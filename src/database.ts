import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "./env.js";
import { PrismaClient } from "./generated/prisma/client.js";

const url = new URL(env.DATABASE_URL);
const connectionLimit = process.env.VERCEL
  ? Math.min(env.DATABASE_CONNECTION_LIMIT, 2)
  : env.DATABASE_CONNECTION_LIMIT;
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  connectionLimit,
});

export const prisma = new PrismaClient({ adapter });
