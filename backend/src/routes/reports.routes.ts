import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.middleware.js";
import { successResponse } from "../types/api.js";

export async function reportsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);
  fastify.get("/", async (_req, reply) => reply.send(successResponse([], "TODO: reports list")));
  fastify.get("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: get reports")));
  fastify.post("/", async (_req, reply) => reply.status(201).send(successResponse(null, "TODO: create reports")));
  fastify.patch("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: update reports")));
  fastify.delete("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: delete reports")));
}
