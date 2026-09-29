import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import type { Category, Prisma } from "../generated/prisma/client.js";

// HTTP tests use in-memory delegates only; no real database or content writes.
Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/category_tests",
  PUBLIC_SITE_URL: "http://localhost",
  SESSION_SECRET: "category-test-only-".repeat(8), SMTP_HOST: "localhost",
  SMTP_PORT: "1025", SMTP_FROM: "test@example.com",
});
const { prisma } = await import("../database.js");
const { createSessionCsrfToken } = await import("../lib/security.js");
const { adminCatalogueRouter } = await import("./admin-catalogue.js");
const app = express();
app.use(express.json());
app.use((request, _response, next) => {
  request.auth = { sessionId: "test-session", user: { id: "test-user", displayName: "Test", email: "test@example.com", role: "CONTENT_EDITOR" } };
  next();
});
app.use("/admin", adminCatalogueRouter);
const onError: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  response.status(error instanceof ZodError ? 400 : error.code === "P2002" ? 409 : error.status ?? 500).json({ error: error.message });
};
app.use(onError);
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const base = `http://127.0.0.1:${address.port}/admin`;
let rows: Category[] = [];
let creates = 0;
let failCreate = false;
const restorers: Array<() => void> = [];
function stub(target: object, key: string, value: unknown) {
  const original = Reflect.get(target, key);
  Object.defineProperty(target, key, { configurable: true, writable: true, value });
  restorers.push(() => Object.defineProperty(target, key, { configurable: true, writable: true, value: original }));
}
beforeEach(() => {
  rows = []; creates = 0; failCreate = false;
  stub(prisma.category, "create", async ({ data }: { data: Prisma.CategoryUncheckedCreateInput }) => {
    creates++;
    if (failCreate) throw new Error("Database unavailable");
    if (rows.some(row => row.slug === data.slug)) throw Object.assign(new Error("Duplicate slug"), { code: "P2002" });
    const record = { description: null, ...data, id: `category-${rows.length + 1}`, createdAt: new Date(), updatedAt: new Date() } as Category;
    rows.push(record);
    return record;
  });
  stub(prisma.category, "update", async ({ where, data }: { where: { id: string }; data: Partial<Category> }) => {
    const record = rows.find(row => row.id === where.id)!;
    Object.assign(record, Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)));
    return record;
  });
  stub(prisma.destination, "create", async ({ data }: { data: Record<string, unknown> }) => ({ ...data, id: "destination-1" }));
  stub(prisma.auditLog, "create", async () => ({}));
});
afterEach(() => { restorers.splice(0).reverse().forEach(restore => restore()); });
after(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await prisma.$disconnect();
});
function request(body: Record<string, unknown>, path = "categories", method = "POST") {
  return fetch(`${base}/${path}`, { method, headers: { "content-type": "application/json", "x-csrf-token": createSessionCsrfToken("test-session") }, body: JSON.stringify(body), signal: AbortSignal.timeout(5000) });
}

test("category name alone creates a normalized slug and optional description", async () => {
  const response = await request({ name: "  Café & Family Tours  ", status: "PUBLISHED" });
  assert.equal(response.status, 201);
  const { data } = await response.json();
  assert.equal(data.name, "Café & Family Tours");
  assert.equal(data.slug, "cafe-family-tours");
  assert.equal(data.description, null);
  assert.equal(data.status, "PUBLISHED");
  assert.equal(creates, 1);
});

test("colliding and concurrent category names receive distinct slugs", async () => {
  const responses = await Promise.all(["Family Tours", "Family & Tours", "Family Tours"].map(name => request({ name })));
  assert(responses.every(response => response.status === 201));
  assert.equal(rows.length, 3);
  assert.equal(new Set(rows.map(row => row.slug)).size, 3);
  assert(rows.every(row => /^family-tours(?:-[a-f0-9]{8})?$/.test(row.slug)));
});

test("non-Latin names and long names produce valid bounded slugs", async () => {
  for (const name of ["ધાર્મિક પ્રવાસ", "उत्तर भारत", "A".repeat(160)]) {
    const response = await request({ name });
    assert.equal(response.status, 201);
    const { data } = await response.json();
    assert.match(data.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert(data.slug.length >= 2 && data.slug.length <= 180);
  }
});

test("renaming retains the existing URL and saved description when omitted", async () => {
  const original = await (await request({ name: "Family Tours", slug: "family-holidays", description: "Existing description" })).json();
  const response = await request({ name: "Family Adventures", status: "PUBLISHED", sortOrder: 5 }, `categories/${original.data.id}`, "PUT");
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data.name, "Family Adventures");
  assert.equal(data.slug, "family-holidays");
  assert.equal(data.description, "Existing description");
  assert.equal(data.sortOrder, 5);
});

test("older clients can supply a slug; explicit duplicate slugs still report conflict", async () => {
  assert.equal((await request({ name: "Pilgrimage", slug: "temple-tours" })).status, 201);
  assert.equal((await request({ name: "Pilgrimage two", slug: "temple-tours" })).status, 409);
  assert.equal(creates, 2);
});

test("invalid names and real database failures do not silently create or retry", async () => {
  assert.equal((await request({ name: "  " })).status, 400);
  assert.equal(creates, 0);
  failCreate = true;
  assert.equal((await request({ name: "Family Tours" })).status, 500);
  assert.equal(creates, 1);
});

test("destination creation still requires its slug and preserves its description", async () => {
  assert.equal((await request({ name: "Kashmir" }, "destinations")).status, 400);
  const response = await request({ name: "Kashmir", slug: "kashmir", description: "Valleys and mountains" }, "destinations");
  assert.equal(response.status, 201);
  assert.equal((await response.json()).data.description, "Valleys and mountains");
});
