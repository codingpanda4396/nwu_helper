import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { getCached } from "./cache.js";
import { fail, ok } from "./response.js";
import { getHomeActivities, getPublicActivity, listPublicActivities } from "./services/activityService.js";

const listQuery = z.object({
  categoryId: z.string().optional(),
  keyword: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20)
});

const activityListQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20)
});

const serviceQuery = z.object({
  serviceKey: z.string().optional()
});

const foodQuery = z.object({
  tag: z.string().optional(),
  sort: z.enum(["default", "distance", "hot", "price"]).optional().default("default")
});

const communityQuery = z.object({
  type: z.string().optional()
});

const communityPostCreateSchema = z.object({
  type: z.string().trim().min(1).max(24),
  title: z.string().trim().min(2).max(80),
  content: z.string().trim().min(5).max(2000),
  authorNickname: z.string().trim().max(24).optional(),
  contact: z.string().trim().max(80).optional(),
  source: z.string().trim().max(24).optional()
});

const communityLikeSchema = z.object({
  sessionId: z.string().trim().min(3).max(120).optional()
});

function merchantCard(merchant: any) {
  return {
    id: merchant.id,
    category: merchant.category?.slug === "food" ? "food" : "service",
    serviceId: merchant.serviceCategory?.key,
    name: merchant.name,
    image: merchant.coverImageUrl,
    summary: merchant.summary,
    avgPrice: merchant.avgPrice,
    distance: "",
    distanceText: "",
    address: merchant.address,
    businessHours: merchant.businessHours,
    phone: merchant.phone,
    tags: merchant.tags || [],
    qrImage: merchant.qrImageUrl,
    qrImageUrl: merchant.qrImageUrl,
    wechatLabel: merchant.wechatLabel,
    privateDomainNote: merchant.privateDomainNote,
    defaultChannelId: merchant.defaultChannelId,
    latitude: merchant.latitude ?? 0,
    longitude: merchant.longitude ?? 0
  };
}

function activityCard(activity: any) {
  return {
    id: activity.id,
    merchantId: activity.merchantId,
    title: activity.title,
    description: activity.description,
    image: activity.coverImage ?? activity.merchant?.coverImageUrl,
    channelId: activity.channelId,
    source: activity.source,
    merchant: activity.merchant ? merchantCard(activity.merchant) : null
  };
}

function wechatEntryCard(item: any) {
  if (!item?.isActive) return null;
  return {
    title: item.title,
    description: item.description,
    buttonText: item.buttonText,
    imageUrl: item.imageUrl,
    isActive: item.isActive
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
    const items = await getCached("banners", () =>
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }), 600);
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
    const data = await getCached("home:data", async () => {
      const [banners, activities, wechatEntry] = await Promise.all([
        prisma.banner.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
        getHomeActivities(),
        prisma.wechatEntryConfig.findUnique({ where: { id: "home-wechat-entry" } })
      ]);
      return {
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
        activities: activities.map(activityCard),
        wechatEntry: wechatEntryCard(wechatEntry)
      };
    }, 300);
    return ok(reply, data);
  });

  app.get("/api/public/wechat-entry", async (_request, reply) => {
    const item = await getCached("wechat-entry", () =>
      prisma.wechatEntryConfig.findUnique({ where: { id: "home-wechat-entry" } }), 600);
    return ok(reply, wechatEntryCard(item));
  });

  app.get("/api/public/categories", async (_request, reply) => {
    const items = await getCached("categories", () =>
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      }), 1800);
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
    return ok(reply, activityCard(activity));
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
    const [items, total] = await prisma.$transaction([
      prisma.merchant.findMany({
        where,
        include: {
          category: true,
          activities: {
            where: { status: "ACTIVE", startAt: { lte: new Date() }, endAt: { gte: new Date() } },
            orderBy: { sortOrder: "asc" }
          }
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.merchant.count({ where })
    ]);
    return ok(reply, { items: items.map(merchantCard), total, page: query.page, pageSize: query.pageSize });
  });

  app.get("/api/public/merchants/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const merchant = await prisma.merchant.findFirst({
      where: { id, status: "APPROVED" },
      include: {
        category: true,
        serviceCategory: true,
        images: {
          orderBy: { sortOrder: "asc" }
        },
        activities: {
          where: { status: "ACTIVE", startAt: { lte: new Date() }, endAt: { gte: new Date() } },
          orderBy: { sortOrder: "asc" }
        }
      }
    });
    if (!merchant) return fail(reply, "NOT_FOUND", "商家不存在", 404);
    return ok(reply, {
      ...merchantCard(merchant),
      summary: merchant.summary,
      phone: merchant.phone,
      images: merchant.images.map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        type: img.type
      })),
      activities: merchant.activities.map(activityCard)
    });
  });

  app.get("/api/public/food/categories", async (_request, reply) => {
    return ok(reply, [{ id: "all", name: "全部" }]);
  });

  app.get("/api/public/food/merchants", async (request, reply) => {
    const query = foodQuery.parse(request.query);
    const where: any = {
      status: "APPROVED",
      category: { slug: "food" }
    };
    if (query.tag && query.tag !== "all") {
      where.tags = { has: query.tag };
    }
    const orderBy: any = query.sort === "price"
      ? [{ avgPrice: "asc" }, { sortOrder: "asc" }]
      : query.sort === "hot"
        ? [{ sortOrder: "asc" }, { createdAt: "desc" }]
        : [{ sortOrder: "asc" }];
    const items = await prisma.merchant.findMany({
      where,
      include: {
        category: true,
        serviceCategory: true,
        activities: {
          where: { status: "ACTIVE", startAt: { lte: new Date() }, endAt: { gte: new Date() } },
          orderBy: { sortOrder: "asc" }
        }
      },
      orderBy
    });
    return ok(reply, items.map(merchantCard));
  });

  app.get("/api/public/food/random", async (_request, reply) => {
    const items = await prisma.merchant.findMany({
      where: {
        status: "APPROVED",
        category: { slug: "food" }
      },
      include: {
        category: true,
        serviceCategory: true
      }
    });
    if (items.length === 0) return ok(reply, null);
    const selected = items[Math.floor(Math.random() * items.length)];
    return ok(reply, merchantCard(selected));
  });

  app.get("/api/public/services/categories", async (_request, reply) => {
    const items = await getCached("service-categories", () =>
      prisma.serviceCategory.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      }), 1800);
    return ok(reply, items);
  });

  app.get("/api/public/services/merchants", async (request, reply) => {
    const query = serviceQuery.parse(request.query);
    const items = await prisma.merchant.findMany({
      where: {
        status: "APPROVED",
        serviceCategory: query.serviceKey ? { key: query.serviceKey } : undefined
      },
      include: {
        category: true,
        serviceCategory: true,
        activities: {
          where: { status: "ACTIVE", startAt: { lte: new Date() }, endAt: { gte: new Date() } },
          orderBy: { sortOrder: "asc" }
        }
      },
      orderBy: [{ sortOrder: "asc" }]
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
}
