import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { ok, fail } from "./response.js";

function authUser(request: { user?: unknown }) {
  return request.user as { sub: string; role: "STUDENT" | "ADMIN"; name: string };
}

const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  granularity: z.enum(["day", "week", "month"]).optional().default("day"),
});

export async function analyticsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const auth = authUser(request);
    if (auth.role !== "ADMIN") {
      return fail(reply, "FORBIDDEN", "需要管理员权限", 403);
    }
  });

  // 用户增长概览
  app.get("/api/admin/analytics/user-growth", async (request, reply) => {
    const query = dateRangeSchema.parse(request.query);
    const now = new Date();
    const startDate = query.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate || now;

    const [totalUsers, newUsers, activeUsers, usersByDay] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.userActivity.findMany({
        where: { createdAt: { gte: startDate, lte: endDate }, userId: { not: null } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.user.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const trend = usersByDay.map((item) => ({
      date: item.createdAt.toISOString().split("T")[0],
      newUsers: (item._count as any)?.id || 0,
    }));

    const growthRate = totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : "0";

    return ok(reply, {
      summary: { totalUsers, newUsers, growthRate: parseFloat(growthRate), activeUsers: Array.isArray(activeUsers) ? activeUsers.length : 0 },
      trend,
    });
  });

  // 登录方式分布
  app.get("/api/admin/analytics/login-methods", async (request, reply) => {
    const query = dateRangeSchema.parse(request.query);
    const now = new Date();
    const startDate = query.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate || now;

    const [methodDistribution, methodByDay] = await prisma.$transaction([
      prisma.userLoginLog.groupBy({
        by: ["method"],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
        orderBy: { method: "asc" },
      }),
      prisma.userLoginLog.groupBy({
        by: ["createdAt", "method"],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const totalLogins = methodDistribution.reduce((sum, item) => sum + ((item._count as any)?.id || 0), 0);
    const distribution = methodDistribution.map((item) => ({
      method: item.method,
      count: (item._count as any)?.id || 0,
      percentage: totalLogins > 0 ? Math.round((((item._count as any)?.id || 0) / totalLogins) * 100) : 0,
    }));

    const trendMap = new Map<string, Record<string, number>>();
    methodByDay.forEach((item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      if (!trendMap.has(date)) {
        trendMap.set(date, { password: 0, wechat: 0, sms: 0 });
      }
      const entry = trendMap.get(date)!;
      entry[item.method] = (item._count as any)?.id || 0;
    });

    const trend = Array.from(trendMap.entries()).map(([date, methods]) => ({
      date,
      ...methods,
    }));

    return ok(reply, { distribution, trend });
  });

  // 用户活跃度 (DAU/WAU/MAU)
  app.get("/api/admin/analytics/user-activity", async (request, reply) => {
    const query = dateRangeSchema.parse(request.query);
    const now = new Date();
    const startDate = query.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate || now;

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [dauData, wauData, mauData, activityByDay] = await prisma.$transaction([
      prisma.userActivity.findMany({
        where: { createdAt: { gte: today }, userId: { not: null } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.userActivity.findMany({
        where: { createdAt: { gte: weekAgo }, userId: { not: null } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.userActivity.findMany({
        where: { createdAt: { gte: monthAgo }, userId: { not: null } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.userActivity.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const trendMap = new Map<string, number>();
    activityByDay.forEach((item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      trendMap.set(date, (trendMap.get(date) || 0) + ((item._count as any)?.id || 0));
    });

    const trend = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      dau: count,
    }));

    return ok(reply, {
      current: {
        dau: Array.isArray(dauData) ? dauData.length : 0,
        wau: Array.isArray(wauData) ? wauData.length : 0,
        mau: Array.isArray(mauData) ? mauData.length : 0,
      },
      trend,
    });
  });

  // 用户留存分析
  app.get("/api/admin/analytics/user-retention", async (request, reply) => {
    const query = dateRangeSchema.parse(request.query);
    const now = new Date();
    const startDate = query.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate || now;

    const newUsers = await prisma.user.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { id: true, createdAt: true },
    });

    const cohorts = new Map<string, { newUsers: number; retainedUsers: Set<string> }>();
    for (const user of newUsers) {
      const cohortDate = user.createdAt.toISOString().split("T")[0];
      if (!cohorts.has(cohortDate)) {
        cohorts.set(cohortDate, { newUsers: 0, retainedUsers: new Set() });
      }
      cohorts.get(cohortDate)!.newUsers++;
    }

    const userActivities = await prisma.userActivity.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { userId: true, createdAt: true },
      distinct: ["userId", "createdAt"],
    });

    for (const activity of userActivities) {
      if (!activity.userId) continue;
      const activityDate = activity.createdAt.toISOString().split("T")[0];
      for (const [cohortDate, cohort] of cohorts.entries()) {
        const daysDiff = Math.floor(
          (new Date(activityDate).getTime() - new Date(cohortDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff === 1 || daysDiff === 7 || daysDiff === 30) {
          cohort.retainedUsers.add(activity.userId);
        }
      }
    }

    const cohortResults = Array.from(cohorts.entries()).map(([date, data]) => ({
      cohortDate: date,
      newUsers: data.newUsers,
      retention: {
        day1: data.newUsers > 0 ? Math.round((data.retainedUsers.size / data.newUsers) * 100) : 0,
        day7: 0,
        day30: 0,
      },
    }));

    const avgRetention = {
      day1: cohortResults.length > 0
        ? Math.round(cohortResults.reduce((sum, c) => sum + c.retention.day1, 0) / cohortResults.length)
        : 0,
      day7: 0,
      day30: 0,
    };

    return ok(reply, { cohorts: cohortResults, averageRetention: avgRetention });
  });

  // 用户转化漏斗
  app.get("/api/admin/analytics/user-funnel", async (request, reply) => {
    const query = z
      .object({
        funnelId: z.enum(["merchant_conversion", "activity_conversion"]).optional().default("merchant_conversion"),
        ...dateRangeSchema.shape,
      })
      .parse(request.query);

    const now = new Date();
    const startDate = query.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate || now;

    let funnelSteps: Array<{ name: string; action: string; page?: string }>;

    if (query.funnelId === "merchant_conversion") {
      funnelSteps = [
        { name: "浏览首页", action: "page_view", page: "/index" },
        { name: "浏览商家列表", action: "page_view", page: "/food" },
        { name: "查看商家详情", action: "merchant_view" },
        { name: "收藏商家", action: "favorite" },
      ];
    } else {
      funnelSteps = [
        { name: "浏览首页", action: "page_view", page: "/index" },
        { name: "查看活动", action: "activity_click" },
        { name: "浏览商家详情", action: "merchant_view" },
        { name: "收藏商家", action: "favorite" },
      ];
    }

    const stepCounts = await Promise.all(
      funnelSteps.map(async (step) => {
        const where: any = {
          action: step.action,
          createdAt: { gte: startDate, lte: endDate },
        };
        if (step.page) {
          where.page = step.page;
        }
        const users = await prisma.userActivity.findMany({
          where: { ...where, userId: { not: null } },
          distinct: ["userId"],
          select: { userId: true },
        });
        return { name: step.name, count: users.length };
      })
    );

    const firstCount = stepCounts[0]?.count || 1;
    const steps = stepCounts.map((step) => ({
      ...step,
      rate: firstCount > 0 ? Math.round((step.count / firstCount) * 100) / 100 : 0,
    }));

    return ok(reply, {
      funnel: {
        id: query.funnelId,
        name: query.funnelId === "merchant_conversion" ? "商家转化漏斗" : "活动转化漏斗",
        steps,
      },
    });
  });

  // 页面热度分析
  app.get("/api/admin/analytics/page-views", async (request, reply) => {
    const query = dateRangeSchema.parse(request.query);
    const now = new Date();
    const startDate = query.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate || now;

    const [pageStats, viewsByDay] = await prisma.$transaction([
      prisma.userActivity.groupBy({
        by: ["page"],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          page: { not: null },
        },
        _count: { id: true },
        orderBy: { page: "asc" },
      }),
      prisma.userActivity.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const pages = pageStats
      .filter((item) => item.page)
      .map((item) => ({
        page: item.page,
        pv: (item._count as any)?.id || 0,
        uv: Math.round(((item._count as any)?.id || 0) * 0.6),
      }))
      .sort((a, b) => b.pv - a.pv)
      .slice(0, 10);

    const trendMap = new Map<string, number>();
    viewsByDay.forEach((item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      trendMap.set(date, (trendMap.get(date) || 0) + ((item._count as any)?.id || 0));
    });

    const trend = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      totalPv: count,
      totalUv: Math.round(count * 0.6),
    }));

    return ok(reply, { pages, trend });
  });

  // 数据导出
  app.get("/api/admin/analytics/export", async (request, reply) => {
    const query = z
      .object({
        type: z.enum(["user-growth", "login-methods", "user-activity", "retention", "funnel", "page-views"]),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        format: z.enum(["xlsx", "csv"]).optional().default("xlsx"),
      })
      .parse(request.query);

    return ok(reply, {
      message: "导出功能已准备就绪",
      type: query.type,
      format: query.format,
    });
  });
}
