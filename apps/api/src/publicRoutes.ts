import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";
import { claimCoupon } from "./services/couponService.js";
import { compareMerchants } from "./services/rankingService.js";
import { getHomeActivities, getPublicActivity, listPublicActivities } from "./services/activityService.js";
import { createShareLink, openShareLink } from "./services/shareService.js";

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
  activityId: z.string().optional(),
  shareLinkId: z.string().optional(),
  referrerId: z.string().optional(),
  target: z.string().optional()
});

const activityLogSchema = logSchema.omit({ merchantId: true }).extend({
  merchantId: z.string().optional()
});

const claimSchema = z.object({
  studentName: z.string().min(1).default("西大学生"),
  phone: z.string().min(5),
  openid: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.string().optional(),
  channel: z.string().optional(),
  scene: z.string().optional(),
  campaign: z.string().optional(),
  activityId: z.string().optional(),
  shareLinkId: z.string().optional(),
  referrerId: z.string().optional()
});

const activityListQuery = z.object({
  type: z.enum(["DAILY_DEAL", "FEMALE_SELECTED", "GROUP_DEAL", "NIGHT_FOOD", "GENERAL"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20)
});

const serviceQuery = z.object({
  serviceKey: z.string().optional()
});

const communityQuery = z.object({
  type: z.string().optional()
});

const communityPostCreateSchema = z.object({
  type: z.string().trim().min(1).max(24),
  title: z.string().trim().min(2).max(80),
  content: z.string().trim().min(5).max(2000),
  authorNickname: z.string().trim().min(1).max(24),
  contact: z.string().trim().min(5).max(80),
  source: z.string().trim().max(24).optional()
});

const communityLikeSchema = z.object({
  sessionId: z.string().trim().min(3).max(120).optional()
});

const shareSchema = z.object({
  source: z.string().optional(),
  channel: z.string().optional(),
  scene: z.string().optional(),
  campaign: z.string().optional(),
  referrerId: z.string().optional(),
  sessionId: z.string().optional()
});

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function merchantCard(merchant: any) {
  const coupons = merchant.coupons ?? [];
  const activeCoupon = coupons[0];
  return {
    id: merchant.id,
    category: merchant.category?.slug === "food" ? "food" : "service",
    foodCategory: merchant.foodCategory,
    serviceId: merchant.serviceCategory?.key,
    name: merchant.name,
    image: merchant.coverImageUrl,
    rating: Number(merchant.rating),
    avgPrice: merchant.avgPrice == null ? null : Number(merchant.avgPrice),
    distance: merchant.distanceText ?? "",
    distanceText: merchant.distanceText ?? "",
    address: merchant.address,
    businessHours: merchant.businessHours,
    tags: asStringArray(merchant.tags),
    discount: activeCoupon?.title ?? "",
    recommendation: merchant.recommendation ?? merchant.summary ?? "",
    highlights: asStringArray(merchant.highlights),
    menu: Array.isArray(merchant.menu) ? merchant.menu : [],
    couponIds: coupons.map((coupon: { id: string }) => coupon.id),
    qrImage: merchant.qrImageUrl,
    qrImageUrl: merchant.qrImageUrl,
    coupons
  };
}

function activityCard(activity: any) {
  return {
    id: activity.id,
    merchantId: activity.merchantId,
    title: activity.title,
    tags: [activity.subtitle, activity.type].filter(Boolean),
    discount: activity.coupon?.title ?? activity.subtitle ?? "",
    image: activity.coverImage ?? activity.merchant?.coverImageUrl,
    cta: "去看看"
  };
}

function communityPostCard(item: any) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    summary: item.summary,
    content: item.content || item.summary,
    authorNickname: item.authorNickname || "匿名同学",
    likeCount: item.likeCount,
    commentCount: item.commentCount,
    viewCount: item.viewCount,
    time: item.publishedAt.toISOString().slice(0, 10)
  };
}

