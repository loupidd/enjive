import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.middleware.js";
import { successResponse } from "../types/api.js";

export async function activitiesRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);
  fastify.get("/", async (_req, reply) => reply.send(successResponse([], "TODO: activities list")));
  fastify.get("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: get activities")));
  fastify.post("/", async (_req, reply) => reply.status(201).send(successResponse(null, "TODO: create activities")));
  fastify.patch("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: update activities")));
  fastify.delete("/:id", async (_req, reply) => reply.send(successResponse(null, "TODO: delete activities")));
}
