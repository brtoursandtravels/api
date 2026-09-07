import { describe, expect, it } from "vitest";
import { packageListQuerySchema } from "./contracts.js";

describe("packageListQuerySchema", () => {
  it("coerces and bounds pagination", () => {
    expect(packageListQuerySchema.parse({ page: "2", pageSize: "24" })).toEqual(
      {
        page: 2,
        pageSize: 24,
        sort: "featured",
      },
    );
    expect(() => packageListQuerySchema.parse({ pageSize: "500" })).toThrow();
  });

  it("rejects oversized searches", () => {
    expect(() =>
      packageListQuerySchema.parse({ q: "x".repeat(121) }),
    ).toThrow();
  });

  it("validates duration and price ranges", () => {
    expect(() =>
      packageListQuerySchema.parse({ minDays: "8", maxDays: "4" }),
    ).toThrow();
    expect(() =>
      packageListQuerySchema.parse({ minPrice: "20000", maxPrice: "10000" }),
    ).toThrow();
    expect(
      packageListQuerySchema.parse({ month: "2026-09", sort: "duration" }),
    ).toEqual(expect.objectContaining({ month: "2026-09", sort: "duration" }));
  });
});
