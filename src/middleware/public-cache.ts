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

/** Settings and entry metadata should not remain at the edge for hours. */
export const publicEditableContentCache: RequestHandler = (request, response, next) => {
  if (request.method === "GET") {
    const policy = "public, max-age=0, s-maxage=30, must-revalidate";
    response.setHeader("Cache-Control", policy);
    response.setHeader("Vercel-CDN-Cache-Control", policy);
  }
  next();
};
