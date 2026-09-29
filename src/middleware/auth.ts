import type { RequestHandler } from "express";
import { prisma } from "../database.js";
import { env } from "../env.js";
import type { AdminRole } from "../generated/prisma/enums.js";
import { HttpError } from "../lib/http-error.js";
import {
  readCookie,
  secretHash,
  verifyPreAuthCsrfToken,
  verifySessionCsrfToken,
} from "../lib/security.js";

export const optionalSession: RequestHandler = async (
  request,
  _response,
  next,
) => {
  // Several admin routers share this middleware within the same request.
  // Reuse only that request's validated identity; later requests still check
  // the database so revoked sessions and disabled users take effect immediately.
  if (request.auth) {
    next();
    return;
  }
  const token = readCookie(request, env.SESSION_COOKIE_NAME);
  if (!token) {
    next();
    return;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: secretHash(token) },
    select: {
      id: true,
      expiresAt: true,
      lastSeenAt: true,
      user: {
        select: { id: true, email: true, displayName: true, role: true, status: true },
      },
    },
  });
  const now = new Date();
  if (
    !session ||
    session.expiresAt <= now ||
    session.user.status !== "ACTIVE"
  ) {
    if (session)
      await prisma.session
        .delete({ where: { id: session.id } })
        .catch(() => undefined);
    next();
    return;
  }

  request.auth = {
    sessionId: session.id,
    user: {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      role: session.user.role,
    },
  };
  if (now.getTime() - session.lastSeenAt.getTime() > 5 * 60_000) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: now },
    });
  }
  next();
};

export const requireAuth: RequestHandler = (request, _response, next) => {
  if (!request.auth) {
    next(new HttpError(401, "AUTH_REQUIRED", "Sign in to continue."));
    return;
  }
  next();
};

export function requireRole(...roles: AdminRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth) {
      next(new HttpError(401, "AUTH_REQUIRED", "Sign in to continue."));
      return;
    }
    if (!roles.includes(request.auth.user.role)) {
      next(
        new HttpError(
          403,
          "FORBIDDEN",
          "You do not have permission for this action.",
        ),
      );
      return;
    }
    next();
  };
}

export const requireCsrf: RequestHandler = (request, _response, next) => {
  const token = request.header("x-csrf-token") ?? "";
  const valid = request.auth
    ? verifySessionCsrfToken(request.auth.sessionId, token)
    : verifyPreAuthCsrfToken(token);
  if (!valid) {
    next(new HttpError(403, "CSRF_INVALID", "Refresh the form and try again."));
    return;
  }
  next();
};
