import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database.js";
import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/http-error.js";
import { sanitizeRichText } from "../lib/rich-text.js";
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
const publicationSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
  isDemo: z.boolean().default(false),
});
const jsonValueSchema = z.json();

function publicationData(input: z.infer<typeof publicationSchema>) {
  return {
    status: input.status,
    publishedAt:
      input.status === "PUBLISHED"
        ? input.publishedAt
          ? new Date(input.publishedAt)
          : new Date()
        : input.publishedAt
          ? new Date(input.publishedAt)
          : null,
    isDemo: input.isDemo,
  };
}

async function audit(
  request: Request,
  response: Response,
  action: string,
  entityType: string,
  entityId: string,
  before?: Prisma.InputJsonValue,
  after?: Prisma.InputJsonValue,
) {
  await prisma.auditLog.create({
    data: {
      actorId: request.auth!.user.id,
      action,
      entityType,
      entityId,
      ...(before ? { before } : {}),
      ...(after ? { after } : {}),
      requestId: String(response.locals.requestId),
    },
  });
}

function prismaJson(value: z.infer<typeof jsonValueSchema>) {
  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

export const adminContentRouter = Router();
adminContentRouter.use(
  optionalSession,
  requireAuth,
  requireRole("SUPER_ADMIN", "CONTENT_EDITOR"),
);

const pageSchema = publicationSchema
  .extend({
    slug: slugSchema,
    title: z.string().trim().min(2).max(220),
    contentHtml: z.string().trim().min(10).max(200_000),
    seoTitle: z.string().trim().max(70).nullable().optional(),
    seoDescription: z.string().trim().max(170).nullable().optional(),
    ownerReviewDue: z.boolean().default(false),
  })
  .strict();

adminContentRouter.get("/pages", async (_request, response) => {
  const records = await prisma.contentPage.findMany({
    orderBy: { updatedAt: "desc" },
  });
  response.json({ data: records });
});

adminContentRouter.post("/pages", requireCsrf, async (request, response) => {
  const input = pageSchema.parse(request.body);
  const contentHtml = sanitizeRichText(input.contentHtml);
  if (contentHtml.replace(/<[^>]+>/g, "").trim().length < 10) {
    throw new HttpError(400, "CONTENT_EMPTY", "Add meaningful page content.");
  }
  const record = await prisma.contentPage.create({
    data: {
      slug: input.slug,
      title: input.title,
      contentHtml,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ownerReviewDue: input.ownerReviewDue,
      ...publicationData(input),
    },
  });
  await audit(
    request,
    response,
    "PAGE_CREATED",
    "ContentPage",
    record.id,
    undefined,
    {
      slug: record.slug,
      title: record.title,
      status: record.status,
    },
  );
  response.status(201).json({ data: record });
});

adminContentRouter.put("/pages/:id", requireCsrf, async (request, response) => {
  const id = z.string().max(30).parse(request.params.id);
  const input = pageSchema.parse(request.body);
  const current = await prisma.contentPage.findUnique({ where: { id } });
  if (!current)
    throw new HttpError(404, "PAGE_NOT_FOUND", "The page was not found.");
  const contentHtml = sanitizeRichText(input.contentHtml);
  const record = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.contentPage.update({
      where: { id },
      data: {
        slug: input.slug,
        title: input.title,
        contentHtml,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        ownerReviewDue: input.ownerReviewDue,
        ...publicationData(input),
      },
    });
    if (current.slug !== input.slug) {
      await transaction.slugRedirect.upsert({
        where: {
          entityType_oldSlug: {
            entityType: "ContentPage",
            oldSlug: current.slug,
          },
        },
        create: {
          entityType: "ContentPage",
          oldSlug: current.slug,
          targetSlug: input.slug,
        },
        update: { targetSlug: input.slug, isActive: true },
      });
    }
    return updated;
  });
  await audit(
    request,
    response,
    "PAGE_UPDATED",
    "ContentPage",
    id,
    { slug: current.slug },
    { slug: record.slug, status: record.status },
  );
  response.json({ data: record });
});

adminContentRouter.delete(
  "/pages/:id",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    await prisma.contentPage.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    await audit(request, response, "PAGE_ARCHIVED", "ContentPage", id);
    response.status(204).send();
  },
);

