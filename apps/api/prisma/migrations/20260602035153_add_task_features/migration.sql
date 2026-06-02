-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('VISIBLE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'REFUNDED');

-- DropIndex
DROP INDEX "idx_activity_status_dates";

-- DropIndex
DROP INDEX "idx_category_active_sort";

-- DropIndex
DROP INDEX "idx_community_post_status_type";

-- DropIndex
DROP INDEX "idx_merchant_status_category";

-- DropIndex
DROP INDEX "idx_merchant_status_service";

-- DropIndex
DROP INDEX "ViewHistory_userId_idx";

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "promotionOrderId" TEXT;

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "promotionOrderId" TEXT;

-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN     "authorUserId" TEXT,
ADD COLUMN     "images" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "ownerUserId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "nickname" TEXT;

-- CreateTable
CREATE TABLE "SmsCode" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorUserId" TEXT,
    "authorNickname" TEXT,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'VISIBLE',
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionSlot" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "pricePerDay" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionOrder" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "bannerId" TEXT,
    "activityId" TEXT,
    "days" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsCode_phone_createdAt_idx" ON "SmsCode"("phone", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "PostLike_postId_idx" ON "PostLike"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionSlot_key_key" ON "PromotionSlot"("key");

-- CreateIndex
CREATE INDEX "PromotionOrder_merchantId_idx" ON "PromotionOrder"("merchantId");

-- CreateIndex
CREATE INDEX "PromotionOrder_status_endAt_idx" ON "PromotionOrder"("status", "endAt");

-- CreateIndex
CREATE INDEX "Merchant_ownerUserId_idx" ON "Merchant"("ownerUserId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_view_history_merchant_date" RENAME TO "ViewHistory_merchantId_createdAt_idx";
