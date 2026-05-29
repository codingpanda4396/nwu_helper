import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
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

  // ── 活动管理 ──

  const activitySchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    merchantId: z.string().min(1),
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
}
