import type { Merchant, MerchantPromotion } from "@prisma/client";

export type MerchantRankInput = Pick<Merchant, "platformBoost" | "sortOrder" | "rating" | "createdAt"> & {
  promotions?: Pick<MerchantPromotion, "boostWeight" | "startAt" | "endAt" | "isActive">[];
};

export function activePromotionBoost(merchant: MerchantRankInput, now = new Date()) {
  return (merchant.promotions ?? [])
    .filter((promotion) => promotion.isActive && promotion.startAt <= now && promotion.endAt >= now)
    .reduce((sum, promotion) => sum + promotion.boostWeight, 0);
}

export function compareMerchants(a: MerchantRankInput, b: MerchantRankInput, now = new Date()) {
  const boostDiff = b.platformBoost + activePromotionBoost(b, now) - (a.platformBoost + activePromotionBoost(a, now));
  if (boostDiff !== 0) return boostDiff;

  const sortDiff = a.sortOrder - b.sortOrder;
  if (sortDiff !== 0) return sortDiff;

  const ratingDiff = Number(b.rating) - Number(a.rating);
  if (ratingDiff !== 0) return ratingDiff;

  return b.createdAt.getTime() - a.createdAt.getTime();
}
