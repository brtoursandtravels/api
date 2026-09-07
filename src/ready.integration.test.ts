import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./database.js";

describe("real MySQL readiness", () => {
  it("executes a query through the configured Prisma adapter", async () => {
    const result = await prisma.$queryRaw<
      Array<{ ready: bigint }>
    >`SELECT 1 AS ready`;
    expect(Number(result[0]?.ready)).toBe(1);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
