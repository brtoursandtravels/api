import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database.js";
import type { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/http-error.js";
import { activityContext, recordActivity } from "../lib/activity-log.js";
import { destinationNamesSchema, resolvePackageDestinations } from "../lib/package-destinations.js";
import {
  optionalSession,
  requireAuth,
  requireCsrf,
  requireRole,
} from "../middleware/auth.js";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .nullable()
  .optional();
const stringList = z
  .array(z.string().trim().min(1).max(500))
  .max(100)
  .default([]);

function jsonStringList(value: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

const itinerarySchema = z.object({
  dayNumber: z.number().int().min(1).max(90),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(10_000),
  activities: stringList.optional(),
  meals: z.string().trim().max(200).nullable().optional(),
  accommodation: z.string().trim().max(255).nullable().optional(),
});

const departureSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
    pricePerPerson: z.coerce
      .number()
      .finite()
      .nonnegative()
      .max(100_000_000)
      .nullable()
      .optional(),
    currency: z.string().trim().toUpperCase().length(3).default("INR"),
    status: z
      .enum(["SCHEDULED", "CANCELLED", "COMPLETED"])
      .default("SCHEDULED"),
    note: z.string().trim().max(500).nullable().optional(),
  })
  .refine((value) => value.endDate >= value.startDate, {
    path: ["endDate"],
    message: "End date must not be before the start date.",
  });

const packageInputSchema = z
  .object({
    slug: slugSchema,
    title: z.string().trim().min(2).max(200),
    summary: z.string().trim().min(10).max(500),
    overview: z.string().trim().min(20).max(30_000),
    days: z.number().int().min(1).max(90),
    nights: z.number().int().min(0).max(89),
    startingCity: z.string().trim().max(160).nullable().optional(),
    basePrice: z.coerce
      .number()
      .finite()
      .nonnegative()
      .max(100_000_000)
      .nullable()
      .optional(),
    currency: z.string().trim().toUpperCase().length(3).default("INR"),
    priceBasis: z.enum(["PER_PERSON", "PER_GROUP", "PER_ROOM", "ON_REQUEST"]),
    highlights: stringList,
    inclusions: stringList,
    exclusions: stringList,
    transportInformation: z.string().trim().max(20_000).nullable().optional(),
    accommodationNotes: z.string().trim().max(20_000).nullable().optional(),
    importantInformation: z.string().trim().max(20_000).nullable().optional(),
    cancellationRules: z.string().trim().max(20_000).nullable().optional(),
    seoTitle: z.string().trim().max(70).nullable().optional(),
    seoDescription: z.string().trim().max(170).nullable().optional(),
    brochureMediaId: z.string().max(30).nullable().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    publishedAt: optionalDateTimeSchema,
    isFeatured: z.boolean().default(false),
    featuredOrder: z.number().int().min(0).max(10_000).nullable().optional(),
    isDemo: z.boolean().default(false),
    destinationIds: z.array(z.string().max(30)).max(20).default([]),
    destinationNames: destinationNamesSchema.optional(),
    categoryIds: z.array(z.string().max(30)).max(20).default([]),
    itinerary: z.array(itinerarySchema).max(90).default([]),
    departures: z.array(departureSchema).max(200).default([]),
    media: z
      .array(
        z
          .object({
            mediaAssetId: z.string().max(30),
            sortOrder: z.number().int().min(0).max(10_000),
            isCover: z.boolean().default(false),
          })
          .strict(),
      )
      .max(100)
      .default([]),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.destinationNames !== undefined && value.destinationIds.length) {
      context.addIssue({ code: "custom", path: ["destinationNames"], message: "Use destination names or IDs, not both." });
    }
    if (value.nights > value.days) {
      context.addIssue({
        code: "custom",
        path: ["nights"],
        message: "Nights cannot exceed days.",
      });
    }
    if (value.priceBasis !== "ON_REQUEST" && value.basePrice === null) {
      context.addIssue({
        code: "custom",
        path: ["basePrice"],
        message: "Add a base price or use price on request.",
      });
    }
    if (
      new Set(value.itinerary.map((day) => day.dayNumber)).size !==
      value.itinerary.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["itinerary"],
        message: "Itinerary day numbers must be unique.",
      });
    }
    if (
      new Set(value.departures.map((item) => item.startDate)).size !==
      value.departures.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["departures"],
        message: "Departure start dates must be unique.",
      });
    }
    if (value.media.filter((item) => item.isCover).length > 1) {
      context.addIssue({
        code: "custom",
        path: ["media"],
        message: "Choose only one package cover image.",
      });
    }
  });

