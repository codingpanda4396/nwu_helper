-- Analytics and tracking schema updates
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "loginCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "registerSource" TEXT;

ALTER TABLE "ViewHistory" DROP CONSTRAINT IF EXISTS "ViewHistory_userId_fkey";
DROP INDEX IF EXISTS "ViewHistory_userId_merchantId_key";
ALTER TABLE "ViewHistory"
ADD COLUMN IF NOT EXISTS "sessionId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "ViewHistory" ADD CONSTRAINT "ViewHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "action" TEXT NOT NULL,
    "page" TEXT,
    "targetId" TEXT,
    "platform" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserLoginLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLoginLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserDailySnapshot" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDailySnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "UserActivity_sessionId_createdAt_idx" ON "UserActivity"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "UserActivity_action_createdAt_idx" ON "UserActivity"("action", "createdAt");
CREATE INDEX IF NOT EXISTS "UserActivity_createdAt_idx" ON "UserActivity"("createdAt");
CREATE INDEX IF NOT EXISTS "UserActivity_page_createdAt_idx" ON "UserActivity"("page", "createdAt");

CREATE INDEX IF NOT EXISTS "UserLoginLog_userId_idx" ON "UserLoginLog"("userId");
CREATE INDEX IF NOT EXISTS "UserLoginLog_createdAt_idx" ON "UserLoginLog"("createdAt");
CREATE INDEX IF NOT EXISTS "UserLoginLog_method_createdAt_idx" ON "UserLoginLog"("method", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "UserDailySnapshot_date_key" ON "UserDailySnapshot"("date");
CREATE INDEX IF NOT EXISTS "UserDailySnapshot_date_idx" ON "UserDailySnapshot"("date");

CREATE INDEX IF NOT EXISTS "ViewHistory_userId_createdAt_idx" ON "ViewHistory"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ViewHistory_createdAt_idx" ON "ViewHistory"("createdAt");

ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserLoginLog" ADD CONSTRAINT "UserLoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Performance optimization indexes for high concurrency.
-- These indexes optimize the most frequent query patterns.

-- Merchant queries by status and category (used in publicRoutes)
CREATE INDEX IF NOT EXISTS "idx_merchant_status_category" ON "Merchant"("status", "categoryId");

-- Merchant queries by status and service category
CREATE INDEX IF NOT EXISTS "idx_merchant_status_service" ON "Merchant"("status", "serviceCategoryId");

-- Community posts by status and type (used in community listing)
CREATE INDEX IF NOT EXISTS "idx_community_post_status_type" ON "CommunityPost"("status", "type");

-- Activities by status and dates (used in home and listing)
CREATE INDEX IF NOT EXISTS "idx_activity_status_dates" ON "Activity"("status", "startAt", "endAt");

-- Banners by active status and sort order
CREATE INDEX IF NOT EXISTS "idx_banner_active_sort" ON "Banner"("isActive", "sortOrder");

-- Categories by active status and sort order
CREATE INDEX IF NOT EXISTS "idx_category_active_sort" ON "Category"("isActive", "sortOrder");

-- Service categories by active status and sort order
CREATE INDEX IF NOT EXISTS "idx_service_category_active_sort" ON "ServiceCategory"("isActive", "sortOrder");

-- User activities by action and date (for analytics)
CREATE INDEX IF NOT EXISTS "idx_user_activity_action_date" ON "UserActivity"("action", "createdAt");

-- View history by merchant and date
CREATE INDEX IF NOT EXISTS "idx_view_history_merchant_date" ON "ViewHistory"("merchantId", "createdAt");
