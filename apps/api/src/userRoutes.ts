import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";

const feedbackSchema = z.object({
  content: z.string().min(5).max(500),
  contact: z.string().max(80).optional(),
  type: z.enum(["SUGGESTION", "COMPLAINT", "COOPERATION", "OTHER"]).default("SUGGESTION")
});

export async function userRoutes(app: FastifyInstance) {
  // 收藏商家
  app.post("/api/user/favorites/:merchantId", async (request, reply) => {
    const auth = request.user as { sub: string } | undefined;
    if (!auth) return fail(reply, "UNAUTHORIZED", "请先登录", 401);
    
    const { merchantId } = z.object({ merchantId: z.string() }).parse(request.params);
    
    const merchant = await prisma.merchant.findFirst({ where: { id: merchantId, status: "APPROVED" } });
    if (!merchant) return fail(reply, "NOT_FOUND", "商家不存在", 404);
    
    const existing = await prisma.favorite.findUnique({
      where: { userId_merchantId: { userId: auth.sub, merchantId } }
    });
    if (existing) return ok(reply, { favorite: true }, "已收藏");
    
    await prisma.favorite.create({
      data: { userId: auth.sub, merchantId }
    });
    
    return ok(reply, { favorite: true }, "收藏成功");
  });

  // 取消收藏
  app.delete("/api/user/favorites/:merchantId", async (request, reply) => {
    const auth = request.user as { sub: string } | undefined;
    if (!auth) return fail(reply, "UNAUTHORIZED", "请先登录", 401);
    
    const { merchantId } = z.object({ merchantId: z.string() }).parse(request.params);
    
    await prisma.favorite.deleteMany({
      where: { userId: auth.sub, merchantId }
    });
    
    return ok(reply, { favorite: false }, "已取消收藏");
  });

  // 获取收藏列表
  app.get("/api/user/favorites", async (request, reply) => {
    const auth = request.user as { sub: string } | undefined;
    if (!auth) return fail(reply, "UNAUTHORIZED", "请先登录", 401);
    
    const favorites = await prisma.favorite.findMany({
      where: { userId: auth.sub },
      include: {
        merchant: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    return ok(reply, favorites.map(f => ({
      id: f.merchant.id,
      name: f.merchant.name,
      image: f.merchant.coverImageUrl,
      summary: f.merchant.summary,
      address: f.merchant.address,
      favoritedAt: f.createdAt
    })));
  });

  // 获取浏览历史
  app.get("/api/user/history", async (request, reply) => {
    const auth = request.user as { sub: string } | undefined;
    if (!auth) return fail(reply, "UNAUTHORIZED", "请先登录", 401);
    
    const history = await prisma.viewHistory.findMany({
      where: { userId: auth.sub },
      include: {
        merchant: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    
    return ok(reply, history.map(h => ({
      id: h.merchant.id,
      name: h.merchant.name,
      image: h.merchant.coverImageUrl,
      summary: h.merchant.summary,
      address: h.merchant.address,
      viewedAt: h.createdAt
    })));
  });

  // 记录浏览历史
  app.post("/api/user/history/:merchantId", async (request, reply) => {
    const auth = request.user as { sub: string } | undefined;
    if (!auth) return fail(reply, "UNAUTHORIZED", "请先登录", 401);
    
    const { merchantId } = z.object({ merchantId: z.string() }).parse(request.params);
    
    await prisma.viewHistory.upsert({
      where: { userId_merchantId: { userId: auth.sub, merchantId } },
      update: { createdAt: new Date() },
      create: { userId: auth.sub, merchantId }
    });
    
    return ok(reply, { success: true });
  });

  // 清空浏览历史
  app.delete("/api/user/history", async (request, reply) => {
    const auth = request.user as { sub: string } | undefined;
    if (!auth) return fail(reply, "UNAUTHORIZED", "请先登录", 401);
    
    await prisma.viewHistory.deleteMany({
      where: { userId: auth.sub }
    });
    
    return ok(reply, { success: true }, "已清空");
  });
}

// 公开API：提交反馈（无需登录）
export async function publicFeedbackRoute(app: FastifyInstance) {
  app.post("/api/public/feedback", async (request, reply) => {
    const parsed = feedbackSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "参数错误");
    
    const feedback = await prisma.feedback.create({
      data: {
        content: parsed.data.content,
        contact: parsed.data.contact,
        type: parsed.data.type,
        status: "PENDING"
      }
    });
    
    return ok(reply, { id: feedback.id }, "感谢你的反馈！");
  });
}
