import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";
import { adminRoutes } from "./adminRoutes.js";
import { authRoutes, requireAuth } from "./auth.js";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { publicRoutes } from "./publicRoutes.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: [config.webOrigin, "http://localhost:5173"],
  credentials: true
});
await app.register(jwt, { secret: config.jwtSecret });

app.get("/api/health", async () => ({ success: true, data: { status: "ok" } }));
await app.register(authRoutes);
await app.register(publicRoutes);
await app.register(async (privateApp) => {
  privateApp.addHook("preHandler", requireAuth);
  await privateApp.register(adminRoutes);
});

const shutdown = async () => {
  await prisma.$disconnect();
  await app.close();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await app.listen({ port: config.port, host: "0.0.0.0" });
