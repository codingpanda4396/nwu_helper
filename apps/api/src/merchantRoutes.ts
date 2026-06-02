import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";

export async function requireMerchant(request: FastifyRequest) {
  await request.jwtVerify();
  const role = (request.user as { role?: string }).role;
  if (role !== "MERCHANT" && role !== "ADMIN") {
    const err = new Error("无权限") as Error & { statusCode?: number };
    err.statusCode = 403;
    throw err;
  }
}

function parseDateQuery(query: any) {
  const now = new Date();
  const from = query.from ? new Date(query.from) : new Date(now.getTime() - 30 * 24 * 3600_000);
  const to = query.to ? new Date(query.to) : now;
  return { from: new Date(from.setHours(0, 0, 0, 0)), to: new Date(to.setHours(23, 59, 59, 999)) };
}

async function getMerchantId(request: FastifyRequest): Promise<string | null> {
  const user = request.user as { sub: string; role?: string };
  const query = request.query as Record<string, string>;

  if (user.role === "ADMIN" && query.merchantId) {
    return query.merchantId;
  }

  const merchant = await prisma.merchant.findFirst({
    where: { ownerUserId: user.sub }
  });
  return merchant?.id ?? null;
}

const profileSchema = z.object({
  summary: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  businessHours: z.string().max(100).optional(),
  coverImageUrl: z.string().max(500).optional(),
  tags: z.array(z.string()).optional()
});

export async function merchantRoutes(app: FastifyInstance) {
  app.get("/api/merchant/me", async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const merchant = await prisma.merchant.findFirst({
      where: { ownerUserId: userId },
      include: { category: true, serviceCategory: true }
    });
    if (!merchant) return fail(reply, "NO_MERCHANT", "尚未关联店铺", 404);
    return ok(reply, {
      id: merchant.id,
      name: merchant.name,
      summary: merchant.summary,
      phone: merchant.phone,
      address: merchant.address,
      businessHours: merchant.businessHours,
      coverImageUrl: merchant.coverImageUrl,
      tags: merchant.tags,
      status: merchant.status,
      category: merchant.category?.name,
      serviceCategory: merchant.serviceCategory?.name
    });
  });

  app.put("/api/merchant/profile", async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "参数错误");

    const merchant = await prisma.merchant.findFirst({
      where: { ownerUserId: userId }
    });
    if (!merchant) return fail(reply, "NO_MERCHANT", "尚未关联店铺", 404);

    const updated = await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        ...(parsed.data.summary !== undefined && { summary: parsed.data.summary }),
        ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
        ...(parsed.data.businessHours !== undefined && { businessHours: parsed.data.businessHours }),
        ...(parsed.data.coverImageUrl !== undefined && { coverImageUrl: parsed.data.coverImageUrl }),
        ...(parsed.data.tags !== undefined && { tags: parsed.data.tags }),
        status: "PENDING"
      }
    });

    return ok(reply, {
      id: updated.id,
      name: updated.name,
      summary: updated.summary,
      phone: updated.phone,
      businessHours: updated.businessHours,
      coverImageUrl: updated.coverImageUrl,
      tags: updated.tags,
      status: updated.status
    }, "已提交，等待管理员复审");
  });

  app.get("/api/merchant/stats", async (request, reply) => {
    const merchantId = await getMerchantId(request);
    if (!merchantId) return fail(reply, "NO_MERCHANT", "尚未关联店铺", 404);

    const { from, to } = parseDateQuery(request.query);

    const [viewHistories, favorites, activities] = await Promise.all([
      prisma.viewHistory.findMany({
        where: { merchantId, createdAt: { gte: from, lte: to } },
        select: { createdAt: true }
      }),
      prisma.favorite.count({ where: { merchantId } }),
      prisma.userActivity.count({
        where: {
          merchantId,
          createdAt: { gte: from, lte: to },
          action: { in: ["click", "call", "view_qr", "navigate"] }
        }
      })
    ]);

    const viewsByDate: Record<string, number> = {};
    for (const v of viewHistories) {
      const d = v.createdAt.toISOString().slice(0, 10);
      viewsByDate[d] = (viewsByDate[d] || 0) + 1;
    }

    const series: Array<{ date: string; views: number; favorites: number; clicks: number }> = [];
    let current = new Date(from);
    while (current <= to) {
      const d = current.toISOString().slice(0, 10);
      series.push({ date: d, views: viewsByDate[d] || 0, favorites: 0, clicks: 0 });
      current.setDate(current.getDate() + 1);
    }

    return ok(reply, {
      series,
      summary: {
        views: viewHistories.length,
        favorites,
        clicks: activities
      }
    });
  });

  app.get("/api/merchant/funnel", async (request, reply) => {
    const merchantId = await getMerchantId(request);
    if (!merchantId) return fail(reply, "NO_MERCHANT", "尚未关联店铺", 404);

    const { from, to } = parseDateQuery(request.query);

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
    const channelId = merchant?.defaultChannelId || merchant?.id;

    const [views, clicks, actions] = await Promise.all([
      prisma.viewHistory.count({
        where: { merchantId, createdAt: { gte: from, lte: to } }
      }),
      prisma.userActivity.count({
        where: {
          merchantId,
          channelId,
          action: { in: ["click", "merchant_click"] },
          createdAt: { gte: from, lte: to }
        }
      }),
      prisma.userActivity.count({
        where: {
          merchantId,
          channelId,
          action: { in: ["call", "navigate", "view_qr"] },
          createdAt: { gte: from, lte: to }
        }
      })
    ]);

    const clickRate = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0";
    const actionRate = clicks > 0 ? ((actions / clicks) * 100).toFixed(1) : "0";

    return ok(reply, {
      steps: [
        { label: "曝光", count: views },
        { label: "点击", count: clicks, rate: `${clickRate}%` },
        { label: "到店动作", count: actions, rate: `${actionRate}%` }
      ]
    });
  });
}
