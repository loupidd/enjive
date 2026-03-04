import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { authService } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { successResponse } from "../types/api.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export function authController(fastify: FastifyInstance) {
  return {
    async login(request: FastifyRequest, reply: FastifyReply) {
      const dto = loginSchema.parse(request.body);
      const result = await authService.login(fastify, dto);
      return reply.send(successResponse(result, "Login successful"));
    },

    async register(request: FastifyRequest, reply: FastifyReply) {
      const dto = registerSchema.parse(request.body);
      const user = await authService.register(dto);
      return reply.status(201).send(successResponse(user, "User registered"));
    },

    async me(request: FastifyRequest, reply: FastifyReply) {
      await authenticate(request, reply);
      const user = await authService.me(request.user.sub);
      return reply.send(successResponse(user));
    },
  };
}
