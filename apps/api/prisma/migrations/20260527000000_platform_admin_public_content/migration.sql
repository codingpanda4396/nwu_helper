CREATE TYPE "BannerTargetType" AS ENUM ('ACTIVITY', 'SERVICE', 'ABOUT', 'TAB', 'URL');
CREATE TYPE "CommunityPostStatus" AS ENUM ('VISIBLE', 'HIDDEN');

ALTER TABLE "Merchant"
  ADD COLUMN "foodCategory" TEXT,
  ADD COLUMN "serviceCategoryId" TEXT,
  ADD COLUMN "avgPrice" DECIMAL(65,30),
  ADD COLUMN "distanceText" TEXT,
  ADD COLUMN "tags" JSONB,
  ADD COLUMN "highlights" JSONB,
  ADD COLUMN "menu" JSONB,
  ADD COLUMN "qrImageUrl" TEXT,
  ADD COLUMN "recommendation" TEXT,
  ADD COLUMN "randomWeight" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "isFoodRecommendation" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isServicePublished" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Banner" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "imageUrl" TEXT NOT NULL,
  "targetType" "BannerTargetType" NOT NULL DEFAULT 'TAB',
  "targetId" TEXT,
  "url" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 100,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "icon" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 100,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityPost" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "likeCount" INTEGER NOT NULL DEFAULT 0,
  "commentCount" INTEGER NOT NULL DEFAULT 0,
  "status" "CommunityPostStatus" NOT NULL DEFAULT 'VISIBLE',
  "sortOrder" INTEGER NOT NULL DEFAULT 100,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceCategory_key_key" ON "ServiceCategory"("key");
CREATE INDEX "Banner_isActive_sortOrder_idx" ON "Banner"("isActive", "sortOrder");
CREATE INDEX "ServiceCategory_isActive_sortOrder_idx" ON "ServiceCategory"("isActive", "sortOrder");
CREATE INDEX "CommunityPost_status_type_sortOrder_publishedAt_idx" ON "CommunityPost"("status", "type", "sortOrder", "publishedAt");
CREATE INDEX "Merchant_serviceCategoryId_idx" ON "Merchant"("serviceCategoryId");
CREATE INDEX "Merchant_foodCategory_isFoodRecommendation_status_idx" ON "Merchant"("foodCategory", "isFoodRecommendation", "status");

ALTER TABLE "Merchant"
  ADD CONSTRAINT "Merchant_serviceCategoryId_fkey"
  FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
