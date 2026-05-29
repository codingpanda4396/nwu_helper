FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/student/package.json apps/student/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY . .
RUN pnpm build

FROM deps AS api-build
COPY . .
RUN pnpm --filter @nwu-helper/shared build && pnpm --filter @nwu-helper/api build

FROM deps AS admin-build
COPY . .
RUN pnpm --filter @nwu-helper/shared build && pnpm --filter @nwu-helper/admin build

FROM deps AS student-build
COPY . .
RUN pnpm --filter @nwu-helper/shared build && pnpm --filter @nwu-helper/student build:h5

FROM base AS api
ENV NODE_ENV=production
COPY --from=api-build /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=api-build /app/node_modules ./node_modules
COPY --from=api-build /app/packages/shared ./packages/shared
COPY --from=api-build /app/apps/api ./apps/api
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["pnpm", "start:cluster"]

FROM nginx:1.27-alpine AS admin
COPY --from=admin-build /app/apps/admin/dist /usr/share/nginx/html
COPY infra/nginx/admin.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

FROM nginx:1.27-alpine AS student
COPY --from=student-build /app/apps/student/dist/build/h5 /usr/share/nginx/html
COPY infra/nginx/student.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
