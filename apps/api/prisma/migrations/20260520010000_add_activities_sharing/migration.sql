CREATE TYPE "ActivityType" AS ENUM ('DAILY_DEAL', 'FEMALE_SELECTED', 'GROUP_DEAL', 'NIGHT_FOOD', 'GENERAL');
CREATE TYPE "ActivityStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED');
CREATE TYPE "ActivityPricingMode" AS ENUM ('FREE', 'CPC', 'CPA', 'FIXED');
CREATE TYPE "ShareTargetType" AS ENUM ('MERCHANT', 'COUPON', 'ACTIVITY');
CREATE TYPE "ShareEventType" AS ENUM ('SHARE_OPEN');

CREATE TABLE "Activity" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "description" TEXT,
  "type" "ActivityType" NOT NULL DEFAULT 'GENERAL',
  "merchantId" TEXT NOT NULL,
  "couponId" TEXT,
  "coverImage" TEXT,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "manualWeight" INTEGER NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 100,
  "budget" DECIMAL(65,30),
  "pricingMode" "ActivityPricingMode" NOT NULL DEFAULT 'FREE',
  "status" "ActivityStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShareLink" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "merchantId" TEXT,
  "couponId" TEXT,
  "activityId" TEXT,
  "targetType" "ShareTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "source" TEXT,
  "channel" TEXT,
  "scene" TEXT,
  "campaign" TEXT,
  "referrerId" TEXT,
  "token" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShareEvent" (
  "id" TEXT NOT NULL,
  "shareLinkId" TEXT NOT NULL,
  "activityId" TEXT,
  "merchantId" TEXT,
  "couponId" TEXT,
  "eventType" "ShareEventType" NOT NULL DEFAULT 'SHARE_OPEN',
  "sessionId" TEXT,
  "source" TEXT,
  "channel" TEXT,
  "scene" TEXT,
  "campaign" TEXT,
  "referrerId" TEXT,
  "ip" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShareEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ExposureLog" ADD COLUMN "activityId" TEXT, ADD COLUMN "shareLinkId" TEXT, ADD COLUMN "referrerId" TEXT;
ALTER TABLE "ClickLog" ADD COLUMN "activityId" TEXT, ADD COLUMN "shareLinkId" TEXT, ADD COLUMN "referrerId" TEXT;
ALTER TABLE "UserCoupon" ADD COLUMN "activityId" TEXT, ADD COLUMN "shareLinkId" TEXT, ADD COLUMN "referrerId" TEXT;
ALTER TABLE "CouponRedemption" ADD COLUMN "activityId" TEXT, ADD COLUMN "shareLinkId" TEXT, ADD COLUMN "referrerId" TEXT;

CREATE UNIQUE INDEX "ShareLink_token_key" ON "ShareLink"("token");
CREATE INDEX "Activity_status_type_startAt_endAt_manualWeight_sortOrder_idx" ON "Activity"("status", "type", "startAt", "endAt", "manualWeight", "sortOrder");
CREATE INDEX "Activity_merchantId_idx" ON "Activity"("merchantId");
CREATE INDEX "Activity_couponId_idx" ON "Activity"("couponId");
CREATE INDEX "ShareLink_targetType_targetId_idx" ON "ShareLink"("targetType", "targetId");
CREATE INDEX "ShareLink_activityId_idx" ON "ShareLink"("activityId");
CREATE INDEX "ShareLink_merchantId_idx" ON "ShareLink"("merchantId");
CREATE INDEX "ShareLink_couponId_idx" ON "ShareLink"("couponId");
CREATE INDEX "ShareLink_referrerId_idx" ON "ShareLink"("referrerId");
CREATE INDEX "ShareEvent_activityId_createdAt_idx" ON "ShareEvent"("activityId", "createdAt");
CREATE INDEX "ShareEvent_merchantId_createdAt_idx" ON "ShareEvent"("merchantId", "createdAt");
CREATE INDEX "ShareEvent_source_channel_createdAt_idx" ON "ShareEvent"("source", "channel", "createdAt");
CREATE INDEX "ExposureLog_activityId_createdAt_idx" ON "ExposureLog"("activityId", "createdAt");
CREATE INDEX "ExposureLog_shareLinkId_idx" ON "ExposureLog"("shareLinkId");
CREATE INDEX "ClickLog_activityId_createdAt_idx" ON "ClickLog"("activityId", "createdAt");
CREATE INDEX "ClickLog_shareLinkId_idx" ON "ClickLog"("shareLinkId");
CREATE INDEX "UserCoupon_activityId_claimedAt_idx" ON "UserCoupon"("activityId", "claimedAt");
CREATE INDEX "UserCoupon_shareLinkId_idx" ON "UserCoupon"("shareLinkId");
CREATE INDEX "UserCoupon_referrerId_idx" ON "UserCoupon"("referrerId");
CREATE INDEX "CouponRedemption_activityId_redeemedAt_idx" ON "CouponRedemption"("activityId", "redeemedAt");
CREATE INDEX "CouponRedemption_shareLinkId_idx" ON "CouponRedemption"("shareLinkId");
CREATE INDEX "CouponRedemption_referrerId_idx" ON "CouponRedemption"("referrerId");

ALTER TABLE "Activity" ADD CONSTRAINT "Activity_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExposureLog" ADD CONSTRAINT "ExposureLog_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExposureLog" ADD CONSTRAINT "ExposureLog_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClickLog" ADD CONSTRAINT "ClickLog_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClickLog" ADD CONSTRAINT "ClickLog_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
