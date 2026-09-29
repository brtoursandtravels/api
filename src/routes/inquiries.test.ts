import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import type { Enquiry, Prisma } from "../generated/prisma/client.js";

Object.assign(process.env, {
  NODE_ENV: "test", DATABASE_URL: "mysql://test:test@127.0.0.1:1/inquiry_tests",
  PUBLIC_SITE_URL: "http://localhost",
  SESSION_SECRET: "inquiry-test-only-".repeat(8), SMTP_HOST: "localhost",
  SMTP_PORT: "1025", SMTP_FROM: "test@example.com",
});
delete process.env.VERCEL;
const { prisma } = await import("../database.js");
const { inquiriesRouter, adminInquiriesRouter } = await import("./inquiries.js");
const { processNextNotification } = await import("../lib/notification-worker.js");
const app = express();
app.use(express.json());
app.use((request, _response, next) => {
  if (request.header("x-test-auth") === "yes") request.auth = {
    sessionId: "test-session", user: { id: "test-user", email: "test@example.com", displayName: "Test", role: "SUPER_ADMIN" },
  };
  next();
});
app.use("/inquiries", inquiriesRouter);
app.use("/admin/inquiries", adminInquiriesRouter);
const onError: ErrorRequestHandler = (error, _request, response, next) => {
  void next;
  response.status(error instanceof ZodError ? 400 : error.status ?? 500).json({ error: {
    message: error.message, fields: error instanceof ZodError ? error.flatten().fieldErrors : undefined,
  } });
};
app.use(onError);
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert(address && typeof address !== "string");
const base = `http://127.0.0.1:${address.port}`;
const restorers: Array<() => void> = [];
function stub(target: object, key: string, implementation: (...args: never[]) => unknown) {
  const original = Reflect.get(target, key), replacement = mock.fn(implementation);
  Object.defineProperty(target, key, { configurable: true, writable: true, value: replacement });
  restorers.push(() => Object.defineProperty(target, key, { configurable: true, writable: true, value: original }));
  return replacement;
}
let records: Array<Enquiry & { assignedTo: null }> = [];
beforeEach(() => {
  records = [];
  stub(prisma.rateLimitBucket, "upsert", async () => ({}));
  stub(prisma.rateLimitBucket, "findUniqueOrThrow", async () => ({ hits: 1, blockedUntil: null }));
  stub(prisma, "$executeRaw", async () => 1);
  stub(prisma, "$transaction", async (callback: (client: typeof prisma) => Promise<unknown>) => callback(prisma));
  stub(prisma.enquiry, "findUnique", async ({ where }: { where: { idempotencyKey: string } }) => records.find(item => item.idempotencyKey === where.idempotencyKey) ?? null);
  stub(prisma.enquiry, "create", async ({ data }: { data: Prisma.EnquiryUncheckedCreateInput }) => {
    const record = { ...data, id: randomUUID(), status: "NEW", assignedTo: null, createdAt: new Date(), updatedAt: new Date() } as Enquiry & { assignedTo: null };
    records.push(record); return record;
  });
  stub(prisma.enquiry, "count", async () => records.length);
  stub(prisma.enquiry, "findMany", async () => records);
  stub(prisma.enquiryStatusHistory, "create", async () => ({}));
  stub(prisma.notificationOutbox, "create", async () => { throw new Error("Enquiries must not queue email alerts"); });
});
afterEach(() => restorers.splice(0).reverse().forEach(restore => restore()));
after(async () => { await new Promise<void>(resolve => server.close(() => resolve())); await prisma.$disconnect(); });
const contact = { type: "CONTACT", name: "Test traveller", email: "traveller@example.com", message: "Please share travel information.", privacyAccepted: true, policyVersion: "2026-08-31" };
function submit(body: object, key = randomUUID()) {
  return fetch(base + "/inquiries", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": key }, body: JSON.stringify(body) });
}

test("contact requests reject missing or invalid phone numbers before saving", async () => {
  for (const phone of [undefined, "", "   ", "-------", "12-34", "1234567890123456"]) {
    const response = await submit({ ...contact, phone });
    assert.equal(response.status, 400);
    assert((await response.json()).error.fields.phone.length);
  }
  assert.equal(records.length, 0);
});

test("a contact phone is saved and visible to admin without an email notification", async () => {
  const response = await submit({ ...contact, phone: "+91 98765 43210" });
  assert.equal(response.status, 201);
  const list = await fetch(base + "/admin/inquiries", { headers: { "x-test-auth": "yes" } });
  assert.equal(list.status, 200);
  const { data } = await list.json();
  assert.equal(data[0].requester.phone, "+91 98765 43210");
  assert.equal(data[0].status, "NEW");
});

test("email-only footer requests remain dynamic and repeated submissions are idempotent", async () => {
  const key = randomUUID(), input = { ...contact, type: "NEWSLETTER" };
  const response = await submit(input, key);
  assert.equal(response.status, 201);
  const receipt = await response.json();
  const repeated = await submit(input, key);
  assert.equal(repeated.status, 200);
  assert.equal((await repeated.json()).data.reference, receipt.data.reference);
  assert.equal(records.length, 1);
  assert.equal(records[0].subject, "Travel journal updates");
  const list = await fetch(base + "/admin/inquiries", { headers: { "x-test-auth": "yes" } });
  const { data } = await list.json();
  assert.equal(data[0].requester.name, "Newsletter subscriber");
  assert.equal(data[0].requester.email, input.email);
  assert.equal(data[0].requester.phone, null);
});

test("legacy enquiry alerts are skipped while password reset delivery still works", async () => {
  const queue = [
    { id: "legacy-enquiry", eventType: "ENQUIRY_RECEIVED", status: "PENDING", attempts: 0, payload: { to: "test@example.com", subject: "Enquiry", text: "Enquiry alert" } },
    { id: "password-reset", eventType: "PASSWORD_RESET_REQUESTED", status: "PENDING", attempts: 0, payload: { to: "test@example.com", subject: "Reset password", text: "Reset link" } },
  ];
  stub(prisma.notificationOutbox, "findFirst", async ({ where }: { where: { eventType?: string; status: { in: string[] } } }) => queue.find(item => (!where.eventType || item.eventType === where.eventType) && where.status.in.includes(item.status)) ?? null);
  stub(prisma.notificationOutbox, "updateMany", async () => ({ count: 1 }));
  stub(prisma.notificationOutbox, "update", async ({ where, data }: { where: { id: string }; data: { status: string } }) => Object.assign(queue.find(item => item.id === where.id)!, data));
  const sent: string[] = [];
  const sender = { sendMail: async (message: { subject: string }) => { sent.push(message.subject); } };
  await processNextNotification(sender);
  assert.deepEqual(sent, ["Reset password"]);
  assert.equal(await processNextNotification(sender), null);
  assert.equal(queue[0].status, "PENDING");
});
