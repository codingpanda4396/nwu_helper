# API 设计

统一成功响应：

```json
{ "success": true, "data": {}, "message": "" }
```

统一错误响应：

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "参数错误" } }
```

## Public / Student API

- `GET /api/health`：健康检查。
- `GET /api/public/categories`：学生端可见类目。
- `GET /api/public/merchants`：商家列表，支持 `categoryId`、`keyword`、分页。
- `GET /api/public/merchants/:id`：商家详情和优惠券。
- `POST /api/public/exposures`：记录商家曝光。
- `POST /api/public/clicks`：记录商家点击。
- `POST /api/public/coupons/:id/claim`：学生领取优惠券，生成核销码并扣减库存。

## Auth API

- `POST /api/auth/login`：管理员或商家登录，返回 JWT。
- `GET /api/users/me`：读取当前账号和商家绑定信息。

## Merchant API

- `GET /api/merchant/overview`：本店资料、优惠券和基础转化统计。
- `GET /api/merchant/claims`：本店领券记录。
- `GET /api/merchant/redemptions`：本店核销记录。
- `POST /api/merchant/redeem`：输入核销码完成核销。

## Admin API

- `GET /api/admin/categories`、`POST /api/admin/categories`、`PATCH /api/admin/categories/:id`：类目管理。
- `GET /api/admin/merchants`、`POST /api/admin/merchants`、`PATCH /api/admin/merchants/:id`：商家管理。
- `PATCH /api/admin/merchants/:id/status`：审核或上下架商家。
- `POST /api/admin/merchant-users`：创建或更新商家登录账号。
- `GET /api/admin/coupons`、`POST /api/admin/coupons`、`PATCH /api/admin/coupons/:id`：优惠券管理。
- `GET /api/admin/dashboard/overview`：平台总览指标。
- `GET /api/admin/dashboard/merchants`：商家转化排行。
