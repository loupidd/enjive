import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";

import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { responseLogger } from "./middlewares/logger.middleware.js";

// ─── Route imports ─────────────────────────────────────────────
import { authRoutes }      from "./routes/auth.routes.js";
import { userRoutes }      from "./routes/users.routes.js";
import { equipmentRoutes } from "./routes/equipment.routes.js";
import { workordersRoutes } from "./routes/workorders.routes.js";
import { troubleRoutes }   from "./routes/trouble.routes.js";
import { scheduleRoutes }  from "./routes/schedule.routes.js";
import { activitiesRoutes } from "./routes/activities.routes.js";
import { reportsRoutes }   from "./routes/reports.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { importRoutes }   from "./routes/import.routes.js";

const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    ...(env.NODE_ENV === "development" && {
      transport: {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" },
      },
    }),
  },
});

async function bootstrap() {
  // ── Plugins ───────────────────────────────────────────────────
  await fastify.register(helmet, { global: true });

  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: "6h" },
  });

  await fastify.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: env.UPLOAD_MAX_SIZE_MB * 1024 * 1024,
    },
  });

  // ── Global hooks ──────────────────────────────────────────────
  fastify.addHook("onSend", responseLogger);

  // ── Error handler ─────────────────────────────────────────────
  fastify.setErrorHandler(errorHandler);

  // ── Health check ──────────────────────────────────────────────
  fastify.get("/health", async () => ({
    status: "ok",
    app: env.APP_NAME,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  }));

  // ── API v1 routes ─────────────────────────────────────────────
  const API_PREFIX = "/api/v1";

  await fastify.register(authRoutes,       { prefix: `${API_PREFIX}/auth` });
  await fastify.register(userRoutes,       { prefix: `${API_PREFIX}/users` });
  await fastify.register(equipmentRoutes,  { prefix: `${API_PREFIX}/equipment` });
  await fastify.register(workordersRoutes, { prefix: `${API_PREFIX}/work-orders` });
  await fastify.register(troubleRoutes,    { prefix: `${API_PREFIX}/trouble` });
  await fastify.register(scheduleRoutes,   { prefix: `${API_PREFIX}/schedule` });
  await fastify.register(activitiesRoutes, { prefix: `${API_PREFIX}/activities` });
  await fastify.register(reportsRoutes,    { prefix: `${API_PREFIX}/reports` });
  await fastify.register(dashboardRoutes,  { prefix: `${API_PREFIX}/dashboard` });
  await fastify.register(importRoutes,     { prefix: `${API_PREFIX}/import` });

  // ── Start ─────────────────────────────────────────────────────
  try {
    await fastify.listen({ port: env.APP_PORT, host: "0.0.0.0" });
    fastify.log.info(`🚀  ${env.APP_NAME} API running on port ${env.APP_PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
