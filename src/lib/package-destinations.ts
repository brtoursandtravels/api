import { createHash } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "./http-error.js";

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");
const nameKey = (name: string) => normalizeName(name).toLowerCase();

export const destinationNamesSchema = z.array(
  z.string().transform(normalizeName).pipe(
    z.string().min(1).max(160).regex(/[\p{L}\p{N}]/u, "Enter a destination name."),
  ),
).max(20).transform((names) => {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = nameKey(name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});

export function destinationSlug(name: string) {
  const slug = nameKey(name).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug.length >= 2 ? slug : `destination-${nameHash(name)}`;
}

function nameHash(name: string) {
  return createHash("sha256").update(nameKey(name)).digest("hex").slice(0, 12);
}

/** Resolve typed names inside the package transaction, without changing existing names or covers. */
export async function resolvePackageDestinations(
  transaction: Pick<Prisma.TransactionClient, "destination">,
  input: {
    destinationNames?: string[] | undefined;
    destinationIds: string[];
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    publishedAt?: string | null | undefined;
    isDemo: boolean;
  },
) {
  // Preserve compatibility with existing API clients and older admin deployments.
  if (input.destinationNames === undefined) return [...new Set(input.destinationIds)];
  const names = destinationNamesSchema.parse(input.destinationNames);
  if (!names.length) return [];
  const records = await transaction.destination.findMany({
    where: { OR: [{ name: { in: names } }, { slug: { in: names.map(destinationSlug) } }] },
    orderBy: { createdAt: "asc" },
  });
  const ids: string[] = [];
  const published = input.status === "PUBLISHED";
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();
  for (const name of names) {
    let record = records.find((item) => nameKey(item.name) === nameKey(name));
    if (!record) {
      let slug = destinationSlug(name);
      const existing = records.find((item) => item.slug === slug);
      if (existing && nameKey(existing.name) === nameKey(name)) {
        record = existing;
      } else {
        // Different place names can produce the same URL slug. Never relabel another destination.
        if (existing) slug = `${slug}-${nameHash(name)}`;
        record = await transaction.destination.upsert({
          where: { slug },
          create: {
            name, slug, isDemo: input.isDemo,
            status: published ? "PUBLISHED" : "DRAFT",
            publishedAt: published ? publishedAt : null,
          },
          update: {},
        });
        records.push(record);
      }
    }
    if (record.status === "ARCHIVED") {
      throw new HttpError(400, "DESTINATION_INVALID", `The destination "${name}" is archived. Enter a different destination.`);
    }
    // Newly typed destinations stay private with drafts and become public with the package.
    if (published && !input.isDemo && (
      record.status !== "PUBLISHED" || record.isDemo ||
      !record.publishedAt || record.publishedAt > publishedAt
    )) {
      await transaction.destination.update({
        where: { id: record.id },
        data: { status: "PUBLISHED", isDemo: false, publishedAt },
      });
    }
    if (!ids.includes(record.id)) ids.push(record.id);
  }
  return ids;
}
