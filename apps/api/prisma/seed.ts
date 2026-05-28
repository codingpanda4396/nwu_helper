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
      categoryId: categoryRecords.get("food")!.id,
      address: "西北大学长安校区南门外学府大街 18 号",
      phone: "029-88880011",
      businessHours: "10:30-22:00",
      coverImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      qrImageUrl: "/assets/images/qr-placeholder.jpg",
      serviceCategoryId: null,
      status: "APPROVED" as const,
      sortOrder: 10
    },
    {
      id: "seed-merchant-print",
      name: "星火图文打印",
      summary: "论文、海报、证件照一站式打印",
      categoryId: categoryRecords.get("printing")!.id,
      address: "西北大学长安校区东门商业街 B12",
      phone: "029-88880012",
      businessHours: "08:30-23:00",
      coverImageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
      qrImageUrl: "/assets/images/qr-placeholder.jpg",
      serviceCategoryId: serviceCategoryRecords.get("printing")!.id,
      status: "APPROVED" as const,
      sortOrder: 20
    },
    {
      id: "seed-merchant-driving",
      name: "长安校园驾培",
      summary: "校车接送，寒暑假集中训练",
      categoryId: categoryRecords.get("driving")!.id,
      address: "郭杜教育科技产业园驾培服务点",
      phone: "029-88880013",
      businessHours: "09:00-20:00",
      coverImageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      qrImageUrl: "/assets/images/qr-placeholder.jpg",
      serviceCategoryId: null,
      status: "APPROVED" as const,
      sortOrder: 30
    },
    {
      id: "seed-merchant-care",
      name: "南门轻护理发",
      summary: "洗剪吹、洗护和基础造型",
      categoryId: categoryRecords.get("services")!.id,
      address: "西北大学长安校区南门生活广场 2 楼",
      phone: "029-88880014",
      businessHours: "10:00-22:00",
      coverImageUrl: "/assets/images/banner-campus.jpg",
      qrImageUrl: "/assets/images/qr-placeholder.jpg",
      serviceCategoryId: serviceCategoryRecords.get("care")!.id,
      status: "APPROVED" as const,
      sortOrder: 40
    },
    {
      id: "seed-merchant-play",
      name: "北门星球台球 KTV",
      summary: "台球、桌游和小包间欢唱",
      categoryId: categoryRecords.get("services")!.id,
      address: "西北大学长安校区北门美食街 3 楼",
      phone: "029-88880015",
      businessHours: "13:00-02:00",
      coverImageUrl: "/assets/images/merchant-service-ktv.jpg",
      qrImageUrl: "/assets/images/qr-placeholder.jpg",
      serviceCategoryId: serviceCategoryRecords.get("play")!.id,
      status: "APPROVED" as const,
      sortOrder: 50
    }
  ];

  for (const merchant of merchants) {
    await prisma.merchant.upsert({
      where: { id: merchant.id },
      update: merchant,
      create: merchant
    });
  }

  const activityWindow = {
    startAt: new Date("2026-05-20T00:00:00.000Z"),
    endAt: new Date("2026-12-31T15:59:59.000Z")
  };
  const activities = [
    {
      id: "seed-activity-daily-food",
      title: "今日爆品：饭点小馆满 30 减 8",
      description: "适合宿舍聚餐和课后快餐，凭核销码到店使用。平台推荐活动，库存有限。",
      merchantId: "seed-merchant-food",
      coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 10,
      status: "ACTIVE" as const,
      ...activityWindow
    },
    {
      id: "seed-activity-female-nails",
      title: "女生精选：周末轻松变美清单",
      description: "精选适合女生周末结伴去的门店活动，优先展示环境、口碑和到店体验。",
      merchantId: "seed-merchant-food",
      coverImage: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 20,
      status: "ACTIVE" as const,
      ...activityWindow
    },
    {
      id: "seed-activity-group-print",
      title: "宿舍拼团：资料打印一起省",
      description: "先组团领券，到店或到柜台出示核销码使用。MVP 阶段不接支付。",
      merchantId: "seed-merchant-print",
      coverImage: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 30,
      status: "ACTIVE" as const,
      ...activityWindow
    },
    {
      id: "seed-activity-driving",
      title: "本周榜单：长安校园驾培报名优惠",
      description: "到店咨询后核销，帮助商家判断校园渠道报名转化。",
      merchantId: "seed-merchant-driving",
      coverImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 40,
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
      title: "加入竹影校园微信",
      description: "领活动、问优惠、推荐好店、反馈问题，都从这里开始。",
      buttonText: "添加微信",
      imageUrl: "/assets/images/h5-wechat-promo.png",
      isActive: true
    },
    create: {
      id: "home-wechat-entry",
      title: "加入竹影校园微信",
      description: "领活动、问优惠、推荐好店、反馈问题，都从这里开始。",
      buttonText: "添加微信",
      imageUrl: "/assets/images/h5-wechat-promo.png",
      isActive: true
    }
  });

  await prisma.campusConfig.upsert({
    where: { id: "default" },
    update: {
      name: "西北大学",
      slug: "nwu",
      isActive: true
    },
    create: {
      id: "default",
      name: "西北大学",
      slug: "nwu",
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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
