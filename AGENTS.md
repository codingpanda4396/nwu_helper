# AGENTS.md

## Project Overview

NWU local life growth platform (西大圈) - a monorepo for student-facing merchant discovery, coupons, and admin dashboard.

## Monorepo Structure

```
apps/api/       → Fastify + Prisma backend (port 4000)
apps/admin/     → React + Vite admin dashboard (port 5175)
apps/student/   → UniApp + Vue3 student app (port 5174, H5 & 小程序)
packages/shared/→ Shared types and constants
```

## Essential Commands

```bash
# Install dependencies
pnpm install

# Start development (runs API + admin in parallel)
pnpm dev

# Start all services (API + admin + student)
pnpm dev:all

# Start student app only
pnpm dev:student

# Start admin dashboard only
pnpm dev:admin

# Typecheck all packages
pnpm typecheck

# Run tests (only API has tests currently)
pnpm test

# Build all packages
pnpm build

# Build student app
pnpm build:student

# Database operations (require PostgreSQL running)
docker compose up -d postgres
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed demo data
```

## Architecture Notes

- **API entrypoint**: `apps/api/src/server.ts`
- **Admin entrypoint**: `apps/admin/src/main.tsx` (React admin dashboard)
- **Student app entrypoint**: `apps/student/src/main.ts` (UniApp Vue3)
- **Shared package**: `packages/shared/src/index.ts` exports types and constants

### API Structure

- `src/config.ts` - Environment config (PORT, JWT_SECRET, WEB_ORIGIN)
- `src/auth.ts` - JWT authentication, login endpoint
- `src/response.ts` - `ok()` and `fail()` helpers for consistent API responses
- `src/db.ts` - Prisma client singleton
- `src/publicRoutes.ts` - Public endpoints (no auth required)
- `src/adminRoutes.ts` - Admin endpoints (JWT auth required)

### Admin Structure

- Single-file React app with client-side routing
- Routes: `/overview`, `/community`, `/banners`, `/services`, `/wechat-entry`
- Uses `VITE_API_BASE` env var for API URL (defaults to empty = same origin)

### Student App Structure (UniApp)

- Vue3 + TypeScript + uView Plus + Pinia
- Pages: index, food, driving, services, community, about, merchant, post
- API封装: `src/api/index.ts`
- 状态管理: `src/store/index.ts`
- 支持H5和微信小程序
- H5开发端口: 5174，已配置代理到后端4000端口

## Database

- PostgreSQL 17 with Prisma ORM
- Schema: `apps/api/prisma/schema.prisma`
- Seed file: `apps/api/prisma/seed.ts`
- Key models: User, Category, Merchant, Banner, Activity, CommunityPost, ServiceCategory

## Testing

- Framework: Vitest
- Config: `apps/api/vitest.config.ts`
- Only API package has tests currently
- Run API tests: `pnpm --filter @nwu-helper/api test`

## CI/CD

- GitHub Actions: `.github/workflows/deploy.yml`
- Deploys to Aliyun ECS on push to `main`
- CI runs: install → db:generate → db:migrate → db:seed → typecheck → test → build
- Production uses Docker Compose with Nginx reverse proxy

## Environment Variables

Required for local development (copy `.env.example` to `.env`):

```
DATABASE_URL=postgresql://nwu:nwu_password@localhost:5432/nwu_helper
JWT_SECRET=change-me-in-production
PORT=4000
WEB_ORIGIN=http://localhost:5175
```

Student app environment (in `apps/student/.env`):

```
VITE_API_BASE=http://localhost:4000
```

## Default Credentials

- Admin: `18800000000` / `admin123456`

## Conventions

- TypeScript strict mode enabled
- ES modules (`"type": "module"` in all package.json)
- API responses follow `{ success: true, data }` or `{ success: false, error: { code, message } }` format
- Prisma migrations must be run before seeding
- Admin assets stored in `apps/admin/public/assets/images/`
- Student app assets stored in `apps/student/src/static/images/`
