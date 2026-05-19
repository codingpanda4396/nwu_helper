import type { Coupon, Merchant } from "@prisma/client";
export { compareMerchants, type MerchantRankInput } from "./services/rankingService.js";

export function assertCouponClaimable(coupon: Pick<Coupon, "status" | "remainingStock" | "validFrom" | "validTo">, now = new Date()) {
  if (coupon.status !== "ACTIVE") return { ok: false as const, code: "COUPON_INACTIVE", message: "优惠券暂不可领取" };
  if (coupon.validFrom > now) return { ok: false as const, code: "COUPON_NOT_STARTED", message: "优惠券尚未开始" };
  if (coupon.validTo < now) return { ok: false as const, code: "COUPON_EXPIRED", message: "优惠券已过期" };
  if (coupon.remainingStock <= 0) return { ok: false as const, code: "COUPON_SOLD_OUT", message: "优惠券已领完" };
  return { ok: true as const };
}

export function makeRedemptionCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + Date.now().toString().slice(-6);
}
