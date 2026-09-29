import { config } from "dotenv";

config({ path: ".env" });

const required = [
  "DATABASE_URL",
  "PUBLIC_SITE_URL",
  "CORS_ALLOWED_ORIGINS",
  "SESSION_SECRET",
  "SMTP_HOST",
  "SMTP_FROM",
] as const;

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    "Missing required environment variables: " + missing.join(", "),
  );
  process.exitCode = 1;
} else if ((process.env.SESSION_SECRET?.length ?? 0) < 64) {
  console.error("SESSION_SECRET must be at least 64 characters.");
  process.exitCode = 1;
} else if (
  process.env.NODE_ENV === "production" &&
  (process.env.DEMO_MODE === "true" || process.env.ALLOW_DEMO_SEED === "true")
) {
  console.error("Production cannot enable demo mode or demo seeding.");
  process.exitCode = 1;
} else {
  console.log(
    "Environment contract is valid for " +
      (process.env.NODE_ENV ?? "development") +
      ".",
  );
}
