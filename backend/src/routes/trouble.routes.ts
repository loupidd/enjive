import type { FastifyInstance } from "fastify";
import { authenticate, requireMinRole } from "../middlewares/auth.middleware.js";
import { troubleController } from "../controllers/trouble.controller.js";
import { Role } from "../types/enums.js";

export async function troubleRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/",             troubleController.getAll);
  fastify.get("/:id",          troubleController.getById);
  fastify.post("/",            troubleController.create);
  fastify.patch("/:id",        { preHandler: requireMinRole(Role.TECHNICIAN) }, troubleController.update);
  fastify.patch("/:id/status", { preHandler: requireMinRole(Role.TECHNICIAN) }, troubleController.updateStatus);
  fastify.delete("/:id",       { preHandler: requireMinRole(Role.MANAGER) }, troubleController.delete);
}
