-- Performance optimization indexes for high concurrency
-- These indexes optimize the most frequent query patterns

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
