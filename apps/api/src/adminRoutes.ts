import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { invalidateCache } from "./cache.js";
import { fail, ok } from "./response.js";

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().int().default(100),
  isActive: z.boolean().default(true)
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

const wechatEntrySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  buttonText: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
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
  content: z.string().optional(),
  authorNickname: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
  source: z.string().optional(),
  viewCount: z.coerce.number().int().nonnegative().default(0),
  likeCount: z.coerce.number().int().nonnegative().default(0),
  commentCount: z.coerce.number().int().nonnegative().default(0),
  status: z.enum(["PENDING", "VISIBLE", "HIDDEN", "REJECTED"]).default("VISIBLE"),
  sortOrder: z.coerce.number().int().default(100),
  publishedAt: z.coerce.date().optional()
});

const attributionActions = [
  "merchant_impression",
  "activity_impression",
  "merchant_click",
  "merchant_view",
  "phone_click",
  "navigation_click",
  "wechat_qr_view",
  "activity_click",
  "community_merchant_click"
];

const attributionQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  merchantId: z.string().optional(),
  activityId: z.string().optional(),
  channelId: z.string().optional(),
  source: z.string().optional()
});

const attributionChannelSchema = z.object({
  key: z.string().trim().min(1).max(80).regex(/^[a-z0-9_-]+$/),
  name: z.string().trim().min(1).max(80),
  source: z.string().trim().max(120).nullable().optional(),
  campaign: z.string().trim().max(120).nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().default(true)
});

function attributionDateRange(query: z.infer<typeof attributionQuerySchema>) {
  const now = new Date();
  return {
    startDate: query.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    endDate: query.endDate || now
  };
}

function visitorKey(row: { sessionId: string | null; userId: string | null; ip: string | null; id: string }) {
  return row.sessionId || row.userId || row.ip || row.id;
}

