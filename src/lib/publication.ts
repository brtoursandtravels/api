import type { PackageWhereInput } from "../generated/prisma/models/Package.js";

export function publicPackageWhere(
  now: Date,
  allowDemo: boolean,
): PackageWhereInput {
  return {
    status: "PUBLISHED",
    publishedAt: { not: null, lte: now },
    ...(allowDemo ? {} : { isDemo: false }),
  };
}
