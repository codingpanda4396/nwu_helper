import type { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "../db.js";

const activeActivityWhere = (now = new Date()) =>
  ({
    status: "ACTIVE",
    startAt: { lte: now },
    endAt: { gte: now },
    merchant: { status: "APPROVED" }
  }) satisfies Prisma.ActivityWhereInput;

export const activityInclude = {
  merchant: { include: { category: true } },
  coupon: true
} satisfies Prisma.ActivityInclude;

export function activityOrderBy() {
  return [{ manualWeight: "desc" as const }, { sortOrder: "asc" as const }, { startAt: "desc" as const }];
}

export async function listPublicActivities(input: { type?: ActivityType; page?: number; pageSize?: number }) {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 20;
  const where = { ...activeActivityWhere(), type: input.type } satisfies Prisma.ActivityWhereInput;
  const [items, total] = await prisma.$transaction([
    prisma.activity.findMany({
      where,
      include: activityInclude,
      orderBy: activityOrderBy(),
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.activity.count({ where })
  ]);
  return { items, total, page, pageSize };
}

export async function getHomeActivities() {
  const take = 10;
  const [dailyDeals, femaleSelected, groupDeals, general] = await prisma.$transaction([
    prisma.activity.findMany({ where: { ...activeActivityWhere(), type: "DAILY_DEAL" }, include: activityInclude, orderBy: activityOrderBy(), take }),
    prisma.activity.findMany({ where: { ...activeActivityWhere(), type: "FEMALE_SELECTED" }, include: activityInclude, orderBy: activityOrderBy(), take }),
    prisma.activity.findMany({ where: { ...activeActivityWhere(), type: "GROUP_DEAL" }, include: activityInclude, orderBy: activityOrderBy(), take }),
    prisma.activity.findMany({ where: { ...activeActivityWhere(), type: "GENERAL" }, include: activityInclude, orderBy: activityOrderBy(), take })
  ]);
  return { dailyDeals, femaleSelected, groupDeals, general };
}

export async function getPublicActivity(id: string) {
  return prisma.activity.findFirst({
    where: { id, ...activeActivityWhere() },
    include: {
      ...activityInclude,
      merchant: {
        include: {
          category: true,
          coupons: {
            where: { status: "ACTIVE", validTo: { gte: new Date() } },
            orderBy: { createdAt: "desc" }
          }
        }
      }
    }
  });
}
