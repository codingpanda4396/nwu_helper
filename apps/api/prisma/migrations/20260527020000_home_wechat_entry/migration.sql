CREATE TABLE "WechatEntryConfig" (
  "id" TEXT NOT NULL DEFAULT 'home-wechat-entry',
  "title" TEXT NOT NULL DEFAULT '加入西大圈微信',
  "description" TEXT NOT NULL DEFAULT '领活动、问优惠、推荐好店、反馈问题，都从这里开始。',
  "buttonText" TEXT NOT NULL DEFAULT '添加微信',
  "imageUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WechatEntryConfig_pkey" PRIMARY KEY ("id")
);

INSERT INTO "WechatEntryConfig" ("id", "title", "description", "buttonText", "imageUrl", "isActive", "updatedAt")
VALUES ('home-wechat-entry', '加入西大圈微信', '领活动、问优惠、推荐好店、反馈问题，都从这里开始。', '添加微信', '/assets/images/h5-wechat-promo.png', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
