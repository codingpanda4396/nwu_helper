import bcrypt from "bcryptjs";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";
import { config } from "./config.js";
import { canSendSms, sendSmsCode } from "./sms.js";

const loginSchema = z.object({
  phone: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  account: z.string().min(1).optional(),
  password: z.string().min(1)
}).refine((data) => data.phone || data.username || data.account, "账号不能为空");

const smsSendSchema = z.object({
  phone: z.string().min(1)
});

const smsLoginSchema = z.object({
  phone: z.string().min(1),
  code: z.string().min(1)
});

const wxLoginSchema = z.object({
  code: z.string().min(1)
});

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

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

  // 微信登录
  app.post("/api/auth/wx-login", async (request, reply) => {
    const parsed = wxLoginSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "参数错误");

    try {
      const wxRes = await fetch(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wx.appId}&secret=${config.wx.appSecret}&js_code=${parsed.data.code}&grant_type=authorization_code`
      );
      const wxData = await wxRes.json() as { openid?: string; errcode?: number; errmsg?: string };

      if (!wxData.openid) {
        return fail(reply, "WX_LOGIN_FAILED", "微信登录失败", 401);
      }

      const user = await prisma.user.upsert({
        where: { openid: wxData.openid },
        create: { openid: wxData.openid, name: "微信用户", role: "STUDENT", registerSource: "miniprogram" },
        update: { lastLoginAt: new Date() }
      });

      const token = app.jwt.sign({ sub: user.id, role: user.role, name: user.name });
      return ok(reply, {
        token,
        user: { id: user.id, name: user.name, nickname: user.nickname, avatarUrl: user.avatarUrl, phone: user.phone, role: user.role }
      });
    } catch (e) {
      return fail(reply, "WX_LOGIN_FAILED", "微信登录失败", 401);
    }
  });

  // 发送短信验证码
  app.post("/api/auth/sms/send", async (request, reply) => {
    const parsed = smsSendSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "手机号不能为空");

    const { phone } = parsed.data;
    const canSend = await canSendSms(phone);
    if (!canSend) return fail(reply, "SMS_TOO_FREQUENT", "验证码发送过于频繁，请60秒后再试", 429);

    const code = generateCode();
    await prisma.smsCode.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      }
    });

    await sendSmsCode(phone, code);
    return ok(reply, {});
  });

  // 短信验证码登录
  app.post("/api/auth/sms/login", async (request, reply) => {
    const parsed = smsLoginSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "手机号和验证码不能为空");

    const { phone, code } = parsed.data;

    const smsCode = await prisma.smsCode.findFirst({
      where: {
        phone,
        consumed: false,
        code,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!smsCode) return fail(reply, "SMS_CODE_INVALID", "验证码错误或已过期", 401);

    await prisma.smsCode.update({
      where: { id: smsCode.id },
      data: { consumed: true }
    });

    const user = await prisma.user.upsert({
      where: { phone },
      create: { phone, name: phone, role: "STUDENT", registerSource: "h5" },
      update: { lastLoginAt: new Date() }
    });

    const token = app.jwt.sign({ sub: user.id, role: user.role, name: user.name });
    return ok(reply, {
      token,
      user: { id: user.id, name: user.name, nickname: user.nickname, avatarUrl: user.avatarUrl, phone: user.phone, role: user.role }
    });
  });
}

export async function requireAuth(request: FastifyRequest) {
  await request.jwtVerify();
}