const blogCategorySchema = publicationSchema
  .extend({ slug: slugSchema, name: z.string().trim().min(2).max(160) })
  .strict();

adminContentRouter.get("/blog/categories", async (_request, response) => {
  response.json({
    data: await prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  });
});

adminContentRouter.post(
  "/blog/categories",
  requireCsrf,
  async (request, response) => {
    const input = blogCategorySchema.parse(request.body);
    const record = await prisma.blogCategory.create({
      data: { slug: input.slug, name: input.name, ...publicationData(input) },
    });
    await audit(
      request,
      response,
      "BLOG_CATEGORY_CREATED",
      "BlogCategory",
      record.id,
    );
    response.status(201).json({ data: record });
  },
);

adminContentRouter.put(
  "/blog/categories/:id",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    const input = blogCategorySchema.parse(request.body);
    const record = await prisma.blogCategory.update({
      where: { id },
      data: { slug: input.slug, name: input.name, ...publicationData(input) },
    });
    await audit(request, response, "BLOG_CATEGORY_UPDATED", "BlogCategory", id);
    response.json({ data: record });
  },
);

adminContentRouter.delete(
  "/blog/categories/:id",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    await prisma.blogCategory.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    response.status(204).send();
  },
);

const blogPostSchema = publicationSchema
  .extend({
    slug: slugSchema,
    title: z.string().trim().min(2).max(220),
    excerpt: z.string().trim().min(10).max(500),
    contentHtml: z.string().trim().min(10).max(300_000),
    categoryId: z.string().max(30).nullable().optional(),
    coverMediaId: z.string().max(30).nullable().optional(),
    publicAuthorName: z.string().trim().max(120).nullable().optional(),
    publicAuthorBio: z.string().trim().max(1000).nullable().optional(),
    seoTitle: z.string().trim().max(70).nullable().optional(),
    seoDescription: z.string().trim().max(170).nullable().optional(),
    tagIds: z.array(z.string().max(30)).max(30).default([]),
    relatedPackageIds: z.array(z.string().max(30)).max(30).default([]),
    relatedPostIds: z.array(z.string().max(30)).max(12).default([]),
    isFeatured: z.boolean().default(false),
  })
  .strict();

const adminBlogInclude = {
  category: true,
  coverMedia: {
    select: { id: true, storageKey: true, altText: true, visibility: true },
  },
  tags: { include: { tag: true } },
  relatedTours: {
    include: { package: { select: { id: true, slug: true, title: true } } },
  },
  relatedArticles: {
    include: {
      relatedPost: {
        select: { id: true, slug: true, title: true, status: true },
      },
    },
  },
} satisfies Prisma.BlogPostInclude;

adminContentRouter.get("/blog/posts", async (_request, response) => {
  const records = await prisma.blogPost.findMany({
    include: adminBlogInclude,
    orderBy: { updatedAt: "desc" },
  });
  response.json({ data: records });
});

async function verifyBlogRelations(
  input: z.infer<typeof blogPostSchema>,
  currentId?: string,
) {
  if (currentId && input.relatedPostIds.includes(currentId))
    throw new HttpError(
      400,
      "RELATED_POST_INVALID",
      "An article cannot relate to itself.",
    );
  const [categories, media, tags, packages, posts] = await prisma.$transaction([
    input.categoryId
      ? prisma.blogCategory.count({
          where: { id: input.categoryId, status: { not: "ARCHIVED" } },
        })
      : prisma.blogCategory.count({ where: { id: "__none__" } }),
    input.coverMediaId
      ? prisma.mediaAsset.count({
          where: { id: input.coverMediaId, mimeType: { startsWith: "image/" } },
        })
      : prisma.mediaAsset.count({ where: { id: "__none__" } }),
    prisma.tag.count({ where: { id: { in: input.tagIds } } }),
    prisma.package.count({ where: { id: { in: input.relatedPackageIds } } }),
    prisma.blogPost.count({
      where: { id: { in: input.relatedPostIds }, status: { not: "ARCHIVED" } },
    }),
  ]);
  if (input.categoryId && categories !== 1)
    throw new HttpError(
      400,
      "BLOG_CATEGORY_INVALID",
      "Choose a valid blog category.",
    );
  if (input.coverMediaId && media !== 1)
    throw new HttpError(
      400,
      "COVER_MEDIA_INVALID",
      "Choose a valid cover image.",
    );
  if (tags !== new Set(input.tagIds).size)
    throw new HttpError(400, "TAG_INVALID", "One or more tags are invalid.");
  if (packages !== new Set(input.relatedPackageIds).size)
    throw new HttpError(
      400,
      "PACKAGE_INVALID",
      "One or more related packages are invalid.",
    );
  if (posts !== new Set(input.relatedPostIds).size)
    throw new HttpError(
      400,
      "RELATED_POST_INVALID",
      "One or more related articles are invalid.",
    );
}

