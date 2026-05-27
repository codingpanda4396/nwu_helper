import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";
import { getActivityPerformance, getBySource, getChannelPerformance, getCouponPerformance, getSummary, getTrends, parseAnalyticsScope } from "./services/analyticsService.js";
import { buildAnalyticsCsv } from "./services/exportService.js";
import { previewRedemptionCode, redeemCouponCode } from "./services/redemptionService.js";

const pagination = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().int().default(100),
  isActive: z.boolean().default(true)
});

const merchantSchema = z.object({
  name: z.string().min(1),
  summary: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  foodCategory: z.string().nullable().optional(),
  serviceCategoryId: z.string().nullable().optional(),
  avgPrice: z.coerce.number().nullable().optional(),
  distanceText: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  menu: z.array(z.object({ name: z.string().min(1), price: z.coerce.number() })).optional(),
  qrImageUrl: z.string().nullable().optional(),
  recommendation: z.string().nullable().optional(),
  randomWeight: z.coerce.number().int().min(0).default(0),
  isFoodRecommendation: z.boolean().default(false),
  isServicePublished: z.boolean().default(false),
  ownerUserId: z.string().nullable().optional(),
  address: z.string().min(1),
  phone: z.string().optional(),
  businessHours: z.string().optional(),
  coverImageUrl: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]).default("APPROVED"),
  rating: z.coerce.number().min(0).max(5).default(4.8),
  sortOrder: z.coerce.number().int().default(100),
  platformBoost: z.coerce.number().int().default(0)
});

const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  imageUrl: z.string().min(1),
  targetType: z.enum(["ACTIVITY", "SERVICE", "ABOUT", "TAB", "URL"]).default("TAB"),
  targetId: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().default(100),
  isActive: z.boolean().default(true)
});

const serviceCategorySchema = z.object({
  name: z.string().min(1),
  key: z.string().min(1).regex(/^[a-z0-9-]+$/),
  icon: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().default(100),
  isActive: z.boolean().default(true)
});

const communityPostSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  likeCount: z.coerce.number().int().nonnegative().default(0),
  commentCount: z.coerce.number().int().nonnegative().default(0),
  status: z.enum(["VISIBLE", "HIDDEN"]).default("VISIBLE"),
  sortOrder: z.coerce.number().int().default(100),
  publishedAt: z.coerce.date().optional()
});

const couponSchema = z.object({
  merchantId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  threshold: z.coerce.number().nullable().optional(),
  discountValue: z.coerce.number().nullable().optional(),
  totalStock: z.coerce.number().int().positive(),
  remainingStock: z.coerce.number().int().nonnegative().optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date(),
  status: z.enum(["ACTIVE", "PAUSED", "EXPIRED"]).default("ACTIVE")
});

const merchantProfileSchema = z.object({
  name: z.string().min(1).optional(),
  summary: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  address: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  businessHours: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional()
});

const merchantCouponSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  threshold: z.coerce.number().nullable().optional(),
  discountValue: z.coerce.number().nullable().optional(),
  totalStock: z.coerce.number().int().positive(),
  remainingStock: z.coerce.number().int().nonnegative().optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date(),
  status: z.enum(["ACTIVE", "PAUSED", "EXPIRED"]).default("ACTIVE")
});

const merchantUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1).optional(),
  phone: z.string().min(5),
  passwordHash: z.string().optional()
});

const redeemSchema = z.object({
  code: z.string().min(1),
  amount: z.coerce.number().positive().optional()
});

const promotionSchema = z.object({
  merchantId: z.string().min(1),
  couponId: z.string().nullable().optional(),
  name: z.string().min(1),
  source: z.enum(["MANUAL", "CAMPAIGN", "BIDDING_RESERVED"]).default("CAMPAIGN"),
  pricingMode: z.enum(["MANUAL", "CPC", "CPA"]).default("MANUAL"),
  boostWeight: z.coerce.number().int().default(0),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  budget: z.coerce.number().nullable().optional(),
  cpc: z.coerce.number().nullable().optional(),
  cpa: z.coerce.number().nullable().optional(),
  isActive: z.boolean().default(true)
});

const activitySchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  type: z.enum(["DAILY_DEAL", "FEMALE_SELECTED", "GROUP_DEAL", "NIGHT_FOOD", "GENERAL"]).default("GENERAL"),
  merchantId: z.string().min(1),
  couponId: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  manualWeight: z.coerce.number().int().default(0),
  sortOrder: z.coerce.number().int().default(100),
  budget: z.coerce.number().nullable().optional(),
  pricingMode: z.enum(["FREE", "CPC", "CPA", "FIXED"]).default("FREE"),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED"]).default("DRAFT")
});

