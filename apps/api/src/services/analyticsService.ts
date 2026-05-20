import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { unknownAttributionGroup } from "./attributionService.js";

export type AnalyticsScope = {
  merchantId?: string;
  couponId?: string;
  activityId?: string;
  startDate?: Date;
  endDate?: Date;
};

function dateFilter(field: "createdAt" | "claimedAt" | "redeemedAt", scope: AnalyticsScope) {
  const range: { gte?: Date; lte?: Date } = {};
  if (scope.startDate) range.gte = scope.startDate;
  if (scope.endDate) range.lte = scope.endDate;
  return Object.keys(range).length ? { [field]: range } : {};
}

function rate(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(4));
}

export function parseAnalyticsScope(query: unknown, forcedMerchantId?: string): AnalyticsScope {
  const input = query as Record<string, string | undefined>;
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  let startDate = input.startDate ? new Date(input.startDate) : undefined;
  let endDate = input.endDate ? new Date(input.endDate) : undefined;
  if (!startDate && input.range === "today") startDate = startOfToday;
  if (!startDate && input.range === "7d") startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  if (!startDate && input.range === "30d") startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
  return {
    merchantId: forcedMerchantId ?? input.merchantId,
    couponId: input.couponId,
    activityId: input.activityId,
    startDate,
    endDate
  };
}

function merchantWhere(scope: AnalyticsScope, field: "createdAt" | "claimedAt" | "redeemedAt") {
  return {
    merchantId: scope.merchantId,
    activityId: scope.activityId,
    ...dateFilter(field, scope)
  };
}

function couponWhere(scope: AnalyticsScope, field: "claimedAt" | "redeemedAt") {
  return {
    merchantId: scope.merchantId,
    couponId: scope.couponId,
    activityId: scope.activityId,
    ...dateFilter(field, scope)
  };
}

export async function getSummary(scope: AnalyticsScope) {
  const [exposureCount, clickCount, claimCount, redemptionCount] = await prisma.$transaction([
    prisma.exposureLog.count({ where: merchantWhere(scope, "createdAt") }),
    prisma.clickLog.count({ where: merchantWhere(scope, "createdAt") }),
    prisma.userCoupon.count({ where: couponWhere(scope, "claimedAt") }),
    prisma.couponRedemption.count({ where: couponWhere(scope, "redeemedAt") })
  ]);
  return {
    exposureCount,
    clickCount,
    claimCount,
    redemptionCount,
    clickRate: rate(clickCount, exposureCount),
    redemptionRate: rate(redemptionCount, claimCount)
  };
}

type GroupKey = { source: string; channel: string };
type Counts = GroupKey & { exposureCount: number; clickCount: number; claimCount: number; redemptionCount: number };

function key(source: string | null | undefined, channel: string | null | undefined) {
  return `${unknownAttributionGroup(source)}\u0000${unknownAttributionGroup(channel)}`;
}

function ensure(map: Map<string, Counts>, source: string | null | undefined, channel: string | null | undefined) {
  const sourceKey = unknownAttributionGroup(source);
  const channelKey = unknownAttributionGroup(channel);
  const mapKey = key(source, channel);
  if (!map.has(mapKey)) map.set(mapKey, { source: sourceKey, channel: channelKey, exposureCount: 0, clickCount: 0, claimCount: 0, redemptionCount: 0 });
  return map.get(mapKey)!;
}

function groupCount(row: { _count?: number | true | { _all?: number } }) {
  return typeof row._count === "number" ? row._count : typeof row._count === "object" ? row._count._all ?? 0 : 0;
}

export async function getBySource(scope: AnalyticsScope) {
  const [exposures, clicks, claims, redemptions] = await prisma.$transaction([
    prisma.exposureLog.groupBy({ by: ["source", "channel"], where: merchantWhere(scope, "createdAt"), orderBy: [{ source: "asc" }, { channel: "asc" }], _count: true }),
    prisma.clickLog.groupBy({ by: ["source", "channel"], where: merchantWhere(scope, "createdAt"), orderBy: [{ source: "asc" }, { channel: "asc" }], _count: true }),
    prisma.userCoupon.groupBy({ by: ["source", "channel"], where: couponWhere(scope, "claimedAt"), orderBy: [{ source: "asc" }, { channel: "asc" }], _count: true }),
    prisma.couponRedemption.groupBy({ by: ["source", "channel"], where: couponWhere(scope, "redeemedAt"), orderBy: [{ source: "asc" }, { channel: "asc" }], _count: true })
  ]);
  const groups = new Map<string, Counts>();
  for (const row of exposures) ensure(groups, row.source, row.channel).exposureCount = groupCount(row);
  for (const row of clicks) ensure(groups, row.source, row.channel).clickCount = groupCount(row);
  for (const row of claims) ensure(groups, row.source, row.channel).claimCount = groupCount(row);
  for (const row of redemptions) ensure(groups, row.source, row.channel).redemptionCount = groupCount(row);
  return [...groups.values()]
    .map((row) => ({ ...row, clickRate: rate(row.clickCount, row.exposureCount), redemptionRate: rate(row.redemptionCount, row.claimCount) }))
    .sort((a, b) => b.exposureCount - a.exposureCount || b.clickCount - a.clickCount || a.source.localeCompare(b.source));
}

