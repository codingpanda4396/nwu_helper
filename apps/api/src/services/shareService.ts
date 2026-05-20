import crypto from "node:crypto";
import type { ShareTargetType } from "@prisma/client";
import { prisma } from "../db.js";
import { attributionData, type AttributionInput } from "./attributionService.js";

export type CreateShareLinkInput = AttributionInput & {
  userId?: string | null;
  merchantId?: string | null;
  couponId?: string | null;
  activityId?: string | null;
  targetType: ShareTargetType;
  targetId: string;
};

function makeShareToken() {
  return crypto.randomBytes(9).toString("base64url");
}

export async function createShareLink(input: CreateShareLinkInput) {
  const attribution = attributionData(input);
  return prisma.shareLink.create({
    data: {
      userId: input.userId || null,
      merchantId: input.merchantId || null,
      couponId: input.couponId || null,
      activityId: input.activityId || null,
      targetType: input.targetType,
      targetId: input.targetId,
      source: attribution.source,
      channel: attribution.channel,
      scene: attribution.scene,
      campaign: attribution.campaign,
      referrerId: attribution.referrerId,
      token: makeShareToken()
    }
  });
}

export async function openShareLink(token: string, input: AttributionInput & { ip?: string; userAgent?: string }) {
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: { activity: true, merchant: true, coupon: true }
  });
  if (!shareLink) throw new Error("SHARE_LINK_NOT_FOUND");
  const attribution = attributionData({
    source: input.source ?? shareLink.source,
    channel: input.channel ?? shareLink.channel,
    scene: input.scene ?? shareLink.scene,
    campaign: input.campaign ?? shareLink.campaign,
    referrerId: input.referrerId ?? shareLink.referrerId,
    sessionId: input.sessionId
  });
  await prisma.shareEvent.create({
    data: {
      shareLinkId: shareLink.id,
      activityId: shareLink.activityId,
      merchantId: shareLink.merchantId,
      couponId: shareLink.couponId,
      source: attribution.source,
      channel: attribution.channel,
      scene: attribution.scene,
      campaign: attribution.campaign,
      referrerId: attribution.referrerId,
      sessionId: input.sessionId || null,
      ip: input.ip,
      userAgent: input.userAgent
    }
  });
  return shareLink;
}
