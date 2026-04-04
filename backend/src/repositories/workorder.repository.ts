import { prisma } from "../config/prisma.js";
import type { CreateWorkOrderDto, UpdateWorkOrderDto, WorkOrderQuery, CreateWorkReportDto } from "../schemas/workorder.schema.js";

export class WorkOrderRepository {
  async findAll(query: WorkOrderQuery) {
    const { page, limit, search, status, priority, type, equipmentId, assignedToId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(status       && { status }),
      ...(priority     && { priority }),
      ...(type         && { type }),
      ...(equipmentId  && { equipmentId }),
      ...(assignedToId && { assignedToId }),
      ...(search && {
        OR: [
          { code:  { contains: search } },
          { title: { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.workOrder.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          equipment:  { select: { id:true, code:true, name:true } },
          assignedTo: { select: { id:true, firstName:true, lastName:true, avatarUrl:true } },
          createdBy:  { select: { id:true, firstName:true, lastName:true } },
        },
      }),
      prisma.workOrder.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.workOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        equipment:     { select: { id:true, code:true, name:true, location:true } },
        assignedTo:    { select: { id:true, firstName:true, lastName:true, avatarUrl:true, role:true } },
        createdBy:     { select: { id:true, firstName:true, lastName:true } },
        schedule:      { select: { id:true, title:true, frequency:true } },
        troubleReport: { select: { id:true, code:true, title:true } },
        statusHistory: { orderBy: { createdAt:"desc" }, take: 20 },
        workReports:   {
          include: { technician: { select:{ id:true, firstName:true, lastName:true } } },
          orderBy: { createdAt:"desc" },
        },
      },
    });
  }

  async create(data: CreateWorkOrderDto, createdById: string) {
    return prisma.workOrder.create({
      data: { ...data, createdById },
      include: {
        equipment:  { select: { id:true, code:true, name:true } },
        assignedTo: { select: { id:true, firstName:true, lastName:true } },
      },
    });
  }

  async update(id: string, data: UpdateWorkOrderDto) {
    return prisma.workOrder.update({
      where: { id },
      data,
      include: { equipment: { select: { id:true, code:true, name:true } } },
    });
  }

  async updateStatus(id: string, status: string, changedById: string, reason?: string) {
    const wo = await prisma.workOrder.findUnique({ where: { id }, select: { status: true } });
    return prisma.$transaction([
      prisma.workOrder.update({
        where: { id },
        data: {
          status: status as any,
          ...(status === "IN_PROGRESS" && { startedAt: new Date() }),
          ...(status === "COMPLETED"   && { completedAt: new Date() }),
        },
      }),
      prisma.workOrderStatusHistory.create({
        data: { workOrderId: id, fromStatus: wo?.status, toStatus: status as any, changedById, reason },
      }),
    ]);
  }

  async addWorkReport(workOrderId: string, technicianId: string, data: CreateWorkReportDto) {
    return prisma.workReport.create({
      data: { workOrderId, technicianId, ...data },
    });
  }

  async softDelete(id: string) {
    return prisma.workOrder.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export const workOrderRepository = new WorkOrderRepository();