export async function getCouponPerformance(scope: AnalyticsScope) {
  const coupons = await prisma.coupon.findMany({
    where: { merchantId: scope.merchantId },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" }
  });
  const rows = [];
  for (const coupon of coupons) {
    const summary = await getSummary({ ...scope, couponId: coupon.id });
    rows.push({ couponId: coupon.id, couponTitle: coupon.title, ...summary });
  }
  return rows;
}

export async function getChannelPerformance(scope: AnalyticsScope) {
  return getBySource(scope);
}

export async function getActivityPerformance(scope: AnalyticsScope) {
  const activities = await prisma.activity.findMany({
    where: { merchantId: scope.merchantId },
    include: { merchant: true, coupon: true },
    orderBy: [{ manualWeight: "desc" }, { sortOrder: "asc" }, { startAt: "desc" }]
  });
  const rows = [];
  for (const activity of activities) {
    const summary = await getSummary({ ...scope, activityId: activity.id, couponId: undefined });
    rows.push({
      activityId: activity.id,
      title: activity.title,
      type: activity.type,
      status: activity.status,
      merchantId: activity.merchantId,
      merchantName: activity.merchant.name,
      couponId: activity.couponId,
      couponTitle: activity.coupon?.title ?? "",
      ...summary
    });
  }
  return rows;
}

function day(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function getTrends(scope: AnalyticsScope) {
  const [exposures, clicks, claims, redemptions] = await prisma.$transaction([
    prisma.exposureLog.findMany({ where: merchantWhere(scope, "createdAt"), select: { createdAt: true } }),
    prisma.clickLog.findMany({ where: merchantWhere(scope, "createdAt"), select: { createdAt: true } }),
    prisma.userCoupon.findMany({ where: couponWhere(scope, "claimedAt"), select: { claimedAt: true } }),
    prisma.couponRedemption.findMany({ where: couponWhere(scope, "redeemedAt"), select: { redeemedAt: true } })
  ]);
  const rows = new Map<string, { date: string; exposureCount: number; clickCount: number; claimCount: number; redemptionCount: number }>();
  const ensureDay = (date: string) => {
    if (!rows.has(date)) rows.set(date, { date, exposureCount: 0, clickCount: 0, claimCount: 0, redemptionCount: 0 });
    return rows.get(date)!;
  };
  for (const item of exposures) ensureDay(day(item.createdAt)).exposureCount += 1;
  for (const item of clicks) ensureDay(day(item.createdAt)).clickCount += 1;
  for (const item of claims) ensureDay(day(item.claimedAt)).claimCount += 1;
  for (const item of redemptions) ensureDay(day(item.redeemedAt)).redemptionCount += 1;
  return [...rows.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export type AnalyticsCsvRow = {
  date: string;
  merchant: string;
  coupon: string;
  source: string;
  channel: string;
  exposures: number;
  clicks: number;
  claims: number;
  redemptions: number;
  clickRate: number;
  redemptionRate: number;
};

export async function getExportRows(scope: AnalyticsScope): Promise<AnalyticsCsvRow[]> {
  const rows = await prisma.userCoupon.groupBy({
    by: ["merchantId", "couponId", "source", "channel"],
    where: couponWhere(scope, "claimedAt"),
    orderBy: [{ merchantId: "asc" }, { couponId: "asc" }, { source: "asc" }, { channel: "asc" }],
    _count: true
  });
  const redemptions = await prisma.couponRedemption.groupBy({
    by: ["merchantId", "couponId", "source", "channel"],
    where: couponWhere(scope, "redeemedAt"),
    orderBy: [{ merchantId: "asc" }, { couponId: "asc" }, { source: "asc" }, { channel: "asc" }],
    _count: true
  });
  const merchants = await prisma.merchant.findMany({ select: { id: true, name: true } });
  const coupons = await prisma.coupon.findMany({ select: { id: true, title: true } });
  const merchantNames = new Map(merchants.map((item) => [item.id, item.name]));
  const couponNames = new Map(coupons.map((item) => [item.id, item.title]));
  const redemptionCounts = new Map(redemptions.map((item) => [`${item.merchantId}:${item.couponId}:${key(item.source, item.channel)}`, groupCount(item)]));
  const dateLabel = scope.startDate || scope.endDate ? `${scope.startDate ? day(scope.startDate) : ""}..${scope.endDate ? day(scope.endDate) : ""}` : "all";
  const result: AnalyticsCsvRow[] = [];
  for (const row of rows) {
    const source = unknownAttributionGroup(row.source);
    const channel = unknownAttributionGroup(row.channel);
    const claimCount = groupCount(row);
    const redemptionCount = redemptionCounts.get(`${row.merchantId}:${row.couponId}:${key(row.source, row.channel)}`) ?? 0;
    const merchantScope = { ...scope, merchantId: row.merchantId, couponId: undefined } satisfies AnalyticsScope;
    const [exposureCount, clickCount] = await Promise.all([
      prisma.exposureLog.count({ where: { ...merchantWhere(merchantScope, "createdAt"), source: row.source, channel: row.channel } }),
      prisma.clickLog.count({ where: { ...merchantWhere(merchantScope, "createdAt"), source: row.source, channel: row.channel } })
    ]);
    result.push({
      date: dateLabel,
      merchant: merchantNames.get(row.merchantId) ?? row.merchantId,
      coupon: couponNames.get(row.couponId) ?? row.couponId,
      source,
      channel,
      exposures: exposureCount,
      clicks: clickCount,
      claims: claimCount,
      redemptions: redemptionCount,
      clickRate: rate(clickCount, exposureCount),
      redemptionRate: rate(redemptionCount, claimCount)
    });
  }
  return result;
}
