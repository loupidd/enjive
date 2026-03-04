// ─── Users routes stub ──────────────────────────────────────────
import type { FastifyInstance } from "fastify";
import { authenticate, requireMinRole } from "../middlewares/auth.middleware.js";
import { Role } from "../types/enums.js";
import { successResponse } from "../types/api.js";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", async (_req, reply) => reply.send(successResponse([], "TODO: list users")));
  fastify.get("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: get user")));
  fastify.post("/", { preHandler: requireMinRole(Role.ADMIN) }, async (_req, reply) =>
    reply.status(201).send(successResponse(null, "TODO: create user"))
  );
  fastify.patch("/:id", { preHandler: requireMinRole(Role.ADMIN) }, async (_req, reply) =>
    reply.send(successResponse(null, "TODO: update user"))
  );
  fastify.delete("/:id", { preHandler: requireMinRole(Role.ADMIN) }, async (_req, reply) =>
    reply.send(successResponse(null, "TODO: delete user"))
  );
}
