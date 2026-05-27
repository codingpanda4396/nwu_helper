const banners = [
  {
    id: "banner-activity",
    title: "商家活动",
    subtitle: "今日校园福利",
    image: "/assets/images/banner-activity.jpg",
    targetType: "activity",
    targetId: "activity-food-001"
  },
  {
    id: "banner-wechat",
    title: "加入西大圈",
    subtitle: "优惠、拼饭、校园服务都在这里",
    image: "/assets/images/banner-wechat.jpg",
    targetType: "about"
  },
  {
    id: "banner-campus",
    title: "校园生活服务",
    subtitle: "打印、驾校、租房、跑腿一站看",
    image: "/assets/images/banner-campus.jpg",
    targetType: "tab",
    url: "/pages/service/index"
  }
];

const quickEntries = [
  { id: "food", title: "美食", icon: "🍜", type: "tab", url: "/pages/food/index" },
  { id: "driving", title: "驾校", icon: "🚗", type: "tab", url: "/pages/driving/index" },
  { id: "print", title: "打印", icon: "🖨️", type: "tab", url: "/pages/service/index", filterId: "printing" },
  { id: "ktv", title: "KTV", icon: "🎤", type: "tab", url: "/pages/service/index", filterId: "ktv" },
  { id: "rent", title: "租房", icon: "🏠", type: "tab", url: "/pages/service/index", filterId: "rent" },
  { id: "errand", title: "跑腿", icon: "🏃", type: "tab", url: "/pages/service/index", filterId: "errand" },
  { id: "job", title: "兼职", icon: "💼", type: "tab", url: "/pages/service/index", filterId: "job" },
  { id: "more", title: "更多", icon: "✨", type: "tab", url: "/pages/service/index" }
];

const activities = [
  {
    id: "activity-food-001",
    merchantId: "merchant-food-001",
    title: "饭点小馆满 30 减 8",
    tags: ["今日福利", "南门"],
    discount: "满30减8",
    image: "/assets/images/merchant-food-001.jpg",
    cta: "去看看"
  },
  {
    id: "activity-food-002",
    merchantId: "merchant-food-002",
    title: "晚风烧烤双人套餐",
    tags: ["夜宵", "学生价"],
    discount: "双人 68",
    image: "/assets/images/merchant-food-002.jpg",
    cta: "约一顿"
  }
];

const foodCategories = [
  { id: "all", name: "全部" },
  { id: "bbq", name: "烧烤" },
  { id: "hotpot", name: "火锅" },
  { id: "milk-tea", name: "奶茶" },
  { id: "snack", name: "小吃" },
  { id: "night", name: "夜宵" },
  { id: "fast-food", name: "快餐" }
];

const merchants = [
  {
    id: "merchant-food-001",
    category: "food",
    foodCategory: "fast-food",
    name: "饭点小馆",
    image: "/assets/images/merchant-food-001.jpg",
    rating: 4.8,
    avgPrice: 25,
    distance: "距西大长安校区约 1.2km",
    address: "西北大学长安校区南门外学府大街 18 号",
    businessHours: "10:30-22:00",
    tags: ["热炒", "简餐", "学生优惠"],
    discount: "满30减8",
    recommendation: "适合下课后和舍友一起吃顿热饭。",
    highlights: ["出餐快", "近南门", "学生套餐"],
    menu: [
      { name: "招牌盖饭", price: 18 },
      { name: "双人热炒套餐", price: 58 }
    ],
    couponIds: ["coupon-food-001"],
    qrImage: "/assets/images/qr-placeholder.jpg",
    latitude: null,
    longitude: null
  },
  {
    id: "merchant-food-002",
    category: "food",
    foodCategory: "bbq",
    name: "晚风烧烤",
    image: "/assets/images/merchant-food-002.jpg",
    rating: 4.7,
    avgPrice: 34,
    distance: "距西大长安校区约 1.5km",
    address: "西北大学长安校区南门夜市街 6 号",
    businessHours: "17:00-01:00",
    tags: ["烧烤", "夜宵", "可拼桌"],
    discount: "双人套餐68",
    recommendation: "适合晚课后拼一桌，烤串和主食都够稳。",
    highlights: ["夜宵友好", "套餐划算", "离校近"],
    menu: [
      { name: "双人烤串套餐", price: 68 },
      { name: "烤苕皮", price: 8 }
    ],
    couponIds: ["coupon-food-002"],
    qrImage: "/assets/images/qr-placeholder.jpg",
    latitude: null,
    longitude: null
  },
  {
    id: "merchant-food-003",
    category: "food",
    foodCategory: "milk-tea",
    name: "青柠茶铺",
    image: "/assets/images/merchant-food-003.jpg",
    rating: 4.6,
    avgPrice: 14,
    distance: "距西大长安校区约 900m",
    address: "学府大街学生公寓对面 3 号",
    businessHours: "09:30-23:00",
    tags: ["奶茶", "果茶", "外带"],
    discount: "第二杯半价",
    recommendation: "复习前带一杯，清爽不腻。",
    highlights: ["出杯快", "低糖可选", "学生折扣"],
    menu: [
      { name: "青柠冰茶", price: 12 },
      { name: "厚乳茉莉", price: 16 }
    ],
    couponIds: ["coupon-food-003"],
    qrImage: "/assets/images/qr-placeholder.jpg",
    latitude: null,
    longitude: null
  },
  {
    id: "merchant-print-001",
    category: "service",
    serviceId: "printing",
    name: "南门快印",
    image: "/assets/images/merchant-print-001.jpg",
    rating: 4.9,
    avgPrice: 8,
    distance: "距西大长安校区约 600m",
    address: "长安校区南门外便利店二楼",
    businessHours: "08:30-22:30",
    tags: ["打印", "装订", "证件照"],
    discount: "论文装订9折",
    recommendation: "课程材料、社团海报和论文装订都能处理。",
    highlights: ["营业时间长", "支持微信传文件", "可开票"],
    menu: [
      { name: "黑白打印", price: 0.2 },
      { name: "普通装订", price: 5 }
    ],
    couponIds: ["coupon-print-001"],
    qrImage: "/assets/images/qr-placeholder.jpg",
    latitude: null,
    longitude: null
  },
  {
    id: "merchant-service-ktv",
    category: "service",
    serviceId: "ktv",
    name: "星点量贩 KTV",
    image: "/assets/images/merchant-service-ktv.jpg",
    rating: 4.5,
    avgPrice: 39,
    distance: "距西大长安校区约 2.1km",
    address: "韦曲南商圈 4 楼",
    businessHours: "12:00-02:00",
    tags: ["KTV", "团建", "生日"],
    discount: "学生包段优惠",
    recommendation: "社团聚会和宿舍生日局都比较方便。",
    highlights: ["包段价", "可预约", "近地铁"],
    menu: [
      { name: "下午场小包", price: 88 },
      { name: "夜场中包", price: 168 }
    ],
    couponIds: ["coupon-ktv-001"],
    qrImage: "/assets/images/qr-placeholder.jpg",
    latitude: null,
    longitude: null
  }
];

