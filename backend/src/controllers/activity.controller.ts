import type { FastifyRequest, FastifyReply } from "fastify";
import { activityService } from "../services/activity.service.js";
import {
  activityQuerySchema, activityIdSchema, createActivitySchema,
} from "../schemas/activity.schema.js";
import { successResponse } from "../types/api.js";

export const activityController = {
  async getAll(req: FastifyRequest, reply: FastifyReply) {
    const query = activityQuerySchema.parse(req.query);
    const { items, meta } = await activityService.getAll(query);
    return reply.send(successResponse(items, undefined, meta));
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = activityIdSchema.parse(req.params);
    return reply.send(successResponse(await activityService.getById(id)));
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const data = createActivitySchema.parse(req.body);
    const log = await activityService.create(data, (req as any).user.sub);
    return reply.status(201).send(successResponse(log, "Activity logged"));
  },
};
