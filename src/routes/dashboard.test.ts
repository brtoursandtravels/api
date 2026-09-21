import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";

Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/dashboard_tests",
  PUBLIC_SITE_URL: "http://localhost", CORS_ALLOWED_ORIGINS: "http://localhost",
  SESSION_SECRET: "dashboard-test-only-".repeat(8), SESSION_COOKIE_NAME: "br_admin_session",
  SMTP_HOST: "localhost", SMTP_PORT: "1025", SMTP_FROM: "test@example.com",
});
delete process.env.VERCEL;
const { prisma } = await import("../database.js");
const { optionalSession, requireAuth } = await import("../middleware/auth.js");
const { verifySessionCsrfToken } = await import("../lib/security.js");
const { authRouter } = await import("./auth.js");
const { adminOperationsRouter } = await import("./admin-operations.js");
const app = express();
app.use("/auth", authRouter);
app.use("/admin", adminOperationsRouter);
app.get("/identity", optionalSession, optionalSession, optionalSession, requireAuth, (request, response) => {
  response.json({ user: request.auth!.user });
});
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
function session(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-session", expiresAt: new Date(Date.now() + 3_600_000), lastSeenAt: new Date(),
    user: { id: "test-user", email: "admin@example.com", displayName: "Test Admin", role: "SUPER_ADMIN", status: "ACTIVE" },
    ...overrides,
  };
}
function read(path = "/admin/dashboard", authenticated = true) {
  return fetch(`${base}${path}`, {
    headers: authenticated ? { cookie: "br_admin_session=test-token" } : {},
    signal: AbortSignal.timeout(5000),
  });
}
beforeEach(() => {
  stub(prisma.session, "findUnique", async () => session());
  stub(prisma.session, "delete", async () => ({}));
  stub(prisma, "$transaction", async () => { throw new Error("Dashboard reads must not require a transaction"); });
  stub(prisma.package, "groupBy", async () => []);
  stub(prisma.departure, "count", async () => 0);
  stub(prisma.enquiry, "groupBy", async () => []);
  stub(prisma.notificationOutbox, "count", async () => 0);
  stub(prisma.blogPost, "groupBy", async () => []);
  stub(prisma, "$queryRaw", async () => []);
});
afterEach(() => { restorers.splice(0).reverse().forEach((restore) => restore()); });
after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await prisma.$disconnect();
});

test("dashboard requires a valid session before reading operational data", async () => {
  const reads = stub(prisma.package, "groupBy", async () => []);
  assert.equal((await read("/admin/dashboard", false)).status, 401);
  stub(prisma.session, "findUnique", async () => null);
  assert.equal((await read()).status, 401);
  assert.equal(reads.mock.callCount(), 0);
});

test("an empty dashboard has zero counts and exactly fourteen UTC dates", async () => {
  const response = await read();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  const { data } = await response.json();
  for (const key of ["packages", "publishedPackages", "upcomingDepartures", "newEnquiries", "failedNotifications", "draftPosts", "publishedPosts"]) {
    assert.equal(data[key], 0);
  }
  assert.deepEqual(data.enquiryStatusCounts, { NEW: 0, CONTACTED: 0, QUOTED: 0, CONFIRMED: 0, CLOSED: 0, LOST: 0 });
  assert.equal(data.enquiryTrend.length, 14);
  const today = new Date(data.generatedAt);
  today.setUTCHours(0, 0, 0, 0);
  assert.deepEqual(data.enquiryTrend, Array.from({ length: 14 }, (_, day) => ({
    date: new Date(today.getTime() - (13 - day) * 86_400_000).toISOString().slice(0, 10), count: 0,
  })));
});