function blogScalar(input: z.infer<typeof blogPostSchema>, authorId: string) {
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    contentHtml: sanitizeRichText(input.contentHtml),
    categoryId: input.categoryId ?? null,
    coverMediaId: input.coverMediaId ?? null,
    authorId,
    publicAuthorName: input.publicAuthorName ?? null,
    publicAuthorBio: input.publicAuthorBio ?? null,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    isFeatured: input.isFeatured,
    ...publicationData(input),
  } satisfies Prisma.BlogPostUncheckedCreateInput;
}

adminContentRouter.post(
  "/blog/posts",
  requireCsrf,
  async (request, response) => {
    const input = blogPostSchema.parse(request.body);
    await verifyBlogRelations(input);
    const record = await prisma.$transaction(async (transaction) => {
      const created = await transaction.blogPost.create({
        data: blogScalar(input, request.auth!.user.id),
      });
      if (input.tagIds.length)
        await transaction.blogPostTag.createMany({
          data: input.tagIds.map((tagId) => ({ postId: created.id, tagId })),
        });
      if (input.relatedPackageIds.length)
        await transaction.blogPostPackage.createMany({
          data: input.relatedPackageIds.map((packageId) => ({
            postId: created.id,
            packageId,
          })),
        });
      if (input.relatedPostIds.length)
        await transaction.blogPostRelated.createMany({
          data: input.relatedPostIds.map((relatedPostId) => ({
            postId: created.id,
            relatedPostId,
          })),
        });
      return transaction.blogPost.findUniqueOrThrow({
        where: { id: created.id },
        include: adminBlogInclude,
      });
    });
    await audit(
      request,
      response,
      "BLOG_POST_CREATED",
      "BlogPost",
      record.id,
      undefined,
      { slug: record.slug, status: record.status },
    );
    response.status(201).json({ data: record });
  },
);

adminContentRouter.put(
  "/blog/posts/:id",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    const input = blogPostSchema.parse(request.body);
    await verifyBlogRelations(input, id);
    const current = await prisma.blogPost.findUnique({ where: { id } });
    if (!current)
      throw new HttpError(
        404,
        "BLOG_POST_NOT_FOUND",
        "The article was not found.",
      );
    const record = await prisma.$transaction(async (transaction) => {
      await transaction.blogPost.update({
        where: { id },
        data: blogScalar(input, request.auth!.user.id),
      });
      await transaction.blogPostTag.deleteMany({ where: { postId: id } });
      await transaction.blogPostPackage.deleteMany({ where: { postId: id } });
      await transaction.blogPostRelated.deleteMany({ where: { postId: id } });
      if (input.tagIds.length)
        await transaction.blogPostTag.createMany({
          data: input.tagIds.map((tagId) => ({ postId: id, tagId })),
        });
      if (input.relatedPackageIds.length)
        await transaction.blogPostPackage.createMany({
          data: input.relatedPackageIds.map((packageId) => ({
            postId: id,
            packageId,
          })),
        });
      if (input.relatedPostIds.length)
        await transaction.blogPostRelated.createMany({
          data: input.relatedPostIds.map((relatedPostId) => ({
            postId: id,
            relatedPostId,
          })),
        });
      if (current.slug !== input.slug) {
        await transaction.slugRedirect.upsert({
          where: {
            entityType_oldSlug: {
              entityType: "BlogPost",
              oldSlug: current.slug,
            },
          },
          create: {
            entityType: "BlogPost",
            oldSlug: current.slug,
            targetSlug: input.slug,
          },
          update: { targetSlug: input.slug, isActive: true },
        });
      }
      return transaction.blogPost.findUniqueOrThrow({
        where: { id },
        include: adminBlogInclude,
      });
    });
    await audit(
      request,
      response,
      "BLOG_POST_UPDATED",
      "BlogPost",
      id,
      { slug: current.slug },
      { slug: record.slug, status: record.status },
    );
    response.json({ data: record });
  },
);

