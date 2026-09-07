import { describe, expect, it } from "vitest";
import { publicPackageWhere } from "./publication.js";

describe("publicPackageWhere", () => {
  it("requires eligible publication and excludes demos by default", () => {
    const now = new Date("2026-08-31T12:00:00.000Z");
    expect(publicPackageWhere(now, false)).toEqual({
      status: "PUBLISHED",
      publishedAt: { not: null, lte: now },
      isDemo: false,
    });
  });

  it("allows labelled demo rows only when explicitly enabled", () => {
    const where = publicPackageWhere(
      new Date("2026-08-31T12:00:00.000Z"),
      true,
    );
    expect(where).not.toHaveProperty("isDemo");
  });
});
