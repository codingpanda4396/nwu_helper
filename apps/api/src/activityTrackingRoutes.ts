import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { ok } from "./response.js";

const activitySchema = z.object({
  action: z.string().trim().min(1).max(80),
  page: z.string().trim().max(120).optional(),
  targetId: z.string().trim().max(120).optional(),
  merchantId: z.string().trim().max(120).optional(),
  activityId: z.string().trim().max(120).optional(),
  channelId: z.string().trim().max(120).optional(),
  source: z.string().trim().max(120).optional(),
  scene: z.string().trim().max(120).optional(),
  sessionId: z.string().trim().max(160).optional(),
  platform: z.enum(["h5", "miniprogram"]).default("h5"),
});

export async function activityTrackingRoutes(app: FastifyInstance) {
  app.post("/api/public/activity", async (request, reply) => {
    const parsed = activitySchema.safeParse(request.body);
    if (!parsed.success) {
      return ok(reply, { success: true });
    }

    const { action, page, targetId, platform } = parsed.data;
    const ip = request.ip;
    const sessionId = parsed.data.sessionId || request.headers["x-session-id"]?.toString() || null;
    const merchantId = parsed.data.merchantId || (action.startsWith("merchant_") || action === "phone_click" || action === "navigation_click" || action === "wechat_qr_view" ? targetId : undefined);
    const activityId = parsed.data.activityId || (action.startsWith("activity_") ? targetId : undefined);

    try {
      await prisma.userActivity.create({
        data: {
          action,
          page: page || null,
          targetId: targetId || null,
          merchantId: merchantId || null,
          activityId: activityId || null,
          channelId: parsed.data.channelId || null,
          source: parsed.data.source || null,
          scene: parsed.data.scene || null,
          platform,
          ip,
          sessionId,
        },
      });
    } catch (error) {
      console.error('[activity-tracking]', error);
    }

    return ok(reply, { success: true });
  });
}
