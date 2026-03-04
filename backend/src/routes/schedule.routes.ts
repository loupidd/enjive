import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.middleware.js";
import { successResponse } from "../types/api.js";

export async function scheduleRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);
  fastify.get("/", async (_req, reply) => reply.send(successResponse([], "TODO: schedule list")));
  fastify.get("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: get schedule")));
  fastify.post("/", async (_req, reply) => reply.status(201).send(successResponse(null, "TODO: create schedule")));
  fastify.patch("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: update schedule")));
  fastify.delete("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: delete schedule")));
}
