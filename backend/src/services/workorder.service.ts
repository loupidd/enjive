import { workOrderRepository } from "../repositories/workorder.repository.js";
import { WORK_ORDER_TRANSITIONS, WorkOrderStatus } from "../types/enums.js";
import type { CreateWorkOrderDto, UpdateWorkOrderDto, UpdateWorkOrderStatus, WorkOrderQuery, CreateWorkReportDto } from "../schemas/workorder.schema.js";
import { paginationMeta } from "../types/api.js";

export class WorkOrderService {
  async getAll(query: WorkOrderQuery) {
    const { items, total } = await workOrderRepository.findAll(query);
    return { items, meta: paginationMeta(total, query.page, query.limit) };
  }

  async getById(id: string) {
    const wo = await workOrderRepository.findById(id);
    if (!wo) this.notFound();
    return wo;
  }

  async create(data: CreateWorkOrderDto, createdById: string) {
    return workOrderRepository.create(data, createdById);
  }

  async update(id: string, data: UpdateWorkOrderDto) {
    await this.getById(id);
    return workOrderRepository.update(id, data);
  }

  async updateStatus(id: string, dto: UpdateWorkOrderStatus, changedById: string) {
    const wo = await this.getById(id) as any;
    const allowed = WORK_ORDER_TRANSITIONS[wo.status as WorkOrderStatus] ?? [];
    if (!allowed.includes(dto.status as WorkOrderStatus)) {
      const err = new Error(`Cannot transition from ${wo.status} to ${dto.status}`) as any;
      err.statusCode = 422; throw err;
    }
    return workOrderRepository.updateStatus(id, dto.status, changedById, dto.reason);
  }

  async addWorkReport(id: string, technicianId: string, data: CreateWorkReportDto) {
    await this.getById(id);
    return workOrderRepository.addWorkReport(id, technicianId, data);
  }

  async delete(id: string) {
    await this.getById(id);
    return workOrderRepository.softDelete(id);
  }

  private notFound(): never {
    const err = new Error("Work order not found") as any;
    err.statusCode = 404; throw err;
  }
}

export const workOrderService = new WorkOrderService();
