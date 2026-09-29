import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";

Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/testimonial_tests",
  PUBLIC_SITE_URL: "http://localhost",
  SESSION_SECRET: "testimonial-test-only-".repeat(8), SMTP_HOST: "localhost",
  SMTP_PORT: "1025", SMTP_FROM: "test@example.com", DEMO_MODE: "false",
});
delete process.env.VERCEL;
const { prisma } = await import("../database.js");
const { createSessionCsrfToken } = await import("../lib/security.js");
const { adminContentRouter } = await import("./admin-content.js");
const { publicContentRouter } = await import("./public-content.js");

type Story = {
  id: string; publicName: string; location: string | null; tripName: string | null;
  quote: string; rating: number; consentNotes: string | null; approved: boolean;
  sortOrder: number; status: string; publishedAt: Date | null; isDemo: boolean;
};
let records: Story[] = [];
const restorers: Array<() => void> = [];
function stub(target: object, key: string, value: unknown) {
  const original = Reflect.get(target, key);
  Object.defineProperty(target, key, { value, configurable: true, writable: true });
  restorers.push(() => Object.defineProperty(target, key, { value: original, configurable: true, writable: true }));
}
beforeEach(() => {
  records = [];
  stub(prisma.testimonial, "create", async ({ data }: { data: Omit<Story, "id"> }) => {
    const record = { id: `story-${records.length + 1}`, ...data };
    records.push(record);
    return record;
  });
  stub(prisma.testimonial, "update", async ({ where, data }: { where: { id: string }; data: Partial<Story> }) => {
    const record = records.find(item => item.id === where.id)!;
    Object.assign(record, data);
    return record;
  });
  stub(prisma.testimonial, "findMany", async ({ where }: { where: { status: string; approved: boolean; isDemo: boolean; publishedAt: { not: null; lte: Date } } }) => {
    assert.equal(where.status, "PUBLISHED");
    assert.equal(where.approved, true);
    assert.equal(where.isDemo, false);
    assert.equal(where.publishedAt.not, null);
    return records.filter(item => item.status === where.status && item.approved === where.approved && item.isDemo === where.isDemo && item.publishedAt && item.publishedAt <= where.publishedAt.lte);
  });
  stub(prisma.auditLog, "create", async () => ({}));
});
afterEach(() => { restorers.splice(0).reverse().forEach(restore => restore()); mock.timers.reset(); });

const app = express();
app.use(express.json());
app.use((request, _response, next) => {
  if (request.header("x-test-role") === "CONTENT_EDITOR") {
    request.auth = { sessionId: "test-session", user: {
      id: "test-user", email: "test@example.com", displayName: "Test", role: "CONTENT_EDITOR",
    } };
  }
  next();
});
app.use("/admin", adminContentRouter);
app.use("/public", publicContentRouter);
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
after(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await prisma.$disconnect();
});

const input = { publicName: "Asha Patel", quote: "A comfortable and memorable journey.", consentNotes: "Email permission received.", status: "PUBLISHED" };
function save(body: unknown, id?: string, csrf = createSessionCsrfToken("test-session"), role = "CONTENT_EDITOR") {
  return fetch(`${base}/admin/testimonials${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    headers: { "content-type": "application/json", "x-test-role": role, "x-csrf-token": csrf },
    body: JSON.stringify(body), signal: AbortSignal.timeout(5000),
  });
}
async function publicStories() {
  const response = await fetch(`${base}/public/testimonials`);
  assert.equal(response.status, 200);
  return (await response.json()).data as Story[];
}

test("publishing records approval and immediate visibility without a separate checkbox", async () => {
  assert.equal((await save(input)).status, 201);
  assert.equal(records[0]!.approved, true);
  assert.ok(records[0]!.publishedAt);
  assert.equal((await publicStories()).length, 1);
});

test("scheduled content appears at the saved time without a second write", async () => {
  mock.timers.enable({ apis: ["Date"], now: new Date("2099-10-01T04:29:00.000Z") });
  const publishedAt = "2099-10-01T10:00:00+05:30";
  assert.equal((await save({ ...input, publishedAt })).status, 201);
  assert.equal(records[0]!.publishedAt!.toISOString(), "2099-10-01T04:30:00.000Z");
  assert.equal((await publicStories()).length, 0);
  mock.timers.tick(59_999);
  assert.equal((await publicStories()).length, 0);
  mock.timers.tick(1);
  assert.equal((await publicStories()).length, 1);
  assert.equal(records.length, 1);
});

test("draft and archived content stays hidden regardless of its date or old approval flag", async () => {
  for (const status of ["DRAFT", "ARCHIVED"]) {
    assert.equal((await save({ ...input, status, approved: true, consentNotes: null, publishedAt: "2020-01-01T00:00:00Z" })).status, 201);
  }
  assert.ok(records.every(record => !record.approved));
  assert.equal((await publicStories()).length, 0);
});

test("permission is required for publishing, including edits and scheduled records", async () => {
  for (const consentNotes of [null, "", "   "]) {
    assert.equal((await save({ ...input, consentNotes, approved: false })).status, 400);
    assert.equal((await save({ ...input, consentNotes, publishedAt: "2099-10-01T04:30:00Z" })).status, 400);
  }
  assert.equal(records.length, 0);
  await save({ ...input, status: "DRAFT", consentNotes: null });
  assert.equal((await save({ ...input, consentNotes: null }, "story-1")).status, 400);
  assert.equal(records[0]!.status, "DRAFT");
  assert.equal((await save({ ...input, approved: false }, "story-1")).status, 200);
  assert.equal(records[0]!.approved, true);
  assert.equal((await publicStories()).length, 1);
  assert.equal((await save({ ...input, status: "DRAFT" }, "story-1")).status, 200);
  assert.equal((await publicStories()).length, 0);
});

test("publishing retains authentication, CSRF and valid-date checks", async () => {
  assert.equal((await save(input, undefined, undefined, "")).status, 401);
  assert.equal((await save(input, undefined, "invalid")).status, 403);
  assert.equal((await save({ ...input, publishedAt: "invalid" })).status, 400);
  assert.equal(records.length, 0);
});