test("grouped counts preserve publication rules, statuses and zero-filled trends", async () => {
  stub(prisma.package, "groupBy", async ({ where }: { where: unknown }) => {
    assert.deepEqual(where, { status: { not: "ARCHIVED" } });
    return [{ status: "PUBLISHED", _count: { _all: 7 } }, { status: "DRAFT", _count: { _all: 2 } }];
  });
  stub(prisma.departure, "count", async ({ where }: { where: { status: string; startDate: { gte: Date } } }) => {
    assert.equal(where.status, "SCHEDULED");
    assert.ok(where.startDate.gte instanceof Date);
    return 4;
  });
  stub(prisma.enquiry, "groupBy", async () => [
    { status: "NEW", _count: { _all: 8 } }, { status: "CONFIRMED", _count: { _all: 3 } },
    { status: "LOST", _count: { _all: 1 } },
  ]);
  stub(prisma.notificationOutbox, "count", async ({ where }: { where: unknown }) => {
    assert.deepEqual(where, { status: "FAILED" });
    return 2;
  });
  stub(prisma.blogPost, "groupBy", async ({ where }: { where: { OR: unknown[] } }) => {
    assert.deepEqual(where.OR[0], { status: "DRAFT" });
    const published = where.OR[1] as { status: string; publishedAt: { lte: Date } };
    assert.equal(published.status, "PUBLISHED");
    assert.ok(published.publishedAt.lte instanceof Date);
    return [{ status: "DRAFT", _count: { _all: 5 } }, { status: "PUBLISHED", _count: { _all: 6 } }];
  });
  let firstDate = "";
  stub(prisma, "$queryRaw", async (_sql: TemplateStringsArray, start: Date, end: Date) => {
    assert.equal(end.getTime() - start.getTime(), 14 * 86_400_000);
    assert.equal(start.getUTCHours(), 0);
    firstDate = start.toISOString().slice(0, 10);
    return [{ date: firstDate, count: 12n }];
  });
  const response = await read();
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.deepEqual({ ...data, enquiryTrend: undefined, generatedAt: undefined }, {
    packages: 9, publishedPackages: 7, upcomingDepartures: 4, newEnquiries: 8,
    failedNotifications: 2, draftPosts: 5, publishedPosts: 6,
    enquiryStatusCounts: { NEW: 8, CONTACTED: 0, QUOTED: 0, CONFIRMED: 3, CLOSED: 0, LOST: 1 },
    enquiryTrend: undefined, generatedAt: undefined,
  });
  assert.deepEqual(data.enquiryTrend[0], { date: firstDate, count: 12 });
  assert.equal(data.enquiryTrend.slice(1).every((row: { count: number }) => row.count === 0), true);
});

test("a failed dashboard read can be retried and changes are visible on the next request", async () => {
  let fail = true;
  stub(prisma.departure, "count", async () => {
    if (fail) throw new Error("Temporary database failure");
    return 9;
  });
  assert.equal((await read()).status, 500);
  fail = false;
  assert.equal((await (await read()).json()).data.upcomingDepartures, 9);
});

test("session lookup is reused only within a request and revocation takes effect on the next one", async () => {
  let revoked = false;
  const lookups = stub(prisma.session, "findUnique", async ({ select }: { select: { user: { select: object } } }) => {
    assert.equal("passwordHash" in select.user.select, false);
    return revoked ? null : session();
  });
  assert.equal((await read("/identity")).status, 200);
  assert.equal(lookups.mock.callCount(), 1);
  revoked = true;
  assert.equal((await read()).status, 401);
  assert.equal(lookups.mock.callCount(), 2);
});

test("session restoration returns a safe user and valid CSRF token in one private response", async () => {
  const response = await read("/auth/csrf");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const { data } = await response.json();
  assert.equal(data.authenticated, true);
  assert.deepEqual(data.user, { id: "test-user", email: "admin@example.com", displayName: "Test Admin", role: "SUPER_ADMIN" });
  assert.equal(verifySessionCsrfToken("test-session", data.csrfToken), true);
  const anonymous = await (await read("/auth/csrf", false)).json();
  assert.equal(anonymous.data.authenticated, false);
  assert.equal(anonymous.data.user, null);
});

test("expired sessions and disabled users cannot restore an authenticated identity", async () => {
  for (const invalid of [
    session({ expiresAt: new Date(0) }),
    session({ user: { ...session().user, status: "DISABLED" } }),
  ]) {
    stub(prisma.session, "findUnique", async () => invalid);
    const { data } = await (await read("/auth/csrf")).json();
    assert.equal(data.authenticated, false);
    assert.equal(data.user, null);
  }
});
