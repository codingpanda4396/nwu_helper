import type { FastifyRequest } from "fastify";
import { config } from "./config.js";

// 登录功能已移除。requireAuth 变为注入默认用户，
// 保留同名导出以兼容 server.ts 的现有引用。
export async function requireAuth(request: FastifyRequest) {
  request.user = config.defaultUser;
}
