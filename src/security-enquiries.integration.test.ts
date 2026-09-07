import argon2 from "argon2";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "./app.js";
import { prisma } from "./database.js";
import { env } from "./env.js";
import { processNextNotification } from "./lib/notification-worker.js";

const testPassword = "Correct-Horse-Battery-2026!";
const resetPassword = "New-Integration-Password-2026!";
const changedPassword = "Changed-Integration-Password-2026!";
const superEmail = "integration-super@example.invalid";
const editorEmail = "integration-editor@example.invalid";
const idempotencyKey = `integration-${randomUUID()}`;
let enquiryId = "";
let superUserId = "";
let editorUserId = "";
let superAgent: ReturnType<typeof request.agent>;
let superCsrf = "";

beforeAll(async () => {
  if (env.NODE_ENV !== "test" || !env.DATABASE_URL.endsWith("/br_tours_test")) {
    throw new Error(
      "Integration tests refuse to run outside the dedicated br_tours_test database.",
    );
  }
  await prisma.adminUser.deleteMany({
    where: { email: { in: [superEmail, editorEmail] } },
  });
  const passwordHash = await argon2.hash(testPassword, {
    type: argon2.argon2id,
  });
  const [superUser, editor] = await prisma.$transaction([
    prisma.adminUser.create({
      data: {
        email: superEmail,
        displayName: "Integration Super",
        passwordHash,
        role: "SUPER_ADMIN",
      },
    }),
    prisma.adminUser.create({
      data: {
        email: editorEmail,
        displayName: "Integration Editor",
        passwordHash,
        role: "CONTENT_EDITOR",
      },
    }),
  ]);
  superUserId = superUser.id;
  editorUserId = editor.id;
});

describe("database-backed authentication and CSRF", () => {
  it("rejects login without CSRF and rotates into an opaque cookie session", async () => {
    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: superEmail, password: testPassword })
      .expect(403)
      .expect(({ body }) => expect(body.error.code).toBe("CSRF_INVALID"));

    superAgent = request.agent(app);
    const csrf = await superAgent.get("/api/v1/auth/csrf").expect(200);
    const login = await superAgent
      .post("/api/v1/auth/login")
      .set("x-csrf-token", csrf.body.data.csrfToken)
      .send({ email: superEmail, password: testPassword })
      .expect(200);

    expect(login.headers["set-cookie"]?.[0]).toContain("HttpOnly");
    expect(login.headers["set-cookie"]?.[0]).not.toContain("Secure");
    expect(login.body.data.user).toEqual(
      expect.objectContaining({ email: superEmail, role: "SUPER_ADMIN" }),
    );
    superCsrf = login.body.data.csrfToken;
    await superAgent
      .get("/api/v1/auth/me")
      .expect(200)
      .expect(({ body }) => expect(body.data.user.email).toBe(superEmail));
    expect(await prisma.session.count({ where: { userId: superUserId } })).toBe(
      1,
    );
  });

  it("enforces role permissions in Express", async () => {
    const agent = request.agent(app);
    const csrf = await agent.get("/api/v1/auth/csrf").expect(200);
    const login = await agent
      .post("/api/v1/auth/login")
      .set("x-csrf-token", csrf.body.data.csrfToken)
      .send({ email: editorEmail, password: testPassword })
      .expect(200);
    expect(login.body.data.user.role).toBe("CONTENT_EDITOR");
    await agent
      .get("/api/v1/admin/inquiries")
      .expect(403)
      .expect(({ body }) => expect(body.error.code).toBe("FORBIDDEN"));
    await agent.get("/api/v1/admin/assignees").expect(403);
  });

  it("updates the current profile and exposes only authorized assignee fields", async () => {
    await superAgent
      .put("/api/v1/auth/profile")
      .set("x-csrf-token", superCsrf)
      .send({ displayName: "Integration Super Updated" })
      .expect(200)
      .expect(({ body }) =>
        expect(body.data.user.displayName).toBe("Integration Super Updated"),
      );
    const assignees = await superAgent
      .get("/api/v1/admin/assignees")
      .expect(200);
    expect(assignees.body.data).toContainEqual({
      id: superUserId,
      displayName: "Integration Super Updated",
      role: "SUPER_ADMIN",
    });
    expect(assignees.body.data[0]).not.toHaveProperty("email");
  });
});

