import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "美食", slug: "food", icon: "utensils", sortOrder: 10 },
  { name: "驾校", slug: "driving", icon: "car", sortOrder: 20 },
  { name: "打印", slug: "printing", icon: "printer", sortOrder: 30 },
  { name: "美甲", slug: "nails", icon: "sparkles", sortOrder: 40 },
  { name: "租房", slug: "rent", icon: "home", sortOrder: 50 },
  { name: "二手", slug: "second-hand", icon: "repeat", sortOrder: 60 },
  { name: "生活服务", slug: "services", icon: "wrench", sortOrder: 70 }
];

async function main() {
  const adminPassword = await bcrypt.hash("123456", 10);
  const merchantPassword = await bcrypt.hash("merchant123456", 10);
  const demoMerchantPassword = await bcrypt.hash("123456", 10);

  await prisma.user.updateMany({
    where: { username: "panda", role: { not: "ADMIN" } },
    data: { username: null }
  });

  await prisma.user.upsert({
    where: { phone: "18800000000" },
    update: { name: "平台管理员", username: "panda", role: "ADMIN", passwordHash: adminPassword },
    create: { name: "平台管理员", username: "panda", phone: "18800000000", role: "ADMIN", passwordHash: adminPassword }
  });

  const categoryRecords = new Map<string, { id: string }>();
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
    categoryRecords.set(category.slug, record);
  }

  const merchantOwners = await Promise.all([
    prisma.user.upsert({
      where: { phone: "18800000011" },
      update: { name: "饭点小馆店长", username: "food-owner", role: "MERCHANT", passwordHash: demoMerchantPassword },
      create: { name: "饭点小馆店长", username: "food-owner", phone: "18800000011", role: "MERCHANT", passwordHash: demoMerchantPassword }
    }),
    prisma.user.upsert({
      where: { phone: "18800000012" },
      update: { name: "星火打印店长", role: "MERCHANT", passwordHash: merchantPassword },
      create: { name: "星火打印店长", phone: "18800000012", role: "MERCHANT", passwordHash: merchantPassword }
    }),
    prisma.user.upsert({
      where: { phone: "18800000013" },
      update: { name: "长安驾培顾问", role: "MERCHANT", passwordHash: merchantPassword },
      create: { name: "长安驾培顾问", phone: "18800000013", role: "MERCHANT", passwordHash: merchantPassword }
    })
  ]);

  const serviceCategories = [
    { key: "printing", name: "打印", icon: "打印", sortOrder: 10 },
    { key: "ktv", name: "KTV", icon: "欢唱", sortOrder: 20 },
    { key: "rent", name: "租房", icon: "租住", sortOrder: 30 },
    { key: "care", name: "洗护理发", icon: "洗护", sortOrder: 40 },
    { key: "play", name: "台球 KTV", icon: "娱乐", sortOrder: 50 },
    { key: "job", name: "兼职", icon: "兼职", sortOrder: 60 }
  ];

  const serviceCategoryRecords = new Map<string, { id: string }>();
  for (const category of serviceCategories) {
    const record = await prisma.serviceCategory.upsert({
      where: { key: category.key },
      update: category,
      create: category
    });
    serviceCategoryRecords.set(category.key, record);
  }

  const merchants = [
    {
      id: "seed-merchant-food",
      name: "饭点小馆",
      summary: "西大南门人均 25 元的热炒和简餐",
      description: "适合宿舍聚餐和课后快餐，凭券到店可享学生专属套餐。",
      categoryId: categoryRecords.get("food")!.id,
      ownerUserId: merchantOwners[0].id,
      address: "西北大学长安校区南门外学府大街 18 号",
      phone: "029-88880011",
      businessHours: "10:30-22:00",
      coverImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      foodCategory: "fast-food",
      serviceCategoryId: null,
      avgPrice: 25,
      distanceText: "距西大长安校区约 1.2km",
      tags: ["热炒", "简餐", "学生优惠"],
      highlights: ["出餐快", "近南门", "学生套餐"],
      menu: [{ name: "招牌盖饭", price: 18 }, { name: "双人热炒套餐", price: 58 }],
      qrImageUrl: "/assets/images/qr-placeholder.jpg",
      recommendation: "适合下课后和舍友一起吃顿热饭。",
      randomWeight: 10,
      isFoodRecommendation: true,
      isServicePublished: false,
      status: "APPROVED" as const,
      rating: 4.8,
      sortOrder: 10,
      platformBoost: 30
    },
    {
      id: "seed-merchant-print",
      name: "星火图文打印",
      summary: "论文、海报、证件照一站式打印",
      description: "支持微信传文件、宿舍楼下自取，课程资料批量打印更优惠。",
      categoryId: categoryRecords.get("printing")!.id,
      ownerUserId: merchantOwners[1].id,
      address: "西北大学长安校区东门商业街 B12",
      phone: "029-88880012",
      businessHours: "08:30-23:00",
      coverImageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
      foodCategory: null,
      serviceCategoryId: serviceCategoryRecords.get("printing")!.id,
      avgPrice: 8,
      distanceText: "距西大长安校区约 600m",
      tags: ["打印", "装订", "证件照"],
      highlights: ["营业时间长", "支持微信传文件", "可开票"],
      menu: [{ name: "黑白打印", price: 0.2 }, { name: "普通装订", price: 5 }],
      qrImageUrl: "/assets/images/qr-placeholder.jpg",
      recommendation: "课程材料、社团海报和论文装订都能处理。",
      randomWeight: 0,
      isFoodRecommendation: false,
      isServicePublished: true,
      status: "APPROVED" as const,
      rating: 4.7,
      sortOrder: 20,
      platformBoost: 20
    },
    {
      id: "seed-merchant-driving",
      name: "长安校园驾培",
      summary: "校车接送，寒暑假集中训练",
      description: "面向西大、长安大学学生的本地驾校咨询点，提供班型咨询和报名优惠。",
      categoryId: categoryRecords.get("driving")!.id,
      ownerUserId: merchantOwners[2].id,
      address: "郭杜教育科技产业园驾培服务点",
      phone: "029-88880013",
      businessHours: "09:00-20:00",
      coverImageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      foodCategory: null,
      serviceCategoryId: null,
      avgPrice: 2600,
      distanceText: "校车接送",
      tags: ["驾校", "校车", "学生优惠"],
      highlights: ["近学校", "接送方便", "寒暑假班"],
      menu: [{ name: "学生优惠班", price: 2600 }, { name: "寒暑假集中班", price: 3200 }],
      qrImageUrl: "/assets/images/qr-placeholder.jpg",
      recommendation: "适合假期集中练车，咨询后再确认班型。",
      randomWeight: 0,
      isFoodRecommendation: false,
      isServicePublished: false,
      status: "APPROVED" as const,
      rating: 4.6,
      sortOrder: 30,
      platformBoost: 10
    },
    {
      id: "seed-merchant-care",
      name: "南门轻护理发",
      summary: "洗剪吹、洗护和基础造型",
      description: "适合学生日常理发和临时整理造型，支持微信预约。",
      categoryId: categoryRecords.get("services")!.id,
      ownerUserId: null,
      address: "西北大学长安校区南门生活广场 2 楼",
      phone: "029-88880014",
      businessHours: "10:00-22:00",
      coverImageUrl: "/assets/images/banner-campus.jpg",
      foodCategory: null,
      serviceCategoryId: serviceCategoryRecords.get("care")!.id,
      avgPrice: 39,
      distanceText: "距西大长安校区约 800m",
      tags: ["理发", "洗护", "学生价"],
      highlights: ["可预约", "学生价", "反馈快"],
      menu: [{ name: "洗剪吹", price: 39 }, { name: "头皮护理", price: 69 }],
      qrImageUrl: "/assets/images/qr-placeholder.jpg",
      recommendation: "基础剪发和洗护评价稳定，适合日常整理。",
      randomWeight: 0,
      isFoodRecommendation: false,
      isServicePublished: true,
      status: "APPROVED" as const,
      rating: 4.6,
      sortOrder: 40,
      platformBoost: 10
    },
    {
      id: "seed-merchant-play",
      name: "北门星球台球 KTV",
      summary: "台球、桌游和小包间欢唱",
      description: "适合宿舍聚会和社团小活动，凭西大圈券到店享学生价。",
      categoryId: categoryRecords.get("services")!.id,
      ownerUserId: null,
      address: "西北大学长安校区北门美食街 3 楼",
      phone: "029-88880015",
      businessHours: "13:00-02:00",
      coverImageUrl: "/assets/images/merchant-service-ktv.jpg",
      foodCategory: null,
      serviceCategoryId: serviceCategoryRecords.get("play")!.id,
      avgPrice: 45,
      distanceText: "距西大长安校区约 900m",
      tags: ["台球", "KTV", "宿舍聚会"],
      highlights: ["夜间营业", "适合多人", "学生套餐"],
      menu: [{ name: "台球小时卡", price: 28 }, { name: "KTV 小包 2 小时", price: 98 }],
      qrImageUrl: "/assets/images/qr-placeholder.jpg",
      recommendation: "适合周末和社团小聚，价格提前确认。",
      randomWeight: 0,
      isFoodRecommendation: false,
      isServicePublished: true,
      status: "APPROVED" as const,
      rating: 4.5,
      sortOrder: 50,
      platformBoost: 8
    }
  ];

  for (const merchant of merchants) {
    await prisma.merchant.upsert({
      where: { id: merchant.id },
      update: merchant,
      create: merchant
    });
  }

  const validTo = new Date("2026-12-31T15:59:59.000Z");
  const coupons = [
    { id: "seed-coupon-food", merchantId: "seed-merchant-food", title: "满 30 减 8 元", description: "堂食出示核销码使用，不与其他活动同享。", threshold: 30, discountValue: 8, totalStock: 300, remainingStock: 300, validTo },
    { id: "seed-coupon-print", merchantId: "seed-merchant-print", title: "黑白打印 100 张 8 折", description: "适用于课程资料、论文初稿打印。", threshold: 10, discountValue: 2, totalStock: 500, remainingStock: 500, validTo },
    { id: "seed-coupon-driving", merchantId: "seed-merchant-driving", title: "报名立减 200 元", description: "到店咨询并完成报名后核销。", threshold: 1000, discountValue: 200, totalStock: 80, remainingStock: 80, validTo },
    { id: "seed-coupon-care", merchantId: "seed-merchant-care", title: "洗剪吹立减 10 元", description: "首次到店洗剪吹可用，需提前预约。", threshold: 39, discountValue: 10, totalStock: 120, remainingStock: 120, validTo },
    { id: "seed-coupon-play", merchantId: "seed-merchant-play", title: "台球 KTV 套餐减 20 元", description: "台球或 KTV 套餐满 98 元可用。", threshold: 98, discountValue: 20, totalStock: 100, remainingStock: 100, validTo }
  ];
  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { id: coupon.id },
      update: coupon,
      create: coupon
    });
  }

  const [foodCoupon, printCoupon, drivingCoupon] = await Promise.all([
    prisma.coupon.findUnique({ where: { id: "seed-coupon-food" } }),
    prisma.coupon.findUnique({ where: { id: "seed-coupon-print" } }),
    prisma.coupon.findUnique({ where: { id: "seed-coupon-driving" } })
  ]);

  const activityWindow = {
    startAt: new Date("2026-05-20T00:00:00.000Z"),
    endAt: new Date("2026-12-31T15:59:59.000Z")
  };
  const activities = [
    {
      id: "seed-activity-daily-food",
      title: "今日爆品：饭点小馆满 30 减 8",
      subtitle: "下课 20 分钟到店吃上热炒",
      description: "适合宿舍聚餐和课后快餐，凭核销码到店使用。平台推荐活动，库存有限。",
      type: "DAILY_DEAL" as const,
      merchantId: "seed-merchant-food",
      couponId: foodCoupon?.id,
      coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      manualWeight: 100,
      sortOrder: 10,
      pricingMode: "FIXED" as const,
      status: "ACTIVE" as const,
      ...activityWindow
    },
    {
      id: "seed-activity-female-nails",
      title: "女生精选：周末轻松变美清单",
      subtitle: "美甲、拍照、甜品先从靠谱门店开始",
      description: "精选适合女生周末结伴去的门店活动，优先展示环境、口碑和到店体验。",
      type: "FEMALE_SELECTED" as const,
      merchantId: "seed-merchant-food",
      couponId: foodCoupon?.id,
      coverImage: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
      manualWeight: 80,
      sortOrder: 20,
      pricingMode: "FREE" as const,
      status: "ACTIVE" as const,
      ...activityWindow
    },
    {
      id: "seed-activity-group-print",
      title: "宿舍拼团：资料打印一起省",
      subtitle: "同宿舍凑单打印更划算",
      description: "先组团领券，到店或到柜台出示核销码使用。MVP 阶段不接支付。",
      type: "GROUP_DEAL" as const,
      merchantId: "seed-merchant-print",
      couponId: printCoupon?.id,
      coverImage: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
      manualWeight: 70,
      sortOrder: 30,
      pricingMode: "FREE" as const,
      status: "ACTIVE" as const,
      ...activityWindow
    },
    {
      id: "seed-activity-driving",
      title: "本周榜单：长安校园驾培报名优惠",
      subtitle: "校车接送，适合假期集中训练",
      description: "到店咨询后核销，帮助商家判断校园渠道报名转化。",
      type: "GENERAL" as const,
      merchantId: "seed-merchant-driving",
      couponId: drivingCoupon?.id,
      coverImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      manualWeight: 50,
      sortOrder: 40,
      pricingMode: "CPA" as const,
      status: "ACTIVE" as const,
      ...activityWindow
    }
  ];

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: activity,
      create: activity
    });
  }

  const banners = [
    {
      id: "seed-banner-activity",
      title: "商家活动",
      subtitle: "今日校园福利",
      imageUrl: "/assets/images/banner-activity.jpg",
      targetType: "ACTIVITY" as const,
      targetId: "seed-activity-daily-food",
      sortOrder: 10,
      isActive: true
    },
    {
      id: "seed-banner-wechat",
      title: "加入西大圈",
      subtitle: "优惠、拼饭、校园服务都在这里",
      imageUrl: "/assets/images/banner-wechat.jpg",
      targetType: "ABOUT" as const,
      sortOrder: 20,
      isActive: true
    },
    {
      id: "seed-banner-service",
      title: "校园生活服务",
      subtitle: "打印、驾校、租房、跑腿一站看",
      imageUrl: "/assets/images/banner-campus.jpg",
      targetType: "TAB" as const,
      url: "/pages/service/index",
      sortOrder: 30,
      isActive: true
    }
  ];

  for (const banner of banners) {
    await prisma.banner.upsert({
      where: { id: banner.id },
      update: banner,
      create: banner
    });
  }

  await prisma.wechatEntryConfig.upsert({
    where: { id: "home-wechat-entry" },
    update: {
      title: "加入西大圈微信",
      description: "领活动、问优惠、推荐好店、反馈问题，都从这里开始。",
      buttonText: "添加微信",
      imageUrl: "/assets/images/h5-wechat-promo.png",
      isActive: true
    },
    create: {
      id: "home-wechat-entry",
      title: "加入西大圈微信",
      description: "领活动、问优惠、推荐好店、反馈问题，都从这里开始。",
      buttonText: "添加微信",
      imageUrl: "/assets/images/h5-wechat-promo.png",
      isActive: true
    }
  });

  const posts = [
    { id: "seed-post-001", type: "校园墙", title: "今天南门有什么好吃的推荐？", summary: "想找一家适合两个人吃饭的小店，预算人均 30 左右。", likeCount: 12, commentCount: 4, sortOrder: 10 },
    { id: "seed-post-002", type: "拼饭", title: "晚上有人一起吃饭点小馆吗", summary: "晚课后从长安校区南门出发，想拼一个双人热炒套餐。", likeCount: 8, commentCount: 6, sortOrder: 20 },
    { id: "seed-post-003", type: "校园信息", title: "星火图文打印今晚到 23:00", summary: "需要打印课程材料的同学可以微信先传文件。", likeCount: 18, commentCount: 2, sortOrder: 30 }
  ];

  for (const post of posts) {
    await prisma.communityPost.upsert({
      where: { id: post.id },
      update: { ...post, status: "VISIBLE" },
      create: { ...post, status: "VISIBLE" }
    });
  }

  console.log("Seed completed.");
  console.log("Admin: panda / 123456");
  console.log("Merchant demo: food-owner / 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
