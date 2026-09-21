import { createHash, randomBytes } from "node:crypto";

function categorySlug(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ").toLowerCase();
  const slug = normalized.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").slice(0, 180).replace(/^-|-$/g, "");
  return slug.length >= 2 ? slug : `category-${createHash("sha256").update(normalized).digest("hex").slice(0, 12)}`;
}

/** Let the unique database constraint resolve collisions, including concurrent creates. */
export async function createCategoryWithSlug<T>(name: string, suppliedSlug: string | undefined, create: (slug: string) => Promise<T>): Promise<T> {
  const base = suppliedSlug ?? categorySlug(name);
  for (let attempt = 0; ; attempt++) {
    const slug = attempt === 0 ? base : `${base.slice(0, 171).replace(/-$/, "")}-${randomBytes(4).toString("hex")}`;
    try {
      return await create(slug);
    } catch (error) {
      const collision = typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
      // Explicit slugs remain supported for older clients. Other failures must surface.
      if (suppliedSlug !== undefined || !collision || attempt >= 4) throw error;
    }
  }
}