describe("transactional public enquiries", () => {
  const payload = {
    type: "CONTACT",
    name: "Integration Visitor",
    email: "visitor@example.invalid",
    phone: "+91 90000 00000",
    subject: "Test planning request",
    message: "This is an integration-only request used to verify persistence.",
    sourcePath: "/contact-us",
    privacyAccepted: true,
    policyVersion: "integration-v1",
  };

  it("persists one lead and one outbox event before returning an honest receipt", async () => {
    const created = await request(app)
      .post("/api/v1/inquiries")
      .set("idempotency-key", idempotencyKey)
      .send(payload)
      .expect(201);
    expect(created.body.data).toEqual(
      expect.objectContaining({
        duplicate: false,
        reference: expect.stringMatching(/^BR-\d{4}-[A-F0-9]{10}$/),
      }),
    );
    expect(created.body.data.email).toBeUndefined();

    const record = await prisma.enquiry.findUniqueOrThrow({
      where: { publicReference: created.body.data.reference },
      include: { notifications: true },
    });
    enquiryId = record.id;
    expect(record.policyVersion).toBe("integration-v1");
    expect(record.notifications).toHaveLength(1);
    expect(record.notifications[0]?.status).toBe("PENDING");
  });

  it("returns the original receipt for an identical retry and conflicts on changed input", async () => {
    const duplicate = await request(app)
      .post("/api/v1/inquiries")
      .set("idempotency-key", idempotencyKey)
      .send(payload)
      .expect(200);
    expect(duplicate.body.data.duplicate).toBe(true);
    expect(await prisma.enquiry.count({ where: { idempotencyKey } })).toBe(1);
    expect(
      await prisma.notificationOutbox.count({ where: { enquiryId } }),
    ).toBe(1);

    await request(app)
      .post("/api/v1/inquiries")
      .set("idempotency-key", idempotencyKey)
      .send({ ...payload, message: `${payload.message} Changed.` })
      .expect(409)
      .expect(({ body }) =>
        expect(body.error.code).toBe("IDEMPOTENCY_CONFLICT"),
      );
  });

  it("exposes private lead workflow only to authorized staff and audits transitions", async () => {
    const detail = await superAgent
      .get(`/api/v1/admin/inquiries/${enquiryId}`)
      .expect(200);
    expect(detail.body.data.requester.email).toBe(payload.email);
    expect(detail.body.data).not.toHaveProperty("idempotencyKey");
    expect(detail.body.data).not.toHaveProperty("payloadHash");

    await superAgent
      .patch(`/api/v1/admin/inquiries/${enquiryId}/status`)
      .set("x-csrf-token", superCsrf)
      .send({ status: "CONTACTED", reason: "Integration verification" })
      .expect(200)
      .expect(({ body }) => expect(body.data.status).toBe("CONTACTED"));
    expect(
      await prisma.enquiryStatusHistory.count({
        where: { enquiryId, toStatus: "CONTACTED", changedById: superUserId },
      }),
    ).toBe(1);
    expect(
      await prisma.auditLog.count({ where: { entityId: enquiryId } }),
    ).toBe(1);
  });
});

