# ECS 一键 CI/CD

这套部署面向阿里云 ECS：GitHub Actions 在 PR 和普通分支执行 CI，在 `main` 分支或手动触发时完成测试、构建、打包，然后通过 SSH/SCP 上传到 ECS，用 `docker compose` 启动 `postgres`、`api`、`admin`、`student`、`gateway`，最后检查 API 和首页接口健康状态。

服务器不需要预先 clone 仓库，也不需要配置 git deploy key。

## 1. ECS 前置条件

最小要求：

- ECS 开放 SSH 端口。
- 安全组开放 Web 端口，默认网关端口 `4396`；如果用宿主机 Nginx/SLB 做 HTTPS，只需要内部反代到 `127.0.0.1:4396`。
- SSH 用户可以执行 Docker；如果没有 Docker，流水线会尝试自动安装，需要该用户有 `sudo` 权限。

如果你想手动初始化 Docker：

```bash
sudo sh -c "$(curl -fsSL https://get.docker.com)"
sudo systemctl enable --now docker
```

## 2. GitHub Secrets

在 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 添加：

必填：

- `ECS_HOST`：ECS 公网 IP 或域名。
- `ECS_USER`：SSH 用户，例如 `root`、`ubuntu`。
- `ECS_SSH_KEY`：可登录 ECS 的 SSH 私钥内容。
- `JWT_SECRET`：生产 JWT 密钥，至少 32 位随机字符串。

推荐：

- `ECS_APP_DIR`：部署目录，默认 `/opt/nwu_helper`。
- `ECS_SSH_PORT`：SSH 端口，默认 `22`。
- `WEB_ORIGIN`：前端访问地址，例如 `https://your-domain.com`。
- `PUBLIC_WEB_URL`：公开前端地址，通常同 `WEB_ORIGIN`。
- `POSTGRES_PASSWORD`：生产数据库密码。

可选：

- `DATABASE_URL`：自定义数据库连接。如果不填，默认使用 compose 内置 Postgres：`postgresql://nwu:${POSTGRES_PASSWORD}@postgres:5432/nwu_helper`。
- `POSTGRES_USER`：默认 `nwu`。
- `POSTGRES_DB`：默认 `nwu_helper`。
- `API_BIND`：API 宿主机绑定，默认 `127.0.0.1:4000`。
- `ADMIN_BIND`：管理后台宿主机绑定，默认 `0.0.0.0:18080`。
- `STUDENT_BIND`：学生端宿主机绑定，默认 `0.0.0.0:8081`。
- `GATEWAY_BIND`：统一网关宿主机绑定，默认 `0.0.0.0:4396`。
- `WEB_BIND`：历史兼容变量；如果未配置 `ADMIN_BIND`，workflow 会把它作为管理后台端口使用。新部署建议改用 `ADMIN_BIND`、`STUDENT_BIND`、`GATEWAY_BIND`。

高级用法：

- `ECS_ENV_FILE`：完整 `.env` 文件内容。配置它后会覆盖上面的分项环境变量生成方式。

示例 `ECS_ENV_FILE`：

```dotenv
NODE_ENV=production
DATABASE_URL=postgresql://nwu:strong-password@postgres:5432/nwu_helper
POSTGRES_USER=nwu
POSTGRES_PASSWORD=strong-password
POSTGRES_DB=nwu_helper
JWT_SECRET=replace-with-a-long-random-secret
PORT=4000
WEB_ORIGIN=https://your-domain.com
PUBLIC_WEB_URL=https://your-domain.com
API_BIND=127.0.0.1:4000
ADMIN_BIND=0.0.0.0:18080
STUDENT_BIND=0.0.0.0:8081
GATEWAY_BIND=0.0.0.0:4396
```

## 3. 一键部署

有三种触发方式：

1. PR 到 `main`：运行 `CI`，只做安装、迁移校验、seed 校验、类型检查、测试、构建和 Docker 镜像构建校验，不部署。
2. push 到普通分支：运行 `CI`，不部署。
3. push 到 `main`：运行 `CI/CD to Aliyun ECS`，先 CI，成功后自动部署到 ECS。
4. GitHub Actions 页面选择 `CI/CD to Aliyun ECS`，点击 `Run workflow` 手动部署。

流水线会执行：

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm db:migrate`
4. `pnpm db:seed`
5. `pnpm typecheck`
6. `pnpm test`
7. `pnpm build`
8. 构建生产 Docker 镜像
9. 用 `git archive` 打包当前 commit，并导出 Docker 镜像包
10. SCP 上传到 ECS
11. ECS 上解压到 `${ECS_APP_DIR}/releases/${GITHUB_SHA}`
12. 复制生产 `.env`
13. 加载 Docker 镜像包
14. 启动 Postgres，执行 `pnpm db:migrate`
15. `docker compose -f docker-compose.prod.yml --env-file .env up -d --no-build --remove-orphans`
16. 在 API 容器内请求 `http://127.0.0.1:4000/api/health` 和 `/api/public/home` 验证部署健康。

生产迁移由 `infra/ecs/deploy.sh` 在启动业务容器前执行；如果手动触发时选择 seed，部署完成后会额外执行 `pnpm db:seed`。

## 4. 首次 seed

首次部署后，如需初始化演示数据，可以在手动触发 workflow 时把 `Run pnpm db:seed after deployment` 选为 `true`。也可以在 ECS 上手动执行：

```bash
cd /opt/nwu_helper/current
docker compose -f docker-compose.prod.yml --env-file .env exec api pnpm db:seed
```

## 5. 查看状态和日志

```bash
cd /opt/nwu_helper/current
docker compose -f docker-compose.prod.yml --env-file .env ps
docker compose -f docker-compose.prod.yml --env-file .env logs -f api
docker compose -f docker-compose.prod.yml --env-file .env logs -f gateway
```

## 6. 回滚

部署目录保留最近 3 个 release。回滚到某个 release：

```bash
cd /opt/nwu_helper
ls releases
ln -sfn /opt/nwu_helper/releases/<release-sha> current
cd current
cp /opt/nwu_helper/shared/.env .env
docker compose -f docker-compose.prod.yml --env-file .env up -d --build --remove-orphans
```

## 7. HTTPS

生产建议用宿主机 Nginx、阿里云 SLB 或 CDN 做 HTTPS 终止，再反代到 Web 容器。

宿主机 Nginx 示例：

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:4396;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
