import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";

Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/admin_read_tests",
  PUBLIC_SITE_URL: "http://localhost",
  SESSION_SECRET: "admin-read-test-only-".repeat(8), SMTP_HOST: "localhost",
  SMTP_PORT: "1025", SMTP_FROM: "test@example.com",
});
delete process.env.VERCEL;
const { prisma } = await import("../database.js");
const { Prisma } = await import("../generated/prisma/client.js");
const { adminCatalogueRouter } = await import("./admin-catalogue.js");
const { adminMediaRouter } = await import("./media.js");
const { adminInquiriesRouter } = await import("./inquiries.js");
const { adminOperationsRouter } = await import("./admin-operations.js");
const { adminContentRouter } = await import("./admin-content.js");
const app = express();
app.use((request, _response, next) => {
  if (request.header("x-test-auth") === "yes") request.auth = {
    sessionId: "test-session", user: { id: "test-user", email: "test@example.com", displayName: "Test", role: "SUPER_ADMIN" },
  };
  next();
});
app.use("/admin", adminOperationsRouter, adminCatalogueRouter, adminContentRouter);
app.use("/admin/media", adminMediaRouter);
app.use("/admin/inquiries", adminInquiriesRouter);
const onError: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  response.status(error.status ?? 500).json({ error: error.message });
};
app.use(onError);
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const base = `http://127.0.0.1:${address.port}`;
const restorers: Array<() => void> = [];
function stub(target: object, key: string, implementation: (...args: never[]) => unknown) {
  const original = Reflect.get(target, key);
  const replacement = mock.fn(implementation);
  Object.defineProperty(target, key, { configurable: true, writable: true, value: replacement });
  restorers.push(() => Object.defineProperty(target, key, { configurable: true, writable: true, value: original }));
  return replacement;
}
beforeEach(() => {
  stub(prisma, "$transaction", async () => { throw new Error("List reads must not open a transaction"); });
});
afterEach(() => { restorers.splice(0).reverse().forEach((restore) => restore()); });
after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await prisma.$disconnect();
});
function read(path: string, authenticated = true) {
  return fetch(base + path, { headers: authenticated ? { "x-test-auth": "yes" } : {}, signal: AbortSignal.timeout(5000) });
}

test("blog summaries omit article bodies and details load one authenticated article", async () => {
  stub(prisma.blogPost, "findMany", async ({ select }: { select: Record<string, unknown> }) => {
    assert.equal(select.contentHtml, undefined);
    assert.equal(select.title, true);
    assert.equal(select.tags, undefined);
    return [{ id: "story", title: "Travel guide", status: "DRAFT" }];
  });
  stub(prisma.blogPost, "findUnique", async ({ where, include }: { where: { id: string }; include: Record<string, unknown> }) => {
    assert(include.tags && include.relatedTours && include.coverMedia);
    return where.id === "story" ? { id: "story", contentHtml: "<h2>Travel guide</h2><p>Plan your visit.</p>" } : null;
  });
  const summaries = await read("/admin/blog/posts?view=summary");
  assert.equal(summaries.status, 200);
  assert.equal((await summaries.json()).data[0].contentHtml, undefined);
  const detail = await read("/admin/blog/posts/story");
  assert.equal(detail.status, 200);
  assert.match((await detail.json()).data.contentHtml, /<h2>/);
  assert.equal((await read("/admin/blog/posts/missing")).status, 404);
  assert.equal((await read("/admin/blog/posts?view=summary", false)).status, 401);
  assert.equal((await read("/admin/blog/posts/story", false)).status, 401);
});

for (const [path, delegate] of [
  ["/admin/packages", prisma.package], ["/admin/media", prisma.mediaAsset],
  ["/admin/inquiries", prisma.enquiry],
] as const) {
  test(`${path} preserves pagination and authentication without transactions`, async () => {
    stub(delegate, "count", async () => 32);
    let selection: { where: object; skip: number; take: number } | undefined;
    stub(delegate, "findMany", async (args: NonNullable<typeof selection>) => { selection = args; return []; });
    const response = await read(`${path}?page=2&pageSize=10`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.meta.total, 32);
    assert.equal(body.meta.page, 2);
    assert.equal(selection?.skip, 10);
    assert.equal(selection?.take, 10);
    assert.equal((await read(path, false)).status, 401);
  });
}

test("package summaries retain filters and exact prices without editor payloads", async () => {
  stub(prisma.package, "count", async () => 1);
  stub(prisma.package, "findMany", async ({ where, select }: { where: { status: string; OR: unknown[] }; select: object }) => {
    assert.equal(where.status, "DRAFT");
    assert.deepEqual(where.OR, [{ title: { contains: "goa" } }, { slug: { contains: "goa" } }]);
    assert.equal("itineraryDays" in select, false);
    assert.equal("overview" in select, false);
    return [{ id: "tour-1", slug: "goa", title: "Goa", status: "DRAFT", days: 3, nights: 2,
      basePrice: new Prisma.Decimal("1234.50"), currency: "INR", priceBasis: "PER_PERSON", isDemo: false, updatedAt: new Date("2026-09-21") }];
  });
  const response = await read("/admin/packages?view=summary&q=goa&status=DRAFT");
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data[0].basePrice, "1234.50");
  assert.equal(data[0].status, "DRAFT");
  assert.equal("itinerary" in data[0], false);
});

test("enquiry list and CSV export use identical filters, including phone search and IST dates", async () => {
  const selections: Array<{ where: { status: string; type: string; createdAt: { gte: Date; lte: Date }; AND: Array<{ OR: object[] }>; OR: object[] }; take: number; skip?: number }> = [];
  stub(prisma.enquiry, "count", async () => 1);
  stub(prisma.enquiry, "findMany", async (args: typeof selections[number]) => { selections.push(args); return []; });
  const filters = "q=79907&status=NEW&type=CONTACT&package=Kashmir&from=2026-09-01&to=2026-09-22&page=2&pageSize=10";
  assert.equal((await read(`/admin/inquiries?${filters}`)).status, 200);
  const exported = await read(`/admin/inquiries/export.csv?${filters}`);
  assert.equal(exported.status, 200);
  assert.match(exported.headers.get("content-type") ?? "", /text\/csv/);
  assert.deepEqual(selections[0].where, selections[1].where);
  assert.equal(selections[1].take, 10_000);
  assert.equal(selections[1].skip, undefined);
  const { where } = selections[0];
  assert.equal(where.status, "NEW"); assert.equal(where.type, "GENERAL");
  assert.equal(where.createdAt.gte.toISOString(), "2026-08-31T18:30:00.000Z");
  assert.equal(where.createdAt.lte.toISOString(), "2026-09-22T18:29:59.999Z");
  assert(where.AND[0].OR.some(filter => JSON.stringify(filter) === JSON.stringify({ phone: { contains: "79907" } })));
  assert.deepEqual(where.OR, [{ packageSlugSnapshot: { contains: "Kashmir" } }, { packageTitleSnapshot: { contains: "Kashmir" } }]);
  assert.equal((await read("/admin/inquiries/export.csv", false)).status, 401);
});
