import type { FastifyReply } from "fastify";

export function ok<T>(reply: FastifyReply, data: T, message = "") {
  return reply.send({ success: true, data, message });
}

export function fail(reply: FastifyReply, code: string, message: string, statusCode = 400) {
  return reply.status(statusCode).send({
    success: false,
    error: { code, message }
  });
}
