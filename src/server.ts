import { app } from "./app.js";
import { prisma } from "./database.js";
import { env } from "./env.js";

const server = app.listen(env.API_PORT, () => {
  console.log("BR API listening on http://127.0.0.1:" + env.API_PORT);
});

async function shutdown(signal: string) {
  console.log(signal + " received; closing API.");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
