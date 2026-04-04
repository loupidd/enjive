import { activityRepository } from "../repositories/activity.repository.js";
import type { CreateActivityDto, ActivityQuery } from "../schemas/activity.schema.js";
import { paginationMeta } from "../types/api.js";

export class ActivityService {
  async getAll(query: ActivityQuery) {
    const { items, total } = await activityRepository.findAll(query);
    return { items, meta: paginationMeta(total, query.page, query.limit) };
  }

  async getById(id: string) {
    const a = await activityRepository.findById(id);
    if (!a) { const err = new Error("Activity not found") as any; err.statusCode = 404; throw err; }
    return a;
  }

  async create(data: CreateActivityDto, performedById: string) {
    return activityRepository.create(data, performedById);
  }
}

export const activityService = new ActivityService();
