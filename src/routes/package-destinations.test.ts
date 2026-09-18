import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import type { Destination } from "../generated/prisma/client.js";
import { destinationNamesSchema, destinationSlug } from "../lib/package-destinations.js";

// Tests use only in-memory delegates; no real database is read or written.
Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/destination_tests",
  PUBLIC_SITE_URL: "http://localhost", CORS_ALLOWED_ORIGINS: "http://localhost",
  SESSION_SECRET: "package-destinations-test-only-".repeat(8), SMTP_HOST: "localhost",
  SMTP_PORT: "1025", SMTP_FROM: "test@example.com",
});
delete process.env.VERCEL;
const { prisma } = await import("../database.js");
const { createSessionCsrfToken } = await import("../lib/security.js");
const { adminCatalogueRouter } = await import("./admin-catalogue.js");
const now = new Date("2026-09-01T00:00:00Z");
const app = express();
app.use(express.json());
app.use((request, _response, next) => {
  const role = request.header("x-test-role");
  if (role === "CONTENT_EDITOR" || role === "SALES_AGENT") request.auth = {
    sessionId: "test-session", user: { id: "test-user", displayName: "Test", email: "test@example.com", role },
  };
  next();
});
app.use("/admin", adminCatalogueRouter);
const onError: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  response.status(error instanceof ZodError ? 400 : error.status ?? 500).json({ error: error.message });
};
app.use(onError);
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const base = `http://127.0.0.1:${address.port}/admin/packages`;
let places: Destination[] = [];
let packages = new Map<string, Record<string, unknown>>();
let links: Array<{ packageId: string; destinationId: string; sortOrder: number }> = [];
let failPackageWrite = false;
const restorers: Array<() => void> = [];
function stub(target: object, key: string, value: unknown) {
  const original = Reflect.get(target, key);
  Object.defineProperty(target, key, { configurable: true, writable: true, value });
  restorers.push(() => Object.defineProperty(target, key, { configurable: true, writable: true, value: original }));
}
function place(overrides: Partial<Destination> = {}): Destination {
  return {
    id: `place-${places.length + 1}`, name: "Matheran", slug: "matheran", summary: null,
    coverMediaId: null, status: "PUBLISHED", publishedAt: now, isDemo: false, sortOrder: 0,
    createdAt: now, updatedAt: now, ...overrides,
  };
}
const emptyRelation = { deleteMany: async () => ({ count: 0 }) };
const tx = {
  destination: {
    findMany: async () => [...places],
    upsert: async ({ where, create }: { where: { slug: string }; create: Partial<Destination> }) => {
      let row = places.find((item) => item.slug === where.slug);
      if (!row) { row = place(create); places.push(row); }
      return row;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Destination> }) => {
      const row = places.find((item) => item.id === where.id)!;
      Object.assign(row, data);
      return row;
    },
  },
  package: {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      if (failPackageWrite) throw new Error("Simulated package write failure");
      const row = { ...data, id: `package-${packages.size + 1}`, createdAt: now, updatedAt: now };
      packages.set(row.id, row);
      return row;
    },
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      const row = packages.get(where.id)!;
      Object.assign(row, data);
      return row;
    },
    findUniqueOrThrow: async ({ where }: { where: { id: string } }) => ({
      ...packages.get(where.id), categories: [], itineraryDays: [], departures: [], media: [], brochureMedia: null,
      destinations: links.filter((row) => row.packageId === where.id).map((row) => ({
        ...row, destination: places.find((item) => item.id === row.destinationId),
      })),
    }),
  },
  packageDestination: {
    createMany: async ({ data }: { data: typeof links }) => { links.push(...data); },
    deleteMany: async ({ where }: { where: { packageId: string } }) => { links = links.filter((row) => row.packageId !== where.packageId); },
  },
  packageCategory: emptyRelation, itineraryDay: emptyRelation, departure: emptyRelation, packageMedia: emptyRelation,
  auditLog: { create: async () => ({}) },
};
beforeEach(() => {
  places = []; packages = new Map(); links = []; failPackageWrite = false;
  stub(prisma.destination, "count", async ({ where }: { where: { id: { in: string[] } } }) => places.filter((row) => where.id.in.includes(row.id) && row.status !== "ARCHIVED").length);
  stub(prisma.category, "count", async () => 0);
  stub(prisma.mediaAsset, "count", async () => 0);
  stub(prisma.package, "findUnique", async ({ where }: { where: { id: string } }) => packages.get(where.id) ?? null);
  stub(prisma, "$transaction", async (input: Promise<unknown>[] | ((value: typeof tx) => Promise<unknown>)) => {
    if (Array.isArray(input)) return Promise.all(input);
    const snapshot = structuredClone({ places, packages, links });
    try { return await input(tx); } catch (error) {
      ({ places, packages, links } = snapshot);
      throw error;
    }
  });
});
afterEach(() => { restorers.splice(0).reverse().forEach((restore) => restore()); });
after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await prisma.$disconnect();
});
const body = {
  slug: "hill-station-tour", title: "Hill station tour", summary: "Explore the hill stations.",
  overview: "Visit the hill stations with a comfortable journey.", days: 4, nights: 3,
  priceBasis: "ON_REQUEST", status: "PUBLISHED",
};
function request(fields: Record<string, unknown>, id?: string, role = "CONTENT_EDITOR", csrf = createSessionCsrfToken("test-session")) {
  return fetch(id ? `${base}/${id}` : base, {
    method: id ? "PUT" : "POST",
    headers: { "content-type": "application/json", "x-test-role": role, "x-csrf-token": csrf },
    body: JSON.stringify({ ...body, ...fields }), signal: AbortSignal.timeout(5000),
  });
}

