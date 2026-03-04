import type { FastifyRequest, FastifyReply } from "fastify";
import { equipmentService } from "../services/equipment.service.js";
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  equipmentQuerySchema,
  equipmentIdSchema,
} from "../schemas/equipment.schema.js";
import { successResponse } from "../types/api.js";

export const equipmentController = {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const query = equipmentQuerySchema.parse(request.query);
    const { items, meta } = await equipmentService.getAll(query);
    return reply.send(successResponse(items, undefined, meta));
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = equipmentIdSchema.parse(request.params);
    const equipment = await equipmentService.getById(id);
    return reply.send(successResponse(equipment));
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createEquipmentSchema.parse(request.body);
    const equipment = await equipmentService.create(data);
    return reply.status(201).send(successResponse(equipment, "Equipment created successfully"));
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = equipmentIdSchema.parse(request.params);
    const data = updateEquipmentSchema.parse(request.body);
    const equipment = await equipmentService.update(id, data);
    return reply.send(successResponse(equipment, "Equipment updated successfully"));
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = equipmentIdSchema.parse(request.params);
    await equipmentService.delete(id);
    return reply.send(successResponse(null, "Equipment deleted successfully"));
  },
};
