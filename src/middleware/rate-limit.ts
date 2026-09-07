import type { RequestHandler } from "express";
import { prisma } from "../database.js";
import { HttpError } from "../lib/http-error.js";
import { secretHash } from "../lib/security.js";

type RateLimitOptions = {
  scope: string;
  max: number;
  windowMs: number;
  identity?: (request: Parameters<RequestHandler>[0]) => string;
};

export function mysqlRateLimit(options: RateLimitOptions): RequestHandler {
  return async (request, response, next) => {
    const identity =
      options.identity?.(request) ??
      request.ip ??
      request.socket.remoteAddress ??
      "unknown";
    const key = `${options.scope}:${secretHash(identity)}`;
    const now = new Date();
    const cutoff = new Date(now.getTime() - options.windowMs);

    await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, windowStartedAt: now, hits: 0 },
      update: {},
    });
    await prisma.$executeRaw`
      UPDATE RateLimitBucket
      SET
        hits = IF(windowStartedAt <= ${cutoff}, 1, hits + 1),
        blockedUntil = IF(windowStartedAt <= ${cutoff}, NULL, blockedUntil),
        windowStartedAt = IF(windowStartedAt <= ${cutoff}, ${now}, windowStartedAt),
        updatedAt = ${now}
      WHERE RateLimitBucket.key = ${key}
    `;
    const bucket = await prisma.rateLimitBucket.findUniqueOrThrow({
      where: { key },
    });

    if (bucket.blockedUntil && bucket.blockedUntil > now) {
      const retrySeconds = Math.max(
        1,
        Math.ceil((bucket.blockedUntil.getTime() - now.getTime()) / 1000),
      );
      response.setHeader("retry-after", String(retrySeconds));
      next(
        new HttpError(
          429,
          "RATE_LIMITED",
          "Too many requests. Please try again later.",
        ),
      );
      return;
    }

    if (bucket.hits > options.max) {
      const blockedUntil = new Date(now.getTime() + options.windowMs);
      await prisma.rateLimitBucket.update({
        where: { key },
        data: { blockedUntil },
      });
      response.setHeader(
        "retry-after",
        String(Math.ceil(options.windowMs / 1000)),
      );
      next(
        new HttpError(
          429,
          "RATE_LIMITED",
          "Too many requests. Please try again later.",
        ),
      );
      return;
    }

    response.setHeader("x-ratelimit-limit", String(options.max));
    response.setHeader(
      "x-ratelimit-remaining",
      String(Math.max(0, options.max - bucket.hits)),
    );
    next();
  };
}
