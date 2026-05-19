import bcrypt from "bcryptjs";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";

const loginSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1)
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "手机号和密码不能为空");

    const user = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
    if (!user || user.status !== "ACTIVE" || !user.passwordHash) return fail(reply, "AUTH_FAILED", "账号或密码错误", 401);

    const matched = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!matched) return fail(reply, "AUTH_FAILED", "账号或密码错误", 401);

    const token = app.jwt.sign({ sub: user.id, role: user.role, name: user.name });
    return ok(reply, {
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
    });
  });
}

export async function requireAuth(request: FastifyRequest) {
  await request.jwtVerify();
}