test("typed names are trimmed, deduplicated, and linked in entered order", async () => {
  const response = await request({ destinationNames: ["  Matheran  ", "Mahabaleshwar", "matheran"] });
  assert.equal(response.status, 201);
  const result = (await response.json()).data;
  assert.deepEqual(result.destinations.map((row: { name: string }) => row.name), ["Matheran", "Mahabaleshwar"]);
  assert.deepEqual(links.map((row) => row.sortOrder), [0, 1]);
  assert.equal(places.length, 2);
});
test("existing destinations keep their IDs, custom slugs, descriptions and images", async () => {
  const existing = place({ slug: "existing-matheran-url", summary: "Existing copy", coverMediaId: "existing-cover" });
  places.push(structuredClone(existing));
  assert.equal((await request({ destinationNames: ["matheran"] })).status, 201);
  assert.deepEqual(places, [existing]);
  assert.equal(links[0]?.destinationId, existing.id);
});
test("editing destinations changes only the edited package", async () => {
  await request({ destinationNames: ["Matheran"] });
  await request({ destinationNames: ["Matheran"] });
  const response = await request({ destinationNames: ["Mahabaleshwar", "Matheran"] }, "package-1");
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data.destinations.map((row: { name: string }) => row.name), ["Mahabaleshwar", "Matheran"]);
  assert.equal(links.filter((row) => row.packageId === "package-2").length, 1);
  assert.equal(places.length, 2);
});
test("clearing the text removes package links without deleting shared places", async () => {
  await request({ destinationNames: ["Matheran"] });
  const response = await request({ destinationNames: [] }, "package-1");
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data.destinations, []);
  assert.equal(places.length, 1);
});
test("draft destinations remain private and are published when their package is published", async () => {
  await request({ destinationNames: ["Matheran"], status: "DRAFT" });
  assert.equal(places[0]?.status, "DRAFT");
  assert.equal(places[0]?.publishedAt, null);
  await request({ destinationNames: ["Matheran"], publishedAt: "2026-10-01T00:00:00Z" }, "package-1");
  assert.equal(places[0]?.status, "PUBLISHED");
  assert.equal(places[0]?.publishedAt?.toISOString(), "2026-10-01T00:00:00.000Z");
});
test("archived destinations are not silently restored", async () => {
  places.push(place({ status: "ARCHIVED" }));
  const response = await request({ destinationNames: ["Mahabaleshwar", "Matheran"] });
  assert.equal(response.status, 400);
  assert.equal(places.length, 1);
  assert.equal(places[0]?.status, "ARCHIVED");
  assert.equal(packages.size, 0);
});
test("a failed package save rolls back newly created destinations", async () => {
  failPackageWrite = true;
  assert.equal((await request({ destinationNames: ["Matheran"] })).status, 500);
  assert.deepEqual(places, []);
});
test("distinct names with colliding slugs do not overwrite another place", async () => {
  places.push(place({ name: "Other place", slug: "matheran" }));
  assert.equal((await request({ destinationNames: ["Matheran"] })).status, 201);
  assert.equal(places.length, 2);
  assert.equal(places[0]?.name, "Other place");
  assert.match(places[1]!.slug, /^matheran-[a-f0-9]{12}$/);
});
test("Unicode names receive stable, non-empty URL slugs", async () => {
  assert.equal((await request({ destinationNames: ["માથેરાન"] })).status, 201);
  assert.match(places[0]!.slug, /^destination-[a-f0-9]{12}$/);
  assert.equal(places[0]?.slug, destinationSlug("માથેરાન"));
});
test("older admin clients can still save destination IDs", async () => {
  places.push(place());
  assert.equal((await request({ destinationIds: ["place-1"] })).status, 201);
  assert.equal(links[0]?.destinationId, "place-1");
});
test("invalid or ambiguous destination input is rejected before writes", async () => {
  for (const fields of [
    { destinationNames: [""] }, { destinationNames: ["---"] }, { destinationNames: ["x".repeat(161)] },
    { destinationNames: Array.from({ length: 21 }, (_, index) => `Place ${index}`) },
    { destinationNames: ["Matheran"], destinationIds: ["place-1"] },
  ]) assert.equal((await request(fields)).status, 400);
  assert.equal(packages.size, 0);
  assert.deepEqual(places, []);
  assert.deepEqual(destinationNamesSchema.parse([" New   Delhi ", "new delhi"]), ["New Delhi"]);
});
test("destination writes retain authentication, role and CSRF checks", async () => {
  const fields = { destinationNames: ["Matheran"] };
  assert.equal((await request(fields, undefined, "")).status, 401);
  assert.equal((await request(fields, undefined, "SALES_AGENT")).status, 403);
  assert.equal((await request(fields, undefined, "CONTENT_EDITOR", "invalid")).status, 403);
  assert.deepEqual(places, []);
});
