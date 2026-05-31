import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { activityTrackingRoutes } from "./activityTrackingRoutes.js";
import { adminRoutes } from "./adminRoutes.js";
import { analyticsRoutes } from "./analyticsRoutes.js";
import { authRoutes, requireAuth } from "./auth.js";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { publicRoutes } from "./publicRoutes.js";
import { uploadRoutes } from "./uploadRoutes.js";
import { userRoutes, publicFeedbackRoute } from "./userRoutes.js";

const app = Fastify({
  logger: true,
  bodyLimit: 1048576,
  connectionTimeout: 30000,
  keepAliveTimeout: 65000,
});

await app.register(cors, {
  origin: [config.webOrigin, "http://localhost:5173"],
  credentials: true
});
await app.register(jwt, { secret: config.jwtSecret });
await app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

app.setErrorHandler((err, _request, reply) => {
  const error = err as Error & { statusCode?: number };
  const statusCode = error.statusCode || 500;
  if (statusCode === 401) {
    return reply.status(401).send({ success: false, error: { code: "UNAUTHORIZED", message: error.message || "请先登录" } });
  }
  if (statusCode === 403) {
    return reply.status(403).send({ success: false, error: { code: "FORBIDDEN", message: error.message || "无权限" } });
  }
  if (statusCode === 429) {
    return reply.status(429).send({ success: false, error: { code: "RATE_LIMIT", message: "请求过于频繁" } });
  }
  return reply.status(statusCode).send({ success: false, error: { code: "INTERNAL_ERROR", message: statusCode >= 500 ? "服务器内部错误" : error.message } });
});

app.get("/api/health", async () => ({ success: true, data: { status: "ok" } }));
await app.register(authRoutes);
await app.register(publicRoutes);
await app.register(publicFeedbackRoute);
await app.register(activityTrackingRoutes);
await app.register(async (privateApp) => {
  privateApp.addHook("preHandler", requireAuth);
  await privateApp.register(adminRoutes);
  await privateApp.register(analyticsRoutes);
  await privateApp.register(uploadRoutes);
  await privateApp.register(userRoutes);
});

const shutdown = async () => {
  await prisma.$disconnect();
  await app.close();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await app.listen({ port: config.port, host: "0.0.0.0" });
