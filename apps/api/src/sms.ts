import { prisma } from "./db.js";

export async function sendSmsCode(phone: string, code: string) {
  console.log(`[SMS] 发送验证码到 ${phone}: ${code}`);
  return { success: true };
}

export async function canSendSms(phone: string): Promise<boolean> {
  const latest = await prisma.smsCode.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return true;
  const elapsed = Date.now() - latest.createdAt.getTime();
  return elapsed >= 60_000;
}
