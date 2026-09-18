import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";

// No real database, credentials or external writes are used by these tests.
Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: "mysql://test:test@127.0.0.1:1/public_read_tests",
  PUBLIC_SITE_URL: "http://localhost",
  CORS_ALLOWED_ORIGINS: "http://localhost",
  SESSION_SECRET: "public-read-test-only-".repeat(8),
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  SMTP_FROM: "test@example.com",
  DEMO_MODE: "false",
});
delete process.env.VERCEL;

const { prisma } = await import("../database.js");
const { packageRouter } = await import("./packages.js");
const { publicContentRouter } = await import("./public-content.js");
const app = express();
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1", publicContentRouter);
const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  response.status(error.status ?? 500).json({ code: error.code });
};
app.use(errorHandler);
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
const restorers: Array<() => void> = [];

function stub(target: object, key: string, implementation: (...args: never[]) => unknown) {
  // Prisma delegate functions are provided by a Proxy, not ordinary methods.
  const original = Reflect.get(target, key);
  const replacement = mock.fn(implementation);
  Object.defineProperty(target, key, { value: replacement, configurable: true, writable: true });
  restorers.push(() => {
    Object.defineProperty(target, key, { value: original, configurable: true, writable: true });
  });
  return replacement;
}

let transactionCalls = 0;
beforeEach(() => {
  transactionCalls = 0;
  stub(prisma, "$transaction", async () => {
    transactionCalls += 1;
    throw Object.assign(new Error("Unable to start a transaction in the given time."), { code: "P2028" });
  });
});
afterEach(() => {
  restorers.splice(0).reverse().forEach((restore) => restore());
  mock.restoreAll();
});
after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  await prisma.$disconnect();
});

function request(path: string) {
  return fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(5000) });
}

for (const [path, delegate] of [
  ["/packages", prisma.package],
  ["/gallery/albums", prisma.galleryAlbum],
  ["/blog", prisma.blogPost],
] as const) {
  test(`${path} keeps pagination/publication filters without acquiring a transaction`, async () => {
    const count = stub(delegate, "count", async () => 28);
    const find = stub(delegate, "findMany", async () => []);
    const response = await request(`${path}?page=2&pageSize=6`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { data: [], meta: { page: 2, pageSize: 6, total: 28 } });
    assert.equal(transactionCalls, 0);
    assert.equal(count.mock.callCount(), 1);
    assert.equal(find.mock.callCount(), 1);
    const countArgs = count.mock.calls[0]!.arguments[0] as unknown as { where: object };
    const findArgs = find.mock.calls[0]!.arguments[0] as unknown as {
      where: { status: string; isDemo: boolean; publishedAt: { not: null; lte: Date } };
      skip: number; take: number;
    };
    assert.deepEqual(countArgs.where, findArgs.where);
    assert.equal(findArgs.where.status, "PUBLISHED");
    assert.equal(findArgs.where.isDemo, false);
    assert.equal(findArgs.where.publishedAt.not, null);
    assert.ok(findArgs.where.publishedAt.lte instanceof Date);
    assert.equal(findArgs.skip, 6);
    assert.equal(findArgs.take, 6);
  });
}

test("site settings and navigation do not require a transaction", async () => {
  stub(prisma.setting, "findMany", async () => [{ key: "site.name", value: "BR Travels" }]);
  stub(prisma.navigationMenu, "findMany", async () => []);
  const response = await request("/site");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: { settings: { "site.name": "BR Travels" }, menus: [] } });
  assert.equal(transactionCalls, 0);
});

test("concurrent public page reads never acquire a database transaction", async () => {
  for (const delegate of [prisma.package, prisma.galleryAlbum, prisma.blogPost]) {
    stub(delegate, "count", async () => 0);
    stub(delegate, "findMany", async () => []);
  }
  stub(prisma.setting, "findMany", async () => []);
  stub(prisma.navigationMenu, "findMany", async () => []);
  const paths = ["/packages", "/gallery/albums", "/blog", "/site"];
  const responses = await Promise.all(Array.from({ length: 12 }, (_, index) => request(paths[index % paths.length]!)));
  assert.ok(responses.every((response) => response.status === 200));
  await Promise.all(responses.map((response) => response.json()));
  assert.equal(transactionCalls, 0);
});
