import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import express, { type ErrorRequestHandler, type Request, type Response } from "express";
import { ZodError } from "zod";

Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/activity_tests",
  PUBLIC_SITE_URL: "http://localhost", CORS_ALLOWED_ORIGINS: "http://localhost",
  SESSION_SECRET: "activity-log-test-only-".repeat(8), SMTP_HOST: "localhost",
  SMTP_PORT: "1025", SMTP_FROM: "test@example.com",
});
delete process.env.VERCEL;
const { prisma } = await import("../database.js");
const { createSessionCsrfToken } = await import("../lib/security.js");
const { activityContext, normalizeIpAddress } = await import("../lib/activity-log.js");
const { adminOperationsRouter } = await import("./admin-operations.js");
const { adminContentRouter } = await import("./admin-content.js");
const app = express();
app.use(express.json());
app.use((request, response, next) => {
  response.locals.requestId = "activity-test-request";
  const role = request.header("x-test-role");
  if (role === "SUPER_ADMIN" || role === "CONTENT_EDITOR" || role === "SALES_AGENT") request.auth = {
    sessionId: "test-session", user: { id: "test-user", email: "admin@example.com", displayName: "Test Admin", role },
  };
  next();
});
app.use("/admin", adminOperationsRouter, adminContentRouter);
const onError: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  response.status(error instanceof ZodError ? 400 : error.status ?? 500).json({ error: error.message });
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
  app.set("trust proxy", 0);
  stub(prisma, "$transaction", async () => { throw new Error("Activity reads must not use a database transaction"); });
});
afterEach(() => { restorers.splice(0).reverse().forEach((restore) => restore()); });
after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await prisma.$disconnect();
});
function read(query = "", role = "SUPER_ADMIN") {
  return fetch(`${base}/admin/audit-logs${query}`, { headers: { "x-test-role": role }, signal: AbortSignal.timeout(5000) });
}
function event(overrides: Record<string, unknown> = {}) {
  return {
    id: "event-1", action: "PACKAGE_UPDATED", entityType: "Package", entityId: "package-1",
    before: { title: "Before" }, after: { title: "After" }, requestId: "request-1",
    actorId: "admin-1", actorName: "Name at event", actorEmail: "old@example.com", actorRole: "CONTENT_EDITOR",
    actor: { displayName: "Current name", email: "new@example.com", role: "SUPER_ADMIN" },
    ipAddress: "203.0.113.5", userAgent: "Test browser", requestMethod: "PUT", requestPath: "/api/v1/admin/packages/package-1",
    createdAt: new Date("2026-09-18T06:40:10Z"), ...overrides,
  };
}

test("activity details are limited to Super Admin users", async () => {
  const reads = stub(prisma.auditLog, "findMany", async () => []);
  assert.equal((await read("", "")).status, 401);
  assert.equal((await read("", "CONTENT_EDITOR")).status, 403);
  assert.equal((await read("", "SALES_AGENT")).status, 403);
  assert.equal(reads.mock.callCount(), 0);
});
test("the API returns historical user details, exact time and IP without requesting secrets", async () => {
  stub(prisma.auditLog, "count", async () => 1);
  let selection: unknown;
  stub(prisma.auditLog, "findMany", async (args: { select: unknown }) => { selection = args.select; return [event()]; });
  const response = await read();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  const record = (await response.json()).data[0];
  assert.deepEqual(record.actor, { id: "admin-1", displayName: "Name at event", email: "old@example.com", role: "CONTENT_EDITOR" });
  assert.equal(record.createdAt, "2026-09-18T06:40:10.000Z");
  assert.equal(record.ipAddress, "203.0.113.5");
  assert.equal(record.requestMethod, "PUT");
  assert.doesNotMatch(JSON.stringify(selection), /password|session|token|ipHash/i);
});
test("historical actor details remain available after account deletion", async () => {
  stub(prisma.auditLog, "count", async () => 1);
  stub(prisma.auditLog, "findMany", async () => [event({ actor: null, actorId: null })]);
  const record = (await (await read()).json()).data[0];
  assert.equal(record.actor.displayName, "Name at event");
  assert.equal(record.actor.email, "old@example.com");
});
test("legacy logs fall back to linked user details and never fabricate IP addresses", async () => {
  stub(prisma.auditLog, "count", async () => 2);
  const legacy = { actorName: null, actorEmail: null, actorRole: null, ipAddress: null };
  stub(prisma.auditLog, "findMany", async () => [event(legacy), event({ ...legacy, actor: null, actorId: null })]);
  const result = (await (await read()).json()).data;
  assert.equal(result[0].actor.displayName, "Current name");
  assert.equal(result[0].ipAddress, null);
  assert.equal(result[1].actor, null);
});
test("filters run in the database before pagination and use the same count criteria", async () => {
  let countWhere: unknown;
  let findArgs: { where: Record<string, unknown>; skip: number; take: number; orderBy: unknown } | undefined;
  stub(prisma.auditLog, "count", async (args: { where: unknown }) => { countWhere = args.where; return 70; });
  stub(prisma.auditLog, "findMany", async (args: NonNullable<typeof findArgs>) => { findArgs = args; return []; });
  const response = await read("?page=3&pageSize=10&entityType=Package&action=package%20updated&actor=admin%40example.com&ipAddress=203.0.113.5&date=2026-09-18");
  assert.equal(response.status, 200);
  assert.ok(findArgs);
  assert.deepEqual(findArgs.where, countWhere);
  assert.equal(findArgs.skip, 20);
  assert.equal(findArgs.take, 10);
  assert.deepEqual(findArgs.where.action, { contains: "PACKAGE_UPDATED" });
  assert.equal(findArgs.where.ipAddress, "203.0.113.5");
  assert.deepEqual(findArgs.where.createdAt, { gte: new Date("2026-09-17T18:30:00Z"), lt: new Date("2026-09-18T18:30:00Z") });
  assert.match(JSON.stringify(findArgs.where.OR), /actorEmail.*admin@example.com/);
  assert.deepEqual(findArgs.orderBy, [{ createdAt: "desc" }, { id: "desc" }]);
  assert.equal((await response.json()).meta.total, 70);
});
test("invalid dates, IP addresses and pagination are rejected", async () => {
  for (const query of ["?date=2026-02-30", "?ipAddress=spoofed", "?page=0", "?pageSize=101"]) {
    assert.equal((await read(query)).status, 400);
  }
});

