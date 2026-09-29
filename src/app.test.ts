import assert from "node:assert/strict";
import { once } from "node:events";
import { after, test } from "node:test";

Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: "mysql://test:test@127.0.0.1:1/app_tests",
  PUBLIC_SITE_URL: "http://localhost",
  SESSION_SECRET: "app-test-only-".repeat(8),
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  SMTP_FROM: "test@example.com",
});

const { app } = await import("./app.js");
const { prisma } = await import("./database.js");
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const base = `http://127.0.0.1:${address.port}`;

after(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await prisma.$disconnect();
});

test("browser requests have no cross-origin permission and writes still require CSRF", async () => {
  const origin = "https://untrusted.example";
  const health = await fetch(`${base}/api/v1/health`, { headers: { origin } });
  assert.equal(health.status, 200);
  assert.equal(health.headers.get("access-control-allow-origin"), null);

  const preflight = await fetch(`${base}/api/v1/auth/login`, {
    method: "OPTIONS",
    headers: { origin, "access-control-request-method": "POST" },
  });
  assert.equal(preflight.headers.get("access-control-allow-origin"), null);

  const login = await fetch(`${base}/api/v1/auth/login`, {
    method: "POST",
    headers: { origin, "content-type": "application/json", "x-csrf-token": "invalid" },
    body: JSON.stringify({ email: "admin@example.com", password: "incorrect" }),
  });
  assert.equal(login.status, 403);
  assert.equal((await login.json()).error.code, "CSRF_INVALID");
});
