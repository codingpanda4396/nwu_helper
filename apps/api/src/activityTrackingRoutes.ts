import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { ok } from "./response.js";

const activitySchema = z.object({
  action: z.string(),
  page: z.string().optional(),
  targetId: z.string().optional(),
  platform: z.enum(["h5", "miniprogram"]),
});

export async function activityTrackingRoutes(app: FastifyInstance) {
  app.post("/api/public/activity", async (request, reply) => {
    const parsed = activitySchema.safeParse(request.body);
    if (!parsed.success) {
      return ok(reply, { success: true });
    }

    const { action, page, targetId, platform } = parsed.data;
    const ip = request.ip;

    try {
      await prisma.userActivity.create({
        data: {
          action,
          page: page || null,
          targetId: targetId || null,
          platform,
          ip,
          sessionId: request.headers["x-session-id"] as string || null,
        },
      });
    } catch (error) {
      console.error('[activity-tracking]', error);
    }

    return ok(reply, { success: true });
  });
}
