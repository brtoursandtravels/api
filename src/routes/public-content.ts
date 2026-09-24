import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database.js";
import { env } from "../env.js";
import type { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/http-error.js";
import { publicMediaUrl } from "../lib/media-url.js";
import { publicMediaSelect } from "../lib/public-media.js";
import { readingMinutes, sanitizeRichText } from "../lib/rich-text.js";
import { publicEditableContentCache, publicReadCache } from "../middleware/public-cache.js";

const pageQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(180).optional(),
  destination: z.string().trim().max(180).optional(),
  package: z.string().trim().max(180).optional(),
  includeImages: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default(false),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});

function published(now: Date) {
  return {
    status: "PUBLISHED" as const,
    publishedAt: { not: null, lte: now },
    ...(env.DEMO_MODE ? {} : { isDemo: false }),
  };
}

function mediaDto(asset: {
  id: string;
  storageKey: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  altText: string;
  caption: string | null;
}) {
  return {
    id: asset.id,
    url: publicMediaUrl(asset),
    mimeType: asset.mimeType,
    width: asset.width,
    height: asset.height,
    altText: asset.altText,
    caption: asset.caption,
  };
}

export const publicContentRouter = Router();

publicContentRouter.get("/site", publicEditableContentCache, async (_request, response) => {
  const settings = await prisma.setting.findMany({
    where: { isPublic: true },
    select: { key: true, value: true },
    orderBy: { key: "asc" },
  });
  response.json({
    data: {
      settings: Object.fromEntries(
        settings.map((setting) => [setting.key, setting.value]),
      ),
      // Navigation is fixed in the website; retain the response shape for older clients.
      menus: [],
    },
  });
});

publicContentRouter.get("/home", publicReadCache, async (_request, response) => {
  const now = new Date();
  const sections = await prisma.homepageSection.findMany({
    where: { ...published(now), isVisible: true },
    select: { id: true, type: true, title: true, content: true, sortOrder: true, isDemo: true },
    orderBy: { sortOrder: "asc" },
  });
  response.json({
    data: {
      sections: sections.map((section) => ({
        id: section.id,
        type: section.type,
        title: section.title,
        content: section.content,
        sortOrder: section.sortOrder,
        isDemo: section.isDemo,
      })),
    },
  });
});

publicContentRouter.get("/pages", publicEditableContentCache, async (_request, response) => {
  const records = await prisma.contentPage.findMany({
    where: published(new Date()),
    select: { slug: true, updatedAt: true },
    orderBy: { slug: "asc" },
  });
  response.json({ data: records });
});

publicContentRouter.get("/pages/:slug", publicEditableContentCache, async (request, response) => {
  const slug = z.string().min(1).max(180).parse(request.params.slug);
  const page = await prisma.contentPage.findFirst({
    where: { slug, ...published(new Date()) },
  });
  if (!page)
    throw new HttpError(404, "PAGE_NOT_FOUND", "This page is not available.");
  response.json({
    data: {
      slug: page.slug,
      title: page.title,
      contentHtml: sanitizeRichText(page.contentHtml),
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      ownerReviewDue: page.ownerReviewDue,
      updatedAt: page.updatedAt.toISOString(),
      isDemo: page.isDemo,
    },
  });
});

