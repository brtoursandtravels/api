import argon2 from "argon2";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database.js";
import { HttpError } from "../lib/http-error.js";
import type { Prisma } from "../generated/prisma/client.js";
import { activityContext, normalizeIpAddress } from "../lib/activity-log.js";
import {
  optionalSession,
  requireAuth,
  requireCsrf,
  requireRole,
} from "../middleware/auth.js";

export const adminOperationsRouter = Router();
adminOperationsRouter.use(optionalSession, requireAuth);

adminOperationsRouter.get("/dashboard", async (_request, response) => {
  response.setHeader("Cache-Control", "private, no-store");
  const now = new Date();
  const trendStart = new Date(now);
  trendStart.setUTCHours(0, 0, 0, 0);
  const trendEnd = new Date(trendStart);
  trendEnd.setUTCDate(trendEnd.getUTCDate() + 1);
  trendStart.setUTCDate(trendStart.getUTCDate() - 13);
  // These independent summaries do not need a transaction. Group counts by
  // status instead of serializing a separate database round trip per status.
  const [
    packageCounts,
    upcomingDepartures,
    enquiryCounts,
    postCounts,
    dailyEnquiries,
  ] = await Promise.all([
    prisma.package.groupBy({
      by: ["status"],
      where: { status: { not: "ARCHIVED" } },
      _count: { _all: true },
    }),
    prisma.departure.count({
      where: { status: { in: ["SCHEDULED", "FILLING_FAST"] }, startDate: { gte: now } },
    }),
    prisma.enquiry.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.blogPost.groupBy({
      by: ["status"],
      where: { OR: [
        { status: "DRAFT" },
        { status: "PUBLISHED", publishedAt: { lte: now } },
      ] },
      _count: { _all: true },
    }),
    // Aggregate in MySQL so the API receives at most 14 rows, even when there
    // are many enquiries. DateTime values are stored in UTC.
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS date, COUNT(*) AS count
      FROM Enquiry
      WHERE createdAt >= ${trendStart} AND createdAt < ${trendEnd}
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
    `,
  ]);
  const enquiryStatusCounts = { NEW: 0, CONTACTED: 0, QUOTED: 0, CONFIRMED: 0, CLOSED: 0, LOST: 0 };
  for (const row of enquiryCounts) {
    enquiryStatusCounts[row.status] = row._count._all;
  }
  const packages = packageCounts.reduce((total, row) => total + row._count._all, 0);
  const publishedPackages = packageCounts.find((row) => row.status === "PUBLISHED")?._count._all ?? 0;
  const draftPosts = postCounts.find((row) => row.status === "DRAFT")?._count._all ?? 0;
  const publishedPosts = postCounts.find((row) => row.status === "PUBLISHED")?._count._all ?? 0;
  const trendMap = new Map<string, number>();
  for (let day = 0; day < 14; day += 1) {
    const date = new Date(trendStart);
    date.setUTCDate(date.getUTCDate() + day);
    trendMap.set(date.toISOString().slice(0, 10), 0);
  }
  for (const row of dailyEnquiries) {
    if (trendMap.has(row.date)) trendMap.set(row.date, Number(row.count));
  }
  response.json({
    data: {
      packages,
      publishedPackages,
      upcomingDepartures,
      newEnquiries: enquiryStatusCounts.NEW,
      draftPosts,
      publishedPosts,
      enquiryStatusCounts,
      enquiryTrend: Array.from(trendMap, ([date, count]) => ({ date, count })),
      generatedAt: new Date().toISOString(),
    },
  });
});

const userCreateSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    displayName: z.string().trim().min(2).max(120),
    role: z.enum(["SUPER_ADMIN", "CONTENT_EDITOR", "SALES_AGENT"]),
    password: z.string().min(14).max(128),
  })
  .strict();
const userUpdateSchema = z
  .object({
    displayName: z.string().trim().min(2).max(120),
    role: z.enum(["SUPER_ADMIN", "CONTENT_EDITOR", "SALES_AGENT"]),
    status: z.enum(["ACTIVE", "DISABLED"]),
  })
  .strict();

adminOperationsRouter.get(
  "/users",
  requireRole("SUPER_ADMIN"),
  async (_request, response) => {
    const records = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    response.json({ data: records });
  },
);

adminOperationsRouter.get(
  "/assignees",
  requireRole("SUPER_ADMIN", "SALES_AGENT"),
  async (_request, response) => {
    const records = await prisma.adminUser.findMany({
      where: { status: "ACTIVE", role: { in: ["SUPER_ADMIN", "SALES_AGENT"] } },
      select: { id: true, displayName: true, role: true },
      orderBy: { displayName: "asc" },
    });
    response.json({ data: records });
  },
);

adminOperationsRouter.post(
  "/users",
  requireRole("SUPER_ADMIN"),
  requireCsrf,
  async (request, response) => {
    const input = userCreateSchema.parse(request.body);
    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });
    const record = await prisma.$transaction(async (transaction) => {
      const created = await transaction.adminUser.create({
        data: {
          email: input.email,
          displayName: input.displayName,
          role: input.role,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: request.auth!.user.id,
          action: "ADMIN_USER_CREATED",
          entityType: "AdminUser",
          entityId: created.id,
          after: {
            email: created.email,
            displayName: created.displayName,
            role: created.role,
          },
          ...activityContext(request, response),
        },
      });
      return created;
    });
    response.status(201).json({ data: record });
  },
);

adminOperationsRouter.put(
  "/users/:id",
  requireRole("SUPER_ADMIN"),
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    const input = userUpdateSchema.parse(request.body);
    const current = await prisma.adminUser.findUnique({ where: { id } });
    if (!current)
      throw new HttpError(
        404,
        "ADMIN_USER_NOT_FOUND",
        "The admin user was not found.",
      );
    const removesActiveSuper =
      current.role === "SUPER_ADMIN" &&
      current.status === "ACTIVE" &&
      (input.role !== "SUPER_ADMIN" || input.status !== "ACTIVE");
    if (removesActiveSuper) {
      const activeSuperAdmins = await prisma.adminUser.count({
        where: { role: "SUPER_ADMIN", status: "ACTIVE" },
      });
      if (activeSuperAdmins <= 1) {
        throw new HttpError(
          409,
          "LAST_SUPER_ADMIN",
          "Keep at least one active Super Admin.",
        );
      }
    }
    const record = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.adminUser.update({
        where: { id },
        data: {
          displayName: input.displayName,
          role: input.role,
          status: input.status,
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      });
      if (current.role !== input.role || input.status === "DISABLED") {
        await transaction.session.deleteMany({ where: { userId: id } });
      }
      await transaction.auditLog.create({
        data: {
          actorId: request.auth!.user.id,
          action: "ADMIN_USER_UPDATED",
          entityType: "AdminUser",
          entityId: id,
          before: {
            displayName: current.displayName,
            role: current.role,
            status: current.status,
          },
          after: {
            displayName: input.displayName,
            role: input.role,
            status: input.status,
          },
          ...activityContext(request, response),
        },
      });
      return updated;
    });
    response.json({ data: record });
  },
);

adminOperationsRouter.get(
  "/audit-logs",
  requireRole("SUPER_ADMIN"),
  async (request, response) => {
    const query = z
      .object({
        page: z.coerce.number().int().min(1).max(10_000).default(1),
        pageSize: z.coerce.number().int().min(1).max(100).default(25),
        entityType: z.string().trim().max(100).optional(),
        action: z.string().trim().max(120).optional(),
        actor: z.string().trim().max(254).optional(),
        ipAddress: z.string().trim().max(45).refine((value) => !value || normalizeIpAddress(value) !== null, "Enter a valid IP address.").optional(),
        date: z.iso.date().optional(),
      })
      .parse(request.query);
    const where: Prisma.AuditLogWhereInput = {
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.action ? { action: { contains: query.action.toUpperCase().replace(/\s+/g, "_") } } : {}),
      ...(query.ipAddress ? { ipAddress: normalizeIpAddress(query.ipAddress)! } : {}),
      ...(query.date ? { createdAt: {
        gte: new Date(`${query.date}T00:00:00+05:30`),
        lt: new Date(new Date(`${query.date}T00:00:00+05:30`).getTime() + 86_400_000),
      } } : {}),
      ...(query.actor ? { OR: [
        { actorId: query.actor }, { actorName: { contains: query.actor } }, { actorEmail: { contains: query.actor } },
        { actor: { is: { OR: [{ displayName: { contains: query.actor } }, { email: { contains: query.actor } }] } } },
      ] } : {}),
    };
    const [total, records] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        select: {
          id: true, action: true, entityType: true, entityId: true, before: true, after: true,
          requestId: true, ipAddress: true, userAgent: true, requestMethod: true, requestPath: true,
          actorId: true, actorName: true, actorEmail: true, actorRole: true, createdAt: true,
          actor: { select: { displayName: true, email: true, role: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);
    response.setHeader("Cache-Control", "private, no-store");
    response.json({ data: records.map(({ actorName, actorEmail, actorRole, actor, ...record }) => ({
      ...record,
      actor: actorName || actorEmail || actor ? {
        id: record.actorId,
        displayName: actorName ?? actor?.displayName ?? "Unknown user",
        email: actorEmail ?? actor?.email ?? null,
        role: actorRole ?? actor?.role ?? null,
      } : null,
    })), meta: { ...query, total } });
  },
);
