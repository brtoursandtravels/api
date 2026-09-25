import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";
import argon2 from "argon2";
import { ZodError } from "zod";

Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/staff_tests",
  PUBLIC_SITE_URL: "http://localhost", CORS_ALLOWED_ORIGINS: "http://localhost",
  SESSION_SECRET: "staff-test-only-".repeat(8), SMTP_HOST: "localhost",
  SMTP_PORT: "1025", SMTP_FROM: "test@example.com",
});
const { prisma } = await import("../database.js");
const { createSessionCsrfToken } = await import("../lib/security.js");
const { adminOperationsRouter } = await import("./admin-operations.js");
let role: "SUPER_ADMIN" | "CONTENT_EDITOR" | "SALES_AGENT" | null = "SUPER_ADMIN";
const app = express();
app.use(express.json());
app.use((request, _response, next) => {
  if (role) request.auth = { sessionId: "staff-session", user: { id: "owner", displayName: "Owner", email: "owner@example.com", role } };
  next();
});
app.use("/admin", adminOperationsRouter);
const onError: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  response.status(error instanceof ZodError ? 400 : error.code === "P2002" ? 409 : error.status ?? 500).json({ error: error.message });
};
app.use(onError);
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const base = `http://127.0.0.1:${address.port}/admin/users`;
const originalHash = await argon2.hash("previous-password-123");
let row: Record<string, unknown>;
let sessionRevocations: string[];
let resetRevocations: string[];
let audits: unknown[];
let failUpdate = false;
const restores: Array<() => void> = [];
function stub(target: object, key: string, value: unknown) {
  const previous = Reflect.get(target, key);
  Object.defineProperty(target, key, { configurable: true, writable: true, value });
  restores.push(() => Object.defineProperty(target, key, { configurable: true, writable: true, value: previous }));
}
function selected(select: Record<string, boolean>) { return Object.fromEntries(Object.keys(select).filter(key => select[key]).map(key => [key, row[key]])); }
beforeEach(() => {
  role = "SUPER_ADMIN"; failUpdate = false;
  row = { id: "staff", displayName: "Staff member", email: "staff@example.com", role: "SALES_AGENT", status: "ACTIVE", passwordHash: originalHash };
  sessionRevocations = []; resetRevocations = []; audits = [];
  stub(prisma, "$transaction", async (work: (transaction: typeof prisma) => Promise<unknown>) => work(prisma));
  stub(prisma.adminUser, "findUnique", async ({ where }: { where: { id: string } }) => where.id === row.id ? { ...row } : null);
  stub(prisma.adminUser, "count", async () => 1);
  stub(prisma.adminUser, "create", async ({ data, select }: { data: Record<string, unknown>; select: Record<string, boolean> }) => { row = { id: "created", status: "ACTIVE", ...data }; return selected(select); });
  stub(prisma.adminUser, "update", async ({ data, select }: { data: Record<string, unknown>; select: Record<string, boolean> }) => {
    if (failUpdate) throw Object.assign(new Error("Email is already used."), { code: "P2002" });
    Object.assign(row, data); return selected(select);
  });
  stub(prisma.session, "deleteMany", async ({ where }: { where: { userId: string } }) => { sessionRevocations.push(where.userId); return { count: 2 }; });
  stub(prisma.passwordResetToken, "deleteMany", async ({ where }: { where: { userId: string } }) => { resetRevocations.push(where.userId); return { count: 1 }; });
  stub(prisma.auditLog, "create", async ({ data }: { data: unknown }) => { audits.push(data); return {}; });
});
afterEach(() => restores.splice(0).reverse().forEach(restore => restore()));
after(async () => { await new Promise<void>(resolve => server.close(() => resolve())); await prisma.$disconnect(); });
function request(body: Record<string, unknown>, id: string | null = "staff", csrf = true) {
  return fetch(id ? `${base}/${id}` : base, { method: id ? "PUT" : "POST", headers: { "content-type": "application/json", ...(csrf ? { "x-csrf-token": createSessionCsrfToken("staff-session") } : {}) }, body: JSON.stringify(body) });
}
const details = { displayName: "Updated staff", status: "ACTIVE" };

test("name, email and password create staff with the existing default permission", async () => {
  const response = await request({ email: " STAFF@EXAMPLE.COM ", displayName: "New member", password: "initial-password-123" }, null);
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.data.email, "staff@example.com");
  assert.equal(body.data.role, "CONTENT_EDITOR");
  assert(await argon2.verify(String(row.passwordHash), "initial-password-123"));
  assert(!JSON.stringify(body).includes("password"));
  assert(!JSON.stringify(audits).includes("initial-password"));
});

test("editing without a password keeps credentials, role and sessions", async () => {
  assert.equal((await request(details)).status, 200);
  assert.equal(row.role, "SALES_AGENT"); assert.equal(row.passwordHash, originalHash);
  assert.deepEqual(sessionRevocations, []); assert.deepEqual(resetRevocations, []);
});

test("password replacement hashes the password and revokes sessions and reset links for only this user", async () => {
  const response = await request({ ...details, password: "replacement-password-123" });
  assert.equal(response.status, 200);
  assert(await argon2.verify(String(row.passwordHash), "replacement-password-123"));
  assert.equal(await argon2.verify(String(row.passwordHash), "previous-password-123"), false);
  assert.deepEqual(sessionRevocations, ["staff"]); assert.deepEqual(resetRevocations, ["staff"]);
  assert(!JSON.stringify(await response.json()).includes("password"));
  assert(!JSON.stringify(audits).includes("replacement-password-123"));
  assert(!JSON.stringify(audits).includes(String(row.passwordHash)));
});

test("changing email normalizes it, preserves the password and revokes old credentials", async () => {
  assert.equal((await request({ ...details, email: " NEW@EXAMPLE.COM " })).status, 200);
  assert.equal(row.email, "new@example.com"); assert.equal(row.passwordHash, originalHash);
  assert.deepEqual(sessionRevocations, ["staff"]); assert.deepEqual(resetRevocations, ["staff"]);
});

test("invalid input and failed updates do not change credentials or revoke sessions", async () => {
  for (const password of ["", "short", "x".repeat(129)]) assert.equal((await request({ ...details, password })).status, 400);
  assert.equal((await request({ ...details, email: "invalid" })).status, 400);
  failUpdate = true;
  assert.equal((await request({ ...details, password: "replacement-password-123", email: "taken@example.com" })).status, 409);
  assert.equal(row.passwordHash, originalHash); assert.equal(row.email, "staff@example.com");
  assert.deepEqual(sessionRevocations, []); assert.deepEqual(audits, []);
});

test("only authenticated Super Admins with a valid CSRF token can create or edit staff", async () => {
  assert.equal((await request(details, "staff", false)).status, 403);
  for (const value of ["CONTENT_EDITOR", "SALES_AGENT", null] as const) {
    role = value;
    assert.equal((await request(details)).status, value ? 403 : 401);
    assert.equal((await request({ displayName: "New member", email: "new@example.com", password: "initial-password-123" }, null)).status, value ? 403 : 401);
  }
  assert.equal(row.passwordHash, originalHash); assert.deepEqual(sessionRevocations, []);
});

test("missing accounts return 404 and the last active Super Admin remains protected without a role field", async () => {
  assert.equal((await request(details, "missing")).status, 404);
  row.role = "SUPER_ADMIN";
  assert.equal((await request({ ...details, status: "DISABLED" })).status, 409);
  assert.equal((await request(details)).status, 200);
  assert.equal(row.role, "SUPER_ADMIN"); assert.equal(row.status, "ACTIVE");
});