adminContentRouter.delete(
  "/blog/posts/:id",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    await prisma.blogPost.update({
      where: { id },
      data: { status: "ARCHIVED", isFeatured: false },
    });
    await audit(request, response, "BLOG_POST_ARCHIVED", "BlogPost", id);
    response.status(204).send();
  },
);

const tagSchema = z
  .object({ slug: slugSchema, name: z.string().trim().min(2).max(100) })
  .strict();
adminContentRouter.get("/blog/tags", async (_request, response) =>
  response.json({
    data: await prisma.tag.findMany({ orderBy: { name: "asc" } }),
  }),
);
adminContentRouter.post(
  "/blog/tags",
  requireCsrf,
  async (request, response) => {
    const input = tagSchema.parse(request.body);
    response
      .status(201)
      .json({ data: await prisma.tag.create({ data: input }) });
  },
);
adminContentRouter.put(
  "/blog/tags/:id",
  requireCsrf,
  async (request, response) => {
    const input = tagSchema.parse(request.body);
    response.json({
      data: await prisma.tag.update({
        where: { id: z.string().max(30).parse(request.params.id) },
        data: input,
      }),
    });
  },
);

const homeSectionSchema = publicationSchema
  .extend({
    type: z.enum([
      "HERO",
      "DISCOVERY",
      "FEATURED_PACKAGES",
      "CATEGORIES",
      "DESTINATIONS",
      "INTRODUCTION",
      "PLANNING_PROCESS",
      "GALLERY",
      "TESTIMONIALS",
      "LATEST_BLOG",
      "FAQS",
      "CONTACT_CTA",
    ]),
    title: z.string().trim().max(220).nullable().optional(),
    content: jsonValueSchema,
    isVisible: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(1000),
  })
  .strict()
  .refine((input) => JSON.stringify(input.content).length <= 50_000, {
    path: ["content"],
    message: "Section content is too large.",
  });

adminContentRouter.get("/home/sections", async (_request, response) =>
  response.json({
    data: await prisma.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  }),
);
adminContentRouter.post(
  "/home/sections",
  requireCsrf,
  async (request, response) => {
    const input = homeSectionSchema.parse(request.body);
    const record = await prisma.homepageSection.create({
      data: {
        type: input.type,
        title: input.title ?? null,
        content: prismaJson(input.content),
        isVisible: input.isVisible,
        sortOrder: input.sortOrder,
        ...publicationData(input),
      },
    });
    await audit(
      request,
      response,
      "HOME_SECTION_CREATED",
      "HomepageSection",
      record.id,
    );
    response.status(201).json({ data: record });
  },
);
adminContentRouter.put(
  "/home/sections/:id",
  requireCsrf,
  async (request, response) => {
    const input = homeSectionSchema.parse(request.body);
    const record = await prisma.homepageSection.update({
      where: { id: z.string().max(30).parse(request.params.id) },
      data: {
        type: input.type,
        title: input.title ?? null,
        content: prismaJson(input.content),
        isVisible: input.isVisible,
        sortOrder: input.sortOrder,
        ...publicationData(input),
      },
    });
    await audit(
      request,
      response,
      "HOME_SECTION_UPDATED",
      "HomepageSection",
      record.id,
    );
    response.json({ data: record });
  },
);
adminContentRouter.delete(
  "/home/sections/:id",
  requireCsrf,
  async (request, response) => {
    const id = z.string().max(30).parse(request.params.id);
    await prisma.homepageSection.update({
      where: { id },
      data: { status: "ARCHIVED", isVisible: false },
    });
    response.status(204).send();
  },
);

