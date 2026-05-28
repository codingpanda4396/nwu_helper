# 数据统计分析后台 - 实现总结

## 已实现功能

### 1. 数据库层
- ✅ 新增 `UserActivity` 表 - 用户行为日志
- ✅ 新增 `UserLoginLog` 表 - 登录日志
- ✅ 新增 `UserDailySnapshot` 表 - 每日数据快照
- ✅ 修改 `User` 表 - 新增 lastLoginAt, lastActiveAt, loginCount, registerSource 字段
- ✅ 修改 `ViewHistory` 表 - 移除唯一约束，支持重复访问记录

### 2. API层 (8个统计分析接口)
- ✅ `GET /api/admin/analytics/user-growth` - 用户增长概览
- ✅ `GET /api/admin/analytics/login-methods` - 登录方式分布
- ✅ `GET /api/admin/analytics/user-activity` - 用户活跃度 (DAU/WAU/MAU)
- ✅ `GET /api/admin/analytics/user-retention` - 用户留存分析
- ✅ `GET /api/admin/analytics/user-funnel` - 用户转化漏斗
- ✅ `GET /api/admin/analytics/page-views` - 页面热度分析
- ✅ `GET /api/admin/analytics/export` - 数据导出
- ✅ `POST /api/public/activity` - 用户行为数据采集

### 3. 前端组件
- ✅ `StatCard` - 统计卡片组件
- ✅ `ChartCard` - 图表容器组件
- ✅ `DateRangePicker` - 时间筛选器组件
- ✅ `ExportButton` - Excel导出按钮组件
- ✅ `LineChart` - 折线图组件
- ✅ `BarChart` - 柱状图组件
- ✅ `PieChart` - 饼图组件
- ✅ `FunnelChart` - 漏斗图组件

### 4. 统计分析页面 (6个)
- ✅ `AnalyticsOverview` - 数据概览页面
- ✅ `UserGrowth` - 用户增长分析页面
- ✅ `LoginMethods` - 登录方式分析页面
- ✅ `UserActivity` - 用户活跃度分析页面
- ✅ `UserRetention` - 用户留存分析页面
- ✅ `UserFunnel` - 用户转化漏斗页面

### 5. 路由集成
- ✅ 侧边栏菜单 - 新增"数据分析"菜单组
- ✅ 路由配置 - 添加所有统计分析页面路由

## 技术栈

### 后端
- Fastify + Prisma + PostgreSQL
- Zod 数据验证
- JWT 认证

### 前端
- React 19 + Ant Design 6
- ECharts 5 + echarts-for-react
- ExcelJS (Excel导出)
- dayjs (日期处理)

## 使用说明

### 1. 启动服务

```bash
# 启动数据库
docker compose up -d postgres

# 安装依赖
pnpm install

# 生成Prisma客户端
pnpm db:generate

# 推送数据库变更
cd apps/api && npx prisma db push

# 启动开发服务器
pnpm dev
```

### 2. 访问管理后台

1. 打开浏览器访问 `http://localhost:5175/admin`
2. 使用管理员账号登录 (默认: 18800000000 / admin123456)
3. 在左侧菜单点击"数据分析"查看统计报表

### 3. 数据采集

在学生端应用中，每次用户行为都需要调用数据采集接口：

```typescript
// 示例：记录页面访问
await fetch('/api/public/activity', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'page_view',
    page: '/index',
    platform: 'h5'
  })
});
```

支持的行为类型：
- `page_view` - 页面访问
- `merchant_view` - 商家浏览
- `favorite` - 收藏
- `unfavorite` - 取消收藏
- `activity_click` - 活动点击
- `post_view` - 帖子查看
- `post_like` - 帖子点赞

### 4. 数据导出

每个统计页面都支持导出Excel功能：
1. 点击页面右上角的"导出Excel"按钮
2. 系统会自动生成并下载Excel文件
3. 文件名格式：`{报表类型}_{日期}.xlsx`

## 目录结构

```
apps/api/src/
├── analyticsRoutes.ts          # 统计分析API路由
├── activityTrackingRoutes.ts   # 数据采集API路由
└── ...

apps/admin/src/
├── analytics/
│   ├── components/             # 基础组件
│   │   ├── StatCard.tsx
│   │   ├── ChartCard.tsx
│   │   ├── DateRangePicker.tsx
│   │   └── ExportButton.tsx
│   ├── charts/                 # 图表组件
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   └── FunnelChart.tsx
│   └── pages/                  # 统计页面
│       ├── AnalyticsOverview.tsx
│       ├── UserGrowth.tsx
│       ├── LoginMethods.tsx
│       ├── UserActivity.tsx
│       ├── UserRetention.tsx
│       └── UserFunnel.tsx
└── ...

apps/web/src/admin/analytics/   # Web端相同结构
└── ...
```

## 注意事项

1. **数据采集**：需要在学生端集成数据采集接口，否则统计页面将没有数据
2. **数据库迁移**：已使用 `prisma db push` 直接推送变更，生产环境建议使用正式迁移
3. **性能优化**：大量数据时建议使用 `UserDailySnapshot` 表进行预聚合
4. **数据安全**：所有统计接口都需要ADMIN权限认证

## 后续优化建议

1. 添加定时任务，每日自动计算快照数据
2. 实现实时数据大屏
3. 添加数据预警机制
4. 支持自定义报表
5. 添加更多维度的分析（商家、活动、内容等）

## 开发完成时间

2026年5月28日
