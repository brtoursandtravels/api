import argon2 from "argon2";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database.js";
import { HttpError } from "../lib/http-error.js";
import type { Prisma } from "../generated/prisma/client.js";
import { activityContext, normalizeIpAddress, recordActivity } from "../lib/activity-log.js";
import {
  optionalSession,
  requireAuth,
  requireCsrf,
  requireRole,
} from "../middleware/auth.js";

export const adminOperationsRouter = Router();
adminOperationsRouter.use(optionalSession, requireAuth);

adminOperationsRouter.get("/dashboard", async (_request, response) => {
  const trendStart = new Date();
  trendStart.setUTCHours(0, 0, 0, 0);
  trendStart.setUTCDate(trendStart.getUTCDate() - 13);
  const [
    packages,
    publishedPackages,
    upcomingDepartures,
    newEnquiries,
    failedNotifications,
    draftPosts,
    publishedPosts,
    contactedEnquiries,
    quotedEnquiries,
    confirmedEnquiries,
    closedEnquiries,
    lostEnquiries,
    recentEnquiries,
  ] = await prisma.$transaction([
    prisma.package.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.package.count({ where: { status: "PUBLISHED" } }),
    prisma.departure.count({
      where: { status: "SCHEDULED", startDate: { gte: new Date() } },
    }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.notificationOutbox.count({ where: { status: "FAILED" } }),
    prisma.blogPost.count({ where: { status: "DRAFT" } }),
    prisma.blogPost.count({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    }),
    prisma.enquiry.count({ where: { status: "CONTACTED" } }),
    prisma.enquiry.count({ where: { status: "QUOTED" } }),
    prisma.enquiry.count({ where: { status: "CONFIRMED" } }),
    prisma.enquiry.count({ where: { status: "CLOSED" } }),
    prisma.enquiry.count({ where: { status: "LOST" } }),
    prisma.enquiry.findMany({
      where: { createdAt: { gte: trendStart } },
      select: { createdAt: true },
    }),
  ]);
  const trendMap = new Map<string, number>();
  for (let day = 0; day < 14; day += 1) {
    const date = new Date(trendStart);
    date.setUTCDate(date.getUTCDate() + day);
    trendMap.set(date.toISOString().slice(0, 10), 0);
  }
  for (const enquiry of recentEnquiries) {
    const key = enquiry.createdAt.toISOString().slice(0, 10);
    trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
  }
  response.json({
    data: {
      packages,
      publishedPackages,
      upcomingDepartures,
      newEnquiries,
      failedNotifications,
      draftPosts,
      publishedPosts,
      enquiryStatusCounts: {
        NEW: newEnquiries,
        CONTACTED: contactedEnquiries,
        QUOTED: quotedEnquiries,
        CONFIRMED: confirmedEnquiries,
        CLOSED: closedEnquiries,
        LOST: lostEnquiries,
      },
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

adminOperationsRouter.get(
  "/notifications",
  requireRole("SUPER_ADMIN", "SALES_AGENT"),
  async (request, response) => {
    const query = z
      .object({
        status: z
          .enum(["PENDING", "PROCESSING", "SENT", "FAILED", "CANCELLED"])
          .optional(),
        page: z.coerce.number().int().min(1).max(10_000).default(1),
        pageSize: z.coerce.number().int().min(1).max(100).default(25),
      })
      .parse(request.query);
    const where = query.status ? { status: query.status } : {};
    const [total, records] = await prisma.$transaction([
      prisma.notificationOutbox.count({ where }),
      prisma.notificationOutbox.findMany({
        where,
        select: {
          id: true,
          enquiryId: true,
          eventType: true,
          status: true,
          attempts: true,
          nextAttemptAt: true,
          sentAt: true,
          lastError: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);
    response.json({ data: records, meta: { ...query, total } });
  },
);

adminOperationsRouter.post(
  "/notifications/:id/retry",
  requireRole("SUPER_ADMIN", "SALES_AGENT"),
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    const updated = await prisma.notificationOutbox.updateMany({
      where: { id, status: "FAILED" },
      data: { status: "PENDING", nextAttemptAt: new Date(), lockedAt: null },
    });
    if (updated.count !== 1) {
      throw new HttpError(
        409,
        "NOTIFICATION_NOT_RETRYABLE",
        "Only failed notifications can be retried.",
      );
    }
    await recordActivity(prisma, request, response, "NOTIFICATION_RETRIED", "NotificationOutbox", id, {
      before: { status: "FAILED" }, after: { status: "PENDING" },
    });
    response.status(202).json({ data: { id, status: "PENDING" } });
  },
);
