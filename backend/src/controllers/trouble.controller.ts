import type { FastifyRequest, FastifyReply } from "fastify";
import { troubleService } from "../services/trouble.service.js";
import {
  troubleQuerySchema, troubleIdSchema,
  createTroubleSchema, updateTroubleSchema, updateTroubleStatusSchema,
} from "../schemas/trouble.schema.js";
import { successResponse } from "../types/api.js";

export const troubleController = {
  async getAll(req: FastifyRequest, reply: FastifyReply) {
    const query = troubleQuerySchema.parse(req.query);
    const { items, meta } = await troubleService.getAll(query);
    return reply.send(successResponse(items, undefined, meta));
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = troubleIdSchema.parse(req.params);
    return reply.send(successResponse(await troubleService.getById(id)));
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const data = createTroubleSchema.parse(req.body);
    const tr = await troubleService.create(data, (req as any).user.sub);
    return reply.status(201).send(successResponse(tr, "Trouble report created"));
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = troubleIdSchema.parse(req.params);
    const data = updateTroubleSchema.parse(req.body);
    return reply.send(successResponse(await troubleService.update(id, data), "Trouble report updated"));
  },

  async updateStatus(req: FastifyRequest, reply: FastifyReply) {
    const { id } = troubleIdSchema.parse(req.params);
    const dto = updateTroubleStatusSchema.parse(req.body);
    await troubleService.updateStatus(id, dto, (req as any).user.sub);
    return reply.send(successResponse(null, `Status updated to ${dto.status}`));
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = troubleIdSchema.parse(req.params);
    await troubleService.delete(id);
    return reply.send(successResponse(null, "Trouble report deleted"));
  },
};