const faqSchema = publicationSchema
  .extend({
    packageId: z.string().max(30).nullable().optional(),
    question: z.string().trim().min(5).max(300),
    answer: z.string().trim().min(5).max(10_000),
    sortOrder: z.number().int().min(0).max(10_000).default(0),
  })
  .strict();
adminContentRouter.get("/faqs", async (_request, response) =>
  response.json({
    data: await prisma.faq.findMany({
      orderBy: [{ packageId: "asc" }, { sortOrder: "asc" }],
    }),
  }),
);
adminContentRouter.post("/faqs", requireCsrf, async (request, response) => {
  const input = faqSchema.parse(request.body);
  const record = await prisma.faq.create({
    data: {
      packageId: input.packageId ?? null,
      question: input.question,
      answer: input.answer,
      sortOrder: input.sortOrder,
      ...publicationData(input),
    },
  });
  response.status(201).json({ data: record });
});
adminContentRouter.put("/faqs/:id", requireCsrf, async (request, response) => {
  const input = faqSchema.parse(request.body);
  response.json({
    data: await prisma.faq.update({
      where: { id: z.string().max(30).parse(request.params.id) },
      data: {
        packageId: input.packageId ?? null,
        question: input.question,
        answer: input.answer,
        sortOrder: input.sortOrder,
        ...publicationData(input),
      },
    }),
  });
});
adminContentRouter.delete(
  "/faqs/:id",
  requireCsrf,
  async (request, response) => {
    await prisma.faq.update({
      where: { id: z.string().max(30).parse(request.params.id) },
      data: { status: "ARCHIVED" },
    });
    response.status(204).send();
  },
);

const testimonialSchema = publicationSchema
  .extend({
    publicName: z.string().trim().min(2).max(120),
    location: z.string().trim().max(120).nullable().optional(),
    tripName: z.string().trim().max(160).nullable().optional(),
    quote: z.string().trim().min(10).max(5000),
    rating: z.number().int().min(1).max(5).default(5),
    consentNotes: z.string().trim().max(5000).nullable().optional(),
    approved: z.boolean().default(false),
    sortOrder: z.number().int().min(0).max(10_000).default(0),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.approved && !value.consentNotes)
      context.addIssue({
        code: "custom",
        path: ["consentNotes"],
        message: "Record consent before approval.",
      });
  });
adminContentRouter.get("/testimonials", async (_request, response) =>
  response.json({
    data: await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
  }),
);
adminContentRouter.post(
  "/testimonials",
  requireCsrf,
  async (request, response) => {
    const input = testimonialSchema.parse(request.body);
    const record = await prisma.testimonial.create({
      data: {
        publicName: input.publicName,
        location: input.location || null,
        tripName: input.tripName || null,
        quote: input.quote,
        rating: input.rating,
        consentNotes: input.consentNotes ?? null,
        approved: input.approved,
        sortOrder: input.sortOrder,
        ...publicationData(input),
      },
    });
    response.status(201).json({ data: record });
  },
);
adminContentRouter.put(
  "/testimonials/:id",
  requireCsrf,
  async (request, response) => {
    const input = testimonialSchema.parse(request.body);
    response.json({
      data: await prisma.testimonial.update({
        where: { id: z.string().max(30).parse(request.params.id) },
        data: {
          publicName: input.publicName,
          location: input.location || null,
          tripName: input.tripName || null,
          quote: input.quote,
          rating: input.rating,
          consentNotes: input.consentNotes ?? null,
          approved: input.approved,
          sortOrder: input.sortOrder,
          ...publicationData(input),
        },
      }),
    });
  },
);
adminContentRouter.delete(
  "/testimonials/:id",
  requireCsrf,
  async (request, response) => {
    await prisma.testimonial.update({
      where: { id: z.string().max(30).parse(request.params.id) },
      data: { status: "ARCHIVED", approved: false },
    });
    response.status(204).send();
  },
);

const forbiddenPublicSetting =
  /(secret|password|token|database|smtp|private|credential|api[_-]?key)/i;
