import type { FastifyRequest, FastifyReply } from "fastify";
import { scheduleService } from "../services/schedule.service.js";
import {
  scheduleQuerySchema, scheduleIdSchema,
  createScheduleSchema, updateScheduleSchema,
} from "../schemas/schedule.schema.js";
import { successResponse } from "../types/api.js";

export const scheduleController = {
  async getAll(req: FastifyRequest, reply: FastifyReply) {
    const query = scheduleQuerySchema.parse(req.query);
    const { items, meta } = await scheduleService.getAll(query);
    return reply.send(successResponse(items, undefined, meta));
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = scheduleIdSchema.parse(req.params);
    return reply.send(successResponse(await scheduleService.getById(id)));
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const data = createScheduleSchema.parse(req.body);
    return reply.status(201).send(successResponse(await scheduleService.create(data), "Schedule created"));
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = scheduleIdSchema.parse(req.params);
    const data = updateScheduleSchema.parse(req.body);
    return reply.send(successResponse(await scheduleService.update(id, data), "Schedule updated"));
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = scheduleIdSchema.parse(req.params);
    await scheduleService.delete(id);
    return reply.send(successResponse(null, "Schedule deleted"));
  },
};
