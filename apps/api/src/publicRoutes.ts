import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";
import { claimCoupon } from "./services/couponService.js";
import { compareMerchants } from "./services/rankingService.js";

const listQuery = z.object({
  categoryId: z.string().optional(),
  keyword: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20)
});

const logSchema = z.object({
  merchantId: z.string().min(1),
  sessionId: z.string().optional(),
  source: z.string().optional(),
  channel: z.string().optional(),
  scene: z.string().optional(),
  campaign: z.string().optional(),
  target: z.string().optional()
});

const claimSchema = z.object({
  studentName: z.string().min(1).default("西大学生"),
  phone: z.string().min(5),
  openid: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.string().optional(),
  channel: z.string().optional(),
  scene: z.string().optional(),
  campaign: z.string().optional()
});

export async function publicRoutes(app: FastifyInstance) {
  app.get("/api/public/categories", async (_request, reply) => {
    const items = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
    return ok(reply, items);
  });

  app.get("/api/public/merchants", async (request, reply) => {
    const query = listQuery.parse(request.query);
    const where = {
      status: "APPROVED" as const,
      categoryId: query.categoryId,
      OR: query.keyword
        ? [
            { name: { contains: query.keyword, mode: "insensitive" as const } },
            { summary: { contains: query.keyword, mode: "insensitive" as const } },
            { address: { contains: query.keyword, mode: "insensitive" as const } }
          ]
        : undefined
    };
    const [allItems, total] = await prisma.$transaction([
      prisma.merchant.findMany({
        where,
        include: {
          category: true,
          coupons: {
            where: { status: "ACTIVE", validTo: { gte: new Date() } },
            orderBy: { createdAt: "desc" }
          },
          promotions: true
        },
        orderBy: [{ createdAt: "desc" }]
      }),
      prisma.merchant.count({ where })
    ]);
    const items = allItems.sort((a, b) => compareMerchants(a, b)).slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
    return ok(reply, { items, total, page: query.page, pageSize: query.pageSize });
  });

  app.get("/api/public/merchants/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const merchant = await prisma.merchant.findFirst({
      where: { id, status: "APPROVED" },
      include: {
        category: true,
        coupons: { orderBy: [{ status: "asc" }, { createdAt: "desc" }] }
      }
    });
    if (!merchant) return fail(reply, "NOT_FOUND", "商家不存在", 404);
    return ok(reply, merchant);
  });

  app.post("/api/public/exposures", async (request, reply) => {
    const parsed = logSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "曝光参数错误");
    const log = await prisma.exposureLog.create({
      data: {
        merchantId: parsed.data.merchantId,
        sessionId: parsed.data.sessionId,
        source: parsed.data.source,
        channel: parsed.data.channel,
        scene: parsed.data.scene,
        campaign: parsed.data.campaign,
        ip: request.ip,
        userAgent: request.headers["user-agent"]
      }
    });
    return ok(reply, log);
  });

  app.post("/api/public/clicks", async (request, reply) => {
    const parsed = logSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "点击参数错误");
    const log = await prisma.clickLog.create({
      data: {
        merchantId: parsed.data.merchantId,
        sessionId: parsed.data.sessionId,
        target: parsed.data.target,
        source: parsed.data.source,
        channel: parsed.data.channel,
        scene: parsed.data.scene,
        campaign: parsed.data.campaign,
        ip: request.ip,
        userAgent: request.headers["user-agent"]
      }
    });
    return ok(reply, log);
  });

  app.post("/api/public/coupons/:id/claim", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = claimSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "请填写昵称和手机号");

    try {
      const result = await claimCoupon(id, parsed.data);
      return ok(reply, result, "领取成功");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "COUPON_NOT_FOUND") return fail(reply, "NOT_FOUND", "优惠券不存在", 404);
      if (message === "DUPLICATE_CLAIM") return fail(reply, "DUPLICATE_CLAIM", "你已领取过该优惠券");
      if (message === "COUPON_INACTIVE") return fail(reply, "COUPON_INACTIVE", "优惠券暂不可领取");
      if (message === "COUPON_NOT_STARTED") return fail(reply, "COUPON_NOT_STARTED", "优惠券尚未开始");
      if (message === "COUPON_EXPIRED") return fail(reply, "COUPON_EXPIRED", "优惠券已过期");
      if (message === "COUPON_SOLD_OUT") return fail(reply, "COUPON_SOLD_OUT", "优惠券已领完");
      throw error;
    }
  });
}
