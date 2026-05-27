import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";

const activeActivityWhere = (now = new Date()) =>
  ({
    status: "ACTIVE",
    startAt: { lte: now },
    endAt: { gte: now },
    merchant: { status: "APPROVED" }
  }) satisfies Prisma.ActivityWhereInput;

export const activityInclude = {
  merchant: { include: { category: true } }
} satisfies Prisma.ActivityInclude;

export function activityOrderBy() {
  return [{ sortOrder: "asc" as const }, { startAt: "desc" as const }];
}

export async function listPublicActivities(input: { page?: number; pageSize?: number }) {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 20;
  const where = activeActivityWhere();
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
  return prisma.activity.findMany({
    where: activeActivityWhere(),
    include: activityInclude,
    orderBy: activityOrderBy(),
    take
  });
}

export async function getPublicActivity(id: string) {
  return prisma.activity.findFirst({
    where: { id, ...activeActivityWhere() },
    include: {
      ...activityInclude,
      merchant: {
        include: {
          category: true
        }
      }
    }
  });
}
