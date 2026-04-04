import { troubleRepository } from "../repositories/trouble.repository.js";
import { TROUBLE_TRANSITIONS, TroubleStatus } from "../types/enums.js";
import type { CreateTroubleDto, UpdateTroubleDto, UpdateTroubleStatus, TroubleQuery } from "../schemas/trouble.schema.js";
import { paginationMeta } from "../types/api.js";

export class TroubleService {
  async getAll(query: TroubleQuery) {
    const { items, total } = await troubleRepository.findAll(query);
    return { items, meta: paginationMeta(total, query.page, query.limit) };
  }

  async getById(id: string) {
    const tr = await troubleRepository.findById(id);
    if (!tr) this.notFound();
    return tr;
  }

  async create(data: CreateTroubleDto, reportedById: string) {
    return troubleRepository.create(data, reportedById);
  }

  async update(id: string, data: UpdateTroubleDto) {
    await this.getById(id);
    return troubleRepository.update(id, data);
  }

  async updateStatus(id: string, dto: UpdateTroubleStatus, changedById: string) {
    const tr = await this.getById(id) as any;
    const allowed = TROUBLE_TRANSITIONS[tr.status as TroubleStatus] ?? [];
    if (!allowed.includes(dto.status as TroubleStatus)) {
      const err = new Error(`Cannot transition from ${tr.status} to ${dto.status}`) as any;
      err.statusCode = 422; throw err;
    }
    return troubleRepository.updateStatus(id, dto.status, changedById, dto.reason);
  }

  async delete(id: string) {
    await this.getById(id);
    return troubleRepository.softDelete(id);
  }

  private notFound(): never {
    const err = new Error("Trouble report not found") as any;
    err.statusCode = 404; throw err;
  }
}

export const troubleService = new TroubleService();
