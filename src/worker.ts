import nodemailer from "nodemailer";
import { prisma } from "./database.js";
import { env } from "./env.js";
import {
  processNextNotification,
  recoverExpiredNotificationLocks,
} from "./lib/notification-worker.js";

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  ...(env.SMTP_USER && env.SMTP_PASSWORD
    ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } }
    : {}),
});

let running = false;
async function tick() {
  if (running) return;
  running = true;
  try {
    await processNextNotification(transport);
  } finally {
    running = false;
  }
}

console.log(
  "Notification worker started; SMTP errors retain outbox rows for retry.",
);
await recoverExpiredNotificationLocks();
await tick();
const timer = setInterval(() => void tick(), env.NOTIFICATION_POLL_MS);

async function shutdown() {
  clearInterval(timer);
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
