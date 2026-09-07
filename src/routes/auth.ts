import argon2 from "argon2";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database.js";
import { env } from "../env.js";
import { HttpError } from "../lib/http-error.js";
import {
  clearSessionCookie,
  createPreAuthCsrfToken,
  createSessionCsrfToken,
  randomToken,
  requestFingerprint,
  secretHash,
  setSessionCookie,
} from "../lib/security.js";
import {
  optionalSession,
  requireAllowedOrigin,
  requireAuth,
  requireCsrf,
} from "../middleware/auth.js";
import { mysqlRateLimit } from "../middleware/rate-limit.js";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const passwordSchema = z.string().min(14).max(128);
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(256),
});
const forgotSchema = z.object({ email: emailSchema });
const resetSchema = z.object({
  token: z.string().min(32).max(256),
  password: passwordSchema,
});
const profileSchema = z
  .object({ displayName: z.string().trim().min(2).max(120) })
  .strict();
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(256),
    newPassword: passwordSchema,
  })
  .strict();
const dummyPasswordHash = argon2.hash(randomToken(), { type: argon2.argon2id });

function publicUser(user: NonNullable<Express.Request["auth"]>["user"]) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}

export const authRouter = Router();
authRouter.use(optionalSession);
authRouter.use((_request, response, next) => {
  response.setHeader("cache-control", "no-store");
  next();
});

authRouter.get("/csrf", (request, response) => {
  const token = request.auth
    ? createSessionCsrfToken(request.auth.sessionId)
    : createPreAuthCsrfToken();
  response.json({
    data: { csrfToken: token, authenticated: Boolean(request.auth) },
  });
});

authRouter.post(
  "/login",
  requireAllowedOrigin,
  requireCsrf,
  mysqlRateLimit({
    scope: "auth-login",
    max: 8,
    windowMs: 15 * 60_000,
    identity: (request) =>
      `${request.ip}:${String(request.body?.email ?? "").toLowerCase()}`,
  }),
  async (request, response) => {
    const input = loginSchema.parse(request.body);
    const user = await prisma.adminUser.findUnique({
      where: { email: input.email },
    });
    const passwordHash = user?.passwordHash ?? (await dummyPasswordHash);
    const validPassword = await argon2
      .verify(passwordHash, input.password)
      .catch(() => false);
    if (!user || !validPassword || user.status !== "ACTIVE") {
      throw new HttpError(
        401,
        "INVALID_CREDENTIALS",
        "The email or password is incorrect.",
      );
    }

    const rawToken = randomToken();
    const expiresAt = new Date(
      Date.now() + env.SESSION_TTL_HOURS * 60 * 60_000,
    );
    const session = await prisma.$transaction(async (transaction) => {
      if (request.auth) {
        await transaction.session
          .delete({ where: { id: request.auth.sessionId } })
          .catch(() => undefined);
      }
      const created = await transaction.session.create({
        data: {
          tokenHash: secretHash(rawToken),
          userId: user.id,
          expiresAt,
          ipHash: requestFingerprint(request),
          userAgent: request.header("user-agent")?.slice(0, 512) ?? null,
        },
      });
      await transaction.adminUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      await transaction.auditLog.create({
        data: {
          actorId: user.id,
          action: "AUTH_LOGIN",
          entityType: "AdminUser",
          entityId: user.id,
          requestId: String(response.locals.requestId),
          ipHash: requestFingerprint(request),
        },
      });
      return created;
    });

    setSessionCookie(response, rawToken, expiresAt);
    response.json({
      data: {
        user: publicUser({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        }),
        csrfToken: createSessionCsrfToken(session.id),
        expiresAt: expiresAt.toISOString(),
      },
    });
  },
);

authRouter.post(
  "/logout",
  requireAuth,
  requireAllowedOrigin,
  requireCsrf,
  async (request, response) => {
    await prisma.$transaction([
      prisma.session.delete({ where: { id: request.auth!.sessionId } }),
      prisma.auditLog.create({
        data: {
          actorId: request.auth!.user.id,
          action: "AUTH_LOGOUT",
          entityType: "AdminUser",
          entityId: request.auth!.user.id,
          requestId: String(response.locals.requestId),
          ipHash: requestFingerprint(request),
        },
      }),
    ]);
    clearSessionCookie(response);
    response.status(204).send();
  },
);

authRouter.get("/me", requireAuth, (request, response) => {
  response.json({ data: { user: publicUser(request.auth!.user) } });
});

