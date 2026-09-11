import type { RequestHandler } from "express";

const sharedCachePolicy =
  "public, max-age=0, s-maxage=300, stale-while-revalidate=86400";

/** Cache successful, anonymous catalogue reads at the hosting edge. */
export const publicReadCache: RequestHandler = (request, response, next) => {
  if (request.method === "GET") {
    response.setHeader("Cache-Control", sharedCachePolicy);
    response.setHeader("Vercel-CDN-Cache-Control", sharedCachePolicy);
  }
  next();
};
