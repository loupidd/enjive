import { scheduleRepository } from "../repositories/schedule.repository.js";
import type { CreateScheduleDto, UpdateScheduleDto, ScheduleQuery } from "../schemas/schedule.schema.js";
import { paginationMeta } from "../types/api.js";

export class ScheduleService {
  async getAll(query: ScheduleQuery) {
    const { items, total } = await scheduleRepository.findAll(query);
    return { items, meta: paginationMeta(total, query.page, query.limit) };
  }

  async getById(id: string) {
    const s = await scheduleRepository.findById(id);
    if (!s) { const err = new Error("Schedule not found") as any; err.statusCode = 404; throw err; }
    return s;
  }

  async create(data: CreateScheduleDto) { return scheduleRepository.create(data); }
  async update(id: string, data: UpdateScheduleDto) { await this.getById(id); return scheduleRepository.update(id, data); }
  async delete(id: string) { await this.getById(id); return scheduleRepository.delete(id); }
}

export const scheduleService = new ScheduleService();
