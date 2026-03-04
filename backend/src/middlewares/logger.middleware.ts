import type { FastifyRequest, FastifyReply } from "fastify";

export async function requestLogger(request: FastifyRequest, reply: FastifyReply) {
  reply.addHook = reply.addHook; // no-op placeholder
  // Fastify natively logs via pino; this hook adds custom fields
  request.log.info({
    method: request.method,
    url: request.url,
    ip: request.ip,
    userId: (request as any).user?.sub ?? "anonymous",
  });
}

export async function responseLogger(request: FastifyRequest, reply: FastifyReply, payload: unknown) {
  request.log.info({
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    userId: (request as any).user?.sub ?? "anonymous",
  });
  return payload;
}
