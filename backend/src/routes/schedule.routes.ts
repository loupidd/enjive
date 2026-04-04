import type { FastifyInstance } from "fastify";
import { authenticate, requireMinRole } from "../middlewares/auth.middleware.js";
import { scheduleController } from "../controllers/schedule.controller.js";
import { Role } from "../types/enums.js";

export async function scheduleRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/",     scheduleController.getAll);
  fastify.get("/:id",  scheduleController.getById);
  fastify.post("/",    { preHandler: requireMinRole(Role.MANAGER) }, scheduleController.create);
  fastify.patch("/:id",{ preHandler: requireMinRole(Role.MANAGER) }, scheduleController.update);
  fastify.delete("/:id",{ preHandler: requireMinRole(Role.MANAGER) }, scheduleController.delete);
}
