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
  const adminPassword = await bcrypt.hash("admin123456", 10);
  const merchantPassword = await bcrypt.hash("merchant123456", 10);
  const demoMerchantPassword = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { phone: "18800000000" },
    update: { name: "平台管理员", role: "ADMIN", passwordHash: adminPassword },
    create: { name: "平台管理员", phone: "18800000000", role: "ADMIN", passwordHash: adminPassword }
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
      update: { name: "饭点小馆店长", username: "panda", role: "MERCHANT", passwordHash: demoMerchantPassword },
      create: { name: "饭点小馆店长", username: "panda", phone: "18800000011", role: "MERCHANT", passwordHash: demoMerchantPassword }
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
      status: "APPROVED" as const,
      rating: 4.6,
      sortOrder: 30,
      platformBoost: 10
    }
  ];

  for (const merchant of merchants) {
    await prisma.merchant.upsert({
      where: { id: merchant.id },
      update: merchant,
      create: merchant
    });
  }

  const couponCount = await prisma.coupon.count();
  if (couponCount === 0) {
    const validTo = new Date("2026-12-31T15:59:59.000Z");
    await prisma.coupon.createMany({
      data: [
        {
          merchantId: "seed-merchant-food",
          title: "满 30 减 8 元",
          description: "堂食出示核销码使用，不与其他活动同享。",
          threshold: 30,
          discountValue: 8,
          totalStock: 300,
          remainingStock: 300,
          validTo
        },
        {
          merchantId: "seed-merchant-print",
          title: "黑白打印 100 张 8 折",
          description: "适用于课程资料、论文初稿打印。",
          threshold: 10,
          discountValue: 2,
          totalStock: 500,
          remainingStock: 500,
          validTo
        },
        {
          merchantId: "seed-merchant-driving",
          title: "报名立减 200 元",
          description: "到店咨询并完成报名后核销。",
          threshold: 1000,
          discountValue: 200,
          totalStock: 80,
          remainingStock: 80,
          validTo
        }
      ]
    });
  }

  console.log("Seed completed.");
  console.log("Admin: 18800000000 / admin123456");
  console.log("Merchant demo: panda / 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