function makeAttributionWhere(query: z.infer<typeof attributionQuerySchema>) {
  const { startDate, endDate } = attributionDateRange(query);
  return {
    createdAt: { gte: startDate, lte: endDate },
    merchantId: query.merchantId,
    activityId: query.activityId,
    channelId: query.channelId,
    source: query.source
  };
}

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function authUser(request: { user?: unknown }) {
  return request.user as { sub: string; role: "STUDENT" | "ADMIN"; name: string };
}

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const auth = authUser(request);
    if (auth.role !== "ADMIN") {
      return fail(reply, "FORBIDDEN", "需要管理员权限", 403);
    }
  });

  app.get("/api/users/me", async (request, reply) => {
    const auth = authUser(request);
    const user = await prisma.user.findUnique({ where: { id: auth.sub } });
    if (!user) return fail(reply, "NOT_FOUND", "用户不存在", 404);
    return ok(reply, { id: user.id, name: user.name, username: user.username, phone: user.phone, role: user.role });
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

  app.get("/api/admin/banners", async (_request, reply) => {
    return ok(reply, await prisma.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }));
  });

  app.get("/api/admin/banners/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) return fail(reply, "NOT_FOUND", "轮播图不存在", 404);
    return ok(reply, banner);
  });

  app.post("/api/admin/banners", async (request, reply) => {
    const parsed = bannerSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "轮播图参数错误");
    const banner = await prisma.banner.create({ data: parsed.data });
    invalidateCache("banners");
    invalidateCache("home:data");
    return ok(reply, banner);
  });

  app.patch("/api/admin/banners/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = bannerSchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "轮播图参数错误");
    const banner = await prisma.banner.update({ where: { id }, data: parsed.data });
    invalidateCache("banners");
    invalidateCache("home:data");
    return ok(reply, banner);
  });

  app.patch("/api/admin/banners/:id/status", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { isActive } = z.object({ isActive: z.boolean() }).parse(request.body);
    const banner = await prisma.banner.update({ where: { id }, data: { isActive } });
    invalidateCache("banners");
    invalidateCache("home:data");
    return ok(reply, banner);
  });

  app.get("/api/admin/wechat-entry", async (_request, reply) => {
    const item = await prisma.wechatEntryConfig.upsert({
      where: { id: "home-wechat-entry" },
      update: {},
      create: {
        id: "home-wechat-entry",
        title: "加入西大圈微信",
        description: "领活动、问优惠、推荐好店、反馈问题，都从这里开始。",
        buttonText: "添加微信",
        imageUrl: "/assets/images/h5-wechat-promo.png",
        isActive: true
      }
    });
    return ok(reply, item);
  });

  app.patch("/api/admin/wechat-entry", async (request, reply) => {
    const parsed = wechatEntrySchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "西大圈入口参数错误");
    return ok(reply, await prisma.wechatEntryConfig.upsert({
      where: { id: "home-wechat-entry" },
      update: parsed.data,
      create: {
        id: "home-wechat-entry",
        title: parsed.data.title || "加入西大圈微信",
        description: parsed.data.description || "领活动、问优惠、推荐好店、反馈问题，都从这里开始。",
        buttonText: parsed.data.buttonText || "添加微信",
        imageUrl: parsed.data.imageUrl || "/assets/images/h5-wechat-promo.png",
        isActive: parsed.data.isActive ?? true
      }
    }));
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

  const drivingConfigSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    promoImages: z.array(z.string()).optional(),
    qrImageUrl: z.string().nullable().optional(),
    qrTitle: z.string().optional(),
    qrDescription: z.string().optional(),
    isActive: z.boolean().optional()
  });

  app.get("/api/admin/driving-config", async (_request, reply) => {
    const item = await prisma.drivingPageConfig.upsert({
      where: { id: "driving-page" },
      update: {},
      create: { id: "driving-page" }
    });
    return ok(reply, item);
  });

  app.patch("/api/admin/driving-config", async (request, reply) => {
    const parsed = drivingConfigSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "驾校配置参数错误");
    const item = await prisma.drivingPageConfig.upsert({
      where: { id: "driving-page" },
      update: parsed.data,
      create: { id: "driving-page", ...parsed.data }
    });
    invalidateCache("driving-config");
    return ok(reply, item);
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
    const { status } = z.object({ status: z.enum(["PENDING", "VISIBLE", "HIDDEN", "REJECTED"]) }).parse(request.body);
    return ok(reply, await prisma.communityPost.update({ where: { id }, data: { status } }));
  });

  app.delete("/api/admin/community-posts/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    await prisma.communityPost.delete({ where: { id } });
    return ok(reply, { deleted: true });
  });

  app.get("/api/admin/dashboard/overview", async (_request, reply) => {
    const [merchantCount, activityCount, bannerCount, communityPostCount, pendingCommunityPostCount, feedbackCount] = await prisma.$transaction([
      prisma.merchant.count(),
      prisma.activity.count(),
      prisma.banner.count(),
      prisma.communityPost.count(),
      prisma.communityPost.count({ where: { status: "PENDING" } }),
      prisma.feedback.count()
    ]);
    return ok(reply, { merchantCount, activityCount, bannerCount, communityPostCount, pendingCommunityPostCount, feedbackCount });
  });

  // ── 商家管理 ──

  const merchantSchema = z.object({
    name: z.string().min(1),
    summary: z.string().nullable().optional(),
    categoryId: z.string().min(1),
    address: z.string().min(1),
    phone: z.string().nullable().optional(),
    businessHours: z.string().nullable().optional(),
    coverImageUrl: z.string().nullable().optional(),
    qrImageUrl: z.string().nullable().optional(),
    wechatLabel: z.string().nullable().optional(),
    privateDomainNote: z.string().nullable().optional(),
    defaultChannelId: z.string().nullable().optional(),
    avgPrice: z.coerce.number().nullable().optional(),
    latitude: z.coerce.number().nullable().optional(),
    longitude: z.coerce.number().nullable().optional(),
    tags: z.array(z.string()).optional(),
    sortOrder: z.coerce.number().int().default(100),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]).default("PENDING"),
    serviceCategoryId: z.string().nullable().optional()
  });

  app.get("/api/admin/merchants", async (_request, reply) => {
    const items = await prisma.merchant.findMany({
      include: { category: true, serviceCategory: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
    return ok(reply, items);
  });

  app.post("/api/admin/merchants", async (request, reply) => {
    const parsed = merchantSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "商家参数错误");
    return ok(reply, await prisma.merchant.create({ data: parsed.data, include: { category: true, serviceCategory: true } }));
  });

  app.patch("/api/admin/merchants/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = merchantSchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "商家参数错误");
    return ok(reply, await prisma.merchant.update({ where: { id }, data: parsed.data, include: { category: true, serviceCategory: true } }));
  });

  app.patch("/api/admin/merchants/:id/status", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { status } = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]) }).parse(request.body);
    return ok(reply, await prisma.merchant.update({ where: { id }, data: { status } }));
  });

  app.delete("/api/admin/merchants/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    await prisma.merchant.delete({ where: { id } });
    return ok(reply, { deleted: true });
  });

  app.post("/api/admin/merchants/:id/assign-owner", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = z.object({ phone: z.string().min(1) }).safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "手机号不能为空");

    const user = await prisma.user.upsert({
      where: { phone: parsed.data.phone },
      create: { phone: parsed.data.phone, name: parsed.data.phone, role: "MERCHANT", registerSource: "admin" },
      update: { role: "MERCHANT" }
    });

    const merchant = await prisma.merchant.update({
      where: { id },
      data: { ownerUserId: user.id }
    });

    return ok(reply, {
      merchant: { id: merchant.id, name: merchant.name },
      owner: { id: user.id, phone: user.phone, role: user.role }
    }, "商家绑定成功");
  });

  // ── 活动管理 ──

  const activitySchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    merchantId: z.string().min(1),
    channelId: z.string().nullable().optional(),
    source: z.string().nullable().optional(),
    coverImage: z.string().nullable().optional(),
    sortOrder: z.coerce.number().int().default(100),
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED"]).default("DRAFT"),
    startAt: z.coerce.date(),
    endAt: z.coerce.date()
  });

  app.get("/api/admin/activities", async (_request, reply) => {
    const items = await prisma.activity.findMany({
      include: { merchant: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
    return ok(reply, items);
  });

  app.post("/api/admin/activities", async (request, reply) => {
    const parsed = activitySchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "活动参数错误");
    return ok(reply, await prisma.activity.create({ data: parsed.data, include: { merchant: true } }));
  });

  app.patch("/api/admin/activities/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = activitySchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "活动参数错误");
    return ok(reply, await prisma.activity.update({ where: { id }, data: parsed.data, include: { merchant: true } }));
  });

  app.delete("/api/admin/activities/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    await prisma.activity.delete({ where: { id } });
    return ok(reply, { deleted: true });
  });

  // ── 反馈管理 ──

  app.get("/api/admin/feedbacks", async (request, reply) => {
    const { status } = z.object({ status: z.enum(["PENDING", "PROCESSING", "RESOLVED"]).optional() }).parse(request.query);
    const where = status ? { status } : {};
    const items = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
    return ok(reply, items);
  });

  app.patch("/api/admin/feedbacks/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = z.object({
      status: z.enum(["PENDING", "PROCESSING", "RESOLVED"]).optional(),
      reply: z.string().nullable().optional()
    }).safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "反馈参数错误");
    return ok(reply, await prisma.feedback.update({ where: { id }, data: parsed.data }));
  });

  // ── 归因分析 ──

  app.get("/api/admin/attribution/channel-options", async (_request, reply) => {
    const items = await prisma.attributionChannel.findMany({
      orderBy: [{ isActive: "desc" }, { key: "asc" }]
    });
    return ok(reply, items);
  });

  app.post("/api/admin/attribution/channel-options", async (request, reply) => {
    const parsed = attributionChannelSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "渠道参数错误");
    return ok(reply, await prisma.attributionChannel.create({ data: parsed.data }));
  });

  app.patch("/api/admin/attribution/channel-options/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = attributionChannelSchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "渠道参数错误");
    return ok(reply, await prisma.attributionChannel.update({ where: { id }, data: parsed.data }));
  });

  app.get("/api/admin/attribution/overview", async (request, reply) => {
    const query = attributionQuerySchema.parse(request.query);
    const where = makeAttributionWhere(query);
    const rows = await prisma.userActivity.findMany({
      where: { ...where, action: { in: attributionActions } },
      select: { id: true, action: true, sessionId: true, userId: true, ip: true }
    });

    const byAction = new Map<string, { pv: number; visitors: Set<string> }>();
    for (const row of rows) {
      const entry = byAction.get(row.action) || { pv: 0, visitors: new Set<string>() };
      entry.pv += 1;
      entry.visitors.add(visitorKey(row));
      byAction.set(row.action, entry);
    }

    const funnel = attributionActions.map((action) => ({
      action,
      pv: byAction.get(action)?.pv || 0,
      uv: byAction.get(action)?.visitors.size || 0
    }));

    return ok(reply, {
      range: attributionDateRange(query),
      totalPv: rows.length,
      totalUv: new Set(rows.map(visitorKey)).size,
      funnel
    });
  });

  app.get("/api/admin/attribution/merchants", async (request, reply) => {
    const query = attributionQuerySchema.parse(request.query);
    const rows = await prisma.userActivity.findMany({
      where: { ...makeAttributionWhere(query), action: { in: attributionActions }, merchantId: { not: null } },
      select: { id: true, action: true, merchantId: true, sessionId: true, userId: true, ip: true }
    });
    const merchantIds = [...new Set(rows.map((row) => row.merchantId).filter((id): id is string => !!id))];
    const merchants = await prisma.merchant.findMany({
      where: { id: { in: merchantIds } },
      select: { id: true, name: true }
    });
    const merchantNameById = new Map(merchants.map((item) => [item.id, item.name]));
    const grouped = new Map<string, { merchantId: string; merchantName: string; totalPv: number; visitors: Set<string>; actions: Record<string, number> }>();
    for (const row of rows) {
      if (!row.merchantId) continue;
      const entry = grouped.get(row.merchantId) || {
        merchantId: row.merchantId,
        merchantName: merchantNameById.get(row.merchantId) || "未知商家",
        totalPv: 0,
        visitors: new Set<string>(),
        actions: {}
      };
      entry.totalPv += 1;
      entry.visitors.add(visitorKey(row));
      entry.actions[row.action] = (entry.actions[row.action] || 0) + 1;
      grouped.set(row.merchantId, entry);
    }
    return ok(reply, Array.from(grouped.values()).map((item) => ({
      merchantId: item.merchantId,
      merchantName: item.merchantName,
      totalPv: item.totalPv,
      totalUv: item.visitors.size,
      ...item.actions
    })).sort((a, b) => b.totalPv - a.totalPv));
  });

  app.get("/api/admin/attribution/channels", async (request, reply) => {
    const query = attributionQuerySchema.parse(request.query);
    const rows = await prisma.userActivity.findMany({
      where: { ...makeAttributionWhere(query), action: { in: attributionActions } },
      select: { id: true, action: true, channelId: true, source: true, sessionId: true, userId: true, ip: true }
    });
    const channelIds = [...new Set(rows.map((row) => row.channelId).filter((id): id is string => !!id))];
    const channels = await prisma.attributionChannel.findMany({
      where: { OR: [{ id: { in: channelIds } }, { key: { in: channelIds } }] },
      select: { id: true, key: true, name: true }
    });
    const channelNameById = new Map<string, string>();
    channels.forEach((item) => {
      channelNameById.set(item.id, item.name);
      channelNameById.set(item.key, item.name);
    });
    const grouped = new Map<string, { channelId: string; channelName: string; source: string; totalPv: number; visitors: Set<string>; actions: Record<string, number> }>();
    for (const row of rows) {
      const key = row.channelId || row.source || "direct";
      const entry = grouped.get(key) || {
        channelId: row.channelId || "",
        channelName: channelNameById.get(key) || row.source || "自然访问",
        source: row.source || "",
        totalPv: 0,
        visitors: new Set<string>(),
        actions: {}
      };
      entry.totalPv += 1;
      entry.visitors.add(visitorKey(row));
      entry.actions[row.action] = (entry.actions[row.action] || 0) + 1;
      grouped.set(key, entry);
    }
    return ok(reply, Array.from(grouped.values()).map((item) => ({
      channelId: item.channelId,
      channelName: item.channelName,
      source: item.source,
      totalPv: item.totalPv,
      totalUv: item.visitors.size,
      ...item.actions
    })).sort((a, b) => b.totalPv - a.totalPv));
  });

  app.get("/api/admin/attribution/export", async (request, reply) => {
    const query = attributionQuerySchema.parse(request.query);
    const rows = await prisma.userActivity.findMany({
      where: { ...makeAttributionWhere(query), action: { in: attributionActions } },
      select: {
        createdAt: true,
        action: true,
        page: true,
        targetId: true,
        merchantId: true,
        activityId: true,
        channelId: true,
        source: true,
        scene: true,
        sessionId: true,
        platform: true
      },
      orderBy: { createdAt: "desc" },
      take: 5000
    });
    const header = ["date", "action", "page", "targetId", "merchantId", "activityId", "channelId", "source", "scene", "sessionId", "platform"];
    const lines = [
      header.join(","),
      ...rows.map((row) => header.map((key) => csvEscape(key === "date" ? row.createdAt.toISOString() : (row as any)[key])).join(","))
    ];
    reply.header("content-type", "text/csv; charset=utf-8");
    reply.header("content-disposition", 'attachment; filename="attribution-export.csv"');
    return lines.join("\n");
  });

  // ── 推广订单管理 ──

  app.get("/api/admin/promotion/orders", async (request, reply) => {
    const query = z.object({ status: z.string().optional() }).safeParse(request.query);
    const where: any = {};
    if (query.success && query.data.status) {
      where.status = query.data.status;
    }
    const orders = await prisma.promotionOrder.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
    return ok(reply, orders);
  });

  app.post("/api/admin/promotion/orders/:id/confirm", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ startAt: z.string().optional() }).safeParse(request.body);

    const order = await prisma.promotionOrder.findUnique({ where: { id } });
    if (!order) return fail(reply, "NOT_FOUND", "订单不存在", 404);

    const startAt = body.success && body.data.startAt ? new Date(body.data.startAt) : new Date();

    const now = new Date();
    const banner = await prisma.banner.create({
      data: {
        title: `推广 #${id.slice(0, 8)}`,
        imageUrl: "",
        targetType: "URL",
        isActive: true,
        promotionOrderId: id,
        sortOrder: 0
      }
    });

    const updated = await prisma.promotionOrder.update({
      where: { id },
      data: {
        status: "ACTIVE",
        paidAt: now,
        startAt,
        endAt: new Date(startAt.getTime() + order.days * 24 * 3600_000),
        bannerId: banner.id
      }
    });

    return ok(reply, updated, "已确认开通");
  });

  app.post("/api/admin/promotion/orders/:id/cancel", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const order = await prisma.promotionOrder.findUnique({ where: { id } });
    if (!order) return fail(reply, "NOT_FOUND", "订单不存在", 404);

    if (order.bannerId) {
      await prisma.banner.update({
        where: { id: order.bannerId },
        data: { isActive: false }
      });
    }

    const updated = await prisma.promotionOrder.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    return ok(reply, updated, "已取消");
  });
}
