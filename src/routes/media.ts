import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { z } from "zod";
import { prisma } from "../database.js";
import { env } from "../env.js";
import { HttpError } from "../lib/http-error.js";
import { activityContext, recordActivity } from "../lib/activity-log.js";
import { publicMediaUrl } from "../lib/media-url.js";
import { randomToken } from "../lib/security.js";
import {
  optionalSession,
  requireAuth,
  requireCsrf,
  requireRole,
} from "../middleware/auth.js";
import { mysqlRateLimit } from "../middleware/rate-limit.js";

const mediaRoot = path.resolve(env.MEDIA_ROOT);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1, fields: 10 },
});
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

function absoluteMediaPath(storageKey: string) {
  const target = path.resolve(mediaRoot, storageKey);
  if (target !== mediaRoot && !target.startsWith(`${mediaRoot}${path.sep}`)) {
    throw new HttpError(
      500,
      "MEDIA_PATH_INVALID",
      "The stored media path is invalid.",
    );
  }
  return target;
}

function mediaDto(record: {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: bigint;
  width: number | null;
  height: number | null;
  altText: string;
  caption: string | null;
  sourceNotes: string | null;
  licenseNotes: string | null;
  visibility: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    url: publicMediaUrl(record),
    originalName: record.originalName,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes.toString(),
    width: record.width,
    height: record.height,
    altText: record.altText,
    caption: record.caption,
    sourceNotes: record.sourceNotes,
    licenseNotes: record.licenseNotes,
    visibility: record.visibility,
    provider: record.provider,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export const publicMediaRouter = Router();
publicMediaRouter.get("/:id", async (request, response) => {
  const id = z.string().max(30).parse(request.params.id);
  const record = await prisma.mediaAsset.findFirst({
    where: { id, visibility: "PUBLIC", provider: "LOCAL" },
  });
  if (!record)
    throw new HttpError(
      404,
      "MEDIA_NOT_FOUND",
      "This media file is not available.",
    );
  if (process.env.VERCEL && record.storageKey.startsWith("seed/")) {
    const publicPath = record.storageKey
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    response.redirect(307, `${env.MEDIA_PUBLIC_BASE_URL}/${publicPath}`);
    return;
  }
  response.setHeader(
    "cache-control",
    "public, max-age=86400, stale-while-revalidate=604800",
  );
  response.setHeader("x-content-type-options", "nosniff");
  if (record.mimeType === "application/pdf") {
    response.setHeader(
      "content-disposition",
      `attachment; filename="${path.basename(record.originalName).replaceAll('"', "")}"`,
    );
    response.setHeader("content-security-policy", "sandbox");
  }
  response.type(record.mimeType).sendFile(absoluteMediaPath(record.storageKey));
});

export const adminMediaRouter = Router();
adminMediaRouter.use(
  optionalSession,
  requireAuth,
  requireRole("SUPER_ADMIN", "CONTENT_EDITOR"),
);

adminMediaRouter.get("/", async (request, response) => {
  const query = z
    .object({
      visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
      page: z.coerce.number().int().min(1).max(10_000).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(25),
    })
    .parse(request.query);
  const where = query.visibility ? { visibility: query.visibility } : {};
  const [total, records] = await Promise.all([
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);
  response.json({ data: records.map(mediaDto), meta: { ...query, total } });
});

adminMediaRouter.post(
  "/",
  requireCsrf,
  mysqlRateLimit({
    scope: "admin-media-upload",
    max: 30,
    windowMs: 60 * 60_000,
    identity: (request) => request.auth!.user.id,
  }),
  upload.single("file"),
  async (request, response) => {
    if (!request.file)
      throw new HttpError(
        400,
        "FILE_REQUIRED",
        "Choose an image or PDF to upload.",
      );
    const fields = z
      .object({
        altText: z.string().trim().min(2).max(300),
        caption: z.string().trim().max(500).optional(),
        sourceNotes: z.string().trim().max(5000).optional(),
        licenseNotes: z.string().trim().max(5000).optional(),
        visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
      })
      .parse(request.body);
    const detected = await fileTypeFromBuffer(request.file.buffer);
    if (!detected || !allowedMimeTypes.has(detected.mime)) {
      throw new HttpError(
        415,
        "MEDIA_TYPE_INVALID",
        "Upload a JPEG, PNG, WebP, AVIF image or PDF brochure.",
      );
    }

    let output: Buffer;
    let width: number | null = null;
    let height: number | null = null;
    let mimeType: "image/webp" | "application/pdf";
    let extension: "webp" | "pdf";
    if (detected.mime === "application/pdf") {
      output = request.file.buffer;
      mimeType = "application/pdf";
      extension = "pdf";
    } else {
      let pipeline = sharp(request.file.buffer, {
        failOn: "error",
        limitInputPixels: 40_000_000,
      }).rotate();
      const metadata = await pipeline.metadata();
      if (
        !metadata.width ||
        !metadata.height ||
        metadata.width < 32 ||
        metadata.height < 32
      ) {
        throw new HttpError(
          400,
          "MEDIA_DIMENSIONS_INVALID",
          "The image dimensions are invalid or too small.",
        );
      }
      pipeline = pipeline.webp({ quality: 85, effort: 4 });
      output = await pipeline.toBuffer();
      width = metadata.autoOrient?.width ?? metadata.width;
      height = metadata.autoOrient?.height ?? metadata.height;
      mimeType = "image/webp";
      extension = "webp";
    }
    const now = new Date();
    const storageKey = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomToken(24)}.${extension}`;
    const absolutePath = absoluteMediaPath(storageKey);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, output, { flag: "wx" });

    try {
      const record = await prisma.mediaAsset.create({
        data: {
          storageKey,
          originalName: path.basename(request.file.originalname).slice(0, 255),
          mimeType,
          sizeBytes: BigInt(output.length),
          width,
          height,
          altText: fields.altText,
          caption: fields.caption ?? null,
          sourceNotes: fields.sourceNotes ?? null,
          licenseNotes: fields.licenseNotes ?? null,
          visibility: fields.visibility,
          uploadedById: request.auth!.user.id,
        },
      });
      await prisma.auditLog.create({
        data: {
          actorId: request.auth!.user.id,
          action: "MEDIA_UPLOADED",
          entityType: "MediaAsset",
          entityId: record.id,
          after: {
            mimeType: record.mimeType,
            sizeBytes: record.sizeBytes.toString(),
            visibility: record.visibility,
          },
          ...activityContext(request, response),
        },
      });
      response.status(201).json({ data: mediaDto(record) });
    } catch (error) {
      await unlink(absolutePath).catch(() => undefined);
      throw error;
    }
  },
);

adminMediaRouter.get("/:id", async (request, response) => {
  const record = await prisma.mediaAsset.findUnique({
    where: { id: z.string().max(30).parse(request.params.id) },
  });
  if (!record)
    throw new HttpError(404, "MEDIA_NOT_FOUND", "The media asset was not found.");
  response.json({ data: mediaDto(record) });
});

adminMediaRouter.get("/:id/file", async (request, response) => {
  const record = await prisma.mediaAsset.findUnique({
    where: { id: z.string().max(30).parse(request.params.id) },
  });
  if (!record || record.provider !== "LOCAL")
    throw new HttpError(
      404,
      "MEDIA_NOT_FOUND",
      "The media file was not found.",
    );
  response.setHeader("cache-control", "private, no-store");
  response.setHeader("x-content-type-options", "nosniff");
  // Seed files are deployed as static assets on Vercel, not stored in the
  // function's writable MEDIA_ROOT. Keep the redirect same-origin so the admin
  // proxy can serve it, and never redirect private uploads to public storage.
  if (
    process.env.VERCEL &&
    record.visibility === "PUBLIC" &&
    record.storageKey.startsWith("seed/")
  ) {
    response.redirect(307, publicMediaUrl(record));
    return;
  }
  if (record.mimeType === "application/pdf") {
    response.setHeader(
      "content-disposition",
      `attachment; filename="${path.basename(record.originalName).replaceAll('"', "")}"`,
    );
    response.setHeader("content-security-policy", "sandbox");
  }
  response.type(record.mimeType).sendFile(absoluteMediaPath(record.storageKey));
});

