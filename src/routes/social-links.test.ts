import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";

Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/social_tests",
  PUBLIC_SITE_URL: "http://localhost", CORS_ALLOWED_ORIGINS: "http://localhost",
  SESSION_SECRET: "social-links-test-only-".repeat(8), SMTP_HOST: "localhost",
  SMTP_PORT: "1025", SMTP_FROM: "test@example.com",
});
delete process.env.VERCEL;
const { prisma } = await import("../database.js");
const { createSessionCsrfToken } = await import("../lib/security.js");
const { adminContentRouter } = await import("./admin-content.js");
const { socialLinksSchema } = await import("../lib/social-links.js");
const { pageSeoSchema, pageSeoKeySchema, staticSeoPages } = await import("../lib/page-seo.js");
const originalTransaction = prisma.$transaction;
const upsert = mock.fn(async ({ create }: { create: object }) => create);
const audit = mock.fn(async () => ({}));
const transaction = mock.fn(async (callback: (tx: object) => Promise<unknown>) =>
  callback({ setting: { upsert }, auditLog: { create: audit } }),
);
const app = express();
app.use(express.json());
app.use((request, _response, next) => {
  const role = request.header("x-test-role");
  if (role === "CONTENT_EDITOR" || role === "SALES_AGENT") {
    request.auth = { sessionId: "test-session", user: {
      id: "test-user", email: "test@example.com", displayName: "Test", role,
    } };
  }
  next();
});
app.use("/admin", adminContentRouter);
const onError: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  response.status(error instanceof ZodError ? 400 : error.status ?? 500).json({ error: error.code ?? "VALIDATION_ERROR" });
};
app.use(onError);
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const base = `http://127.0.0.1:${address.port}`;
beforeEach(() => {
  transaction.mock.resetCalls(); upsert.mock.resetCalls(); audit.mock.resetCalls();
  Object.defineProperty(prisma, "$transaction", { value: transaction, configurable: true, writable: true });
});
afterEach(() => {
  Object.defineProperty(prisma, "$transaction", { value: originalTransaction, configurable: true, writable: true });
});
after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await prisma.$disconnect();
});
const links = { instagram: "https://www.instagram.com/br_tours_travels/", facebook: "https://www.facebook.com/share/1EdDpd2pfZ/" };
function request(body: unknown, role = "CONTENT_EDITOR", csrf = createSessionCsrfToken("test-session"), path = "/admin/settings/social-links") {
  return fetch(base + path, {
    method: "PUT", headers: { "content-type": "application/json", "x-test-role": role, "x-csrf-token": csrf },
    body: JSON.stringify(body), signal: AbortSignal.timeout(5000),
  });
}

test("both social links and their audit entry are saved in one authenticated transaction", async () => {
  const response = await request(links);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.data.map((row: { key: string; value: string; isPublic: boolean }) => [row.key, row.value, row.isPublic]), [
    ["social.instagram", links.instagram, true], ["social.facebook", links.facebook, true],
  ]);
  assert.equal(transaction.mock.callCount(), 1);
  assert.equal(upsert.mock.callCount(), 2);
  assert.equal(audit.mock.callCount(), 1);
});
test("clearing links stores empty values rather than restoring old URLs", async () => {
  const response = await request({ instagram: "  ", facebook: "" });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.data.map((row: { value: string }) => row.value), ["", ""]);
});
test("social settings retain session, role and CSRF protection", async () => {
  assert.equal((await request(links, "")).status, 401);
  assert.equal((await request(links, "SALES_AGENT")).status, 403);
  assert.equal((await request(links, "CONTENT_EDITOR", "invalid")).status, 403);
  assert.equal(transaction.mock.callCount(), 0);
});
test("invalid social URLs are rejected before any database writes", async () => {
  for (const instagram of ["javascript:alert(1)", "http://instagram.com/test", "https://instagram.com.evil.test", "https://user:password@instagram.com/test", "https://facebook.com/test"]) {
    assert.equal((await request({ ...links, instagram })).status, 400);
  }
  assert.equal(transaction.mock.callCount(), 0);
});
test("the generic settings editor cannot bypass social URL validation", async () => {
  const response = await request({ value: "javascript:alert(1)", isPublic: true }, "CONTENT_EDITOR", createSessionCsrfToken("test-session"), "/admin/settings/social.instagram");
  assert.equal(response.status, 400);
  assert.equal(transaction.mock.callCount(), 0);
});
test("validation trims valid URLs and rejects missing or extra fields", () => {
  assert.equal(socialLinksSchema.parse({ ...links, instagram: ` ${links.instagram} ` }).instagram, links.instagram);
  assert.equal(socialLinksSchema.safeParse({ instagram: links.instagram }).success, false);
  assert.equal(socialLinksSchema.safeParse({ ...links, secret: "ignored" }).success, false);
});

