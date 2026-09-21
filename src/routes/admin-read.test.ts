import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";

Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/admin_read_tests",
  PUBLIC_SITE_URL: "http://localhost", CORS_ALLOWED_ORIGINS: "http://localhost",
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
const app = express();
app.use((request, _response, next) => {
  if (request.header("x-test-auth") === "yes") request.auth = {
    sessionId: "test-session", user: { id: "test-user", email: "test@example.com", displayName: "Test", role: "SUPER_ADMIN" },
  };
  next();
});
app.use("/admin", adminOperationsRouter, adminCatalogueRouter);
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

for (const [path, delegate] of [
  ["/admin/packages", prisma.package], ["/admin/media", prisma.mediaAsset],
  ["/admin/inquiries", prisma.enquiry], ["/admin/notifications", prisma.notificationOutbox],
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
