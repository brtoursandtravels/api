import { z } from "zod";
import { prisma } from "../database.js";

export const notificationPayloadSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  text: z.string().min(1).max(20_000),
});

export type MailSender = {
  sendMail(
    message: z.infer<typeof notificationPayloadSchema>,
  ): Promise<unknown>;
};

export async function recoverExpiredNotificationLocks(now = new Date()) {
  return prisma.notificationOutbox.updateMany({
    where: {
      status: "PROCESSING",
      lockedAt: { lt: new Date(now.getTime() - 15 * 60_000) },
    },
    data: {
      status: "FAILED",
      lockedAt: null,
      nextAttemptAt: now,
      lastError: "WORKER_LOCK_EXPIRED",
    },
  });
}

export async function processNextNotification(
  sender: MailSender,
  now = new Date(),
  onlyId?: string,
) {
  const item = await prisma.notificationOutbox.findFirst({
    where: {
      // Enquiries are handled in admin; only account recovery emails are sent.
      eventType: "PASSWORD_RESET_REQUESTED",
      status: { in: ["PENDING", "FAILED"] },
      nextAttemptAt: { lte: now },
      ...(onlyId ? { id: onlyId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  if (!item) return null;

  const claimed = await prisma.notificationOutbox.updateMany({
    where: { id: item.id, status: item.status },
    data: { status: "PROCESSING", lockedAt: now, attempts: { increment: 1 } },
  });
  if (claimed.count !== 1) return null;

  try {
    const payload = notificationPayloadSchema.parse(item.payload);
    await sender.sendMail(payload);
    return await prisma.notificationOutbox.update({
      where: { id: item.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        lockedAt: null,
        lastError: null,
      },
    });
  } catch (error) {
    const attempts = item.attempts + 1;
    const delayMinutes = Math.min(60, 2 ** Math.min(attempts, 6));
    const code =
      typeof error === "object" &&
      error &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code.slice(0, 80)
        : "DELIVERY_ERROR";
    return prisma.notificationOutbox.update({
      where: { id: item.id },
      data: {
        status: attempts >= 10 ? "CANCELLED" : "FAILED",
        lockedAt: null,
        nextAttemptAt: new Date(now.getTime() + delayMinutes * 60_000),
        lastError: `SMTP_${code}`,
      },
    });
  }
}
