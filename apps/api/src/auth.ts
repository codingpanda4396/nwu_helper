import bcrypt from "bcryptjs";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";

const loginSchema = z.object({
  phone: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  account: z.string().min(1).optional(),
  password: z.string().min(1)
}).refine((data) => data.phone || data.username || data.account, "账号不能为空");

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "账号和密码不能为空");

    const account = parsed.data.account ?? parsed.data.username ?? parsed.data.phone;
    const accountWhere = [];
    if (parsed.data.username || parsed.data.account) accountWhere.push({ username: account });
    if (parsed.data.phone || parsed.data.account) accountWhere.push({ phone: account });
    const user = await prisma.user.findFirst({
      where: { OR: accountWhere }
    });
    if (!user || user.status !== "ACTIVE" || !user.passwordHash) return fail(reply, "AUTH_FAILED", "账号或密码错误", 401);

    const matched = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!matched) return fail(reply, "AUTH_FAILED", "账号或密码错误", 401);

    const token = app.jwt.sign({ sub: user.id, role: user.role, name: user.name });
    return ok(reply, {
      token,
      user: { id: user.id, name: user.name, username: user.username, phone: user.phone, role: user.role }
    });
  });
}

export async function requireAuth(request: FastifyRequest) {
  await request.jwtVerify();
}
