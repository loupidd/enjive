import type { FastifyInstance } from "fastify";
import {
  authenticate,
  requireMinRole,
} from "../middlewares/auth.middleware.js";
import { userController } from "../controllers/user.controller.js";
import { Role } from "../types/enums.js";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", userController.getAll);
  fastify.get("/:id", userController.getById);
  fastify.post(
    "/",
    { preHandler: requireMinRole(Role.ADMIN) },
    userController.create,
  );
  fastify.patch(
    "/:id",
    { preHandler: requireMinRole(Role.ADMIN) },
    userController.update,
  );
  fastify.patch("/:id/password", userController.changePassword);
  // SUPER_ADMIN only — force-reset any user password without knowing current
  fastify.patch(
    "/:id/reset-password",
    { preHandler: requireMinRole(Role.SUPER_ADMIN) },
    userController.resetPassword,
  );
  fastify.delete(
    "/:id",
    { preHandler: requireMinRole(Role.ADMIN) },
    userController.delete,
  );
}
