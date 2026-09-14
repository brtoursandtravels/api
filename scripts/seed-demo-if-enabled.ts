import { config } from "dotenv";

config({ path: ".env" });

const demoSeedEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.ALLOW_DEMO_SEED === "true";

if (demoSeedEnabled) {
  console.log("Demo seeding is enabled; synchronising demo content.");
  await import("../prisma/seed.js");
} else {
  console.log(
    "Skipping demo seed. It runs only outside production when ALLOW_DEMO_SEED=true.",
  );
}
