FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY . .
RUN pnpm build

FROM base AS api
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/api ./apps/api
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]

FROM nginx:1.27-alpine AS web
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
