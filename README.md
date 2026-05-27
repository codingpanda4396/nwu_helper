# 西大圈本地生活增长平台

面向西北大学周边商家的本地生活增长平台 MVP，覆盖学生端商家发现、优惠券领取、到店核销、曝光/点击/领取/核销统计，以及平台人工运营后台。

## 技术栈

- 前端：React + Vite + TypeScript
- 后端：Node.js + Fastify + TypeScript
- 数据库：PostgreSQL + Prisma
- 部署：Docker Compose + Nginx

## 本地开发

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm db:generate
pnpm --filter @nwu-helper/api db:migrate:dev
pnpm db:seed
pnpm dev
```

默认地址：

- 学生端：http://localhost:5173/student
- 商家后台：http://localhost:5173/merchant
- 平台后台：http://localhost:5173/admin
- API 健康检查：http://localhost:4000/api/health

默认账号：

- 管理员：`18800000000` / `admin123456`
- 商家演示账号：`panda` / `123456`

## 常用命令

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm db:migrate
pnpm db:seed
```

## MVP 闭环

平台管理员维护类目、商家、优惠券和手动排序权重；学生在 H5 浏览商家列表、进入详情并填写手机号/昵称领取优惠券；商家在 H5 后台查看经营指标、维护店铺资料和优惠券，并输入核销码完成到店核销；系统统计曝光、点击、领取和核销数据。首版只做 H5 用户端、目录、优惠券、核销归因和手动排序，不做在线支付、自动扣费和原生客户端工程。

## 部署

ECS 部署说明见 [docs/deployment.md](docs/deployment.md)。