test("static-page meta tags have limits and support only known public routes", () => {
  assert.equal(staticSeoPages.length, 10);
  assert.equal(new Set(staticSeoPages.map((page) => page.path)).size, 10);
  for (const page of staticSeoPages) assert.equal(pageSeoKeySchema.safeParse(`seo.pages.${page.key}`).success, true);
  assert.equal(pageSeoKeySchema.safeParse("seo.pages.admin").success, false);
  assert.deepEqual(pageSeoSchema.parse({ metaTitle: " Title ", metaDescription: " Description " }), { metaTitle: "Title", metaDescription: "Description" });
  assert.equal(pageSeoSchema.safeParse({ metaTitle: "x".repeat(71), metaDescription: "" }).success, false);
  assert.equal(pageSeoSchema.safeParse({ metaTitle: "", metaDescription: "x".repeat(171) }).success, false);
});

test("invalid static-page metadata is rejected through the settings API", async () => {
  for (const [key, value] of [
    ["seo.pages.home", { metaTitle: "x".repeat(71), metaDescription: "" }],
    ["seo.pages.gallery", { metaTitle: "Gallery" }],
    ["seo.pages.admin", { metaTitle: "Admin", metaDescription: "Not a public page" }],
  ] as const) {
    const response = await request({ value, isPublic: true }, "CONTENT_EDITOR", createSessionCsrfToken("test-session"), `/admin/settings/${key}`);
    assert.equal(response.status, 400);
  }
});

test("Page SEO lists fixed routes and saves metadata as public settings", async () => {
  const originals = { findMany: prisma.setting.findMany, upsert: prisma.setting.upsert, audit: prisma.auditLog.create };
  const value = { metaTitle: "Custom home title", metaDescription: "Custom home description" };
  let saved: unknown;
  Object.defineProperty(prisma.setting, "findMany", { configurable: true, writable: true, value: async () => [
    { key: "seo.pages.home", value, isPublic: true },
  ] });
  Object.defineProperty(prisma.setting, "upsert", { configurable: true, writable: true, value: async (args: { create: unknown }) => { saved = args.create; return args.create; } });
  Object.defineProperty(prisma.auditLog, "create", { configurable: true, writable: true, value: async () => ({}) });
  try {
    const list = await fetch(`${base}/admin/seo/pages`, { headers: { "x-test-role": "CONTENT_EDITOR" } });
    assert.equal(list.status, 200);
    const pages = (await list.json()).data;
    assert.equal(pages.length, 10);
    assert.equal(pages.find((page: { key: string }) => page.key === "home").metaTitle, value.metaTitle);
    const save = await request({ value, isPublic: true }, "CONTENT_EDITOR", createSessionCsrfToken("test-session"), "/admin/settings/seo.pages.home");
    assert.equal(save.status, 200);
    assert.deepEqual(saved, { key: "seo.pages.home", value, isPublic: true, description: null });
  } finally {
    Object.defineProperty(prisma.setting, "findMany", { value: originals.findMany, configurable: true, writable: true });
    Object.defineProperty(prisma.setting, "upsert", { value: originals.upsert, configurable: true, writable: true });
    Object.defineProperty(prisma.auditLog, "create", { value: originals.audit, configurable: true, writable: true });
  }
});