const coupons = [
  { id: "coupon-food-001", merchantId: "merchant-food-001", title: "满 30 减 8 元", description: "堂食出示使用，不与其他活动同享。", validTo: "2026-12-31", stockText: "限量 300 张", status: "active" },
  { id: "coupon-food-002", merchantId: "merchant-food-002", title: "双人套餐 68 元", description: "含烤串、主食和饮品，到店前建议咨询。", validTo: "2026-12-31", stockText: "限量 120 份", status: "active" },
  { id: "coupon-food-003", merchantId: "merchant-food-003", title: "第二杯半价", description: "指定饮品参与，外带可用。", validTo: "2026-12-31", stockText: "每日 50 份", status: "active" },
  { id: "coupon-print-001", merchantId: "merchant-print-001", title: "论文装订 9 折", description: "毕业季提前预约更稳。", validTo: "2026-12-31", stockText: "长期有效", status: "active" },
  { id: "coupon-ktv-001", merchantId: "merchant-service-ktv", title: "学生包段优惠", description: "凭学生证或西大圈咨询入口确认。", validTo: "2026-12-31", stockText: "需预约", status: "active" }
];

const services = [
  { id: "printing", name: "打印", icon: "🖨️", merchantIds: ["merchant-print-001"] },
  { id: "ktv", name: "KTV", icon: "🎤", merchantIds: ["merchant-service-ktv"] },
  { id: "rent", name: "租房", icon: "🏠", merchantIds: [] },
  { id: "errand", name: "跑腿", icon: "🏃", merchantIds: [] },
  { id: "fitness", name: "健身", icon: "💪", merchantIds: [] },
  { id: "photo", name: "摄影", icon: "📷", merchantIds: [] },
  { id: "repair", name: "维修", icon: "🔧", merchantIds: [] },
  { id: "job", name: "兼职", icon: "💼", merchantIds: [] }
];

const communityTypes = ["全部", "校园墙", "求助", "拼饭", "二手", "吐槽", "校园信息"];

const communityPosts = [
  { id: "post-001", type: "校园墙", title: "今天南门有什么好吃的推荐？", summary: "想找一家适合两个人吃饭的小店，预算人均 30 左右。", content: "想找一家适合两个人吃饭的小店，预算人均 30 左右。最好离南门近一点，下课后直接过去。", authorNickname: "想吃饭同学", time: "10 分钟前", viewCount: 35, likeCount: 12, commentCount: 4 },
  { id: "post-002", type: "拼饭", title: "晚上有人一起吃烧烤吗", summary: "晚课后从长安校区南门出发，想拼晚风烧烤双人套餐。", content: "晚课后从长安校区南门出发，想拼晚风烧烤双人套餐，AA 就行。", authorNickname: "晚课人", time: "28 分钟前", viewCount: 26, likeCount: 8, commentCount: 6 },
  { id: "post-003", type: "校园信息", title: "南门快印今晚到 22:30", summary: "需要打印课程材料的同学可以微信先传文件。", content: "需要打印课程材料的同学可以微信先传文件，今晚营业到 22:30。", authorNickname: "信息搬运", time: "1 小时前", viewCount: 58, likeCount: 18, commentCount: 2 },
  { id: "post-004", type: "二手", title: "出一个八成新台灯", summary: "亮度可调，长安校区自取。", content: "出一个八成新台灯，亮度可调，长安校区自取。", authorNickname: "毕业清理", time: "2 小时前", viewCount: 19, likeCount: 5, commentCount: 3 }
];

const drivingSchool = {
  name: "西大圈合作驾校",
  image: "/assets/images/driving-school.jpg",
  yardImage: "/assets/images/driving-yard.jpg",
  summary: "面向西北大学学生的周边驾校咨询入口，主打近学校、接送方便和学生优惠。",
  advantages: ["近学校", "接送方便", "学车周期短", "学生优惠"],
  process: ["扫码咨询", "确认班型", "提交资料", "安排练车", "考试拿证"],
  qrImage: "/assets/images/qr-placeholder.jpg"
};

module.exports = {
  banners,
  quickEntries,
  activities,
  foodCategories,
  merchants,
  coupons,
  services,
  communityTypes,
  communityPosts,
  drivingSchool
};
