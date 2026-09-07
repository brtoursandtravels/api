import { config } from "dotenv";
import argon2 from "argon2";
import { input, password, select } from "@inquirer/prompts";
import { createOperationalPrisma } from "./lib/database.js";

config({ path: ".env" });

if (
  process.env.NODE_ENV === "production" &&
  process.env.ALLOW_ADMIN_BOOTSTRAP !== "true"
) {
  throw new Error(
    "Set ALLOW_ADMIN_BOOTSTRAP=true only for the one-time production bootstrap.",
  );
}

const email = (
  await input({
    message: "Admin email",
    validate: (value) =>
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? true : "Enter a valid email.",
  })
)
  .trim()
  .toLowerCase();
const displayName = await input({
  message: "Display name",
  validate: (value) =>
    value.trim().length >= 2 ? true : "Enter at least 2 characters.",
});
const role = await select({
  message: "Role",
  choices: [
    { name: "Super Admin", value: "SUPER_ADMIN" as const },
    { name: "Content Editor", value: "CONTENT_EDITOR" as const },
    { name: "Sales Agent", value: "SALES_AGENT" as const },
  ],
});
const plainPassword = await password({
  message: "Password (hidden)",
  mask: "*",
  validate: (value) =>
    value.length >= 14 ? true : "Use at least 14 characters.",
});
const confirmation = await password({ message: "Confirm password", mask: "*" });
if (plainPassword !== confirmation) {
  throw new Error("Password confirmation did not match.");
}

const prisma = createOperationalPrisma();
try {
  const passwordHash = await argon2.hash(plainPassword, {
    type: argon2.argon2id,
  });
  await prisma.adminUser.create({
    data: {
      email,
      displayName: displayName.trim(),
      role,
      passwordHash,
      status: "ACTIVE",
    },
  });
  console.log(
    "Admin created for " +
      email +
      ". No password was logged or stored in source.",
  );
} finally {
  await prisma.$disconnect();
}
