import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";

const createOrderSchema = z.object({
  slotId: z.string().min(1),
  days: z.number().int().positive(),
  title: z.string().optional(),
  imageUrl: z.string().optional()
});

export async function promotionRoutes(app: FastifyInstance) {
  app.get("/api/promotion/slots", async (_request, reply) => {
    const slots = await prisma.promotionSlot.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    });
    return ok(reply, slots);
  });

  app.get("/api/promotion/orders", async (request, reply) => {
    const user = request.user as { sub: string };

    const merchant = await prisma.merchant.findFirst({
      where: { ownerUserId: user.sub }
    });
    if (!merchant) return fail(reply, "NO_MERCHANT", "尚未关联店铺", 404);

    const orders = await prisma.promotionOrder.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, orders);
  });

  app.post("/api/promotion/orders", async (request, reply) => {
    const user = request.user as { sub: string };
    const parsed = createOrderSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "参数错误");

    const merchant = await prisma.merchant.findFirst({
      where: { ownerUserId: user.sub }
    });
    if (!merchant) return fail(reply, "NO_MERCHANT", "尚未关联店铺", 404);

    const slot = await prisma.promotionSlot.findUnique({
      where: { id: parsed.data.slotId }
    });
    if (!slot || !slot.isActive) return fail(reply, "NOT_FOUND", "推广位不存在", 404);

    const amount = slot.pricePerDay * parsed.data.days;

    const order = await prisma.promotionOrder.create({
      data: {
        merchantId: merchant.id,
        slotId: parsed.data.slotId,
        days: parsed.data.days,
        amount,
        status: "PENDING"
      }
    });

    return ok(reply, {
      ...order,
      message: "下单成功，请线下转账后等待管理员确认开通"
    });
  });
}
