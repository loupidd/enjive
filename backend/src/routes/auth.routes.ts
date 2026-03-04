import type { FastifyInstance } from "fastify";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export async function authRoutes(fastify: FastifyInstance) {
  const controller = authController(fastify);

  fastify.post("/login", controller.login);
  fastify.post("/register", controller.register);
  fastify.get("/me", { preHandler: authenticate }, controller.me);
}
