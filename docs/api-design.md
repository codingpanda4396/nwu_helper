# API 设计

统一成功响应：

```json
{ "success": true, "data": {}, "message": "" }
```

统一错误响应：

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "参数错误" } }
```

## Public API

- `GET /api/health`：健康检查。
- `GET /api/public/banners`：轮播图列表（仅返回 isActive 的）。
- `GET /api/public/home`：首页聚合数据（banners + activities + wechatEntry）。
- `GET /api/public/wechat-entry`：微信入口配置。
- `GET /api/public/categories`：学生端可见类目。
- `GET /api/public/merchants`：商家列表，支持 `categoryId`、`keyword`、分页。
- `GET /api/public/merchants/:id`：商家详情（含图片、活动）。
- `GET /api/public/food/categories`：美食分类。
- `GET /api/public/food/merchants`：美食商家列表，支持 `tag`（snack/meal/tea/night）和 `sort`（default/distance/hot/price）筛选。
- `GET /api/public/food/random`：随机推荐一家美食商家。
- `GET /api/public/services/categories`：服务分类列表。
- `GET /api/public/services/merchants`：服务商家列表，支持 `serviceKey` 筛选。
- `GET /api/public/activities`：活动列表，支持分页。
- `GET /api/public/activities/home`：首页活动推荐。
- `GET /api/public/activities/:id`：活动详情。
- `GET /api/public/community/types`：社区帖子类型列表。
- `GET /api/public/community/posts`：社区帖子列表，支持 `type` 筛选。
- `POST /api/public/community/posts`：提交新帖子（需审核）。
- `GET /api/public/community/posts/:id`：帖子详情（自动增加浏览量）。
- `POST /api/public/community/posts/:id/like`：点赞帖子。
- `POST /api/public/feedback`：提交反馈（无需登录）。
- `POST /api/public/activity`：用户行为埋点追踪。

## Auth API

- `POST /api/auth/login`：管理员登录，支持 `{ phone, password }`、`{ username, password }` 或 `{ account, password }`，返回 JWT。

## User API（需登录）

- `POST /api/user/favorites/:merchantId`：收藏商家。
- `DELETE /api/user/favorites/:merchantId`：取消收藏。
- `GET /api/user/favorites`：获取收藏列表。
- `POST /api/user/history/:merchantId`：记录浏览历史。
- `GET /api/user/history`：获取浏览历史。
- `DELETE /api/user/history`：清空浏览历史。

## Admin API（需 ADMIN 角色）

- `GET /api/users/me`：读取当前账号信息。
- `GET /api/admin/categories`、`POST /api/admin/categories`、`PATCH /api/admin/categories/:id`：类目管理。
- `GET /api/admin/merchants`、`POST /api/admin/merchants`、`PATCH /api/admin/merchants/:id`、`DELETE /api/admin/merchants/:id`：商家管理。
- `PATCH /api/admin/merchants/:id/status`：审核或上下架商家。
- `GET /api/admin/activities`、`POST /api/admin/activities`、`PATCH /api/admin/activities/:id`、`DELETE /api/admin/activities/:id`：活动管理。
- `GET /api/admin/banners`、`POST /api/admin/banners`、`PATCH /api/admin/banners/:id`、`PATCH /api/admin/banners/:id/status`：轮播图管理。
- `GET /api/admin/wechat-entry`、`PATCH /api/admin/wechat-entry`：微信入口配置。
- `GET /api/admin/service-categories`、`POST /api/admin/service-categories`、`PATCH /api/admin/service-categories/:id`：服务分类管理。
- `GET /api/admin/community-posts`、`POST /api/admin/community-posts`、`PATCH /api/admin/community-posts/:id`、`PATCH /api/admin/community-posts/:id/status`、`DELETE /api/admin/community-posts/:id`：社区帖子管理。
- `GET /api/admin/feedbacks`、`PATCH /api/admin/feedbacks/:id`：反馈管理。
- `GET /api/admin/dashboard/overview`：平台总览指标。

## Analytics API（需 ADMIN 角色）

- `GET /api/admin/analytics/user-growth`：用户增长趋势。
- `GET /api/admin/analytics/login-methods`：登录方式分布。
- `GET /api/admin/analytics/user-activity`：用户活跃度（DAU/WAU/MAU）。
- `GET /api/admin/analytics/user-retention`：用户留存分析。
- `GET /api/admin/analytics/user-funnel`：转化漏斗。
- `GET /api/admin/analytics/page-views`：页面热度分析。
- `GET /api/admin/analytics/export`：数据导出。

## Upload API（需登录）

- `POST /api/upload/image`：上传图片到阿里云 OSS。
- `GET /api/upload/policy`：获取 OSS 直传签名。