const settingSchema = z
  .object({
    value: jsonValueSchema,
    isPublic: z.boolean(),
    description: z.string().trim().max(500).nullable().optional(),
  })
  .strict();
adminContentRouter.get("/settings", async (_request, response) =>
  response.json({
    data: await prisma.setting.findMany({ orderBy: { key: "asc" } }),
  }),
);
adminContentRouter.put(
  "/settings/:key",
  requireCsrf,
  async (request, response) => {
    const key = z
      .string()
      .trim()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9._-]+$/i)
      .parse(request.params.key);
    const input = settingSchema.parse(request.body);
    if (input.isPublic && forbiddenPublicSetting.test(key))
      throw new HttpError(
        400,
        "PUBLIC_SETTING_FORBIDDEN",
        "Secret-like settings cannot be public.",
      );
    const record = await prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value: prismaJson(input.value),
        isPublic: input.isPublic,
        description: input.description ?? null,
      },
      update: {
        value: prismaJson(input.value),
        isPublic: input.isPublic,
        description: input.description ?? null,
      },
    });
    await audit(
      request,
      response,
      "SETTING_UPDATED",
      "Setting",
      key,
      undefined,
      { isPublic: record.isPublic },
    );
    response.json({ data: record });
  },
);

const safeHrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((value) => {
    if (value.startsWith("/") && !value.startsWith("//")) return true;
    try {
      const url = new URL(value);
      return ["https:", "mailto:", "tel:"].includes(url.protocol);
    } catch {
      return false;
    }
  }, "Use a relative path, HTTPS, mailto or tel URL.");
const menuSchema = z
  .object({
    label: z.string().trim().min(1).max(120),
    items: z
      .array(
        z
          .object({
            key: z
              .string()
              .trim()
              .min(1)
              .max(80)
              .regex(/^[a-z0-9_-]+$/),
            parentKey: z
              .string()
              .trim()
              .min(1)
              .max(80)
              .regex(/^[a-z0-9_-]+$/)
              .nullable()
              .optional(),
            label: z.string().trim().min(1).max(120),
            href: safeHrefSchema,
            sortOrder: z.number().int().min(0).max(1000),
            isVisible: z.boolean(),
          })
          .strict(),
      )
      .max(100),
  })
  .strict()
  .superRefine((value, context) => {
    const keys = new Set(value.items.map((item) => item.key));
    if (keys.size !== value.items.length) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Navigation item keys must be unique.",
      });
    }
    for (const [index, item] of value.items.entries()) {
      if (!item.parentKey) continue;
      if (item.parentKey === item.key || !keys.has(item.parentKey)) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "parentKey"],
          message: "Choose a different top-level item as the parent.",
        });
        continue;
      }
      const parent = value.items.find(
        (candidate) => candidate.key === item.parentKey,
      );
      if (parent?.parentKey) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "parentKey"],
          message: "Navigation supports a maximum of two levels.",
        });
      }
    }
  });
adminContentRouter.get("/navigation", async (_request, response) =>
  response.json({
    data: await prisma.navigationMenu.findMany({
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
  }),
);
adminContentRouter.put(
  "/navigation/:key",
  requireCsrf,
  async (request, response) => {
    const key = z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9_-]+$/)
      .parse(request.params.key);
    const input = menuSchema.parse(request.body);
    const menu = await prisma.$transaction(async (transaction) => {
      const record = await transaction.navigationMenu.upsert({
        where: { key },
        create: { key, label: input.label },
        update: { label: input.label },
      });
      await transaction.navigationItem.deleteMany({
        where: { menuId: record.id },
      });
      const itemIds = new Map<string, string>();
      for (const item of input.items.filter(
        (candidate) => !candidate.parentKey,
      )) {
        const created = await transaction.navigationItem.create({
          data: {
            menuId: record.id,
            label: item.label,
            href: item.href,
            sortOrder: item.sortOrder,
            isVisible: item.isVisible,
          },
        });
        itemIds.set(item.key, created.id);
      }
      for (const item of input.items.filter(
        (candidate) => candidate.parentKey,
      )) {
        const created = await transaction.navigationItem.create({
          data: {
            menuId: record.id,
            parentId: itemIds.get(item.parentKey!)!,
            label: item.label,
            href: item.href,
            sortOrder: item.sortOrder,
            isVisible: item.isVisible,
          },
        });
        itemIds.set(item.key, created.id);
      }
      return transaction.navigationMenu.findUniqueOrThrow({
        where: { id: record.id },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      });
    });
    await audit(
      request,
      response,
      "NAVIGATION_UPDATED",
      "NavigationMenu",
      menu.id,
    );
    response.json({ data: menu });
  },
);

