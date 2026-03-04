import { equipmentRepository } from "../repositories/equipment.repository.js";
import type { CreateEquipmentDto, UpdateEquipmentDto, EquipmentQuery } from "../schemas/equipment.schema.js";
import { paginationMeta } from "../types/api.js";

export class EquipmentService {
  async getAll(query: EquipmentQuery) {
    const { items, total } = await equipmentRepository.findAll(query);
    const meta = paginationMeta(total, query.page, query.limit);
    return { items, meta };
  }

  async getById(id: string) {
    const equipment = await equipmentRepository.findById(id);
    if (!equipment) {
      const err = new Error("Equipment not found") as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    return equipment;
  }

  async create(data: CreateEquipmentDto) {
    // Duplicate detection
    const existing = await equipmentRepository.checkDuplicate(data.code);
    if (existing) {
      const err = new Error(`Equipment with code "${data.code}" already exists`) as Error & { statusCode: number };
      err.statusCode = 409;
      throw err;
    }
    return equipmentRepository.create(data);
  }

  async update(id: string, data: UpdateEquipmentDto) {
    await this.getById(id); // ensure exists
    return equipmentRepository.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id); // ensure exists
    return equipmentRepository.softDelete(id);
  }
}

export const equipmentService = new EquipmentService();
