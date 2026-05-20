# 数据库设计

数据库使用 PostgreSQL，ORM 使用 Prisma。

## 核心模型

- `User`：统一账号，角色为 `STUDENT`、`MERCHANT`、`ADMIN`。支持唯一 `username` 和唯一手机号；学生可只记录手机号和昵称，商家和管理员有密码。
- `Category`：本地生活类目，例如美食、驾校、打印、美甲、租房、二手、生活服务。
- `Merchant`：店铺资料、类目、地址、电话、营业时间、封面图、状态、评分、人工排序权重。
- `Coupon`：优惠券标题、说明、门槛、优惠值、总库存、剩余库存、有效期和状态。
- `UserCoupon`：学生领券记录，包含唯一核销码和 `CLAIMED`、`USED`、`EXPIRED` 状态。
- `CouponRedemption`：核销记录，记录商家、学生、优惠券、消费金额和核销时间。
- `ExposureLog`：商家曝光日志。
- `ClickLog`：商家点击日志。

## 关键关系

- `Merchant` 属于一个 `Category`，可绑定一个商家登录 `User`。
- `Coupon` 属于一个 `Merchant`。
- 学生领取优惠券后创建 `UserCoupon`，并扣减 `Coupon.remainingStock`。
- 商家核销时将 `UserCoupon.status` 改为 `USED`，并创建一条 `CouponRedemption`。
- `ExposureLog` 和 `ClickLog` 都归属于 `Merchant`，首版只统计不扣费。

## 关键状态

`Merchant.status`：

- `PENDING`
- `APPROVED`
- `REJECTED`
- `SUSPENDED`

`Coupon.status`：

- `ACTIVE`
- `PAUSED`
- `EXPIRED`

`UserCoupon.status`：

- `CLAIMED`
- `USED`
- `EXPIRED`

## 首版排序

学生端只展示 `APPROVED` 商家。排序规则为：

1. `platformBoost` 降序。
2. `sortOrder` 升序。
3. `rating` 降序。
4. `createdAt` 降序。