async function saveFaq(forwarded?: string) {
  return fetch(`${base}/admin/faqs?token=do-not-log-this`, {
    method: "POST", headers: { "content-type": "application/json", "x-test-role": "CONTENT_EDITOR",
      "x-csrf-token": createSessionCsrfToken("test-session"), "user-agent": "Test browser/device",
      ...(forwarded ? { "x-forwarded-for": forwarded } : {}),
    },
    body: JSON.stringify({ question: "What is included?", answer: "Breakfast is included." }), signal: AbortSignal.timeout(5000),
  });
}
test("new content activity captures trusted IP, user, method and safe path", async () => {
  stub(prisma.faq, "create", async () => ({ id: "faq-1", question: "What is included?", status: "DRAFT" }));
  let stored: Record<string, unknown> | undefined;
  stub(prisma.auditLog, "create", async ({ data }: { data: Record<string, unknown> }) => { stored = data; return data; });
  assert.equal((await saveFaq("203.0.113.99")).status, 201);
  assert.ok(stored);
  assert.equal(stored.action, "FAQ_CREATED");
  assert.equal(stored.ipAddress, "127.0.0.1");
  assert.equal(stored.actorEmail, "admin@example.com");
  assert.equal(stored.actorRole, "CONTENT_EDITOR");
  assert.equal(stored.userAgent, "Test browser/device");
  assert.equal(stored.requestMethod, "POST");
  assert.equal(stored.requestPath, "/admin/faqs");
  assert.equal(stored.requestId, "activity-test-request");
  assert.doesNotMatch(JSON.stringify(stored), /do-not-log-this|x-csrf-token/);
});
test("configured proxy trust uses the closest untrusted address, not a spoofable leftmost IP", async () => {
  app.set("trust proxy", 1);
  stub(prisma.faq, "create", async () => ({ id: "faq-1", question: "What is included?", status: "DRAFT" }));
  let ip: unknown;
  stub(prisma.auditLog, "create", async ({ data }: { data: { ipAddress: string } }) => { ip = data.ipAddress; return data; });
  assert.equal((await saveFaq("203.0.113.99, 198.51.100.4")).status, 201);
  assert.equal(ip, "198.51.100.4");
});
test("request context handles IPv6, absent users and login/reset actor overrides", () => {
  const request = { ip: "2001:db8::1", socket: {}, method: "POST", originalUrl: "/auth/login?password=secret", header: () => "b".repeat(600) } as unknown as Request;
  const response = { locals: { requestId: "r".repeat(100) } } as unknown as Response;
  const context = activityContext(request, response, { displayName: "Login user", email: "login@example.com", role: "SUPER_ADMIN" });
  assert.equal(context.ipAddress, "2001:db8::1");
  assert.equal(context.actorName, "Login user");
  assert.equal(context.requestPath, "/auth/login");
  assert.equal(context.userAgent?.length, 512);
  assert.equal(context.requestId?.length, 64);
  assert.equal(activityContext(request, response).actorEmail, null);
  assert.equal(normalizeIpAddress("::ffff:192.0.2.1"), "192.0.2.1");
  assert.equal(normalizeIpAddress("not-an-ip"), null);
});
