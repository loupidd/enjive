import type { FastifyInstance } from "fastify";
import { authenticate, requireMinRole } from "../middlewares/auth.middleware.js";
import { workOrderController } from "../controllers/workorder.controller.js";
import { Role } from "../types/enums.js";

export async function workordersRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/",           workOrderController.getAll);
  fastify.get("/:id",        workOrderController.getById);
  fastify.post("/",          { preHandler: requireMinRole(Role.TECHNICIAN) }, workOrderController.create);
  fastify.patch("/:id",      { preHandler: requireMinRole(Role.TECHNICIAN) }, workOrderController.update);
  fastify.patch("/:id/status", { preHandler: requireMinRole(Role.TECHNICIAN) }, workOrderController.updateStatus);
  fastify.post("/:id/reports", { preHandler: requireMinRole(Role.TECHNICIAN) }, workOrderController.addWorkReport);
  fastify.delete("/:id",     { preHandler: requireMinRole(Role.MANAGER) }, workOrderController.delete);
}
