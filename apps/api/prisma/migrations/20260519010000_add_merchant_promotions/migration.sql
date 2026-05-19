CREATE TYPE "PricingMode" AS ENUM ('MANUAL', 'CPC', 'CPA');
CREATE TYPE "PromotionSource" AS ENUM ('MANUAL', 'CAMPAIGN', 'BIDDING_RESERVED');

CREATE TABLE "MerchantPromotion" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "couponId" TEXT,
    "name" TEXT NOT NULL,
    "source" "PromotionSource" NOT NULL DEFAULT 'MANUAL',
    "pricingMode" "PricingMode" NOT NULL DEFAULT 'MANUAL',
    "boostWeight" INTEGER NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "budget" DECIMAL(65,30),
    "cpc" DECIMAL(65,30),
    "cpa" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantPromotion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MerchantPromotion_merchantId_isActive_startAt_endAt_idx" ON "MerchantPromotion"("merchantId", "isActive", "startAt", "endAt");
CREATE INDEX "MerchantPromotion_couponId_idx" ON "MerchantPromotion"("couponId");

ALTER TABLE "MerchantPromotion" ADD CONSTRAINT "MerchantPromotion_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MerchantPromotion" ADD CONSTRAINT "MerchantPromotion_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
