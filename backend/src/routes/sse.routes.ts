/**
 * SSE route — GET /api/v1/events
 *
 * Authenticated clients connect here and receive real-time events
 * as text/event-stream. The connection stays open; the client
 * reconnects automatically via the browser EventSource API.
 */
import type { FastifyInstance } from "fastify";
import { authenticate }        from "../middlewares/auth.middleware.js";
import { eventsBus }           from "../services/events.service.js";

export async function sseRoutes(fastify: FastifyInstance) {

  fastify.get("/", { preHandler: authenticate }, async (req, reply) => {
    const user     = (req as any).user;
    const userId   = user.sub   as string;
    const userSite = user.site  as string ?? "EDA";

    // Set SSE headers
    reply.raw.writeHead(200, {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering
    });
    reply.raw.flushHeaders();

    // Send initial connected event
    reply.raw.write(`event: connected\ndata: ${JSON.stringify({ userId, userSite })}\n\n`);

    const sub = { reply, userId, userSite };
    eventsBus.add(sub);
    fastify.log.info(`SSE: +1 (${eventsBus.size} total) — user ${userId} site ${userSite}`);

    // Remove subscriber when client disconnects
    req.raw.on("close", () => {
      eventsBus.remove(sub);
      fastify.log.info(`SSE: -1 (${eventsBus.size} total) — user ${userId} disconnected`);
    });

    // Keep the reply open — return a never-resolving promise
    await new Promise<void>((resolve) => {
      req.raw.on("close", resolve);
      req.raw.on("error", resolve);
    });
  });
}
