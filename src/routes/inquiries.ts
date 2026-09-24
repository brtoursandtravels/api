import { randomBytes } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database.js";
import { env } from "../env.js";
import { Prisma, type EnquiryStatus } from "../generated/prisma/client.js";
import { HttpError } from "../lib/http-error.js";
import { activityContext, recordActivity } from "../lib/activity-log.js";
import { publicPackageWhere } from "../lib/publication.js";
import { sha256 } from "../lib/security.js";
import {
  optionalSession,
  requireAuth,
  requireCsrf,
  requireRole,
} from "../middleware/auth.js";
import { mysqlRateLimit } from "../middleware/rate-limit.js";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()),
    "Use a valid date.",
  );

const inquirySchema = z
  .object({
    type: z.enum(["CONTACT", "NEWSLETTER", "PACKAGE_ENQUIRY", "BOOKING_REQUEST"]),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(254),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(40)
      .regex(/^[+()\d\s-]+$/)
      .refine(value => /^\d{7,15}$/.test(value.replace(/\D/g, "")), "Enter a valid phone number.")
      .optional(),
    subject: z.string().trim().min(2).max(200).optional(),
    message: z.string().trim().min(10).max(5000),
    packageSlug: z.string().trim().min(1).max(180).optional(),
    departureId: z.string().trim().min(1).max(30).optional(),
    preferredStartDate: dateSchema.optional(),
    adultCount: z.coerce.number().int().min(1).max(50).optional(),
    childCount: z.coerce.number().int().min(0).max(50).optional(),
    budget: z.coerce
      .number()
      .finite()
      .nonnegative()
      .max(100_000_000)
      .optional(),
    sourcePath: z.string().trim().startsWith("/").max(500).optional(),
    sourceMetadata: z
      .object({
        utmSource: z.string().trim().max(100).optional(),
        utmMedium: z.string().trim().max(100).optional(),
        utmCampaign: z.string().trim().max(100).optional(),
      })
      .strict()
      .optional(),
    privacyAccepted: z.literal(true),
    policyVersion: z.string().trim().min(1).max(64),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.type === "CONTACT" && !value.phone) {
      context.addIssue({ code: "custom", path: ["phone"], message: "Enter your phone number." });
    }
    if ((value.type === "PACKAGE_ENQUIRY" || value.type === "BOOKING_REQUEST") && !value.packageSlug) {
      context.addIssue({
        code: "custom",
        path: ["packageSlug"],
        message: "Choose a package.",
      });
    }
    if (value.departureId && !value.packageSlug) {
      context.addIssue({
        code: "custom",
        path: ["departureId"],
        message: "A departure requires a package.",
      });
    }
  });

function makeReference() {
  return `BR-${new Date().getUTCFullYear()}-${randomBytes(5).toString("hex").toUpperCase()}`;
}

function publicReceipt(enquiry: { publicReference: string; createdAt: Date }) {
  return {
    reference: enquiry.publicReference,
    receivedAt: enquiry.createdAt.toISOString(),
    message:
      "Your request has been received for staff review. It is not a confirmed booking or payment.",
  };
}

export const inquiriesRouter = Router();

