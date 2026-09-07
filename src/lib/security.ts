import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import type { Request, Response } from "express";
import { env } from "../env.js";

export function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

export function secretHash(value: string) {
  return createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", env.SESSION_SECRET)
    .update(value)
    .digest("base64url");
}

function equalText(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createPreAuthCsrfToken(now = Date.now()) {
  const expiresAt = now + env.CSRF_TTL_MINUTES * 60_000;
  const nonce = randomToken(18);
  const value = `preauth.${expiresAt}.${nonce}`;
  return `${value}.${sign(value)}`;
}

export function verifyPreAuthCsrfToken(token: string, now = Date.now()) {
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "preauth") return false;
  const value = parts.slice(0, 3).join(".");
  const expiresAt = Number(parts[1]);
  return (
    Number.isFinite(expiresAt) &&
    expiresAt >= now &&
    equalText(parts[3] ?? "", sign(value))
  );
}

export function createSessionCsrfToken(sessionId: string) {
  return sign(`session.${sessionId}`);
}

export function verifySessionCsrfToken(sessionId: string, token: string) {
  return equalText(token, createSessionCsrfToken(sessionId));
}

export function readCookie(request: Request, name: string) {
  const header = request.header("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1));
    } catch {
      return undefined;
    }
  }
  return undefined;
}

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setSessionCookie(
  response: Response,
  token: string,
  expiresAt: Date,
) {
  response.cookie(env.SESSION_COOKIE_NAME, token, {
    ...cookieOptions,
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(env.SESSION_COOKIE_NAME, cookieOptions);
}

export function requestFingerprint(request: Request) {
  return secretHash(request.ip || request.socket.remoteAddress || "unknown");
}
