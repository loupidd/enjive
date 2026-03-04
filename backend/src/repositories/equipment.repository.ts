import { prisma } from "../config/prisma.js";
import type { CreateEquipmentDto, UpdateEquipmentDto, EquipmentQuery } from "../schemas/equipment.schema.js";

export class EquipmentRepository {
  async findAll(query: EquipmentQuery) {
    const { page, limit, search, status, category, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(status && { status }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
          { serialNumber: { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.equipment.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.equipment.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByCode(code: string) {
    return prisma.equipment.findFirst({
      where: { code, deletedAt: null },
    });
  }

  /** Duplicate detection placeholder */
  async checkDuplicate(code: string, excludeId?: string) {
    return prisma.equipment.findFirst({
      where: {
        code,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: CreateEquipmentDto) {
    return prisma.equipment.create({ data });
  }

  async update(id: string, data: UpdateEquipmentDto) {
    return prisma.equipment.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.equipment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const equipmentRepository = new EquipmentRepository();