function authUser(request: { user?: unknown }) {
  return request.user as { sub: string; role: "STUDENT" | "MERCHANT" | "ADMIN"; name: string };
}

async function merchantIdForUser(userId: string) {
  const merchant = await prisma.merchant.findUnique({ where: { ownerUserId: userId } });
  return merchant?.id;
}

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const auth = authUser(request);
    if (request.url.startsWith("/api/admin") && auth.role !== "ADMIN") {
      return fail(reply, "FORBIDDEN", "需要管理员权限", 403);
    }
    if (request.url.startsWith("/api/merchant") && auth.role !== "MERCHANT") {
      return fail(reply, "FORBIDDEN", "需要商家权限", 403);
    }
  });

  app.get("/api/users/me", async (request, reply) => {
    const auth = authUser(request);
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      include: { merchantProfile: true }
    });
    if (!user) return fail(reply, "NOT_FOUND", "用户不存在", 404);
    return ok(reply, { id: user.id, name: user.name, username: user.username, phone: user.phone, role: user.role, merchantId: user.merchantProfile?.id });
  });

  app.get("/api/merchant/overview", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);

    const [merchant, coupons, claims, used, exposureCount, clickCount, redemptionAmount] = await prisma.$transaction([
      prisma.merchant.findUnique({ where: { id: merchantId }, include: { category: true } }),
      prisma.coupon.findMany({ where: { merchantId }, orderBy: { createdAt: "desc" } }),
      prisma.userCoupon.count({ where: { merchantId } }),
      prisma.userCoupon.count({ where: { merchantId, status: "USED" } }),
      prisma.exposureLog.count({ where: { merchantId } }),
      prisma.clickLog.count({ where: { merchantId } }),
      prisma.couponRedemption.aggregate({ where: { merchantId }, _sum: { amount: true } })
    ]);
    return ok(reply, { merchant, coupons, stats: { claims, used, exposureCount, clickCount, redemptionAmount: redemptionAmount._sum.amount ?? 0 } });
  });

  app.get("/api/merchant/coupons", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    return ok(reply, await prisma.coupon.findMany({ where: { merchantId }, orderBy: { createdAt: "desc" } }));
  });

  app.get("/api/merchant/activities", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    return ok(reply, await prisma.activity.findMany({
      where: { merchantId },
      include: { coupon: true },
      orderBy: [{ status: "asc" }, { manualWeight: "desc" }, { sortOrder: "asc" }]
    }));
  });

  app.patch("/api/merchant/profile", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    const parsed = merchantProfileSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "店铺资料参数错误");
    return ok(reply, await prisma.merchant.update({ where: { id: merchantId }, data: parsed.data, include: { category: true } }));
  });

  app.post("/api/merchant/coupons", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    const parsed = merchantCouponSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "优惠券参数错误");
    const totalStock = parsed.data.totalStock;
    return ok(reply, await prisma.coupon.create({ data: { ...parsed.data, merchantId, remainingStock: parsed.data.remainingStock ?? totalStock } }));
  });

  app.patch("/api/merchant/coupons/:id", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const existing = await prisma.coupon.findFirst({ where: { id, merchantId } });
    if (!existing) return fail(reply, "NOT_FOUND", "优惠券不存在", 404);
    const parsed = merchantCouponSchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "优惠券参数错误");
    return ok(reply, await prisma.coupon.update({ where: { id }, data: parsed.data }));
  });

  app.get("/api/merchant/claims", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    const items = await prisma.userCoupon.findMany({
      where: { merchantId },
      include: { coupon: true, user: true, redemption: true },
      orderBy: { claimedAt: "desc" }
    });
    return ok(reply, items);
  });

  app.get("/api/merchant/redemptions", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    const items = await prisma.couponRedemption.findMany({
      where: { merchantId },
      include: { coupon: true, student: true, userCoupon: true },
      orderBy: { redeemedAt: "desc" }
    });
    return ok(reply, items);
  });

  app.post("/api/merchant/redeem", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    const parsed = redeemSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "核销参数错误");

    try {
      const redemption = await redeemCouponCode(merchantId, parsed.data.code, parsed.data.amount);
      return ok(reply, redemption, "核销成功");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "CODE_NOT_FOUND") return fail(reply, "NOT_FOUND", "核销码不存在", 404);
      if (message === "ALREADY_USED") return fail(reply, "ALREADY_USED", "该券已核销");
      if (message === "COUPON_EXPIRED") return fail(reply, "COUPON_EXPIRED", "该券已过期");
      throw error;
    }
  });

  app.get("/api/merchant/redeem/preview", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    const { code } = z.object({ code: z.string().min(1) }).parse(request.query);
    try {
      return ok(reply, await previewRedemptionCode(merchantId, code));
    } catch (error) {
      if (error instanceof Error && error.message === "CODE_NOT_FOUND") return fail(reply, "NOT_FOUND", "核销码不存在", 404);
      throw error;
    }
  });

  app.get("/api/merchant/analytics/summary", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    return ok(reply, await getSummary(parseAnalyticsScope(request.query, merchantId)));
  });

  app.get("/api/merchant/analytics/by-source", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    return ok(reply, await getBySource(parseAnalyticsScope(request.query, merchantId)));
  });

  app.get("/api/merchant/coupon-performance", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    return ok(reply, await getCouponPerformance(parseAnalyticsScope(request.query, merchantId)));
  });

  app.get("/api/merchant/channel-performance", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    return ok(reply, await getChannelPerformance(parseAnalyticsScope(request.query, merchantId)));
  });

  app.get("/api/merchant/reports/overview", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    return ok(reply, await getSummary(parseAnalyticsScope(request.query, merchantId)));
  });

  app.get("/api/merchant/reports/activities", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    return ok(reply, await getActivityPerformance(parseAnalyticsScope(request.query, merchantId)));
  });

  app.get("/api/merchant/reports/channels", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    return ok(reply, await getBySource(parseAnalyticsScope(request.query, merchantId)));
  });

  app.get("/api/merchant/trends", async (request, reply) => {
    const auth = authUser(request);
    const merchantId = await merchantIdForUser(auth.sub);
    if (!merchantId) return fail(reply, "FORBIDDEN", "当前账号未绑定商家", 403);
    return ok(reply, await getTrends(parseAnalyticsScope(request.query, merchantId)));
  });

  app.get("/api/admin/categories", async (_request, reply) => {
    return ok(reply, await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }));
  });

  app.post("/api/admin/categories", async (request, reply) => {
    const parsed = categorySchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "类目参数错误");
    return ok(reply, await prisma.category.create({ data: parsed.data }));
  });

  app.patch("/api/admin/categories/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = categorySchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "类目参数错误");
    return ok(reply, await prisma.category.update({ where: { id }, data: parsed.data }));
  });

  app.get("/api/admin/merchants", async (request, reply) => {
    const query = pagination.extend({ status: z.string().optional(), categoryId: z.string().optional() }).parse(request.query);
    const where = { status: query.status as never, categoryId: query.categoryId };
    const [items, total] = await prisma.$transaction([
      prisma.merchant.findMany({
        where,
        include: { category: true, serviceCategory: true, ownerUser: true, coupons: true },
        orderBy: [{ platformBoost: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.merchant.count({ where })
    ]);
    return ok(reply, { items, total, page: query.page, pageSize: query.pageSize });
  });

  app.post("/api/admin/merchant-users", async (request, reply) => {
    const parsed = merchantUserSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "商家账号参数错误");
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(parsed.data.passwordHash ?? "merchant123456", 10);
    const user = await prisma.user.upsert({
      where: { phone: parsed.data.phone },
      update: { name: parsed.data.name, username: parsed.data.username, role: "MERCHANT", passwordHash },
      create: { name: parsed.data.name, username: parsed.data.username, phone: parsed.data.phone, role: "MERCHANT", passwordHash }
    });
    return ok(reply, user);
  });

  app.post("/api/admin/merchants", async (request, reply) => {
    const parsed = merchantSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "商家参数错误");
    return ok(reply, await prisma.merchant.create({ data: parsed.data }));
  });

  app.patch("/api/admin/merchants/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = merchantSchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "商家参数错误");
    return ok(reply, await prisma.merchant.update({ where: { id }, data: parsed.data }));
  });

  app.patch("/api/admin/merchants/:id/status", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { status } = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]) }).parse(request.body);
    return ok(reply, await prisma.merchant.update({ where: { id }, data: { status } }));
  });

  app.get("/api/admin/coupons", async (_request, reply) => {
    return ok(reply, await prisma.coupon.findMany({ include: { merchant: true }, orderBy: { createdAt: "desc" } }));
  });

  app.get("/api/admin/activities", async (_request, reply) => {
    return ok(reply, await prisma.activity.findMany({
      include: { merchant: true, coupon: true },
      orderBy: [{ status: "asc" }, { manualWeight: "desc" }, { sortOrder: "asc" }, { startAt: "desc" }]
    }));
  });

  app.post("/api/admin/activities", async (request, reply) => {
    const parsed = activitySchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "活动参数错误");
    if (parsed.data.couponId) {
      const coupon = await prisma.coupon.findFirst({ where: { id: parsed.data.couponId, merchantId: parsed.data.merchantId } });
      if (!coupon) return fail(reply, "VALIDATION_ERROR", "优惠券不属于所选商家");
    }
    return ok(reply, await prisma.activity.create({ data: { ...parsed.data, couponId: parsed.data.couponId || null } }));
  });

  app.patch("/api/admin/activities/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = activitySchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "活动参数错误");
    const current = await prisma.activity.findUnique({ where: { id } });
    if (!current) return fail(reply, "NOT_FOUND", "活动不存在", 404);
    const merchantId = parsed.data.merchantId ?? current.merchantId;
    if (parsed.data.couponId) {
      const coupon = await prisma.coupon.findFirst({ where: { id: parsed.data.couponId, merchantId } });
      if (!coupon) return fail(reply, "VALIDATION_ERROR", "优惠券不属于所选商家");
    }
    const data = { ...parsed.data };
    if ("couponId" in data) data.couponId = data.couponId || null;
    return ok(reply, await prisma.activity.update({ where: { id }, data }));
  });

  app.patch("/api/admin/activities/:id/status", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { status } = z.object({ status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED"]) }).parse(request.body);
    return ok(reply, await prisma.activity.update({ where: { id }, data: { status } }));
  });

  app.post("/api/admin/coupons", async (request, reply) => {
    const parsed = couponSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "优惠券参数错误");
    const totalStock = parsed.data.totalStock;
    return ok(reply, await prisma.coupon.create({ data: { ...parsed.data, remainingStock: parsed.data.remainingStock ?? totalStock } }));
  });

  app.patch("/api/admin/coupons/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = couponSchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "优惠券参数错误");
    return ok(reply, await prisma.coupon.update({ where: { id }, data: parsed.data }));
  });

  app.get("/api/admin/dashboard/overview", async (_request, reply) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [merchantCount, approvedMerchantCount, couponCount, activityCount, bannerCount, communityPostCount, claimCount, redemptionCount, todayExposures, todayClicks, redemptionAmount] = await prisma.$transaction([
      prisma.merchant.count(),
      prisma.merchant.count({ where: { status: "APPROVED" } }),
      prisma.coupon.count(),
      prisma.activity.count(),
      prisma.banner.count(),
      prisma.communityPost.count(),
      prisma.userCoupon.count(),
      prisma.couponRedemption.count(),
      prisma.exposureLog.count({ where: { createdAt: { gte: today } } }),
      prisma.clickLog.count({ where: { createdAt: { gte: today } } }),
      prisma.couponRedemption.aggregate({ _sum: { amount: true } })
    ]);
    return ok(reply, { merchantCount, approvedMerchantCount, couponCount, activityCount, bannerCount, communityPostCount, claimCount, redemptionCount, todayExposures, todayClicks, redemptionAmount: redemptionAmount._sum.amount ?? 0 });
  });

  app.get("/api/admin/banners", async (_request, reply) => {
    return ok(reply, await prisma.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }));
  });

  app.post("/api/admin/banners", async (request, reply) => {
    const parsed = bannerSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "轮播图参数错误");
    return ok(reply, await prisma.banner.create({ data: parsed.data }));
  });

  app.patch("/api/admin/banners/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = bannerSchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "轮播图参数错误");
    return ok(reply, await prisma.banner.update({ where: { id }, data: parsed.data }));
  });

  app.patch("/api/admin/banners/:id/status", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { isActive } = z.object({ isActive: z.boolean() }).parse(request.body);
    return ok(reply, await prisma.banner.update({ where: { id }, data: { isActive } }));
  });

  app.get("/api/admin/service-categories", async (_request, reply) => {
    return ok(reply, await prisma.serviceCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }));
  });

  app.post("/api/admin/service-categories", async (request, reply) => {
    const parsed = serviceCategorySchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "服务分类参数错误");
    return ok(reply, await prisma.serviceCategory.create({ data: parsed.data }));
  });

  app.patch("/api/admin/service-categories/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = serviceCategorySchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "服务分类参数错误");
    return ok(reply, await prisma.serviceCategory.update({ where: { id }, data: parsed.data }));
  });

  app.get("/api/admin/community-posts", async (_request, reply) => {
    return ok(reply, await prisma.communityPost.findMany({ orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { publishedAt: "desc" }] }));
  });

  app.post("/api/admin/community-posts", async (request, reply) => {
    const parsed = communityPostSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "帖子参数错误");
    return ok(reply, await prisma.communityPost.create({ data: parsed.data }));
  });

  app.patch("/api/admin/community-posts/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = communityPostSchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "帖子参数错误");
    return ok(reply, await prisma.communityPost.update({ where: { id }, data: parsed.data }));
  });

  app.patch("/api/admin/community-posts/:id/status", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { status } = z.object({ status: z.enum(["VISIBLE", "HIDDEN"]) }).parse(request.body);
    return ok(reply, await prisma.communityPost.update({ where: { id }, data: { status } }));
  });

  app.get("/api/admin/analytics/summary", async (request, reply) => {
    return ok(reply, await getSummary(parseAnalyticsScope(request.query)));
  });

  app.get("/api/admin/analytics/by-source", async (request, reply) => {
    return ok(reply, await getBySource(parseAnalyticsScope(request.query)));
  });

  app.get("/api/admin/reports/overview", async (request, reply) => {
    return ok(reply, await getSummary(parseAnalyticsScope(request.query)));
  });

  app.get("/api/admin/reports/channels", async (request, reply) => {
    return ok(reply, await getBySource(parseAnalyticsScope(request.query)));
  });

  app.get("/api/admin/reports/activities", async (request, reply) => {
    return ok(reply, await getActivityPerformance(parseAnalyticsScope(request.query)));
  });

  app.get("/api/admin/reports/merchants", async (_request, reply) => {
    const merchants = await prisma.merchant.findMany({
      include: { category: true, userCoupons: true, redemptions: true, exposureLogs: true, clickLogs: true },
      orderBy: [{ platformBoost: "desc" }, { sortOrder: "asc" }]
    });
    return ok(reply, merchants.map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      category: merchant.category.name,
      status: merchant.status,
      exposures: merchant.exposureLogs.length,
      clicks: merchant.clickLogs.length,
      claims: merchant.userCoupons.length,
      redemptions: merchant.redemptions.length,
      redemptionRate: merchant.userCoupons.length ? Number((merchant.redemptions.length / merchant.userCoupons.length).toFixed(4)) : 0,
      redemptionAmount: merchant.redemptions.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
    })));
  });

  app.get("/api/admin/analytics/export.csv", async (request, reply) => {
    const csv = await buildAnalyticsCsv(parseAnalyticsScope(request.query));
    reply.header("Content-Type", "text/csv; charset=utf-8");
    reply.header("Content-Disposition", 'attachment; filename="analytics-export.csv"');
    return reply.send(csv);
  });

  app.get("/api/admin/promotions", async (_request, reply) => {
    return ok(reply, await prisma.merchantPromotion.findMany({
      include: { merchant: true, coupon: true },
      orderBy: [{ isActive: "desc" }, { startAt: "desc" }]
    }));
  });

  app.post("/api/admin/promotions", async (request, reply) => {
    const parsed = promotionSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "推广活动参数错误");
    return ok(reply, await prisma.merchantPromotion.create({ data: { ...parsed.data, couponId: parsed.data.couponId || null } }));
  });

  app.patch("/api/admin/promotions/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = promotionSchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "推广活动参数错误");
    const data = { ...parsed.data };
    if ("couponId" in data) data.couponId = data.couponId || null;
    return ok(reply, await prisma.merchantPromotion.update({ where: { id }, data }));
  });

  app.patch("/api/admin/promotions/:id/status", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { isActive } = z.object({ isActive: z.boolean() }).parse(request.body);
    return ok(reply, await prisma.merchantPromotion.update({ where: { id }, data: { isActive } }));
  });

  app.get("/api/admin/dashboard/merchants", async (_request, reply) => {
    const merchants = await prisma.merchant.findMany({
      include: { category: true, userCoupons: true, redemptions: true, exposureLogs: true, clickLogs: true },
      orderBy: [{ platformBoost: "desc" }, { sortOrder: "asc" }]
    });
    return ok(reply, merchants.map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      category: merchant.category.name,
      status: merchant.status,
      exposures: merchant.exposureLogs.length,
      clicks: merchant.clickLogs.length,
      claims: merchant.userCoupons.length,
      redemptions: merchant.redemptions.length,
      redemptionAmount: merchant.redemptions.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
    })));
  });
}
