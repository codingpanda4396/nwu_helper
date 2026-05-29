# 数据库设计

数据库使用 PostgreSQL，ORM 使用 Prisma。Schema 位于 `apps/api/prisma/schema.prisma`。

## 核心模型

- `User`：统一账号，角色为 `STUDENT`、`ADMIN`。支持唯一 `username` 和唯一手机号。
- `Category`：本地生活类目，例如美食、驾校、打印、美甲、租房、二手、生活服务。
- `Merchant`：店铺资料、类目、地址、电话、营业时间、封面图、二维码、人均价格、经纬度、标签、状态、排序权重。
- `MerchantImage`：商家图片（菜单、环境等），支持分类和排序。
- `Banner`：轮播图，支持跳转到活动、服务、关于、页面或 URL。
- `WechatEntryConfig`：首页微信入口配置（单例）。
- `ServiceCategory`：服务分类（打印、KTV、租房、洗护理发、台球、兼职等）。
- `CommunityPost`：社区帖子，支持类型筛选、点赞、浏览量、审核状态。
- `Activity`：商家活动，关联 Merchant，支持状态和时间窗口。
- `ViewHistory`：浏览历史，可关联 User 或仅记录 sessionId。
- `Favorite`：收藏，User 和 Merchant 的多对多关系。
- `Feedback`：用户反馈，支持类型和状态管理。
- `CampusConfig`：校园配置（单例）。
- `UserActivity`：用户行为埋点，用于分析。
- `UserLoginLog`：登录日志，记录登录方式和平台。
- `UserDailySnapshot`：每日快照，记录新增用户、活跃用户等。

## 关键关系

- `Merchant` 属于一个 `Category`，可选属于一个 `ServiceCategory`。
- `Merchant` 有多个 `MerchantImage` 和 `Activity`。
- `Favorite` 是 `User` 和 `Merchant` 的多对多关联。
- `ViewHistory` 可关联 `User`（登录用户）或仅记录 `sessionId`（匿名用户）。
- `UserActivity` 可关联 `User`，记录行为埋点。

## 关键枚举

`UserRole`：`STUDENT`、`ADMIN`

`MerchantStatus`：`PENDING`、`APPROVED`、`REJECTED`、`SUSPENDED`

`ActivityStatus`：`DRAFT`、`ACTIVE`、`PAUSED`、`ENDED`

`CommunityPostStatus`：`PENDING`、`VISIBLE`、`HIDDEN`、`REJECTED`

`FeedbackType`：`SUGGESTION`、`COMPLAINT`、`COOPERATION`、`OTHER`

`FeedbackStatus`：`PENDING`、`PROCESSING`、`RESOLVED`

`BannerTargetType`：`ACTIVITY`、`SERVICE`、`ABOUT`、`TAB`、`URL`

## 排序规则

学生端只展示 `APPROVED` 商家。排序规则为：

1. `sortOrder` 升序。
2. `createdAt` 降序。
