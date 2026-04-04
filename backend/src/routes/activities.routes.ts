import type { FastifyInstance } from "fastify";
import { authenticate, requireMinRole } from "../middlewares/auth.middleware.js";
import { activityController } from "../controllers/activity.controller.js";
import { Role } from "../types/enums.js";

export async function activitiesRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/",     activityController.getAll);
  fastify.get("/:id",  activityController.getById);
  fastify.post("/",    { preHandler: requireMinRole(Role.TECHNICIAN) }, activityController.create);
}
