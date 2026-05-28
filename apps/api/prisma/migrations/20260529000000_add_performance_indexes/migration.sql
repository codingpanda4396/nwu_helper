-- Performance optimization indexes for high concurrency
-- These indexes optimize the most frequent query patterns

-- Merchant queries by status and category (used in publicRoutes)
CREATE INDEX IF NOT EXISTS idx_merchant_status_category ON merchants(status, category_id);

-- Merchant queries by status and service category
CREATE INDEX IF NOT EXISTS idx_merchant_status_service ON merchants(status, service_category_id);

-- Community posts by status and type (used in community listing)
CREATE INDEX IF NOT EXISTS idx_community_post_status_type ON community_posts(status, type);

-- Activities by status and dates (used in home and listing)
CREATE INDEX IF NOT EXISTS idx_activity_status_dates ON activities(status, start_at, end_at);

-- Banners by active status and sort order
CREATE INDEX IF NOT EXISTS idx_banner_active_sort ON banners(is_active, sort_order);

-- Categories by active status and sort order
CREATE INDEX IF NOT EXISTS idx_category_active_sort ON categories(is_active, sort_order);

-- Service categories by active status and sort order
CREATE INDEX IF NOT EXISTS idx_service_category_active_sort ON service_categories(is_active, sort_order);

-- User activities by action and date (for analytics)
CREATE INDEX IF NOT EXISTS idx_user_activity_action_date ON user_activities(action, created_at);

-- View history by merchant and date
CREATE INDEX IF NOT EXISTS idx_view_history_merchant_date ON view_histories(merchant_id, created_at);
