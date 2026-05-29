# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

西大圈 (nwu-helper) — a local-life growth platform for merchants around Northwest University. Monorepo with student-facing mobile app, admin dashboard, and API backend.

## Commands

```bash
pnpm install                    # Install all dependencies
pnpm dev                        # API (4000) + Admin (5175) in parallel
pnpm dev:all                    # API + Admin + Student H5
pnpm dev:admin                  # Admin only
pnpm dev:student                # Student H5 only
pnpm typecheck                  # tsc --noEmit across all packages
pnpm test                       # Vitest (only API has tests currently)
pnpm build                      # Build all packages
pnpm build:student              # Build student H5 only
```

### Database (local dev)

```bash
docker compose up -d postgres
pnpm db:generate                # Generate Prisma client
pnpm --filter @nwu-helper/api db:migrate:dev   # Run migrations
pnpm db:seed                    # Seed demo data
```

### Running a single test

```bash
pnpm --filter @nwu-helper/api test -- path/to/test.ts
```

## Architecture

**pnpm monorepo** with workspaces in `apps/*` and `packages/*`.

```
Student App (UniApp/Vue3)  ──┐
Admin Dashboard (React)     ──┼──▶  Fastify API (apps/api)  ──▶  PostgreSQL (Prisma)
Web Frontend (React)        ──┘
```

### apps/api — Fastify + Prisma backend (port 4000)

- **Entry**: `apps/api/src/server.ts` (single process) or `apps/api/src/cluster.ts` (multi-worker)
- **Auth**: JWT via `src/auth.ts` — `requireAuth` hook on protected routes
- **Route groups**: public (`/api/public/*`), auth (`/api/auth/*`), admin (`/api/admin/*`, requires ADMIN role), user (`/api/user/*`), upload (`/api/upload/*`)
- **Response helpers**: `ok()` / `fail()` in `src/response.ts` — all endpoints return `{ success, data }` or `{ success, error: { code, message } }`
- **Config**: `src/config.ts` reads env vars (PORT, JWT_SECRET, OSS credentials, etc.)
- **DB**: `src/db.ts` exports Prisma singleton; schema at `apps/api/prisma/schema.prisma`
- **Validation**: Zod schemas for request validation
- **External services**: Alibaba Cloud OSS (`src/oss.ts`), SMS (`src/sms.ts`)

### apps/admin — React + Vite + Ant Design (port 5175)

- **Entry**: `apps/admin/src/main.tsx`
- **Routing**: React Router v7, client-side; auth via JWT in localStorage (`useAdmin` hook)
- **API calls**: `adminApi()` helper attaches Bearer token; data fetching via `useAdminData()` hook
- **Brand theme**: emerald green (#10B981)
- **Proxies** `/api` to `http://localhost:4000` in dev

### apps/student — UniApp + Vue3 mobile app (port 5174)

- **Entry**: `apps/student/src/main.ts`
- **Pages**: defined in `apps/student/src/pages.json` — 5-tab layout (Home, Food, Service, Community, Mine)
- **API layer**: `apps/student/src/api/index.ts` wraps `uni.request()` with promises
- **State**: Pinia store at `apps/student/src/store/index.ts`
- **Build targets**: H5 (web) and WeChat mini-program
- **Proxies** `/api` to `http://localhost:4000` in dev

### packages/shared — Shared TypeScript types

Exports type constants (userRoles, merchantStatuses, etc.), derived TypeScript types, and API response types (`ApiSuccess<T>`, `ApiFailure`, `ApiResponse<T>`).

## Database

PostgreSQL 17 with Prisma ORM. Key models: User (STUDENT/ADMIN roles), Category, Merchant (status: PENDING/APPROVED/REJECTED/SUSPENDED), Activity, Banner, CommunityPost (moderation: PENDING/VISIBLE/HIDDEN/REJECTED), ServiceCategory, Favorite, ViewHistory, Feedback, UserActivity (analytics).

Schema: `apps/api/prisma/schema.prisma` — migrations in `apps/api/prisma/migrations/`, seed in `apps/api/prisma/seed.ts`.

## Environment Variables

Copy `.env.example` to `.env`. Key vars:

```
DATABASE_URL=postgresql://nwu:nwu_password@localhost:5432/nwu_helper
JWT_SECRET=change-me-in-production
PORT=4000
WEB_ORIGIN=http://localhost:5175
```

## Default Credentials

- Admin: `18800000000` / `admin123456`

## Conventions

- TypeScript strict mode, ES modules (`"type": "module"`)
- No ESLint configured — linting is `tsc --noEmit` only
- Prisma migrations must be run before seeding
- CI pipeline (GitHub Actions): install → db:generate → db:migrate → db:seed → typecheck → test → build → Docker deploy to Aliyun ECS
- Production uses multi-stage Dockerfile with separate targets (api, web, admin, student) + Nginx reverse proxy
