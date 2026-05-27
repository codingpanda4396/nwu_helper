import type { Prisma } from "@prisma/client";
import { assertCouponClaimable } from "../localLife.js";
import { prisma } from "../db.js";
import { attributionData, type AttributionInput } from "./attributionService.js";

export type ClaimCouponPayload = AttributionInput & {
  studentName: string;
  phone: string;
  openid?: string;
};

export async function claimCoupon(couponId: string, payload: ClaimCouponPayload) {
  return prisma.$transaction(async (tx) => {
    const coupon = await tx.coupon.findUnique({ where: { id: couponId }, include: { merchant: true } });
    if (!coupon || coupon.merchant.status !== "APPROVED") throw new Error("COUPON_NOT_FOUND");

    const claimable = assertCouponClaimable(coupon);
    if (!claimable.ok) throw new Error(claimable.code);

    const user = await tx.user.upsert({
      where: { phone: payload.phone },
      update: { name: payload.studentName, openid: payload.openid },
      create: { name: payload.studentName, phone: payload.phone, openid: payload.openid, role: "STUDENT" }
    });

    const existing = await tx.userCoupon.findUnique({ where: { userId_couponId: { userId: user.id, couponId: coupon.id } } });
    if (existing) throw new Error("DUPLICATE_CLAIM");

    await tx.coupon.update({ where: { id: coupon.id }, data: { remainingStock: { decrement: 1 } } });
    return tx.userCoupon.create({
      data: {
        userId: user.id,
        couponId: coupon.id,
        merchantId: coupon.merchantId,
        code: Math.random().toString(36).slice(2, 10).toUpperCase(),
        ...attributionData(payload),
        claimedSessionId: payload.sessionId || null
      } satisfies Prisma.UserCouponUncheckedCreateInput,
      include: { coupon: true, merchant: true, user: true }
    });
  });
}
