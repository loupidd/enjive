import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.middleware.js";
import { successResponse } from "../types/api.js";

export async function troubleRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);
  fastify.get("/", async (_req, reply) => reply.send(successResponse([], "TODO: trouble list")));
  fastify.get("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: get trouble")));
  fastify.post("/", async (_req, reply) => reply.status(201).send(successResponse(null, "TODO: create trouble")));
  fastify.patch("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: update trouble")));
  fastify.delete("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: delete trouble")));
}
