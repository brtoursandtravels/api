import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";

Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/deletion_tests",
  PUBLIC_SITE_URL: "http://localhost",
  SESSION_SECRET: "deletion-test-only-".repeat(8), SMTP_HOST: "localhost",
  SMTP_PORT: "1025", SMTP_FROM: "test@example.com",
});
delete process.env.VERCEL;
const { prisma } = await import("../database.js");
const originalTransaction = prisma.$transaction;
const { createSessionCsrfToken } = await import("../lib/security.js");
const { adminDeletionsRouter } = await import("./admin-deletions.js");
const app = express();
app.use((request, _response, next) => {
  const role = request.header("x-test-role");
  if (role === "CONTENT_EDITOR" || role === "SUPER_ADMIN" || role === "SALES_AGENT") request.auth = {
    sessionId: "test-session", user: { id: "test-user", email: "test@example.com", displayName: "Test", role },
  };
  next();
});
app.use("/admin", adminDeletionsRouter);
const onError: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  response.status(error instanceof ZodError ? 400 : error.status ?? 500).json({ error: { code: error.code, message: error.message } });
};
app.use(onError);
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const base = `http://127.0.0.1:${address.port}/admin`;
const resources = [
  ["packages", "package", "PACKAGE_DELETED"], ["categories", "category", "CATEGORY_DELETED"],
  ["destinations", "destination", "DESTINATION_DELETED"], ["pages", "contentPage", "PAGE_DELETED"],
  ["blog/posts", "blogPost", "BLOG_POST_DELETED"], ["blog/categories", "blogCategory", "BLOG_CATEGORY_DELETED"],
  ["blog/tags", "tag", "BLOG_TAG_DELETED"], ["gallery/albums", "galleryAlbum", "GALLERY_ALBUM_DELETED"],
  ["home/sections", "homepageSection", "HOME_SECTION_DELETED"], ["faqs", "faq", "FAQ_DELETED"],
  ["testimonials", "testimonial", "TESTIMONIAL_DELETED"], ["settings", "setting", "SETTING_DELETED"],
  ["navigation", "navigationMenu", "MENU_DELETED"],
] as const;
let records: Record<string, Map<string, Record<string, unknown>>>;
let events: Array<Record<string, unknown>>;
let removedLinks: string[];
let failAudit: boolean;
let foreignKeyConflict: boolean;
let transactions: number;
beforeEach(() => {
  events = []; removedLinks = []; failAudit = false; foreignKeyConflict = false; transactions = 0;
  records = Object.fromEntries(resources.map(([, model]) => [model, new Map([
    ["entry", { id: "entry", key: "entry", title: "Test entry", name: "Test entry", slug: "test-entry", question: "Test question?", publicName: "Test traveller", label: "Footer", isPublic: false, value: "secret-setting-value" }],
    ["unrelated", { id: "unrelated" }],
  ])]));
  const transaction = Object.fromEntries(resources.map(([, model]) => [model, {
    delete: async ({ where, select }: { where: { id?: string; key?: string }; select: Record<string, boolean> }) => {
      if (foreignKeyConflict) throw Object.assign(new Error("Referenced"), { code: "P2003" });
      const id = where.id ?? where.key!;
      const row = records[model]!.get(id);
      if (!row) throw Object.assign(new Error("Missing"), { code: "P2025" });
      records[model]!.delete(id);
      return Object.fromEntries(Object.keys(select).map((key) => [key, row[key]]));
    },
  }]));
  Object.assign(transaction, {
    packageCategory: { deleteMany: async () => { removedLinks.push("categories"); return { count: 1 }; } },
    packageDestination: { deleteMany: async () => { removedLinks.push("destinations"); return { count: 1 }; } },
    auditLog: { create: async ({ data }: { data: Record<string, unknown> }) => {
      if (failAudit) throw new Error("Audit unavailable");
      events.push(data); return data;
    } },
  });
  Object.defineProperty(prisma, "$transaction", { configurable: true, writable: true, value: async (operation: (tx: unknown) => Promise<unknown>) => {
    transactions++;
    const before = structuredClone({ records, events, removedLinks });
    try { return await operation(transaction); } catch (error) {
      ({ records, events, removedLinks } = before); throw error;
    }
  } });
});
afterEach(() => Object.defineProperty(prisma, "$transaction", { configurable: true, writable: true, value: originalTransaction }));
after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await prisma.$disconnect();
});
function remove(path: string, role = "CONTENT_EDITOR", csrf = createSessionCsrfToken("test-session")) {
  return fetch(`${base}/${path}`, { method: "DELETE", headers: { "x-test-role": role, "x-csrf-token": csrf }, signal: AbortSignal.timeout(5000) });
}

for (const [path, model, action] of resources) {
  test(`permanent deletion removes only the selected ${path} entry and records its audit`, async () => {
    const response = await remove(`${path}/entry/permanent`);
    assert.equal(response.status, 204);
    assert.equal(records[model]!.has("entry"), false);
    assert.equal(records[model]!.has("unrelated"), true);
    assert.equal(events.length, 1);
    assert.equal(events[0]!.action, action);
    assert.equal(events[0]!.actorId, "test-user");
    assert.equal(events[0]!.entityId, "entry");
    assert.equal(JSON.stringify(events).includes("secret-setting-value"), false);
    assert.equal(transactions, 1);
  });
}
test("authentication, content role and CSRF are required before deleting", async () => {
  assert.equal((await remove("packages/entry/permanent", "")).status, 401);
  assert.equal((await remove("packages/entry/permanent", "SALES_AGENT")).status, 403);
  assert.equal((await remove("packages/entry/permanent", "CONTENT_EDITOR", "invalid")).status, 403);
  assert.equal(transactions, 0);
});
test("missing entries return 404 without an audit entry", async () => {
  assert.equal((await remove("packages/missing/permanent")).status, 404);
  assert.equal(events.length, 0);
});
test("audit failure rolls back deletion and taxonomy link removal", async () => {
  failAudit = true;
  assert.equal((await remove("categories/entry/permanent")).status, 500);
  assert.equal(records.category!.has("entry"), true);
  assert.deepEqual(removedLinks, []);
});
test("category deletion detaches packages without deleting them", async () => {
  assert.equal((await remove("categories/entry/permanent")).status, 204);
  assert.deepEqual(removedLinks, ["categories"]);
  assert.equal(records.package!.has("entry"), true);
});
test("foreign-key conflicts return an actionable error and leave the entry intact", async () => {
  foreignKeyConflict = true;
  const response = await remove("pages/entry/permanent");
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error.code, "RECORD_IN_USE");
  assert.equal(records.contentPage!.has("entry"), true);
});
test("unlisted resources cannot be deleted through the shared routes", async () => {
  assert.equal((await remove("users/entry/permanent")).status, 404);
  assert.equal(transactions, 0);
});

test("long setting keys remain deletable and retain their full key in the audit snapshot", async () => {
  const key = "public." + "x".repeat(100);
  records.setting!.set(key, { key, isPublic: true, value: "never-log-values" });
  assert.equal((await remove(`settings/${key}/permanent`)).status, 204);
  assert.equal(events[0]!.entityId, key.slice(0, 64));
  assert.deepEqual(events[0]!.before, { key, isPublic: true });
});
