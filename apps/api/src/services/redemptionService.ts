import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";

export function maskPhone(phone: string | null | undefined) {
  if (!phone) return null;
  if (phone.length < 8) return phone.replace(/.(?=.{2})/g, "*");
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export async function previewRedemptionCode(merchantId: string, code: string) {
  const userCoupon = await prisma.userCoupon.findUnique({
    where: { code },
    include: { coupon: true, user: true, redemption: true }
  });
  if (!userCoupon || userCoupon.merchantId !== merchantId) throw new Error("CODE_NOT_FOUND");
  return {
    userCouponId: userCoupon.id,
    code: userCoupon.code,
    couponTitle: userCoupon.coupon.title,
    maskedPhone: maskPhone(userCoupon.user.phone),
    claimedAt: userCoupon.claimedAt,
    validTo: userCoupon.coupon.validTo,
    isExpired: userCoupon.coupon.validTo < new Date(),
    isRedeemed: Boolean(userCoupon.redemption),
    redeemedAt: userCoupon.redemption?.redeemedAt ?? null,
    source: userCoupon.source,
    channel: userCoupon.channel,
    scene: userCoupon.scene,
    campaign: userCoupon.campaign
  };
}

export async function redeemCouponCode(merchantId: string, code: string, amount?: number) {
  return prisma.$transaction(async (tx) => {
    const userCoupon = await tx.userCoupon.findUnique({
      where: { code },
      include: { coupon: true, redemption: true }
    });
    if (!userCoupon || userCoupon.merchantId !== merchantId) throw new Error("CODE_NOT_FOUND");
    if (userCoupon.status === "USED" || userCoupon.redemption) throw new Error("ALREADY_USED");
    if (userCoupon.coupon.validTo < new Date()) throw new Error("COUPON_EXPIRED");

    await tx.userCoupon.update({ where: { id: userCoupon.id }, data: { status: "USED", usedAt: new Date() } });
    try {
      return await tx.couponRedemption.create({
        data: {
          userCouponId: userCoupon.id,
          couponId: userCoupon.couponId,
          merchantId: userCoupon.merchantId,
          studentId: userCoupon.userId,
          amount,
          source: userCoupon.source,
          channel: userCoupon.channel,
          scene: userCoupon.scene,
          campaign: userCoupon.campaign,
          activityId: userCoupon.activityId,
          shareLinkId: userCoupon.shareLinkId,
          referrerId: userCoupon.referrerId,
          claimedSessionId: userCoupon.claimedSessionId
        },
        include: { coupon: true, student: true, userCoupon: true }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("ALREADY_USED");
      }
      throw error;
    }
  });
}
