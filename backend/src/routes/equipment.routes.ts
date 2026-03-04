import type { FastifyInstance } from "fastify";
import { equipmentController } from "../controllers/equipment.controller.js";
import { authenticate, requireMinRole } from "../middlewares/auth.middleware.js";
import { Role } from "../types/enums.js";

export async function equipmentRoutes(fastify: FastifyInstance) {
  // All equipment routes require authentication
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", equipmentController.getAll);
  fastify.get("/:id", equipmentController.getById);

  fastify.post(
    "/",
    { preHandler: requireMinRole(Role.TECHNICIAN) },
    equipmentController.create
  );

  fastify.patch(
    "/:id",
    { preHandler: requireMinRole(Role.TECHNICIAN) },
    equipmentController.update
  );

  fastify.delete(
    "/:id",
    { preHandler: requireMinRole(Role.MANAGER) },
    equipmentController.delete
  );
}
