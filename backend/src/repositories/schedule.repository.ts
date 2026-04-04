import { prisma } from "../config/prisma.js";
import type { CreateScheduleDto, UpdateScheduleDto, ScheduleQuery } from "../schemas/schedule.schema.js";

export class ScheduleRepository {
  async findAll(query: ScheduleQuery) {
    const { page, limit, search, frequency, equipmentId, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(frequency   !== undefined && { frequency }),
      ...(equipmentId !== undefined && { equipmentId }),
      ...(isActive    !== undefined && { isActive }),
      ...(search && {
        OR: [
          { title:       { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.schedule.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { equipment: { select:{ id:true, code:true, name:true } } },
      }),
      prisma.schedule.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    return prisma.schedule.findFirst({
      where: { id },
      include: {
        equipment:  { select: { id:true, code:true, name:true, location:true } },
        workOrders: { select: { id:true, code:true, status:true, createdAt:true }, orderBy: { createdAt:"desc" }, take: 10 },
      },
    });
  }

  async create(data: CreateScheduleDto) {
    // Calculate first nextRunAt = startDate
    return prisma.schedule.create({
      data: { ...data, nextRunAt: data.startDate },
      include: { equipment: { select: { id:true, code:true, name:true } } },
    });
  }

  async update(id: string, data: UpdateScheduleDto) {
    return prisma.schedule.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.schedule.delete({ where: { id } });
  }
}

export const scheduleRepository = new ScheduleRepository();
