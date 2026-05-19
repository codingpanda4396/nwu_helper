CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'MERCHANT', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "MerchantStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "CouponStatus" AS ENUM ('ACTIVE', 'PAUSED', 'EXPIRED');
CREATE TYPE "UserCouponStatus" AS ENUM ('CLAIMED', 'USED', 'EXPIRED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "openid" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
  "passwordHash" TEXT,
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "icon" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 100,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Merchant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "summary" TEXT,
  "description" TEXT,
  "categoryId" TEXT NOT NULL,
  "ownerUserId" TEXT,
  "address" TEXT NOT NULL,
  "phone" TEXT,
  "businessHours" TEXT,
  "coverImageUrl" TEXT,
  "status" "MerchantStatus" NOT NULL DEFAULT 'PENDING',
  "rating" DECIMAL(65,30) NOT NULL DEFAULT 4.8,
  "sortOrder" INTEGER NOT NULL DEFAULT 100,
  "platformBoost" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Coupon" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "threshold" DECIMAL(65,30),
  "discountValue" DECIMAL(65,30),
  "totalStock" INTEGER NOT NULL,
  "remainingStock" INTEGER NOT NULL,
  "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validTo" TIMESTAMP(3) NOT NULL,
  "status" "CouponStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserCoupon" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "couponId" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "status" "UserCouponStatus" NOT NULL DEFAULT 'CLAIMED',
  "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "usedAt" TIMESTAMP(3),
  CONSTRAINT "UserCoupon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CouponRedemption" (
  "id" TEXT NOT NULL,
  "userCouponId" TEXT NOT NULL,
  "couponId" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "amount" DECIMAL(65,30),
  "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExposureLog" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "sessionId" TEXT,
  "source" TEXT,
  "userAgent" TEXT,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExposureLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClickLog" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "sessionId" TEXT,
  "target" TEXT,
  "userAgent" TEXT,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClickLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_openid_key" ON "User"("openid");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Merchant_ownerUserId_key" ON "Merchant"("ownerUserId");
CREATE INDEX "Merchant_categoryId_idx" ON "Merchant"("categoryId");
CREATE INDEX "Merchant_status_platformBoost_sortOrder_rating_createdAt_idx" ON "Merchant"("status", "platformBoost", "sortOrder", "rating", "createdAt");
CREATE INDEX "Coupon_merchantId_status_validTo_idx" ON "Coupon"("merchantId", "status", "validTo");
CREATE UNIQUE INDEX "UserCoupon_code_key" ON "UserCoupon"("code");
CREATE UNIQUE INDEX "UserCoupon_userId_couponId_key" ON "UserCoupon"("userId", "couponId");
CREATE INDEX "UserCoupon_merchantId_status_claimedAt_idx" ON "UserCoupon"("merchantId", "status", "claimedAt");
CREATE UNIQUE INDEX "CouponRedemption_userCouponId_key" ON "CouponRedemption"("userCouponId");
CREATE INDEX "CouponRedemption_merchantId_redeemedAt_idx" ON "CouponRedemption"("merchantId", "redeemedAt");
CREATE INDEX "ExposureLog_merchantId_createdAt_idx" ON "ExposureLog"("merchantId", "createdAt");
CREATE INDEX "ClickLog_merchantId_createdAt_idx" ON "ClickLog"("merchantId", "createdAt");

ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_userCouponId_fkey" FOREIGN KEY ("userCouponId") REFERENCES "UserCoupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExposureLog" ADD CONSTRAINT "ExposureLog_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClickLog" ADD CONSTRAINT "ClickLog_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
