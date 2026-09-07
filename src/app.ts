import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import type helmetFactory from "helmet";
import multer from "multer";
import { pinoHttp } from "pino-http";
import { ZodError } from "zod";
import { prisma } from "./database.js";
import { env } from "./env.js";
import { Prisma } from "./generated/prisma/client.js";
import { HttpError } from "./lib/http-error.js";
import { authRouter } from "./routes/auth.js";
import { adminCatalogueRouter } from "./routes/admin-catalogue.js";
import { adminContentRouter } from "./routes/admin-content.js";
import { adminOperationsRouter } from "./routes/admin-operations.js";
import { adminInquiriesRouter, inquiriesRouter } from "./routes/inquiries.js";
import { packageRouter } from "./routes/packages.js";
import { publicContentRouter } from "./routes/public-content.js";
import { adminMediaRouter, publicMediaRouter } from "./routes/media.js";

const helmet = createRequire(import.meta.url)("helmet") as typeof helmetFactory;

export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY_HOPS);
app.use(
  pinoHttp({
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers.x-csrf-token",
        "req.headers.idempotency-key",
        "req.body.password",
        "req.body.email",
        "req.body.phone",
      ],
      censor: "[REDACTED]",
    },
  }),
);
app.use((request, response, next) => {
  const requestId =
    request.header("x-request-id")?.slice(0, 64) || randomUUID();
  response.locals.requestId = requestId;
  response.setHeader("x-request-id", requestId);
  next();
});
app.use(
  helmet({
    strictTransportSecurity:
      env.NODE_ENV === "production"
        ? { maxAge: 31_536_000, includeSubDomains: true }
        : false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "upgrade-insecure-requests": env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || env.CORS_ALLOWED_ORIGINS.includes(origin))
        callback(null, true);
      else
        callback(
          new HttpError(
            403,
            "ORIGIN_NOT_ALLOWED",
            "The request origin is not allowed.",
          ),
        );
    },
  }),
);
app.use(express.json({ limit: "256kb", type: ["application/json"] }));
app.use((request, _response, next) => {
  if (
    ["POST", "PUT", "PATCH"].includes(request.method) &&
    Number(request.header("content-length") ?? 0) > 0 &&
    !request.is("application/json") &&
    !(
      request.path === "/api/v1/admin/media" &&
      request.is("multipart/form-data")
    )
  ) {
    next(
      new HttpError(
        415,
        "CONTENT_TYPE_INVALID",
        "Send JSON requests as application/json.",
      ),
    );
    return;
  }
  next();
});

const health = (_request: express.Request, response: express.Response) => {
  response.json({ data: { status: "ok", service: "br-tours-api" } });
};
const ready = async (_request: express.Request, response: express.Response) => {
  await prisma.$queryRaw`SELECT 1`;
  response.json({ data: { status: "ready", database: "reachable" } });
};

app.get("/health", health);
app.get("/ready", ready);
app.get("/api/v1/health", health);
app.get("/api/v1/ready", ready);
app.use("/media", publicMediaRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", publicContentRouter);
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/inquiries", inquiriesRouter);
app.use("/api/v1/admin", adminOperationsRouter);
app.use("/api/v1/admin", adminCatalogueRouter);
app.use("/api/v1/admin", adminContentRouter);
app.use("/api/v1/admin/media", adminMediaRouter);
app.use("/api/v1/admin/inquiries", adminInquiriesRouter);

app.use((_request, _response, next) => {
  next(
    new HttpError(
      404,
      "ROUTE_NOT_FOUND",
      "The requested API route does not exist.",
    ),
  );
});

const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  void _next;
  const requestId = String(response.locals.requestId ?? "unknown");
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Check the submitted fields.",
        fields: error.flatten().fieldErrors,
        requestId,
      },
    });
    return;
  }
  if (error instanceof multer.MulterError) {
    response.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
      error: {
        code:
          error.code === "LIMIT_FILE_SIZE"
            ? "UPLOAD_TOO_LARGE"
            : "UPLOAD_INVALID",
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "The uploaded file is too large."
            : "The upload could not be processed.",
        requestId,
      },
    });
    return;
  }
  if (error instanceof HttpError) {
    response.status(error.status).json({
      error: { code: error.code, message: error.message, requestId },
    });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      response.status(409).json({
        error: {
          code: "RECORD_CONFLICT",
          message: "A record with this unique value already exists.",
          requestId,
        },
      });
      return;
    }
    if (error.code === "P2025") {
      response.status(404).json({
        error: {
          code: "RECORD_NOT_FOUND",
          message: "The record was not found.",
          requestId,
        },
      });
      return;
    }
  }

  response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message:
        env.NODE_ENV === "production"
          ? "The request could not be completed."
          : error instanceof Error
            ? error.message
            : "Unknown server error.",
      requestId,
    },
  });
};
app.use(errorHandler);

export default app;
