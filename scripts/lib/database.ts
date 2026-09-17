import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../src/generated/prisma/client.js";

function connectionOptions(databaseUrl: string, connectionLimit = 5) {
  const url = new URL(databaseUrl);
  if (url.protocol !== "mysql:") {
    throw new Error("DATABASE_URL must use the mysql:// protocol.");
  }

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit,
  };
}

export function createOperationalPrisma() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const defaultLimit =
    process.env.VERCEL || process.env.NODE_ENV === "production" ? "1" : "5";
  const limit = Number(
    process.env.DATABASE_CONNECTION_LIMIT ?? defaultLimit,
  );
  const adapter = new PrismaMariaDb(connectionOptions(databaseUrl, limit));
  return new PrismaClient({ adapter });
}
