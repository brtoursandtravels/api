import { packageListQuerySchema } from "../contracts.js";
import { Router } from "express";
import { prisma } from "../database.js";
import { env } from "../env.js";
import type { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/http-error.js";
import {
  publicPackageInclude,
  toPackageCard,
  toPackageDetail,
  type PublicPackageRecord,
} from "../lib/packages.js";
import { publicPackageWhere } from "../lib/publication.js";

export const packageRouter = Router();

packageRouter.get("/", async (request, response) => {
  const query = packageListQuerySchema.parse(request.query);
  const now = new Date();
  const publicationWhere = publicPackageWhere(now, env.DEMO_MODE);
  const where: Prisma.PackageWhereInput = {
    ...publicationWhere,
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q } },
            { summary: { contains: query.q } },
            { startingCity: { contains: query.q } },
          ],
        }
      : {}),
    ...(query.destination
      ? { destinations: { some: { destination: { slug: query.destination } } } }
      : {}),
    ...(query.category
      ? { categories: { some: { category: { slug: query.category } } } }
      : {}),
    ...(query.startingCity
      ? { startingCity: { contains: query.startingCity } }
      : {}),
    ...(query.minDays !== undefined || query.maxDays !== undefined
      ? {
          days: {
            ...(query.minDays !== undefined ? { gte: query.minDays } : {}),
            ...(query.maxDays !== undefined ? { lte: query.maxDays } : {}),
          },
        }
      : {}),
    ...(query.month
      ? {
          departures: {
            some: {
              status: "SCHEDULED" as const,
              startDate: {
                gte: new Date(`${query.month}-01T00:00:00.000Z`),
                lt: new Date(
                  Date.UTC(
                    Number(query.month.slice(0, 4)),
                    Number(query.month.slice(5, 7)),
                    1,
                  ),
                ),
              },
            },
          },
        }
      : {}),
  };

  const computedPriceQuery =
    query.minPrice !== undefined ||
    query.maxPrice !== undefined ||
    query.sort === "price-asc" ||
    query.sort === "price-desc";

  if (computedPriceQuery) {
    const records = await prisma.package.findMany({
      where,
      include: publicPackageInclude,
      orderBy: { publishedAt: "desc" },
      take: 2001,
    });
    if (records.length > 2000) {
      throw new HttpError(
        422,
        "FILTER_TOO_BROAD",
        "Add a destination, category or duration before sorting by price.",
      );
    }
    const cards = (records as PublicPackageRecord[])
      .map((record) => toPackageCard(record, now))
      .filter((card) => {
        const price = card.startingPrice
          ? Number(card.startingPrice.amount)
          : null;
        if (
          query.minPrice !== undefined &&
          (price === null || price < query.minPrice)
        )
          return false;
        if (
          query.maxPrice !== undefined &&
          (price === null || price > query.maxPrice)
        )
          return false;
        return true;
      })
      .sort((left, right) => {
        const leftPrice = left.startingPrice
          ? Number(left.startingPrice.amount)
          : Number.POSITIVE_INFINITY;
        const rightPrice = right.startingPrice
          ? Number(right.startingPrice.amount)
          : Number.POSITIVE_INFINITY;
        return query.sort === "price-desc"
          ? rightPrice - leftPrice
          : leftPrice - rightPrice;
      });
    const total = cards.length;
    const start = (query.page - 1) * query.pageSize;
    response.json({
      data: cards.slice(start, start + query.pageSize),
      meta: { page: query.page, pageSize: query.pageSize, total },
    });
    return;
  }

  const orderBy =
    query.sort === "newest"
      ? [{ publishedAt: "desc" as const }]
      : query.sort === "duration"
        ? [{ days: "asc" as const }, { title: "asc" as const }]
        : [
            { isFeatured: "desc" as const },
            { featuredOrder: "asc" as const },
            { publishedAt: "desc" as const },
          ];
  const [total, records] = await prisma.$transaction([
    prisma.package.count({ where }),
    prisma.package.findMany({
      where,
      include: publicPackageInclude,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  response.json({
    data: (records as PublicPackageRecord[]).map((record) =>
      toPackageCard(record, now),
    ),
    meta: { page: query.page, pageSize: query.pageSize, total },
  });
});

packageRouter.get("/:slug", async (request, response) => {
  const now = new Date();
  const record = await prisma.package.findFirst({
    where: {
      ...publicPackageWhere(now, env.DEMO_MODE),
      slug: request.params.slug,
    },
    include: publicPackageInclude,
  });

  if (!record) {
    const redirect = await prisma.slugRedirect.findUnique({
      where: {
        entityType_oldSlug: {
          entityType: "Package",
          oldSlug: request.params.slug,
        },
      },
    });
    if (redirect?.isActive && redirect.targetSlug !== request.params.slug) {
      const target = await prisma.package.findFirst({
        where: {
          ...publicPackageWhere(now, env.DEMO_MODE),
          slug: redirect.targetSlug,
        },
        select: { slug: true },
      });
      if (target) {
        response.redirect(
          308,
          `/api/v1/packages/${encodeURIComponent(target.slug)}`,
        );
        return;
      }
    }
    throw new HttpError(
      404,
      "PACKAGE_NOT_FOUND",
      "This package is not available.",
    );
  }
  const typedRecord = record as PublicPackageRecord;
  const destinationIds = typedRecord.destinations.map(
    (item) => item.destinationId,
  );
  const categoryIds = typedRecord.categories.map((item) => item.categoryId);
  const related = await prisma.package.findMany({
    where: {
      ...publicPackageWhere(now, env.DEMO_MODE),
      id: { not: typedRecord.id },
      OR: [
        ...(destinationIds.length
          ? [
              {
                destinations: {
                  some: { destinationId: { in: destinationIds } },
                },
              },
            ]
          : []),
        ...(categoryIds.length
          ? [{ categories: { some: { categoryId: { in: categoryIds } } } }]
          : []),
      ],
    },
    include: publicPackageInclude,
    orderBy: [
      { isFeatured: "desc" },
      { featuredOrder: "asc" },
      { publishedAt: "desc" },
    ],
    take: 3,
  });
  response.json({
    data: {
      ...toPackageDetail(typedRecord, now),
      relatedPackages: (related as PublicPackageRecord[]).map((item) =>
        toPackageCard(item, now),
      ),
    },
  });
});