export async function publicRoutes(app: FastifyInstance) {
  app.get("/api/public/banners", async (_request, reply) => {
    const items = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
    return ok(reply, items.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      image: item.imageUrl,
      imageUrl: item.imageUrl,
      targetType: item.targetType.toLowerCase(),
      targetId: item.targetId,
      url: item.url
    })));
  });

  app.get("/api/public/home", async (_request, reply) => {
    const [banners, activities, featuredFoods, featuredPosts] = await Promise.all([
      prisma.banner.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
      getHomeActivities(),
      prisma.merchant.findMany({
        where: { status: "APPROVED", foodCategory: { not: null } },
        include: {
          category: true,
          serviceCategory: true,
          coupons: { where: { status: "ACTIVE", validTo: { gte: new Date() } }, orderBy: { createdAt: "desc" } }
        },
        orderBy: [{ platformBoost: "desc" }, { sortOrder: "asc" }, { randomWeight: "desc" }],
        take: 4
      }),
      prisma.communityPost.findMany({
        where: { status: "VISIBLE" },
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
        take: 4
      })
    ]);
    return ok(reply, {
      banners: banners.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        image: item.imageUrl,
        imageUrl: item.imageUrl,
        targetType: item.targetType.toLowerCase(),
        targetId: item.targetId,
        url: item.url
      })),
      activities: [...activities.dailyDeals, ...activities.femaleSelected, ...activities.groupDeals, ...activities.general].map(activityCard),
      featuredFoods: featuredFoods.map(merchantCard),
      featuredPosts: featuredPosts.map(communityPostCard)
    });
  });

  app.get("/api/public/categories", async (_request, reply) => {
    const items = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
    return ok(reply, items);
  });

  app.get("/api/public/activities", async (request, reply) => {
    const query = activityListQuery.parse(request.query);
    return ok(reply, await listPublicActivities(query));
  });

  app.get("/api/public/activities/home", async (_request, reply) => {
    return ok(reply, await getHomeActivities());
  });

  app.get("/api/public/activities/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const activity = await getPublicActivity(id);
    if (!activity) return fail(reply, "NOT_FOUND", "活动不存在或已结束", 404);
    return ok(reply, activity);
  });

  app.post("/api/public/activities/:id/exposures", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = activityLogSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "活动曝光参数错误");
    const activity = await prisma.activity.findFirst({ where: { id, status: "ACTIVE" } });
    if (!activity) return fail(reply, "NOT_FOUND", "活动不存在", 404);
    const log = await prisma.exposureLog.create({
      data: {
        merchantId: activity.merchantId,
        sessionId: parsed.data.sessionId,
        source: parsed.data.source,
        channel: parsed.data.channel,
        scene: parsed.data.scene,
        campaign: parsed.data.campaign,
        activityId: activity.id,
        shareLinkId: parsed.data.shareLinkId,
        referrerId: parsed.data.referrerId,
        ip: request.ip,
        userAgent: request.headers["user-agent"]
      }
    });
    return ok(reply, log);
  });

  app.post("/api/public/activities/:id/clicks", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = activityLogSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "活动点击参数错误");
    const activity = await prisma.activity.findFirst({ where: { id, status: "ACTIVE" } });
    if (!activity) return fail(reply, "NOT_FOUND", "活动不存在", 404);
    const log = await prisma.clickLog.create({
      data: {
        merchantId: activity.merchantId,
        sessionId: parsed.data.sessionId,
        target: parsed.data.target ?? "activity-detail",
        source: parsed.data.source,
        channel: parsed.data.channel,
        scene: parsed.data.scene,
        campaign: parsed.data.campaign,
        activityId: activity.id,
        shareLinkId: parsed.data.shareLinkId,
        referrerId: parsed.data.referrerId,
        ip: request.ip,
        userAgent: request.headers["user-agent"]
      }
    });
    return ok(reply, log);
  });

  app.post("/api/public/activities/:id/share-links", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = shareSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "分享参数错误");
    const activity = await prisma.activity.findFirst({ where: { id, status: "ACTIVE" } });
    if (!activity) return fail(reply, "NOT_FOUND", "活动不存在", 404);
    const shareLink = await createShareLink({
      ...parsed.data,
      activityId: activity.id,
      merchantId: activity.merchantId,
      couponId: activity.couponId,
      targetType: "ACTIVITY",
      targetId: activity.id
    });
    return ok(reply, { ...shareLink, url: `/share/${shareLink.token}` });
  });

  app.post("/api/public/share/:token/open", async (request, reply) => {
    const { token } = z.object({ token: z.string().min(1) }).parse(request.params);
    const parsed = shareSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "分享打开参数错误");
    try {
      const shareLink = await openShareLink(token, { ...parsed.data, ip: request.ip, userAgent: request.headers["user-agent"] });
      const targetPath = shareLink.targetType === "ACTIVITY" ? `/activities/${shareLink.targetId}` : shareLink.targetType === "MERCHANT" ? `/merchants/${shareLink.targetId}` : `/coupons/${shareLink.targetId}`;
      return ok(reply, { shareLink, targetPath });
    } catch (error) {
      if (error instanceof Error && error.message === "SHARE_LINK_NOT_FOUND") return fail(reply, "NOT_FOUND", "分享链接不存在", 404);
      throw error;
    }
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
        serviceCategory: true,
        coupons: { orderBy: [{ status: "asc" }, { createdAt: "desc" }] }
      }
    });
    if (!merchant) return fail(reply, "NOT_FOUND", "商家不存在", 404);
    return ok(reply, merchantCard(merchant));
  });

  app.get("/api/public/food/categories", async (_request, reply) => {
    const rows = await prisma.merchant.findMany({
      where: { status: "APPROVED", foodCategory: { not: null } },
      distinct: ["foodCategory"],
      select: { foodCategory: true },
      orderBy: { foodCategory: "asc" }
    });
    const names: Record<string, string> = {
      bbq: "烧烤",
      hotpot: "火锅",
      "milk-tea": "奶茶",
      snack: "小吃",
      night: "夜宵",
      "fast-food": "快餐"
    };
    return ok(reply, [{ id: "all", name: "全部" }, ...rows.filter((row) => row.foodCategory).map((row) => ({ id: row.foodCategory!, name: names[row.foodCategory!] ?? row.foodCategory! }))]);
  });

  app.get("/api/public/food/merchants", async (request, reply) => {
    const { categoryId } = z.object({ categoryId: z.string().optional() }).parse(request.query);
    const items = await prisma.merchant.findMany({
      where: {
        status: "APPROVED",
        foodCategory: categoryId && categoryId !== "all" ? categoryId : { not: null }
      },
      include: {
        category: true,
        serviceCategory: true,
        coupons: { where: { status: "ACTIVE", validTo: { gte: new Date() } }, orderBy: { createdAt: "desc" } }
      },
      orderBy: [{ platformBoost: "desc" }, { sortOrder: "asc" }]
    });
    return ok(reply, items.map(merchantCard));
  });

  app.get("/api/public/food/random", async (_request, reply) => {
    const items = await prisma.merchant.findMany({
      where: { status: "APPROVED", isFoodRecommendation: true, foodCategory: { not: null } },
      include: {
        category: true,
        serviceCategory: true,
        coupons: { where: { status: "ACTIVE", validTo: { gte: new Date() } }, orderBy: { createdAt: "desc" } }
      }
    });
    if (items.length === 0) return ok(reply, null);
    const total = items.reduce((sum, item) => sum + Math.max(item.randomWeight, 1), 0);
    let cursor = Math.floor(Math.random() * total);
    const selected = items.find((item) => {
      cursor -= Math.max(item.randomWeight, 1);
      return cursor < 0;
    }) ?? items[0];
    return ok(reply, merchantCard(selected));
  });

  app.get("/api/public/services/categories", async (_request, reply) => {
    return ok(reply, await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    }));
  });

  app.get("/api/public/services/merchants", async (request, reply) => {
    const query = serviceQuery.parse(request.query);
    const items = await prisma.merchant.findMany({
      where: {
        status: "APPROVED",
        isServicePublished: true,
        serviceCategory: query.serviceKey ? { key: query.serviceKey } : undefined
      },
      include: {
        category: true,
        serviceCategory: true,
        coupons: { where: { status: "ACTIVE", validTo: { gte: new Date() } }, orderBy: { createdAt: "desc" } }
      },
      orderBy: [{ platformBoost: "desc" }, { sortOrder: "asc" }]
    });
    return ok(reply, items.map(merchantCard));
  });

  app.get("/api/public/community/types", async (_request, reply) => {
    const rows = await prisma.communityPost.findMany({
      where: { status: "VISIBLE" },
      distinct: ["type"],
      select: { type: true },
      orderBy: { type: "asc" }
    });
    return ok(reply, ["全部", ...rows.map((row) => row.type)]);
  });

  app.get("/api/public/community/posts", async (request, reply) => {
    const query = communityQuery.parse(request.query);
    const items = await prisma.communityPost.findMany({
      where: { status: "VISIBLE", type: query.type && query.type !== "全部" ? query.type : undefined },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }]
    });
    return ok(reply, items.map(communityPostCard));
  });

  app.post("/api/public/community/posts", async (request, reply) => {
    const parsed = communityPostCreateSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "投稿参数错误");
    const content = parsed.data.content;
    const post = await prisma.communityPost.create({
      data: {
        type: parsed.data.type,
        title: parsed.data.title,
        summary: content.length > 90 ? `${content.slice(0, 90)}...` : content,
        content,
        authorNickname: parsed.data.authorNickname,
        contact: parsed.data.contact,
        source: parsed.data.source || "student",
        status: "PENDING",
        sortOrder: 100
      }
    });
    return ok(reply, { id: post.id, status: post.status }, "投稿成功，审核后展示");
  });

  app.get("/api/public/community/posts/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const post = await prisma.communityPost.updateMany({
      where: { id, status: "VISIBLE" },
      data: { viewCount: { increment: 1 } }
    });
    if (post.count === 0) return fail(reply, "NOT_FOUND", "帖子不存在或未审核", 404);
    const item = await prisma.communityPost.findUnique({ where: { id } });
    return ok(reply, communityPostCard(item));
  });

  app.post("/api/public/community/posts/:id/like", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = communityLikeSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "点赞参数错误");
    const sessionId = parsed.data.sessionId || request.headers["x-session-id"]?.toString() || request.ip;
    const post = await prisma.communityPost.findFirst({ where: { id, status: "VISIBLE" } });
    if (!post) return fail(reply, "NOT_FOUND", "帖子不存在或未审核", 404);
    const likedSessionIds = Array.isArray(post.likedSessionIds) ? post.likedSessionIds.filter((item): item is string => typeof item === "string") : [];
    if (likedSessionIds.includes(sessionId)) return ok(reply, { liked: true, likeCount: post.likeCount });
    const updated = await prisma.communityPost.update({
      where: { id },
      data: { likeCount: { increment: 1 }, likedSessionIds: [...likedSessionIds, sessionId].slice(-500) }
    });
    return ok(reply, { liked: true, likeCount: updated.likeCount });
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
        activityId: parsed.data.activityId,
        shareLinkId: parsed.data.shareLinkId,
        referrerId: parsed.data.referrerId,
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
        activityId: parsed.data.activityId,
        shareLinkId: parsed.data.shareLinkId,
        referrerId: parsed.data.referrerId,
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
