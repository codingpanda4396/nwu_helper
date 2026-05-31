-- CreateTable
CREATE TABLE "DrivingPageConfig" (
    "id" TEXT NOT NULL DEFAULT 'driving-page',
    "title" TEXT NOT NULL DEFAULT '严选驾校',
    "description" TEXT NOT NULL DEFAULT '课少也能稳稳学车，就近练车、灵活约课、流程透明。',
    "promoImages" JSONB NOT NULL DEFAULT '[]',
    "qrImageUrl" TEXT,
    "qrTitle" TEXT NOT NULL DEFAULT '扫码咨询班型',
    "qrDescription" TEXT NOT NULL DEFAULT '报名优惠、练车时间和接送安排，以西大圈微信咨询为准。',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrivingPageConfig_pkey" PRIMARY KEY ("id")
);
