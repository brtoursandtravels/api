import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const booleanFromString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    DATABASE_URL: z.string().url().startsWith("mysql://"),
    DATABASE_CONNECTION_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),
    PUBLIC_SITE_URL: z.string().url(),
    CORS_ALLOWED_ORIGINS: z.string().min(1),
    SESSION_SECRET: z.string().min(64),
    SESSION_COOKIE_NAME: z.string().min(1).max(100).default("br_admin_session"),
    SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(12),
    CSRF_TTL_MINUTES: z.coerce.number().int().min(5).max(120).default(30),
    PASSWORD_RESET_TTL_MINUTES: z.coerce
      .number()
      .int()
      .min(10)
      .max(120)
      .default(30),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(2).default(0),
    DEMO_MODE: booleanFromString.default(false),
    ALLOW_DEMO_SEED: booleanFromString.default(false),
    MEDIA_ROOT: z.string().min(1).default("./storage/media"),
    MEDIA_PUBLIC_BASE_URL: z.string().startsWith("/").default("/media"),
    MAX_UPLOAD_BYTES: z.coerce
      .number()
      .int()
      .min(1024)
      .max(25_000_000)
      .default(8_000_000),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535),
    SMTP_SECURE: booleanFromString.default(false),
    SMTP_FROM: z.string().email(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASSWORD: z.string().min(1).optional(),
    STAFF_NOTIFICATION_EMAIL: z.string().email().optional(),
    NOTIFICATION_POLL_MS: z.coerce
      .number()
      .int()
      .min(250)
      .max(60_000)
      .default(5000),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === "production" && value.DEMO_MODE) {
      context.addIssue({
        code: "custom",
        path: ["DEMO_MODE"],
        message: "DEMO_MODE must be false in production.",
      });
    }
    if (value.NODE_ENV === "production" && value.ALLOW_DEMO_SEED) {
      context.addIssue({
        code: "custom",
        path: ["ALLOW_DEMO_SEED"],
        message: "ALLOW_DEMO_SEED must be false in production.",
      });
    }
    if (Boolean(value.SMTP_USER) !== Boolean(value.SMTP_PASSWORD)) {
      context.addIssue({
        code: "custom",
        path: ["SMTP_PASSWORD"],
        message: "SMTP_USER and SMTP_PASSWORD must be configured together.",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    "Invalid API environment configuration.",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("API environment validation failed.");
}

export const env = {
  ...parsed.data,
  CORS_ALLOWED_ORIGINS: parsed.data.CORS_ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