const adminPackageInclude = {
  destinations: {
    orderBy: { sortOrder: "asc" as const },
    include: { destination: true },
  },
  categories: { include: { category: true } },
  itineraryDays: { orderBy: { dayNumber: "asc" as const } },
  departures: { orderBy: { startDate: "asc" as const } },
  media: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      mediaAsset: {
        select: { id: true, altText: true, visibility: true, storageKey: true },
      },
    },
  },
  brochureMedia: {
    select: { id: true, originalName: true, mimeType: true, visibility: true },
  },
} satisfies Prisma.PackageInclude;

type AdminPackageRecord = Prisma.PackageGetPayload<{
  include: typeof adminPackageInclude;
}>;

function adminPackageDto(record: AdminPackageRecord) {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    overview: record.overview,
    days: record.days,
    nights: record.nights,
    startingCity: record.startingCity,
    basePrice: record.basePrice?.toFixed(2) ?? null,
    currency: record.currency,
    priceBasis: record.priceBasis,
    highlights: jsonStringList(record.highlights),
    inclusions: jsonStringList(record.inclusions),
    exclusions: jsonStringList(record.exclusions),
    transportInformation: record.transportInformation,
    accommodationNotes: record.accommodationNotes,
    importantInformation: record.importantInformation,
    cancellationRules: record.cancellationRules,
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
    brochure: record.brochureMedia,
    status: record.status,
    publishedAt: record.publishedAt?.toISOString() ?? null,
    isFeatured: record.isFeatured,
    featuredOrder: record.featuredOrder,
    isDemo: record.isDemo,
    destinations: record.destinations.map(({ destination, sortOrder }) => ({
      id: destination.id,
      slug: destination.slug,
      name: destination.name,
      sortOrder,
    })),
    categories: record.categories.map(({ category }) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
    })),
    itinerary: record.itineraryDays.map((day) => ({
      id: day.id,
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description,
      activities: jsonStringList(day.activities),
      meals: day.meals,
      accommodation: day.accommodation,
    })),
    departures: record.departures.map((departure) => ({
      id: departure.id,
      startDate: departure.startDate.toISOString().slice(0, 10),
      endDate: departure.endDate.toISOString().slice(0, 10),
      pricePerPerson: departure.pricePerPerson?.toFixed(2) ?? null,
      currency: departure.currency,
      status: departure.status,
      note: departure.note,
    })),
    media: record.media.map((item) => ({
      ...item.mediaAsset,
      sortOrder: item.sortOrder,
      isCover: item.isCover,
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function verifyRelations(
  destinationIds: string[],
  categoryIds: string[],
  mediaIds: string[],
  brochureMediaId?: string | null,
) {
  const [destinationCount, categoryCount, mediaCount, brochureCount] =
    await Promise.all([
      destinationIds.length ? prisma.destination.count({
        where: { id: { in: destinationIds }, status: { not: "ARCHIVED" } },
      }) : 0,
      categoryIds.length ? prisma.category.count({
        where: { id: { in: categoryIds }, status: { not: "ARCHIVED" } },
      }) : 0,
      mediaIds.length ? prisma.mediaAsset.count({
        where: { id: { in: mediaIds }, mimeType: { startsWith: "image/" } },
      }) : 0,
      brochureMediaId
        ? prisma.mediaAsset.count({
            where: { id: brochureMediaId, mimeType: "application/pdf" },
          })
        : 0,
    ]);
  if (destinationCount !== new Set(destinationIds).size) {
    throw new HttpError(
      400,
      "DESTINATION_INVALID",
      "One or more destinations are unavailable.",
    );
  }
  if (categoryCount !== new Set(categoryIds).size) {
    throw new HttpError(
      400,
      "CATEGORY_INVALID",
      "One or more categories are unavailable.",
    );
  }
  if (mediaCount !== new Set(mediaIds).size) {
    throw new HttpError(
      400,
      "MEDIA_INVALID",
      "One or more media assets are unavailable.",
    );
  }
  if (brochureMediaId && brochureCount !== 1) {
    throw new HttpError(
      400,
      "BROCHURE_INVALID",
      "Choose a valid PDF brochure asset.",
    );
  }
}

function scalarPackageData(input: z.infer<typeof packageInputSchema>) {
  return {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    overview: input.overview,
    days: input.days,
    nights: input.nights,
    startingCity: input.startingCity ?? null,
    basePrice:
      input.priceBasis === "ON_REQUEST" ? null : (input.basePrice ?? null),
    currency: input.currency,
    priceBasis: input.priceBasis,
    highlights: input.highlights,
    inclusions: input.inclusions,
    exclusions: input.exclusions,
    transportInformation: input.transportInformation ?? null,
    accommodationNotes: input.accommodationNotes ?? null,
    importantInformation: input.importantInformation ?? null,
    cancellationRules: input.cancellationRules ?? null,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    brochureMediaId: input.brochureMediaId ?? null,
    status: input.status,
    publishedAt:
      input.status === "PUBLISHED"
        ? input.publishedAt
          ? new Date(input.publishedAt)
          : new Date()
        : input.publishedAt
          ? new Date(input.publishedAt)
          : null,
    isFeatured: input.isFeatured,
    featuredOrder: input.isFeatured ? (input.featuredOrder ?? null) : null,
    isDemo: input.isDemo,
  } satisfies Prisma.PackageUncheckedCreateInput;
}

export const adminCatalogueRouter = Router();
adminCatalogueRouter.use(
  optionalSession,
  requireAuth,
  requireRole("SUPER_ADMIN", "CONTENT_EDITOR"),
);

adminCatalogueRouter.get("/packages", async (request, response) => {
  const query = z
    .object({
      q: z.string().trim().max(120).optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
      page: z.coerce.number().int().min(1).max(10_000).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(25),
      view: z.enum(["full", "summary"]).default("full"),
    })
    .parse(request.query);
  const where: Prisma.PackageWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q } },
            { slug: { contains: query.q } },
          ],
        }
      : {}),
  };
  if (query.view === "summary") {
    const [total, records] = await Promise.all([
      prisma.package.count({ where }),
      prisma.package.findMany({
        where,
        select: {
          id: true, slug: true, title: true, status: true, days: true, nights: true,
          basePrice: true, currency: true, priceBasis: true, isDemo: true, updatedAt: true,
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);
    response.json({ data: records.map((record) => ({ ...record, basePrice: record.basePrice?.toFixed(2) ?? null })), meta: { ...query, total } });
    return;
  }
  const [total, records] = await Promise.all([
    prisma.package.count({ where }),
    prisma.package.findMany({
      where,
      include: adminPackageInclude,
      orderBy: { updatedAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);
  response.json({
    data: records.map(adminPackageDto),
    meta: { ...query, total },
  });
});

adminCatalogueRouter.get("/packages/:id", async (request, response) => {
  const record = await prisma.package.findUnique({
    where: { id: z.string().max(30).parse(request.params.id) },
    include: adminPackageInclude,
  });
  if (!record)
    throw new HttpError(404, "PACKAGE_NOT_FOUND", "The package was not found.");
  response.json({ data: adminPackageDto(record) });
});

adminCatalogueRouter.post(
  "/packages",
  requireCsrf,
  async (request, response) => {
    const input = packageInputSchema.parse(request.body);
    await verifyRelations(
      input.destinationIds,
      input.categoryIds,
      input.media.map((item) => item.mediaAssetId),
      input.brochureMediaId,
    );
    const record = await prisma.$transaction(async (transaction) => {
      const destinationIds = await resolvePackageDestinations(transaction, input);
      const created = await transaction.package.create({
        data: scalarPackageData(input),
      });
      if (destinationIds.length) {
        await transaction.packageDestination.createMany({
          data: destinationIds.map((destinationId, sortOrder) => ({
            packageId: created.id,
            destinationId,
            sortOrder,
          })),
        });
      }
      if (input.categoryIds.length) {
        await transaction.packageCategory.createMany({
          data: input.categoryIds.map((categoryId) => ({
            packageId: created.id,
            categoryId,
          })),
        });
      }
      if (input.itinerary.length) {
        await transaction.itineraryDay.createMany({
          data: input.itinerary.map((day) => ({
            packageId: created.id,
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
            activities: day.activities ?? [],
            meals: day.meals ?? null,
            accommodation: day.accommodation ?? null,
          })),
        });
      }
      if (input.departures.length) {
        await transaction.departure.createMany({
          data: input.departures.map((departure) => ({
            packageId: created.id,
            startDate: new Date(`${departure.startDate}T00:00:00.000Z`),
            endDate: new Date(`${departure.endDate}T00:00:00.000Z`),
            pricePerPerson: departure.pricePerPerson ?? null,
            currency: departure.currency,
            status: departure.status,
            note: departure.note ?? null,
          })),
        });
      }
      if (input.media.length) {
        await transaction.packageMedia.createMany({
          data: input.media.map((item) => ({ packageId: created.id, ...item })),
        });
      }
      await transaction.auditLog.create({
        data: {
          actorId: request.auth!.user.id,
          action: "PACKAGE_CREATED",
          entityType: "Package",
          entityId: created.id,
          after: {
            slug: created.slug,
            title: created.title,
            status: created.status,
          },
          ...activityContext(request, response),
        },
      });
      return transaction.package.findUniqueOrThrow({
        where: { id: created.id },
        include: adminPackageInclude,
      });
    });
    response.status(201).json({ data: adminPackageDto(record) });
  },
);

adminCatalogueRouter.put(
  "/packages/:id",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    const input = packageInputSchema.parse(request.body);
    await verifyRelations(
      input.destinationIds,
      input.categoryIds,
      input.media.map((item) => item.mediaAssetId),
      input.brochureMediaId,
    );
    const current = await prisma.package.findUnique({ where: { id } });
    if (!current)
      throw new HttpError(
        404,
        "PACKAGE_NOT_FOUND",
        "The package was not found.",
      );
    const record = await prisma.$transaction(async (transaction) => {
      const destinationIds = await resolvePackageDestinations(transaction, input);
      await transaction.package.update({
        where: { id },
        data: scalarPackageData(input),
      });
      await transaction.packageDestination.deleteMany({
        where: { packageId: id },
      });
      await transaction.packageCategory.deleteMany({
        where: { packageId: id },
      });
      await transaction.itineraryDay.deleteMany({ where: { packageId: id } });
      await transaction.departure.deleteMany({ where: { packageId: id } });
      await transaction.packageMedia.deleteMany({ where: { packageId: id } });
      if (destinationIds.length) {
        await transaction.packageDestination.createMany({
          data: destinationIds.map((destinationId, sortOrder) => ({
            packageId: id,
            destinationId,
            sortOrder,
          })),
        });
      }
      if (input.categoryIds.length) {
        await transaction.packageCategory.createMany({
          data: input.categoryIds.map((categoryId) => ({
            packageId: id,
            categoryId,
          })),
        });
      }
      if (input.itinerary.length) {
        await transaction.itineraryDay.createMany({
          data: input.itinerary.map((day) => ({
            packageId: id,
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
            activities: day.activities ?? [],
            meals: day.meals ?? null,
            accommodation: day.accommodation ?? null,
          })),
        });
      }
      if (input.departures.length) {
        await transaction.departure.createMany({
          data: input.departures.map((departure) => ({
            packageId: id,
            startDate: new Date(`${departure.startDate}T00:00:00.000Z`),
            endDate: new Date(`${departure.endDate}T00:00:00.000Z`),
            pricePerPerson: departure.pricePerPerson ?? null,
            currency: departure.currency,
            status: departure.status,
            note: departure.note ?? null,
          })),
        });
      }
      if (input.media.length) {
        await transaction.packageMedia.createMany({
          data: input.media.map((item) => ({ packageId: id, ...item })),
        });
      }
      if (current.slug !== input.slug) {
        const reverse = await transaction.slugRedirect.findFirst({
          where: {
            entityType: "Package",
            oldSlug: input.slug,
            targetSlug: current.slug,
            isActive: true,
          },
        });
        if (reverse)
          throw new HttpError(
            409,
            "REDIRECT_LOOP",
            "This slug change would create a redirect loop.",
          );
        await transaction.slugRedirect.upsert({
          where: {
            entityType_oldSlug: {
              entityType: "Package",
              oldSlug: current.slug,
            },
          },
          create: {
            entityType: "Package",
            oldSlug: current.slug,
            targetSlug: input.slug,
          },
          update: { targetSlug: input.slug, isActive: true },
        });
      }
      await transaction.auditLog.create({
        data: {
          actorId: request.auth!.user.id,
          action: "PACKAGE_UPDATED",
          entityType: "Package",
          entityId: id,
          before: {
            slug: current.slug,
            title: current.title,
            status: current.status,
          },
          after: { slug: input.slug, title: input.title, status: input.status },
          ...activityContext(request, response),
        },
      });
      return transaction.package.findUniqueOrThrow({
        where: { id },
        include: adminPackageInclude,
      });
    });
    response.json({ data: adminPackageDto(record) });
  },
);

adminCatalogueRouter.delete(
  "/packages/:id",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    const record = await prisma.package.update({
      where: { id },
      data: { status: "ARCHIVED", isFeatured: false, featuredOrder: null },
    });
    await prisma.auditLog.create({
      data: {
        actorId: request.auth!.user.id,
        action: "PACKAGE_ARCHIVED",
        entityType: "Package",
        entityId: id,
        before: { status: record.status },
        after: { status: "ARCHIVED" },
        ...activityContext(request, response),
      },
    });
    response.status(204).send();
  },
);

const taxonomySchema = z
  .object({
    slug: slugSchema,
    name: z.string().trim().min(2).max(160),
    description: z.string().trim().max(5000).nullable().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    publishedAt: optionalDateTimeSchema,
    sortOrder: z.number().int().min(0).max(10_000).default(0),
    isDemo: z.boolean().default(false),
    coverMediaId: z.string().max(30).nullable().optional(),
  })
  .strict();

async function verifyDestinationCoverMedia(coverMediaId?: string | null) {
  if (!coverMediaId) return;
  const count = await prisma.mediaAsset.count({
    where: {
      id: coverMediaId,
      mimeType: { startsWith: "image/" },
      visibility: "PUBLIC",
    },
  });
  if (count !== 1) {
    throw new HttpError(
      400,
      "DESTINATION_COVER_INVALID",
      "Choose a public image from the media library.",
    );
  }
}

for (const resource of ["destinations", "categories"] as const) {
  const model =
    resource === "destinations" ? prisma.destination : prisma.category;
  adminCatalogueRouter.get(`/${resource}`, async (_request, response) => {
    const records = await (
      model.findMany as typeof prisma.destination.findMany
    )({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    response.json({
      data: records.map((record) =>
        resource === "destinations"
          ? { ...record, description: record.summary }
          : record,
      ),
    });
  });
  adminCatalogueRouter.post(
    `/${resource}`,
    requireCsrf,
    async (request, response) => {
      const input = taxonomySchema.parse(request.body);
      if (resource === "destinations") {
        await verifyDestinationCoverMedia(input.coverMediaId);
      }
      const data = {
        slug: input.slug,
        name: input.name,
        ...(resource === "destinations"
          ? {
              summary: input.description ?? null,
              coverMediaId: input.coverMediaId ?? null,
            }
          : { description: input.description ?? null }),
        status: input.status,
        publishedAt:
          input.status === "PUBLISHED"
            ? input.publishedAt
              ? new Date(input.publishedAt)
              : new Date()
            : null,
        sortOrder: input.sortOrder,
        isDemo: input.isDemo,
      };
      const record = await (model.create as typeof prisma.destination.create)({
        data,
      } as never);
      await recordActivity(prisma, request, response, resource === "destinations" ? "DESTINATION_CREATED" : "CATEGORY_CREATED",
        resource === "destinations" ? "Destination" : "Category", record.id, { after: { name: record.name, slug: record.slug, status: record.status } });
      response.status(201).json({
        data:
          resource === "destinations"
            ? { ...record, description: record.summary }
            : record,
      });
    },
  );
  adminCatalogueRouter.put(
    `/${resource}/:id`,
    requireCsrf,
    async (request, response) => {
      const id = z.string().max(30).parse(request.params.id);
      const input = taxonomySchema.parse(request.body);
      if (resource === "destinations") {
        await verifyDestinationCoverMedia(input.coverMediaId);
      }
      const data = {
        slug: input.slug,
        name: input.name,
        ...(resource === "destinations"
          ? {
              summary: input.description ?? null,
              coverMediaId: input.coverMediaId ?? null,
            }
          : { description: input.description ?? null }),
        status: input.status,
        publishedAt:
          input.status === "PUBLISHED"
            ? input.publishedAt
              ? new Date(input.publishedAt)
              : new Date()
            : null,
        sortOrder: input.sortOrder,
        isDemo: input.isDemo,
      };
      const record = await (model.update as typeof prisma.destination.update)({
        where: { id },
        data,
      } as never);
      await recordActivity(prisma, request, response, resource === "destinations" ? "DESTINATION_UPDATED" : "CATEGORY_UPDATED",
        resource === "destinations" ? "Destination" : "Category", id, { after: { name: record.name, slug: record.slug, status: record.status } });
      response.json({
        data:
          resource === "destinations"
            ? { ...record, description: record.summary }
            : record,
      });
    },
  );
  adminCatalogueRouter.delete(
    `/${resource}/:id`,
    requireCsrf,
    async (request, response) => {
      const id = z.string().max(30).parse(request.params.id);
      await (model.update as typeof prisma.destination.update)({
        where: { id },
        data: { status: "ARCHIVED" },
      } as never);
      await recordActivity(prisma, request, response, resource === "destinations" ? "DESTINATION_ARCHIVED" : "CATEGORY_ARCHIVED",
        resource === "destinations" ? "Destination" : "Category", id, { after: { status: "ARCHIVED" } });
      response.status(204).send();
    },
  );
}
