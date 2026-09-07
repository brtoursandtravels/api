import argon2 from "argon2";
import { prisma } from "./database.js";
import { env } from "./env.js";

const testPassword = "Playwright-Only-Password-2026!";
const accounts = [
  {
    email: "e2e-super@example.invalid",
    displayName: "E2E Super Admin",
    role: "SUPER_ADMIN" as const,
  },
  {
    email: "e2e-editor@example.invalid",
    displayName: "E2E Content Editor",
    role: "CONTENT_EDITOR" as const,
  },
  {
    email: "e2e-sales@example.invalid",
    displayName: "E2E Sales Agent",
    role: "SALES_AGENT" as const,
  },
];

async function main() {
  if (env.NODE_ENV !== "test" || !env.DATABASE_URL.endsWith("/br_tours_test")) {
    throw new Error(
      "E2E fixtures refuse to run outside the dedicated br_tours_test database.",
    );
  }
  const passwordHash = await argon2.hash(testPassword, {
    type: argon2.argon2id,
  });
  for (const account of accounts) {
    const current = await prisma.adminUser.findUnique({
      where: { email: account.email },
    });
    if (current)
      await prisma.session.deleteMany({ where: { userId: current.id } });
    await prisma.adminUser.upsert({
      where: { email: account.email },
      create: { ...account, passwordHash },
      update: {
        displayName: account.displayName,
        role: account.role,
        status: "ACTIVE",
        passwordHash,
      },
    });
  }
  console.log("Isolated Playwright staff fixtures are ready in br_tours_test.");
}

main().finally(async () => prisma.$disconnect());