adminMediaRouter.patch("/:id", requireCsrf, async (request, response) => {
  const id = z.string().max(30).parse(request.params.id);
  const input = z
    .object({
      altText: z.string().trim().min(2).max(300),
      caption: z.string().trim().max(500).nullable().optional(),
      sourceNotes: z.string().trim().max(5000).nullable().optional(),
      licenseNotes: z.string().trim().max(5000).nullable().optional(),
      visibility: z.enum(["PUBLIC", "PRIVATE"]),
    })
    .strict()
    .parse(request.body);
  const record = await prisma.mediaAsset.update({
    where: { id },
    data: {
      altText: input.altText,
      caption: input.caption ?? null,
      sourceNotes: input.sourceNotes ?? null,
      licenseNotes: input.licenseNotes ?? null,
      visibility: input.visibility,
    },
  });
  await recordActivity(prisma, request, response, "MEDIA_UPDATED", "MediaAsset", id, {
    after: { altText: record.altText, visibility: record.visibility },
  });
  response.json({ data: mediaDto(record) });
});

adminMediaRouter.delete("/:id", requireCsrf, async (request, response) => {
  const id = z.string().max(30).parse(request.params.id);
  const record = await prisma.mediaAsset.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          packageMedia: true,
          albumImages: true,
          blogCovers: true,
          packageBrochures: true,
        },
      },
    },
  });
  if (!record)
    throw new HttpError(
      404,
      "MEDIA_NOT_FOUND",
      "The media file was not found.",
    );
  const references =
    record._count.packageMedia +
    record._count.albumImages +
    record._count.blogCovers +
    record._count.packageBrochures;
  if (references > 0) {
    throw new HttpError(
      409,
      "MEDIA_IN_USE",
      "Remove this asset from packages, albums and articles before deleting it.",
    );
  }
  await prisma.$transaction(async (transaction) => {
    await transaction.mediaAsset.delete({ where: { id } });
    await recordActivity(transaction, request, response, "MEDIA_DELETED", "MediaAsset", id, {
      before: { originalName: record.originalName, mimeType: record.mimeType, visibility: record.visibility },
    });
  });
  if (record.provider === "LOCAL")
    await unlink(absoluteMediaPath(record.storageKey)).catch(() => undefined);
  response.status(204).send();
});
