import { isIP } from "node:net";
import type { Request, Response } from "express";
import type { Prisma } from "../generated/prisma/client.js";
import { requestFingerprint } from "./security.js";

type Actor = { displayName: string; email: string; role: string };

export function normalizeIpAddress(value: string | undefined) {
  if (!value) return null;
  const ip = value.startsWith("::ffff:") ? value.slice(7) : value;
  return isIP(ip) ? ip : null;
}

/** Never copy request bodies, passwords, cookies, tokens or query strings into a log. */
export function activityContext(request: Request, response: Response, actor: Actor | undefined = request.auth?.user) {
  return {
    requestId: typeof response.locals.requestId === "string" ? response.locals.requestId.slice(0, 64) : null,
    // req.ip follows the configured Express trust-proxy policy. Do not trust arbitrary forwarded headers.
    ipAddress: normalizeIpAddress(request.ip ?? request.socket.remoteAddress),
    ipHash: requestFingerprint(request),
    userAgent: request.header("user-agent")?.slice(0, 512) || null,
    actorName: actor?.displayName.slice(0, 120) ?? null,
    actorEmail: actor?.email.slice(0, 254) ?? null,
    actorRole: actor?.role.slice(0, 40) ?? null,
    requestMethod: request.method.slice(0, 10),
    requestPath: request.originalUrl.split("?")[0]!.slice(0, 500),
  };
}

export async function recordActivity(
  database: Pick<Prisma.TransactionClient, "auditLog">,
  request: Request,
  response: Response,
  action: string,
  entityType: string,
  entityId: string,
  changes: { before?: Prisma.InputJsonValue; after?: Prisma.InputJsonValue } = {},
) {
  await database.auditLog.create({ data: {
    actorId: request.auth?.user.id ?? null, action, entityType, entityId,
    ...changes, ...activityContext(request, response),
  } });
}
