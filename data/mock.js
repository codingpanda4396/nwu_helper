const mockPosts = [
  {
    _id: 'mock_001',
    type: '今日摊位',
    title: '手工奶茶摊 南门附近',
    description: '自制手工奶茶，多种口味可选，珍珠奶茶、椰果奶茶、红豆奶茶等，每杯8-12元，欢迎同学们前来品尝！',
    location: '南门附近',
    time: '每天 14:00-21:00',
    price: '8-12元/杯',
    contact: '微信号：milktea_nwu',
    allowPublicContact: true,
    remark: '支持微信支付',
    status: '已展示',
    createdAt: new Date('2026-05-08T10:00:00')
  },
  {
    _id: 'mock_002',
    type: '跑腿代办',
    title: '西区快递帮取',
    description: '帮忙代取西区菜鸟驿站、京东、顺丰等快递，每单3元，大件另议。每天中午和傍晚可取。',
    location: '西区菜鸟驿站',
    time: '每天 12:00-13:00, 17:00-19:00',
    price: '3元/单',
    contact: '微信号：express_help',
    allowPublicContact: true,
    remark: '大件物品需提前说明',
    status: '已展示',
    createdAt: new Date('2026-05-08T11:30:00')
  },
  {
    _id: 'mock_003',
    type: '周边商家',
    title: '东门外打印店推荐',
    description: '东门外50米"学府打印"，打印0.1元/面，复印0.05元/面，装订2元/本，支持微信支付宝，老板人很好。',
    location: '东门外50米',
    time: '8:00-22:00',
    price: '打印0.1元/面',
    contact: '到店即可',
    allowPublicContact: true,
    remark: '毕业论文打印有优惠',
    status: '已展示',
    createdAt: new Date('2026-05-08T14:00:00')
  },
  {
    _id: 'mock_004',
    type: '二手闲置',
    title: '出售高数教材（九成新）',
    description: '同济版高等数学第七版上下册，九成新，无笔记标注，附赠配套习题答案。原价68元，现价30元两本。',
    location: '西区宿舍',
    time: '随时可联系',
    price: '30元',
    contact: '微信号：math_books',
    allowPublicContact: true,
    remark: '可小刀，先到先得',
    status: '已展示',
    createdAt: new Date('2026-05-09T09:00:00')
  },
  {
    _id: 'mock_005',
    type: '拼车拼单',
    title: '周末拼车去西安火车站',
    description: '本周六上午8点从学校出发去西安火车站，车上还有3个空位，费用AA，预计每人15-20元。',
    location: '学校正门集合',
    time: '本周六 8:00',
    price: '15-20元/人',
    contact: '微信号：carpool_nwu',
    allowPublicContact: true,
    remark: '准时出发，不等人',
    status: '已展示',
    createdAt: new Date('2026-05-09T10:30:00')
  },
  {
    _id: 'mock_006',
    type: '今日摊位',
    title: '自制饰品摊 图书馆前广场',
    description: '手工制作的耳环、手链、发夹等饰品，每件都是独一无二的，价格5-25元不等，欢迎来看看~',
    location: '图书馆前广场',
    time: '今天 15:00-19:00',
    price: '5-25元',
    contact: '微信号：handmade_accessories',
    allowPublicContact: true,
    remark: '支持定制',
    status: '已展示',
    createdAt: new Date('2026-05-09T12:00:00')
  },
  {
    _id: 'mock_007',
    type: '跑腿代办',
    title: '代排二食堂打饭',
    description: '中午11:30前下单，帮你在二食堂排队打饭，送到宿舍楼下，每单2元。可以指定窗口和菜品。',
    location: '二食堂',
    time: '工作日 11:00-11:30 下单',
    price: '2元/单',
    contact: '微信号：cqueue_help',
    allowPublicContact: true,
    remark: '需提前支付餐费+跑腿费',
    status: '已展示',
    createdAt: new Date('2026-05-09T13:00:00')
  },
  {
    _id: 'mock_008',
    type: '二手闲置',
    title: '宿舍台灯 + 充电宝出售',
    description: 'LED护眼台灯，三档调光，九成新，原价89元现价35元。小米充电宝20000mAh，轻微使用痕迹，原价129元现价60元。打包价85元。',
    location: '东区宿舍',
    time: '随时可联系',
    price: '台灯35元/充电宝60元/打包85元',
    contact: '微信号：dorm_sale',
    allowPublicContact: false,
    remark: '可当面验货',
    status: '已展示',
    createdAt: new Date('2026-05-09T14:30:00')
  }
];

module.exports = {
  mockPosts: mockPosts
};
