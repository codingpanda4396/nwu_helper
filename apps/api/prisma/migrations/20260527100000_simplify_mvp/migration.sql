-- DropForeignKey
ALTER TABLE "Merchant" DROP CONSTRAINT IF EXISTS "Merchant_ownerUserId_fkey";

-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT IF EXISTS "Coupon_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "UserCoupon" DROP CONSTRAINT IF EXISTS "UserCoupon_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserCoupon" DROP CONSTRAINT IF EXISTS "UserCoupon_couponId_fkey";

-- DropForeignKey
ALTER TABLE "UserCoupon" DROP CONSTRAINT IF EXISTS "UserCoupon_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "UserCoupon" DROP CONSTRAINT IF EXISTS "UserCoupon_activityId_fkey";

-- DropForeignKey
ALTER TABLE "UserCoupon" DROP CONSTRAINT IF EXISTS "UserCoupon_shareLinkId_fkey";

-- DropForeignKey
ALTER TABLE "ExposureLog" DROP CONSTRAINT IF EXISTS "ExposureLog_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "ExposureLog" DROP CONSTRAINT IF EXISTS "ExposureLog_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ExposureLog" DROP CONSTRAINT IF EXISTS "ExposureLog_shareLinkId_fkey";

-- DropForeignKey
ALTER TABLE "ClickLog" DROP CONSTRAINT IF EXISTS "ClickLog_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "ClickLog" DROP CONSTRAINT IF EXISTS "ClickLog_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ClickLog" DROP CONSTRAINT IF EXISTS "ClickLog_shareLinkId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT IF EXISTS "Activity_couponId_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT IF EXISTS "ShareLink_userId_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT IF EXISTS "ShareLink_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT IF EXISTS "ShareLink_couponId_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT IF EXISTS "ShareLink_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ShareEvent" DROP CONSTRAINT IF EXISTS "ShareEvent_shareLinkId_fkey";

-- DropForeignKey
ALTER TABLE "ShareEvent" DROP CONSTRAINT IF EXISTS "ShareEvent_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ShareEvent" DROP CONSTRAINT IF EXISTS "ShareEvent_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "ShareEvent" DROP CONSTRAINT IF EXISTS "ShareEvent_couponId_fkey";

-- DropForeignKey
ALTER TABLE "MerchantPromotion" DROP CONSTRAINT IF EXISTS "MerchantPromotion_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "MerchantPromotion" DROP CONSTRAINT IF EXISTS "MerchantPromotion_couponId_fkey";

-- DropTable
DROP TABLE IF EXISTS "Coupon";

-- DropTable
DROP TABLE IF EXISTS "UserCoupon";

-- DropTable
DROP TABLE IF EXISTS "ExposureLog";

-- DropTable
DROP TABLE IF EXISTS "ClickLog";

-- DropTable
DROP TABLE IF EXISTS "ShareLink";

-- DropTable
DROP TABLE IF EXISTS "ShareEvent";

-- DropTable
DROP TABLE IF EXISTS "MerchantPromotion";

-- DropEnum
DROP TYPE IF EXISTS "CouponStatus";

-- DropEnum
DROP TYPE IF EXISTS "UserCouponStatus";

-- DropEnum
DROP TYPE IF EXISTS "PricingMode";

-- DropEnum
DROP TYPE IF EXISTS "ActivityType";

-- DropEnum
DROP TYPE IF EXISTS "ActivityPricingMode";

-- DropEnum
DROP TYPE IF EXISTS "PromotionSource";

-- DropEnum
DROP TYPE IF EXISTS "ShareTargetType";

-- DropEnum
DROP TYPE IF EXISTS "ShareEventType";

-- AlterTable: Merchant - remove unused columns
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "description";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "ownerUserId";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "foodCategory";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "avgPrice";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "distanceText";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "tags";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "highlights";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "menu";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "randomWeight";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "isFoodRecommendation";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "isServicePublished";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "rating";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "platformBoost";
ALTER TABLE "Merchant" DROP COLUMN IF EXISTS "recommendation";

-- AlterTable: Activity - remove unused columns
ALTER TABLE "Activity" DROP COLUMN IF EXISTS "subtitle";
ALTER TABLE "Activity" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Activity" DROP COLUMN IF EXISTS "couponId";
ALTER TABLE "Activity" DROP COLUMN IF EXISTS "manualWeight";
ALTER TABLE "Activity" DROP COLUMN IF EXISTS "budget";
ALTER TABLE "Activity" DROP COLUMN IF EXISTS "pricingMode";

-- DropIndex
DROP INDEX IF EXISTS "Merchant_foodCategory_isFoodRecommendation_status_idx";

-- AlterTable: User - remove MERCHANT role (will be handled by data migration)
-- Note: We'll keep existing users but they can be cleaned up manually

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Merchant_status_sortOrder_idx" ON "Merchant"("status", "sortOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Activity_status_startAt_endAt_sortOrder_idx" ON "Activity"("status", "startAt", "endAt", "sortOrder");
