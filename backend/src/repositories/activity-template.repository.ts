import { prisma } from "../config/prisma.js";

export interface ActivityTemplateQuery {
  equipmentType?: string;
  classification?: string;
  interval?: string;
  page?: number;
  limit?: number;
}

export interface CreateActivityTemplateDto {
  equipmentType: string;
  classification: string;
  interval: string;
  name: string;
  type: string;
  answerType?: string;
  unit?: string;
  optimum?: string;
  min?: string;
  max?: string;
  sort?: number;
  status?: string;
}

export const activityTemplateRepository = {
  async findAll(q: ActivityTemplateQuery) {
    const where: any = {};
    if (q.equipmentType) where.equipmentType = q.equipmentType;
    if (q.classification) where.classification = q.classification;
    if (q.interval) where.interval = q.interval;

    const page = q.page ?? 1;
    const limit = q.limit ?? 200;
    const [items, total] = await Promise.all([
      prisma.activityTemplate.findMany({
        where,
        orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityTemplate.count({ where }),
    ]);
    return { items, total };
  },

  async create(data: CreateActivityTemplateDto) {
    return prisma.activityTemplate.create({ data });
  },

  async update(id: string, data: Partial<CreateActivityTemplateDto>) {
    return prisma.activityTemplate.update({ where: { id }, data });
  },

  async remove(id: string) {
    return prisma.activityTemplate.delete({ where: { id } });
  },

  async bulkCreate(items: CreateActivityTemplateDto[]) {
    return prisma.activityTemplate.createMany({
      data: items,
      skipDuplicates: true,
    });
  },
};
