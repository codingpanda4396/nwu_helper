-- Shift tracking toward lightweight local-life information services and private-domain attribution.

ALTER TABLE "Merchant"
ADD COLUMN IF NOT EXISTS "wechatLabel" TEXT,
ADD COLUMN IF NOT EXISTS "privateDomainNote" TEXT,
ADD COLUMN IF NOT EXISTS "defaultChannelId" TEXT;

ALTER TABLE "Activity"
ADD COLUMN IF NOT EXISTS "channelId" TEXT,
ADD COLUMN IF NOT EXISTS "source" TEXT;

CREATE TABLE IF NOT EXISTS "AttributionChannel" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "campaign" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributionChannel_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "UserActivity"
ADD COLUMN IF NOT EXISTS "merchantId" TEXT,
ADD COLUMN IF NOT EXISTS "activityId" TEXT,
ADD COLUMN IF NOT EXISTS "channelId" TEXT,
ADD COLUMN IF NOT EXISTS "source" TEXT,
ADD COLUMN IF NOT EXISTS "scene" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "AttributionChannel_key_key" ON "AttributionChannel"("key");
CREATE INDEX IF NOT EXISTS "AttributionChannel_isActive_key_idx" ON "AttributionChannel"("isActive", "key");

CREATE INDEX IF NOT EXISTS "Merchant_defaultChannelId_idx" ON "Merchant"("defaultChannelId");
CREATE INDEX IF NOT EXISTS "Activity_channelId_idx" ON "Activity"("channelId");
CREATE INDEX IF NOT EXISTS "UserActivity_merchantId_createdAt_idx" ON "UserActivity"("merchantId", "createdAt");
CREATE INDEX IF NOT EXISTS "UserActivity_activityId_createdAt_idx" ON "UserActivity"("activityId", "createdAt");
CREATE INDEX IF NOT EXISTS "UserActivity_channelId_createdAt_idx" ON "UserActivity"("channelId", "createdAt");
CREATE INDEX IF NOT EXISTS "UserActivity_source_createdAt_idx" ON "UserActivity"("source", "createdAt");