authRouter.put(
  "/profile",
  requireAuth,
  requireAllowedOrigin,
  requireCsrf,
  async (request, response) => {
    const input = profileSchema.parse(request.body);
    const user = await prisma.adminUser.update({
      where: { id: request.auth!.user.id },
      data: { displayName: input.displayName },
      select: { id: true, email: true, displayName: true, role: true },
    });
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "AUTH_PROFILE_UPDATED",
        entityType: "AdminUser",
        entityId: user.id,
        after: { displayName: user.displayName },
        requestId: String(response.locals.requestId),
        ipHash: requestFingerprint(request),
      },
    });
    response.json({ data: { user } });
  },
);

authRouter.post(
  "/change-password",
  requireAuth,
  requireAllowedOrigin,
  requireCsrf,
  async (request, response) => {
    const input = changePasswordSchema.parse(request.body);
    const user = await prisma.adminUser.findUniqueOrThrow({
      where: { id: request.auth!.user.id },
    });
    const validPassword = await argon2
      .verify(user.passwordHash, input.currentPassword)
      .catch(() => false);
    if (!validPassword)
      throw new HttpError(
        400,
        "CURRENT_PASSWORD_INVALID",
        "The current password is incorrect.",
      );
    const passwordHash = await argon2.hash(input.newPassword, {
      type: argon2.argon2id,
    });
    await prisma.$transaction([
      prisma.adminUser.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "AUTH_PASSWORD_CHANGED",
          entityType: "AdminUser",
          entityId: user.id,
          requestId: String(response.locals.requestId),
          ipHash: requestFingerprint(request),
        },
      }),
    ]);
    clearSessionCookie(response);
    response.status(204).send();
  },
);

authRouter.post(
  "/forgot-password",
  requireAllowedOrigin,
  requireCsrf,
  mysqlRateLimit({ scope: "auth-forgot", max: 5, windowMs: 30 * 60_000 }),
  async (request, response) => {
    const input = forgotSchema.parse(request.body);
    const user = await prisma.adminUser.findUnique({
      where: { email: input.email },
    });
    if (user?.status === "ACTIVE") {
      const token = randomToken();
      const expiresAt = new Date(
        Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60_000,
      );
      const resetUrl = new URL("/admin/reset-password", env.PUBLIC_SITE_URL);
      resetUrl.searchParams.set("token", token);
      await prisma.$transaction([
        prisma.passwordResetToken.create({
          data: { tokenHash: secretHash(token), userId: user.id, expiresAt },
        }),
        prisma.notificationOutbox.create({
          data: {
            eventType: "PASSWORD_RESET_REQUESTED",
            payload: {
              to: user.email,
              subject: "Reset your BR Tours admin password",
              text: `A password reset was requested for your BR Tours admin account.\n\nOpen this link within ${env.PASSWORD_RESET_TTL_MINUTES} minutes:\n${resetUrl.toString()}\n\nIf you did not request this, no action is required.`,
            },
          },
        }),
      ]);
    }
    response.status(202).json({
      data: {
        message:
          "If the account exists, password reset instructions have been queued.",
      },
    });
  },
);

authRouter.post(
  "/reset-password",
  requireAllowedOrigin,
  requireCsrf,
  mysqlRateLimit({ scope: "auth-reset", max: 8, windowMs: 30 * 60_000 }),
  async (request, response) => {
    const input = resetSchema.parse(request.body);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: secretHash(input.token) },
      include: { user: true },
    });
    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt <= new Date() ||
      resetToken.user.status !== "ACTIVE"
    ) {
      throw new HttpError(
        400,
        "RESET_TOKEN_INVALID",
        "This password reset link is invalid or expired.",
      );
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });
    await prisma.$transaction(async (transaction) => {
      const consumed = await transaction.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() },
      });
      if (consumed.count !== 1) {
        throw new HttpError(
          409,
          "RESET_TOKEN_USED",
          "This password reset link was already used.",
        );
      }
      await transaction.adminUser.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });
      await transaction.session.deleteMany({
        where: { userId: resetToken.userId },
      });
      await transaction.auditLog.create({
        data: {
          actorId: resetToken.userId,
          action: "AUTH_PASSWORD_RESET",
          entityType: "AdminUser",
          entityId: resetToken.userId,
          requestId: String(response.locals.requestId),
          ipHash: requestFingerprint(request),
        },
      });
    });
    clearSessionCookie(response);
    response.json({
      data: { message: "Password updated. Sign in with the new password." },
    });
  },
);