inquiriesRouter.post(
  "/",
  mysqlRateLimit({ scope: "public-inquiry", max: 8, windowMs: 30 * 60_000 }),
  async (request, response) => {
    const idempotencyKey = z
      .string()
      .min(16)
      .max(128)
      .parse(request.header("idempotency-key"));
    const input = inquirySchema.parse(request.body);
    if (input.type === "NEWSLETTER") {
      input.name = "Newsletter subscriber";
      input.subject = "Travel journal updates";
      input.message = "Please contact me about BR travel journal updates.";
    }
    const now = new Date();
    const packageRecord = input.packageSlug
      ? await prisma.package.findFirst({
          where: {
            slug: input.packageSlug,
            ...publicPackageWhere(now, env.DEMO_MODE),
          },
          select: { id: true, slug: true, title: true },
        })
      : null;
    if (input.packageSlug && !packageRecord) {
      throw new HttpError(
        400,
        "PACKAGE_INVALID",
        "The selected package is not available.",
      );
    }

    const departure = input.departureId
      ? await prisma.departure.findFirst({
          where: {
            id: input.departureId,
            packageId: packageRecord!.id,
            status: { in: ["SCHEDULED", "FILLING_FAST"] },
            startDate: { gte: now },
          },
          select: { id: true },
        })
      : null;
    if (input.departureId && !departure) {
      throw new HttpError(
        400,
        "DEPARTURE_INVALID",
        "The selected departure is not available.",
      );
    }

    const normalized = {
      ...input,
      packageSlug: packageRecord?.slug ?? null,
      packageId: packageRecord?.id ?? null,
      departureId: departure?.id ?? null,
    };
    const payloadHash = sha256(JSON.stringify(normalized));
    const existing = await prisma.enquiry.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      if (existing.payloadHash !== payloadHash) {
        throw new HttpError(
          409,
          "IDEMPOTENCY_CONFLICT",
          "This submission key was already used for different information.",
        );
      }
      response.json({ data: { ...publicReceipt(existing), duplicate: true } });
      return;
    }

    const type = input.type === "CONTACT" || input.type === "NEWSLETTER" ? "GENERAL" : input.type;
    const partySize =
      input.adultCount === undefined && input.childCount === undefined
        ? undefined
        : (input.adultCount ?? 0) + (input.childCount ?? 0);

    try {
      const enquiry = await prisma.$transaction(async (transaction) => {
        const enquiryData: Prisma.EnquiryUncheckedCreateInput = {
          publicReference: makeReference(),
          idempotencyKey,
          payloadHash,
          type,
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          subject: input.subject ?? null,
          message: input.message,
          packageId: packageRecord?.id ?? null,
          packageTitleSnapshot: packageRecord?.title ?? null,
          packageSlugSnapshot: packageRecord?.slug ?? null,
          departureId: departure?.id ?? null,
          preferredStartDate: input.preferredStartDate
            ? new Date(`${input.preferredStartDate}T00:00:00.000Z`)
            : null,
          adultCount: input.adultCount ?? null,
          childCount: input.childCount ?? null,
          partySize: partySize ?? null,
          budget: input.budget ?? null,
          sourcePath: input.sourcePath ?? null,
          sourceMetadata: input.sourceMetadata ?? Prisma.JsonNull,
          consentAt: now,
          policyVersion: input.policyVersion,
        };
        const created = await transaction.enquiry.create({
          data: enquiryData,
        });
        await transaction.enquiryStatusHistory.create({
          data: {
            enquiryId: created.id,
            toStatus: "NEW",
            reason: "Public submission received",
          },
        });
        return created;
      });
      response
        .status(201)
        .json({ data: { ...publicReceipt(enquiry), duplicate: false } });
    } catch (error) {
      const raced = await prisma.enquiry.findUnique({
        where: { idempotencyKey },
      });
      if (raced) {
        if (raced.payloadHash !== payloadHash) {
          throw new HttpError(
            409,
            "IDEMPOTENCY_CONFLICT",
            "This submission key was already used for different information.",
          );
        }
        response.json({ data: { ...publicReceipt(raced), duplicate: true } });
        return;
      }
      throw error;
    }
  },
);

const listQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    status: z
      .enum(["NEW", "CONTACTED", "QUOTED", "CONFIRMED", "CLOSED", "LOST"])
      .optional(),
    type: z.enum(["CONTACT", "PACKAGE_ENQUIRY", "BOOKING_REQUEST"]).optional(),
    package: z.string().trim().max(180).optional(),
    from: dateSchema.optional(),
    to: dateSchema.optional(),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    path: ["to"],
    message: "End date must follow the start date.",
  });

