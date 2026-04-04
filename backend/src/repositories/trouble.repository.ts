import { prisma } from "../config/prisma.js";
import type { CreateTroubleDto, UpdateTroubleDto, TroubleQuery } from "../schemas/trouble.schema.js";

export class TroubleRepository {
  async findAll(query: TroubleQuery) {
    const { page, limit, search, status, severity, equipmentId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(status      && { status }),
      ...(severity    && { severity }),
      ...(equipmentId && { equipmentId }),
      ...(search && {
        OR: [
          { code:  { contains: search } },
          { title: { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.troubleReport.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          equipment:   { select: { id:true, code:true, name:true } },
          reportedBy:  { select: { id:true, firstName:true, lastName:true, avatarUrl:true } },
        },
      }),
      prisma.troubleReport.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    return prisma.troubleReport.findFirst({
      where: { id, deletedAt: null },
      include: {
        equipment:    { select: { id:true, code:true, name:true, location:true } },
        reportedBy:   { select: { id:true, firstName:true, lastName:true, role:true } },
        statusHistory:{ orderBy: { createdAt:"desc" }, take: 20 },
        workOrders:   { select: { id:true, code:true, title:true, status:true } },
      },
    });
  }

  async create(data: CreateTroubleDto, reportedById: string) {
    return prisma.troubleReport.create({ data: { ...data, reportedById } });
  }

  async update(id: string, data: UpdateTroubleDto) {
    return prisma.troubleReport.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string, changedById: string, reason?: string) {
    const tr = await prisma.troubleReport.findUnique({ where: { id }, select: { status: true } });
    return prisma.$transaction([
      prisma.troubleReport.update({
        where: { id },
        data: {
          status: status as any,
          ...(status === "RESOLVED" && { resolvedAt: new Date() }),
        },
      }),
      prisma.troubleStatusHistory.create({
        data: { troubleReportId: id, fromStatus: tr?.status, toStatus: status as any, changedById, reason },
      }),
    ]);
  }

  async softDelete(id: string) {
    return prisma.troubleReport.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export const troubleRepository = new TroubleRepository();
