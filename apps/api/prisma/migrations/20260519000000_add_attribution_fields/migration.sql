ALTER TABLE "ExposureLog" ADD COLUMN "channel" TEXT;
ALTER TABLE "ExposureLog" ADD COLUMN "scene" TEXT;
ALTER TABLE "ExposureLog" ADD COLUMN "campaign" TEXT;

ALTER TABLE "ClickLog" ADD COLUMN "source" TEXT;
ALTER TABLE "ClickLog" ADD COLUMN "channel" TEXT;
ALTER TABLE "ClickLog" ADD COLUMN "scene" TEXT;
ALTER TABLE "ClickLog" ADD COLUMN "campaign" TEXT;

ALTER TABLE "UserCoupon" ADD COLUMN "source" TEXT;
ALTER TABLE "UserCoupon" ADD COLUMN "channel" TEXT;
ALTER TABLE "UserCoupon" ADD COLUMN "scene" TEXT;
ALTER TABLE "UserCoupon" ADD COLUMN "campaign" TEXT;
ALTER TABLE "UserCoupon" ADD COLUMN "claimedSessionId" TEXT;

ALTER TABLE "CouponRedemption" ADD COLUMN "source" TEXT;
ALTER TABLE "CouponRedemption" ADD COLUMN "channel" TEXT;
ALTER TABLE "CouponRedemption" ADD COLUMN "scene" TEXT;
ALTER TABLE "CouponRedemption" ADD COLUMN "campaign" TEXT;
ALTER TABLE "CouponRedemption" ADD COLUMN "claimedSessionId" TEXT;

CREATE INDEX "ExposureLog_merchantId_source_channel_createdAt_idx" ON "ExposureLog"("merchantId", "source", "channel", "createdAt");
CREATE INDEX "ClickLog_merchantId_source_channel_createdAt_idx" ON "ClickLog"("merchantId", "source", "channel", "createdAt");
CREATE INDEX "UserCoupon_merchantId_source_channel_claimedAt_idx" ON "UserCoupon"("merchantId", "source", "channel", "claimedAt");
CREATE INDEX "CouponRedemption_merchantId_source_channel_redeemedAt_idx" ON "CouponRedemption"("merchantId", "source", "channel", "redeemedAt");