function adminListItem(record: {
  id: string;
  publicReference: string;
  type: string;
  status: string;
  name: string;
  email: string;
  phone: string | null;
  packageTitleSnapshot: string | null;
  assignedTo: { id: string; displayName: string } | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    reference: record.publicReference,
    type: record.type === "GENERAL" ? "CONTACT" : record.type,
    status: record.status,
    requester: { name: record.name, email: record.email, phone: record.phone },
    packageTitle: record.packageTitleSnapshot,
    assignedTo: record.assignedTo,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

const adminEnquiryInclude = {
  assignedTo: { select: { id: true, displayName: true } },
  notes: {
    orderBy: { createdAt: "asc" as const },
    include: { author: { select: { id: true, displayName: true } } },
  },
  statusHistory: {
    orderBy: { createdAt: "asc" as const },
    include: { changedBy: { select: { id: true, displayName: true } } },
  },
} satisfies Prisma.EnquiryInclude;

const transitions: Record<EnquiryStatus, EnquiryStatus[]> = {
  NEW: ["CONTACTED", "LOST"],
  CONTACTED: ["QUOTED", "CLOSED", "LOST"],
  QUOTED: ["CONFIRMED", "CLOSED", "LOST"],
  CONFIRMED: ["CLOSED", "LOST"],
  CLOSED: [],
  LOST: ["CONTACTED"],
};

export const adminInquiriesRouter = Router();
adminInquiriesRouter.use(
  optionalSession,
  requireAuth,
  requireRole("SUPER_ADMIN", "SALES_AGENT"),
);

function enquiryFilters(query: z.infer<typeof listQuerySchema>): Prisma.EnquiryWhereInput {
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.type
      ? { type: query.type === "CONTACT" ? "GENERAL" : query.type }
      : {}),
    ...(query.package
      ? {
          OR: [
            { packageSlugSnapshot: { contains: query.package } },
            { packageTitleSnapshot: { contains: query.package } },
          ],
        }
      : {}),
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from
              ? { gte: new Date(`${query.from}T00:00:00.000+05:30`) }
              : {}),
            ...(query.to ? { lte: new Date(`${query.to}T23:59:59.999+05:30`) } : {}),
          },
        }
      : {}),
    ...(query.q
      ? {
          AND: [
            {
              OR: [
                { publicReference: { contains: query.q } },
                { name: { contains: query.q } },
                { email: { contains: query.q } },
                { phone: { contains: query.q } },
                { packageTitleSnapshot: { contains: query.q } },
              ],
            },
          ],
        }
      : {}),
  };
}

