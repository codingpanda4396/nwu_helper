import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";

const feedbackSchema = z.object({
  content: z.string().min(5).max(500),
  contact: z.string().max(80).optional(),
  type: z.enum(["SUGGESTION", "COMPLAINT", "COOPERATION", "OTHER"]).default("SUGGESTION")
});

const profileSchema = z.object({
  nickname: z.string().max(50).optional(),
  avatarUrl: z.string().max(500).optional()
});

export async function userRoutes(app: FastifyInstance) {
  // 获取用户资料
  app.get("/api/user/profile", async (request, reply) => {
    const auth = request.user as { sub: string } | undefined;
    if (!auth) return fail(reply, "UNAUTHORIZED", "请先登录", 401);

    const user = await prisma.user.findUnique({ where: { id: auth.sub } });
    if (!user) return fail(reply, "NOT_FOUND", "用户不存在", 404);

    return ok(reply, {
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      role: user.role
    });
  });

  // 更新用户资料
  app.put("/api/user/profile", async (request, reply) => {
    const auth = request.user as { sub: string } | undefined;
    if (!auth) return fail(reply, "UNAUTHORIZED", "请先登录", 401);

    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "参数错误");

    const user = await prisma.user.update({
      where: { id: auth.sub },
      data: {
        ...(parsed.data.nickname !== undefined && { nickname: parsed.data.nickname }),
        ...(parsed.data.avatarUrl !== undefined && { avatarUrl: parsed.data.avatarUrl })
      }
    });

    return ok(reply, {
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      role: user.role
    });
  });

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
    
    // 查找现有的浏览记录
    const existing = await prisma.viewHistory.findFirst({
      where: { userId: auth.sub, merchantId },
    });

    if (existing) {
      // 更新现有记录的时间
      await prisma.viewHistory.update({
        where: { id: existing.id },
        data: { createdAt: new Date() },
      });
    } else {
      // 创建新记录
      await prisma.viewHistory.create({
        data: { userId: auth.sub, merchantId },
      });
    }
    
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
