import { prisma } from "../config/prisma.js";
import type { CreateActivityDto, ActivityQuery } from "../schemas/activity.schema.js";

export class ActivityRepository {
  async findAll(query: ActivityQuery) {
    const { page, limit, search, type, equipmentId, from, to, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(type        && { type }),
      ...(equipmentId && { equipmentId }),
      ...(from || to) && {
        performedAt: {
          ...(from && { gte: from }),
          ...(to   && { lte: to   }),
        },
      },
      ...(search && {
        OR: [
          { description: { contains: search } },
          { notes:       { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          equipment:   { select: { id:true, code:true, name:true } },
          performedBy: { select: { id:true, firstName:true, lastName:true, avatarUrl:true } },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    return prisma.activityLog.findFirst({
      where: { id },
      include: {
        equipment:   { select: { id:true, code:true, name:true } },
        performedBy: { select: { id:true, firstName:true, lastName:true } },
      },
    });
  }

  async create(data: CreateActivityDto, performedById: string) {
    return prisma.activityLog.create({
      data: { ...data, performedById, performedAt: data.performedAt ?? new Date() },
    });
  }
}

export const activityRepository = new ActivityRepository();