adminInquiriesRouter.get("/", async (request, response) => {
  const query = listQuerySchema.parse(request.query);
  const where = enquiryFilters(query);
  const [total, records] = await Promise.all([
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({
      where,
      select: {
        id: true, publicReference: true, type: true, status: true, name: true,
        email: true, phone: true, packageTitleSnapshot: true, createdAt: true, updatedAt: true,
        assignedTo: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);
  response.json({
    data: records.map(adminListItem),
    meta: { page: query.page, pageSize: query.pageSize, total },
  });
});

adminInquiriesRouter.get("/export.csv", async (request, response) => {
  const query = listQuerySchema.parse(request.query);
  const records = await prisma.enquiry.findMany({
    where: enquiryFilters(query),
    orderBy: { createdAt: "desc" },
    take: 10_000,
  });
  const safeCell = (value: unknown) => {
    let text = value === null || value === undefined ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const rows = [
    [
      "Reference",
      "Type",
      "Status",
      "Name",
      "Email",
      "Phone",
      "Package",
      "Created at",
    ],
    ...records.map((record) => [
      record.publicReference,
      record.type,
      record.status,
      record.name,
      record.email,
      record.phone,
      record.packageTitleSnapshot,
      record.createdAt.toISOString(),
    ]),
  ];
  response
    .type("text/csv")
    .setHeader("content-disposition", "attachment; filename=br-enquiries.csv");
  response.send(rows.map((row) => row.map(safeCell).join(",")).join("\r\n"));
});

adminInquiriesRouter.get("/:id", async (request, response) => {
  const record = await prisma.enquiry.findUnique({
    where: { id: z.string().max(30).parse(request.params.id) },
    include: adminEnquiryInclude,
  });
  if (!record)
    throw new HttpError(404, "ENQUIRY_NOT_FOUND", "The enquiry was not found.");
  response.json({
    data: {
      ...adminListItem(record),
      subject: record.subject,
      message: record.message,
      preferredStartDate:
        record.preferredStartDate?.toISOString().slice(0, 10) ?? null,
      adultCount: record.adultCount,
      childCount: record.childCount,
      partySize: record.partySize,
      budget: record.budget?.toFixed(2) ?? null,
      currency: record.currency,
      packageSlug: record.packageSlugSnapshot,
      departureId: record.departureId,
      sourcePath: record.sourcePath,
      consentAt: record.consentAt.toISOString(),
      policyVersion: record.policyVersion,
      notes: record.notes.map((note) => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
      })),
      statusHistory: record.statusHistory.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
    },
  });
});

adminInquiriesRouter.patch(
  "/:id/status",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    const input = z
      .object({
        status: z.enum([
          "NEW",
          "CONTACTED",
          "QUOTED",
          "CONFIRMED",
          "CLOSED",
          "LOST",
        ]),
        reason: z.string().trim().max(500).optional(),
      })
      .strict()
      .parse(request.body);
    const current = await prisma.enquiry.findUnique({ where: { id } });
    if (!current)
      throw new HttpError(
        404,
        "ENQUIRY_NOT_FOUND",
        "The enquiry was not found.",
      );
    if (!transitions[current.status].includes(input.status)) {
      throw new HttpError(
        409,
        "STATUS_TRANSITION_INVALID",
        `Cannot move ${current.status} to ${input.status}.`,
      );
    }
    const updated = await prisma.$transaction(async (transaction) => {
      const record = await transaction.enquiry.update({
        where: { id },
        data: { status: input.status },
      });
      await transaction.enquiryStatusHistory.create({
        data: {
          enquiryId: id,
          changedById: request.auth!.user.id,
          fromStatus: current.status,
          toStatus: input.status,
          reason: input.reason ?? null,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: request.auth!.user.id,
          action: "ENQUIRY_STATUS_CHANGED",
          entityType: "Enquiry",
          entityId: id,
          before: { status: current.status },
          after: { status: input.status, reason: input.reason ?? null },
          ...activityContext(request, response),
        },
      });
      return record;
    });
    response.json({
      data: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  },
);

adminInquiriesRouter.post(
  "/:id/notes",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    const input = z
      .object({ body: z.string().trim().min(1).max(5000) })
      .strict()
      .parse(request.body);
    const exists = await prisma.enquiry.count({ where: { id } });
    if (!exists)
      throw new HttpError(
        404,
        "ENQUIRY_NOT_FOUND",
        "The enquiry was not found.",
      );
    const note = await prisma.enquiryNote.create({
      data: {
        enquiryId: id,
        authorId: request.auth!.user.id,
        body: input.body,
      },
      include: { author: { select: { id: true, displayName: true } } },
    });
    await recordActivity(prisma, request, response, "ENQUIRY_NOTE_ADDED", "Enquiry", id, {
      after: { noteId: note.id },
    });
    response
      .status(201)
      .json({ data: { ...note, createdAt: note.createdAt.toISOString() } });
  },
);

adminInquiriesRouter.patch(
  "/:id/assignment",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    const input = z
      .object({ assignedToId: z.string().max(30).nullable() })
      .strict()
      .parse(request.body);
    if (input.assignedToId) {
      const assignee = await prisma.adminUser.findFirst({
        where: {
          id: input.assignedToId,
          status: "ACTIVE",
          role: { in: ["SUPER_ADMIN", "SALES_AGENT"] },
        },
      });
      if (!assignee)
        throw new HttpError(
          400,
          "ASSIGNEE_INVALID",
          "Choose an active sales or super admin user.",
        );
    }
    const updated = await prisma.enquiry
      .update({ where: { id }, data: { assignedToId: input.assignedToId } })
      .catch(() => null);
    if (!updated)
      throw new HttpError(
        404,
        "ENQUIRY_NOT_FOUND",
        "The enquiry was not found.",
      );
    await recordActivity(prisma, request, response, "ENQUIRY_ASSIGNED", "Enquiry", id, {
      after: { assignedToId: updated.assignedToId },
    });
    response.json({ data: { id: updated.id, assignedToId: updated.assignedToId } });
  },
);
