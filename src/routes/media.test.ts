import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { after, afterEach, mock, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";

// Isolated HTTP tests: no real login, credentials, database or storage writes.
Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: "mysql://test:test@127.0.0.1:1/media_tests",
  PUBLIC_SITE_URL: "http://localhost",
  CORS_ALLOWED_ORIGINS: "http://localhost",
  SESSION_SECRET: "media-test-only-".repeat(8),
  MEDIA_ROOT: path.resolve("public/media"),
  MEDIA_PUBLIC_BASE_URL: "/media",
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  SMTP_FROM: "test@example.com",
});
delete process.env.VERCEL;

const { prisma } = await import("../database.js");
const { adminMediaRouter } = await import("./media.js");
const originalFindUnique = prisma.mediaAsset.findUnique;

const app = express();
app.use((request, response, next) => {
  const role = request.header("x-test-role");
  if (
    role === "SUPER_ADMIN" ||
    role === "CONTENT_EDITOR" ||
    role === "SALES_AGENT"
  ) {
    request.auth = {
      sessionId: "test-session",
      user: {
        id: "test-user", email: "test@example.com", displayName: "Test", role,
      },
    };
  }
  // Inspect non-seed upload paths without creating fixture uploads on disk.
  if (request.header("x-test-capture-file") === "true") {
    response.sendFile = (filename: string) => response.json({ filename });
  }
  next();
});
app.use("/api/v1/admin/media", adminMediaRouter);
const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  response.status(error.status ?? 500).json({ code: error.code });
};
app.use(errorHandler);

const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const baseUrl = `http://127.0.0.1:${address.port}`;
const id = "test-media";
const storageKey = "seed/tours/east-india-puri-jagannath.webp";
const record = {
  id,
  storageKey,
  provider: "LOCAL",
  visibility: "PUBLIC",
  originalName: "east-india-puri-jagannath.webp",
  mimeType: "image/webp",
};

function mockMediaLookup(value: typeof record | null) {
  const lookup = mock.fn(async () => value);
  // Prisma exposes delegate methods through a Proxy rather than own methods.
  Object.defineProperty(prisma.mediaAsset, "findUnique", {
    value: lookup,
    configurable: true,
    writable: true,
  });
  return lookup;
}

function requestFile(
  headers: Record<string, string> = { "x-test-role": "SUPER_ADMIN" },
) {
  return fetch(`${baseUrl}/api/v1/admin/media/${id}/file`, {
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(5000),
  });
}

afterEach(() => {
  Object.defineProperty(prisma.mediaAsset, "findUnique", {
    value: originalFindUnique,
    configurable: true,
    writable: true,
  });
  mock.restoreAll();
  delete process.env.VERCEL;
});
after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  await prisma.$disconnect();
});

test("admin preview still requires a session", async () => {
  const lookup = mockMediaLookup(record);
  const response = await requestFile({});
  assert.equal(response.status, 401);
  assert.equal(lookup.mock.callCount(), 0);
  assert.equal(response.headers.get("location"), null);
});

test("roles without media access are rejected", async () => {
  const lookup = mockMediaLookup(record);
  const response = await requestFile({ "x-test-role": "SALES_AGENT" });
  assert.equal(response.status, 403);
  assert.equal(lookup.mock.callCount(), 0);
});

test("Vercel public seed previews redirect to same-origin deployed assets", async () => {
  process.env.VERCEL = "1";
  mockMediaLookup(record);
  const response = await requestFile({ "x-test-role": "CONTENT_EDITOR" });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), `/media/${storageKey}`);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});

test("static asset redirects encode each path segment", async () => {
  process.env.VERCEL = "1";
  mockMediaLookup({ ...record, storageKey: "seed/tours/a b.webp" });
  const response = await requestFile();
  assert.equal(response.headers.get("location"), "/media/seed/tours/a%20b.webp");
});

test("local seed previews still return image bytes", async () => {
  mockMediaLookup(record);
  const response = await requestFile();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /image\/webp/);
  assert.equal(response.headers.get("location"), null);
  assert.deepEqual(
    Buffer.from(await response.arrayBuffer()),
    await readFile(path.resolve("public/media", storageKey)),
  );
});

test("private media is served through the authenticated endpoint, never redirected", async () => {
  process.env.VERCEL = "1";
  mockMediaLookup({ ...record, visibility: "PRIVATE" });
  const response = await requestFile();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(
    Buffer.from(await response.arrayBuffer()),
    await readFile(path.resolve("public/media", storageKey)),
  );
});

test("ordinary uploads retain their authenticated runtime-storage path", async () => {
  process.env.VERCEL = "1";
  mockMediaLookup({ ...record, storageKey: "2026/09/upload.webp" });
  const response = await requestFile({
    "x-test-role": "SUPER_ADMIN", "x-test-capture-file": "true",
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.deepEqual(await response.json(), {
    filename: path.resolve("public/media/2026/09/upload.webp"),
  });
});

test("unknown media returns 404 instead of a static redirect", async () => {
  process.env.VERCEL = "1";
  mockMediaLookup(null);
  const response = await requestFile();
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("location"), null);
});
