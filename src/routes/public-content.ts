import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database.js";
import { env } from "../env.js";
import type { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/http-error.js";
import { publicMediaUrl } from "../lib/media-url.js";
import { readingMinutes, sanitizeRichText } from "../lib/rich-text.js";

const pageQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(180).optional(),
  destination: z.string().trim().max(180).optional(),
  package: z.string().trim().max(180).optional(),
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

publicContentRouter.get("/site", async (_request, response) => {
  const [settings, menus] = await prisma.$transaction([
    prisma.setting.findMany({
      where: { isPublic: true },
      orderBy: { key: "asc" },
    }),
    prisma.navigationMenu.findMany({
      include: {
        items: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { key: "asc" },
    }),
  ]);
  response.json({
    data: {
      settings: Object.fromEntries(
        settings.map((setting) => [setting.key, setting.value]),
      ),
      menus: menus.map((menu) => ({
        key: menu.key,
        label: menu.label,
        items: menu.items.map((item) => ({
          id: item.id,
          parentId: item.parentId,
          label: item.label,
          href: item.href,
          sortOrder: item.sortOrder,
        })),
      })),
    },
  });
});

publicContentRouter.get("/home", async (_request, response) => {
  const now = new Date();
  const sections = await prisma.homepageSection.findMany({
    where: { ...published(now), isVisible: true },
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

publicContentRouter.get("/pages/:slug", async (request, response) => {
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

publicContentRouter.get("/destinations", async (_request, response) => {
  const records = await prisma.destination.findMany({
    where: published(new Date()),
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  response.json({
    data: records.map((record) => ({
      id: record.id,
      slug: record.slug,
      name: record.name,
      summary: record.summary,
      isDemo: record.isDemo,
    })),
  });
});

publicContentRouter.get("/categories", async (_request, response) => {
  const records = await prisma.category.findMany({
    where: published(new Date()),
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

publicContentRouter.get("/gallery/albums", async (request, response) => {
  const query = pageQuerySchema.parse(request.query);
  const packageDestinations = query.package
    ? await prisma.package.findFirst({
        where: { slug: query.package, ...published(new Date()) },
        select: {
          destinations: { select: { destinationId: true } },
        },
      })
    : null;
  const where: Prisma.GalleryAlbumWhereInput = {
    ...published(new Date()),
    ...(query.destination ? { destination: { slug: query.destination } } : {}),
    ...(query.package
      ? {
          destinationId: {
            in:
              packageDestinations?.destinations.map(
                (item) => item.destinationId,
              ) ?? [],
          },
        }
      : {}),
  };
  const [total, records] = await prisma.$transaction([
    prisma.galleryAlbum.count({ where }),
    prisma.galleryAlbum.findMany({
      where,
      include: {
        destination: { select: { slug: true, name: true } },
        images: {
          where: { mediaAsset: { visibility: "PUBLIC" } },
          orderBy: { sortOrder: "asc" },
          take: 1,
          include: { mediaAsset: true },
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
      isDemo: record.isDemo,
    })),
    meta: { page: query.page, pageSize: query.pageSize, total },
  });
});

publicContentRouter.get("/gallery/albums/:slug", async (request, response) => {
  const slug = z.string().min(1).max(180).parse(request.params.slug);
  const record = await prisma.galleryAlbum.findFirst({
    where: { slug, ...published(new Date()) },
    include: {
      destination: { select: { slug: true, name: true } },
      images: {
        where: { mediaAsset: { visibility: "PUBLIC" } },
        orderBy: { sortOrder: "asc" },
        include: { mediaAsset: true },
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

publicContentRouter.get("/blog/categories", async (_request, response) => {
  const records = await prisma.blogCategory.findMany({
    where: published(new Date()),
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

publicContentRouter.get("/blog", async (request, response) => {
  const query = pageQuerySchema.parse(request.query);
  const where: Prisma.BlogPostWhereInput = {
    ...published(new Date()),
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
  const [total, records] = await prisma.$transaction([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      include: {
        category: { select: { slug: true, name: true } },
        coverMedia: true,
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
      author: record.publicAuthorName
        ? { name: record.publicAuthorName }
        : null,
      isDemo: record.isDemo,
    })),
    meta: { page: query.page, pageSize: query.pageSize, total },
  });
});

publicContentRouter.get("/blog/:slug", async (request, response) => {
  const slug = z.string().min(1).max(180).parse(request.params.slug);
  const now = new Date();
  const record = await prisma.blogPost.findFirst({
    where: { slug, ...published(now) },
    include: {
      category: { select: { slug: true, name: true } },
      coverMedia: true,
      tags: { include: { tag: { select: { slug: true, name: true } } } },
      relatedArticles: {
        where: { relatedPost: { is: published(now) } },
        include: {
          relatedPost: {
            include: {
              category: { select: { slug: true, name: true } },
              coverMedia: true,
            },
          },
        },
      },
      relatedTours: {
        where: { package: { is: published(now) } },
        include: {
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
      tags: record.tags.map(({ tag }) => tag),
      cover:
        record.coverMedia?.visibility === "PUBLIC"
          ? mediaDto(record.coverMedia)
          : null,
      publishedAt: record.publishedAt!.toISOString(),
      readingMinutes: readingMinutes(record.contentHtml),
      author: record.publicAuthorName
        ? { name: record.publicAuthorName, bio: record.publicAuthorBio }
        : null,
      seo: { title: record.seoTitle, description: record.seoDescription },
      relatedArticles: record.relatedArticles.map(({ relatedPost }) => ({
        id: relatedPost.id,
        slug: relatedPost.slug,
        title: relatedPost.title,
        excerpt: relatedPost.excerpt,
        category: relatedPost.category,
        cover:
          relatedPost.coverMedia?.visibility === "PUBLIC"
            ? mediaDto(relatedPost.coverMedia)
            : null,
        publishedAt: relatedPost.publishedAt!.toISOString(),
      })),
      relatedPackages: record.relatedTours.map(
        ({ package: relatedPackage }) => relatedPackage,
      ),
      isDemo: record.isDemo,
    },
  });
});

publicContentRouter.get("/faqs", async (request, response) => {
  const packageSlug = z
    .string()
    .trim()
    .max(180)
    .optional()
    .parse(request.query.package);
  const records = await prisma.faq.findMany({
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

publicContentRouter.get("/testimonials", async (_request, response) => {
  const records = await prisma.testimonial.findMany({
    where: { ...published(new Date()), approved: true },
    orderBy: { sortOrder: "asc" },
  });
  response.json({
    data: records.map(({ id, publicName, quote, sortOrder }) => ({
      id,
      publicName,
      quote,
      sortOrder,
    })),
  });
});