describe("durable notification and password-reset operations", () => {
  it("retains the lead after a real SMTP refusal and sends the same outbox row on retry", async () => {
    const event = await prisma.notificationOutbox.findFirstOrThrow({
      where: { enquiryId, eventType: "ENQUIRY_RECEIVED" },
    });
    const refusingTransport = nodemailer.createTransport({
      host: "127.0.0.1",
      port: 1,
      secure: false,
      connectionTimeout: 1_000,
      greetingTimeout: 1_000,
      socketTimeout: 1_000,
    });
    const failed = await processNextNotification(
      refusingTransport,
      new Date(),
      event.id,
    );
    refusingTransport.close();
    expect(failed).toEqual(
      expect.objectContaining({
        id: event.id,
        status: "FAILED",
        attempts: 1,
      }),
    );
    expect(failed?.lastError).toMatch(/^SMTP_(ECONNREFUSED|ESOCKET)$/);
    expect(await prisma.enquiry.count({ where: { id: enquiryId } })).toBe(1);
    await prisma.notificationOutbox.update({
      where: { id: event.id },
      data: { status: "PENDING", nextAttemptAt: new Date() },
    });
    const captureTransport = nodemailer.createTransport({
      jsonTransport: true,
    });
    const sent = await processNextNotification(
      captureTransport,
      new Date(),
      event.id,
    );
    captureTransport.close();
    expect(sent).toEqual(
      expect.objectContaining({ id: event.id, status: "SENT", attempts: 2 }),
    );
    expect(await prisma.enquiry.count({ where: { id: enquiryId } })).toBe(1);
  });

  it("uses an expiring single-use reset token and revokes existing sessions", async () => {
    await superAgent
      .post("/api/v1/auth/forgot-password")
      .set("x-csrf-token", superCsrf)
      .send({ email: superEmail })
      .expect(202);
    const outbox = await prisma.notificationOutbox.findFirstOrThrow({
      where: { eventType: "PASSWORD_RESET_REQUESTED" },
      orderBy: { createdAt: "desc" },
    });
    const payload = outbox.payload as { text: string };
    const rawToken = /[?&]token=([^\s&]+)/.exec(payload.text)?.[1];
    expect(rawToken).toBeTruthy();
    await superAgent
      .post("/api/v1/auth/reset-password")
      .set("x-csrf-token", superCsrf)
      .send({ token: decodeURIComponent(rawToken!), password: resetPassword })
      .expect(200);
    await superAgent.get("/api/v1/auth/me").expect(401);
    expect(await prisma.session.count({ where: { userId: superUserId } })).toBe(
      0,
    );
    expect(
      await argon2.verify(
        (
          await prisma.adminUser.findUniqueOrThrow({
            where: { id: superUserId },
          })
        ).passwordHash,
        resetPassword,
      ),
    ).toBe(true);

    const retryCsrf = await request(app).get("/api/v1/auth/csrf").expect(200);
    await request(app)
      .post("/api/v1/auth/reset-password")
      .set("x-csrf-token", retryCsrf.body.data.csrfToken)
      .send({ token: decodeURIComponent(rawToken!), password: resetPassword })
      .expect(400);
    await prisma.notificationOutbox.delete({ where: { id: outbox.id } });
  });

  it("requires the current password and revokes all sessions after a password change", async () => {
    const agent = request.agent(app);
    const csrf = await agent.get("/api/v1/auth/csrf").expect(200);
    const login = await agent
      .post("/api/v1/auth/login")
      .set("x-csrf-token", csrf.body.data.csrfToken)
      .send({ email: superEmail, password: resetPassword })
      .expect(200);
    await agent
      .post("/api/v1/auth/change-password")
      .set("x-csrf-token", login.body.data.csrfToken)
      .send({ currentPassword: "incorrect", newPassword: changedPassword })
      .expect(400)
      .expect(({ body }) =>
        expect(body.error.code).toBe("CURRENT_PASSWORD_INVALID"),
      );
    await agent
      .post("/api/v1/auth/change-password")
      .set("x-csrf-token", login.body.data.csrfToken)
      .send({ currentPassword: resetPassword, newPassword: changedPassword })
      .expect(204);
    await agent.get("/api/v1/auth/me").expect(401);
    expect(await prisma.session.count({ where: { userId: superUserId } })).toBe(
      0,
    );
    expect(
      await argon2.verify(
        (
          await prisma.adminUser.findUniqueOrThrow({
            where: { id: superUserId },
          })
        ).passwordHash,
        changedPassword,
      ),
    ).toBe(true);
  });
});

afterAll(async () => {
  await prisma.enquiry.deleteMany({ where: { idempotencyKey } });
  await prisma.session.deleteMany({
    where: { userId: { in: [superUserId, editorUserId] } },
  });
  await prisma.passwordResetToken.deleteMany({
    where: { userId: { in: [superUserId, editorUserId] } },
  });
  await prisma.auditLog.deleteMany({
    where: { actorId: { in: [superUserId, editorUserId] } },
  });
  await prisma.adminUser.deleteMany({
    where: { id: { in: [superUserId, editorUserId] } },
  });
  await prisma.rateLimitBucket.deleteMany();
  await prisma.$disconnect();
});