publicContentRouter.get("/destinations", publicReadCache, async (_request, response) => {
  const records = await prisma.destination.findMany({
    where: published(new Date()),
    select: {
      id: true, slug: true, name: true, summary: true, isDemo: true,
      coverMedia: { select: publicMediaSelect },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  response.json({
    data: records.map((record) => ({
      id: record.id,
      slug: record.slug,
      name: record.name,
      summary: record.summary,
      cover:
        record.coverMedia?.visibility === "PUBLIC"
          ? mediaDto(record.coverMedia)
          : null,
      isDemo: record.isDemo,
    })),
  });
});

publicContentRouter.get("/categories", publicReadCache, async (_request, response) => {
  const records = await prisma.category.findMany({
    where: published(new Date()),
    select: { id: true, slug: true, name: true, description: true, isDemo: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  response.json({
    data: records.map((record) => ({
      id: record.id,
      slug: record.slug,
      name: record.name,
      description: record.description,
      isDemo: record.isDemo,
    })),
  });
});

publicContentRouter.get("/package-options", publicReadCache, async (_request, response) => {
  const records = await prisma.package.findMany({
    where: published(new Date()),
    select: { slug: true, title: true },
    orderBy: [{ title: "asc" }, { id: "asc" }],
    take: 500,
  });
  response.json({ data: records });
});

publicContentRouter.get("/gallery/albums", publicReadCache, async (request, response) => {
  const query = pageQuerySchema.parse(request.query);
  const now = new Date();
  const where: Prisma.GalleryAlbumWhereInput = {
    ...published(now),
    ...(query.destination || query.package ? {
      destination: {
        ...(query.destination ? { slug: query.destination } : {}),
        ...(query.package ? { packages: { some: { package: { slug: query.package, ...published(now) } } } } : {}),
      },
    } : {}),
  };
  const [total, records] = await Promise.all([
    prisma.galleryAlbum.count({ where }),
    prisma.galleryAlbum.findMany({
      where,
      select: {
        id: true, slug: true, title: true, description: true, isDemo: true,
        destination: { select: { slug: true, name: true } },
        images: {
          where: { mediaAsset: { visibility: "PUBLIC" } },
          orderBy: { sortOrder: "asc" },
          ...(query.includeImages ? {} : { take: 1 }),
          select: { mediaAsset: { select: publicMediaSelect } },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);
  response.json({
    data: records.map((record) => ({
      id: record.id,
      slug: record.slug,
      title: record.title,
      description: record.description,
      destination: record.destination,
      cover: record.images[0] ? mediaDto(record.images[0].mediaAsset) : null,
      ...(query.includeImages
        ? { images: record.images.map((image) => mediaDto(image.mediaAsset)) }
        : {}),
      isDemo: record.isDemo,
    })),
    meta: { page: query.page, pageSize: query.pageSize, total },
  });
});

publicContentRouter.get("/gallery/albums/:slug", publicReadCache, async (request, response) => {
  const slug = z.string().min(1).max(180).parse(request.params.slug);
  const record = await prisma.galleryAlbum.findFirst({
    where: { slug, ...published(new Date()) },
    select: {
      id: true, slug: true, title: true, description: true, isDemo: true,
      destination: { select: { slug: true, name: true } },
      images: {
        where: { mediaAsset: { visibility: "PUBLIC" } },
        orderBy: { sortOrder: "asc" },
        select: { mediaAsset: { select: publicMediaSelect } },
      },
    },
  });
  if (!record)
    throw new HttpError(
      404,
      "ALBUM_NOT_FOUND",
      "This gallery album is not available.",
    );
  response.json({
    data: {
      id: record.id,
      slug: record.slug,
      title: record.title,
      description: record.description,
      destination: record.destination,
      images: record.images.map((image) => mediaDto(image.mediaAsset)),
      isDemo: record.isDemo,
    },
  });
});

publicContentRouter.get("/blog/categories", publicReadCache, async (_request, response) => {
  const records = await prisma.blogCategory.findMany({
    where: published(new Date()),
    select: { id: true, slug: true, name: true, isDemo: true },
    orderBy: { name: "asc" },
  });
  response.json({
    data: records.map(({ id, slug, name, isDemo }) => ({
      id,
      slug,
      name,
      isDemo,
    })),
  });
});

publicContentRouter.get("/blog", publicReadCache, async (request, response) => {
  const query = pageQuerySchema.parse(request.query);
  const now = new Date();
  const where: Prisma.BlogPostWhereInput = {
    ...published(now),
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q } },
            { excerpt: { contains: query.q } },
          ],
        }
      : {}),
  };
  const [total, records] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      select: {
        id: true, slug: true, title: true, excerpt: true, contentHtml: true,
        publishedAt: true, isDemo: true,
        category: { select: { slug: true, name: true } },
        coverMedia: { select: publicMediaSelect },
        relatedTours: {
          where: { package: { is: published(now) } },
          take: 1,
          select: {
            package: {
              select: { slug: true, title: true, days: true },
            },
          },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);
  response.json({
    data: records.map((record) => ({
      id: record.id,
      slug: record.slug,
      title: record.title,
      excerpt: record.excerpt,
      category: record.category,
      cover:
        record.coverMedia?.visibility === "PUBLIC"
          ? mediaDto(record.coverMedia)
          : null,
      publishedAt: record.publishedAt!.toISOString(),
      readingMinutes: readingMinutes(record.contentHtml),
      author: null,
      relatedTour: record.relatedTours[0]?.package ?? null,
      isDemo: record.isDemo,
    })),
    meta: { page: query.page, pageSize: query.pageSize, total },
  });
});

publicContentRouter.get("/blog/:slug", publicEditableContentCache, async (request, response) => {
  const slug = z.string().min(1).max(180).parse(request.params.slug);
  const now = new Date();
  const record = await prisma.blogPost.findFirst({
    where: { slug, ...published(now) },
    select: {
      id: true, slug: true, title: true, excerpt: true, contentHtml: true, publishedAt: true,
      seoTitle: true, seoDescription: true, isDemo: true,
      category: { select: { slug: true, name: true } },
      coverMedia: { select: publicMediaSelect },
      relatedTours: {
        where: { package: { is: published(now) } },
        select: {
          package: {
            select: {
              id: true,
              slug: true,
              title: true,
              summary: true,
              days: true,
              nights: true,
            },
          },
        },
      },
    },
  });
  if (!record)
    throw new HttpError(
      404,
      "BLOG_POST_NOT_FOUND",
      "This article is not available.",
    );
  response.json({
    data: {
      id: record.id,
      slug: record.slug,
      title: record.title,
      excerpt: record.excerpt,
      contentHtml: sanitizeRichText(record.contentHtml),
      category: record.category,
      // Empty compatibility fields keep older cached pages safe during rollout.
      tags: [],
      cover:
        record.coverMedia?.visibility === "PUBLIC"
          ? mediaDto(record.coverMedia)
          : null,
      publishedAt: record.publishedAt!.toISOString(),
      readingMinutes: readingMinutes(record.contentHtml),
      author: null,
      seo: { title: record.seoTitle, description: record.seoDescription },
      relatedArticles: [],
      relatedPackages: record.relatedTours.map(
        ({ package: relatedPackage }) => relatedPackage,
      ),
      isDemo: record.isDemo,
    },
  });
});

publicContentRouter.get("/faqs", publicReadCache, async (request, response) => {
  const packageSlug = z
    .string()
    .trim()
    .max(180)
    .optional()
    .parse(request.query.package);
  const records = await prisma.faq.findMany({
    select: { id: true, question: true, answer: true, sortOrder: true, isDemo: true },
    where: {
      ...published(new Date()),
      ...(packageSlug
        ? { package: { slug: packageSlug } }
        : { packageId: null }),
    },
    orderBy: { sortOrder: "asc" },
  });
  response.json({
    data: records.map(({ id, question, answer, sortOrder, isDemo }) => ({
      id,
      question,
      answer,
      sortOrder,
      isDemo,
    })),
  });
});

const publishedSampleTestimonialIds = [
  "demo-testimonial-kashmir",
  "demo-testimonial-chardham",
  "demo-testimonial-rajasthan",
];

publicContentRouter.get("/testimonials", publicReadCache, async (_request, response) => {
  const now = new Date();
  const records = await prisma.testimonial.findMany({
    select: { id: true, publicName: true, location: true, tripName: true, quote: true, rating: true, sortOrder: true, isDemo: true },
    where: {
      status: "PUBLISHED",
      publishedAt: { not: null, lte: now },
      approved: true,
      ...(env.DEMO_MODE
        ? {}
        : {
            OR: [
              { isDemo: false },
              { id: { in: publishedSampleTestimonialIds } },
            ],
          }),
    },
    orderBy: { sortOrder: "asc" },
  });
  response.json({
    data: records.map(({ id, publicName, location, tripName, quote, rating, sortOrder, isDemo }) => ({
      id,
      publicName,
      location,
      tripName,
      quote,
      rating,
      sortOrder,
      isDemo,
    })),
  });
});
