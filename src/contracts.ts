import { z } from "zod";

export const publicationStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);
export type PublicationStatus = z.infer<typeof publicationStatusSchema>;

export const moneySchema = z.object({
  amount: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  currency: z.string().length(3),
  basis: z.enum(["PER_PERSON", "PER_GROUP", "PER_ROOM", "ON_REQUEST"]),
});

export const packageListQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    destination: z.string().trim().max(180).optional(),
    category: z.string().trim().max(180).optional(),
    startingCity: z.string().trim().max(160).optional(),
    minDays: z.coerce.number().int().min(1).max(90).optional(),
    maxDays: z.coerce.number().int().min(1).max(90).optional(),
    minPrice: z.coerce
      .number()
      .finite()
      .nonnegative()
      .max(100_000_000)
      .optional(),
    maxPrice: z.coerce
      .number()
      .finite()
      .nonnegative()
      .max(100_000_000)
      .optional(),
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
      .optional(),
    sort: z
      .enum(["featured", "newest", "price-asc", "price-desc", "duration"])
      .default("featured"),
    page: z.coerce.number().int().min(1).max(1000).default(1),
    pageSize: z.coerce.number().int().min(1).max(48).default(12),
  })
  .superRefine((value, context) => {
    if (
      value.minDays !== undefined &&
      value.maxDays !== undefined &&
      value.minDays > value.maxDays
    ) {
      context.addIssue({
        code: "custom",
        path: ["maxDays"],
        message: "Maximum duration must be at least the minimum.",
      });
    }
    if (
      value.minPrice !== undefined &&
      value.maxPrice !== undefined &&
      value.minPrice > value.maxPrice
    ) {
      context.addIssue({
        code: "custom",
        path: ["maxPrice"],
        message: "Maximum price must be at least the minimum.",
      });
    }
  });

export const packageCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  days: z.number().int().positive(),
  nights: z.number().int().nonnegative(),
  startingCity: z.string().nullable(),
  destinations: z.array(z.object({ slug: z.string(), name: z.string() })),
  categories: z.array(z.object({ slug: z.string(), name: z.string() })),
  highlights: z.array(z.string()),
  startingPrice: moneySchema.nullable(),
  cover: z
    .object({
      id: z.string(),
      url: z.string(),
      width: z.number().nullable(),
      height: z.number().nullable(),
      altText: z.string(),
      caption: z.string().nullable(),
    })
    .nullable(),
  isDemo: z.boolean(),
});

export const packageDetailSchema = packageCardSchema.extend({
  overview: z.string(),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  importantInformation: z.string().nullable(),
  transportInformation: z.string().nullable(),
  accommodationNotes: z.string().nullable(),
  cancellationRules: z.string().nullable(),
  seo: z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
  }),
  brochure: z
    .object({
      id: z.string(),
      url: z.string(),
      originalName: z.string(),
      mimeType: z.literal("application/pdf"),
    })
    .nullable(),
  media: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      width: z.number().nullable(),
      height: z.number().nullable(),
      altText: z.string(),
      caption: z.string().nullable(),
    }),
  ),
  itinerary: z.array(
    z.object({
      dayNumber: z.number().int().positive(),
      title: z.string(),
      description: z.string(),
    }),
  ),
  departures: z.array(
    z.object({
      id: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      price: moneySchema.nullable(),
    }),
  ),
  relatedPackages: z.array(packageCardSchema),
});

export const packageListResponseSchema = z.object({
  data: z.array(packageCardSchema),
  meta: z.object({ page: z.number(), pageSize: z.number(), total: z.number() }),
});

export const packageDetailResponseSchema = z.object({
  data: packageDetailSchema,
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
    requestId: z.string(),
  }),
});

export type PackageListQuery = z.infer<typeof packageListQuerySchema>;
export type PackageCard = z.infer<typeof packageCardSchema>;
export type PackageDetail = z.infer<typeof packageDetailSchema>;
export type PackageListResponse = z.infer<typeof packageListResponseSchema>;
export type PackageDetailResponse = z.infer<typeof packageDetailResponseSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;