const albumSchema = publicationSchema
  .extend({
    slug: slugSchema,
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(10_000).nullable().optional(),
    destinationId: z.string().max(30).nullable().optional(),
    mediaIds: z.array(z.string().max(30)).max(200).default([]),
  })
  .strict();
const albumInclude = {
  destination: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    include: { mediaAsset: true },
  },
} satisfies Prisma.GalleryAlbumInclude;
type GalleryAlbumRecord = Prisma.GalleryAlbumGetPayload<{
  include: typeof albumInclude;
}>;

function galleryAlbumDto(record: GalleryAlbumRecord) {
  return {
    ...record,
    images: record.images.map((image) => ({
      ...image,
      mediaAsset: {
        ...image.mediaAsset,
        sizeBytes: image.mediaAsset.sizeBytes.toString(),
      },
    })),
  };
}

adminContentRouter.get("/gallery/albums", async (_request, response) =>
  response.json({
    data: (
      await prisma.galleryAlbum.findMany({
        include: albumInclude,
        orderBy: { updatedAt: "desc" },
      })
    ).map(galleryAlbumDto),
  }),
);
async function saveAlbum(
  id: string | null,
  input: z.infer<typeof albumSchema>,
) {
  const mediaCount = await prisma.mediaAsset.count({
    where: { id: { in: input.mediaIds }, mimeType: { startsWith: "image/" } },
  });
  if (mediaCount !== new Set(input.mediaIds).size)
    throw new HttpError(
      400,
      "MEDIA_INVALID",
      "One or more media assets are invalid.",
    );
  return prisma.$transaction(async (transaction) => {
    const album = id
      ? await transaction.galleryAlbum.update({
          where: { id },
          data: {
            slug: input.slug,
            title: input.title,
            description: input.description ?? null,
            destinationId: input.destinationId ?? null,
            ...publicationData(input),
          },
        })
      : await transaction.galleryAlbum.create({
          data: {
            slug: input.slug,
            title: input.title,
            description: input.description ?? null,
            destinationId: input.destinationId ?? null,
            ...publicationData(input),
          },
        });
    await transaction.galleryAlbumImage.deleteMany({
      where: { albumId: album.id },
    });
    if (input.mediaIds.length)
      await transaction.galleryAlbumImage.createMany({
        data: input.mediaIds.map((mediaAssetId, sortOrder) => ({
          albumId: album.id,
          mediaAssetId,
          sortOrder,
        })),
      });
    return transaction.galleryAlbum.findUniqueOrThrow({
      where: { id: album.id },
      include: albumInclude,
    });
  });
}
adminContentRouter.post(
  "/gallery/albums",
  requireCsrf,
  async (request, response) => {
    const record = await saveAlbum(null, albumSchema.parse(request.body));
    await audit(
      request,
      response,
      "GALLERY_ALBUM_CREATED",
      "GalleryAlbum",
      record.id,
    );
    response.status(201).json({ data: galleryAlbumDto(record) });
  },
);
adminContentRouter.put(
  "/gallery/albums/:id",
  requireCsrf,
  async (request, response) => {
    const record = await saveAlbum(
      z.string().max(30).parse(request.params.id),
      albumSchema.parse(request.body),
    );
    await audit(
      request,
      response,
      "GALLERY_ALBUM_UPDATED",
      "GalleryAlbum",
      record.id,
    );
    response.json({ data: galleryAlbumDto(record) });
  },
);
adminContentRouter.delete(
  "/gallery/albums/:id",
  requireCsrf,
  async (request, response) => {
    await prisma.galleryAlbum.update({
      where: { id: z.string().max(30).parse(request.params.id) },
      data: { status: "ARCHIVED" },
    });
    response.status(204).send();
  },
);
