import type { FastifyRequest, FastifyReply } from "fastify";
import { workOrderService } from "../services/workorder.service.js";
import {
  workOrderQuerySchema, workOrderIdSchema,
  createWorkOrderSchema, updateWorkOrderSchema,
  updateWorkOrderStatusSchema, createWorkReportSchema,
} from "../schemas/workorder.schema.js";
import { successResponse } from "../types/api.js";

export const workOrderController = {
  async getAll(req: FastifyRequest, reply: FastifyReply) {
    const query = workOrderQuerySchema.parse(req.query);
    const { items, meta } = await workOrderService.getAll(query);
    return reply.send(successResponse(items, undefined, meta));
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdSchema.parse(req.params);
    return reply.send(successResponse(await workOrderService.getById(id)));
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const data = createWorkOrderSchema.parse(req.body);
    const wo = await workOrderService.create(data, (req as any).user.sub);
    return reply.status(201).send(successResponse(wo, "Work order created"));
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdSchema.parse(req.params);
    const data = updateWorkOrderSchema.parse(req.body);
    return reply.send(successResponse(await workOrderService.update(id, data), "Work order updated"));
  },

  async updateStatus(req: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdSchema.parse(req.params);
    const dto = updateWorkOrderStatusSchema.parse(req.body);
    await workOrderService.updateStatus(id, dto, (req as any).user.sub);
    return reply.send(successResponse(null, `Status updated to ${dto.status}`));
  },

  async addWorkReport(req: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdSchema.parse(req.params);
    const data = createWorkReportSchema.parse(req.body);
    const report = await workOrderService.addWorkReport(id, (req as any).user.sub, data);
    return reply.status(201).send(successResponse(report, "Work report submitted"));
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdSchema.parse(req.params);
    await workOrderService.delete(id);
    return reply.send(successResponse(null, "Work order deleted"));
  },
};
