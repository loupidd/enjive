import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.middleware.js";
import { prisma } from "../config/prisma.js";
import { successResponse } from "../types/api.js";
import { z } from "zod";

const reportQuerySchema = z.object({
  from:  z.coerce.date().optional(),
  to:    z.coerce.date().optional(),
  year:  z.coerce.number().int().optional(),
});

export async function reportsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // GET /api/v1/reports — aggregated stats for Reports page
  fastify.get("/", async (req, reply) => {
    const { from, to, year } = reportQuerySchema.parse(req.query);

    const now  = new Date();
    const yr   = year ?? now.getFullYear();
    const dateFrom = from ?? new Date(yr, 0, 1);
    const dateTo   = to   ?? new Date(yr, 11, 31, 23, 59, 59);

    const [
      workOrdersByStatus,
      workOrdersByType,
      workOrdersByMonth,
      troubleBySeverity,
      troubleByMonth,
      avgCompletionHours,
      topEquipmentByWO,
    ] = await Promise.all([
      // WO counts by status
      prisma.workOrder.groupBy({
        by: ["status"],
        where: { deletedAt: null, createdAt: { gte: dateFrom, lte: dateTo } },
        _count: { id: true },
      }),

      // WO counts by type
      prisma.workOrder.groupBy({
        by: ["type"],
        where: { deletedAt: null, createdAt: { gte: dateFrom, lte: dateTo } },
        _count: { id: true },
      }),

      // WO counts per month (raw — last 12 months)
      prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count
        FROM work_orders
        WHERE deletedAt IS NULL
          AND createdAt >= ${dateFrom} AND createdAt <= ${dateTo}
        GROUP BY month ORDER BY month ASC
      `,

      // Trouble by severity
      prisma.troubleReport.groupBy({
        by: ["severity"],
        where: { deletedAt: null, createdAt: { gte: dateFrom, lte: dateTo } },
        _count: { id: true },
      }),

      // Trouble per month
      prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count
        FROM trouble_reports
        WHERE deletedAt IS NULL
          AND createdAt >= ${dateFrom} AND createdAt <= ${dateTo}
        GROUP BY month ORDER BY month ASC
      `,

      // Average completion time
      prisma.workOrder.aggregate({
        where: { deletedAt: null, status: "COMPLETED", actualHours: { not: null } },
        _avg: { actualHours: true },
      }),

      // Top 5 equipment by WO count
      prisma.workOrder.groupBy({
        by: ["equipmentId"],
        where: { deletedAt: null, createdAt: { gte: dateFrom, lte: dateTo } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ]);

    // Hydrate equipment names for top equipment
    const equipmentIds = topEquipmentByWO.map(r => r.equipmentId);
    const equipmentNames = await prisma.equipment.findMany({
      where: { id: { in: equipmentIds } },
      select: { id:true, code:true, name:true },
    });
    const eqMap = Object.fromEntries(equipmentNames.map(e => [e.id, e]));

    return reply.send(successResponse({
      workOrdersByStatus: workOrdersByStatus.map(r => ({ status: r.status, count: r._count.id })),
      workOrdersByType:   workOrdersByType.map(r => ({ type: r.type, count: r._count.id })),
      workOrdersByMonth:  workOrdersByMonth.map(r => ({ month: r.month, count: Number(r.count) })),
      troubleBySeverity:  troubleBySeverity.map(r => ({ severity: r.severity, count: r._count.id })),
      troubleByMonth:     troubleByMonth.map(r => ({ month: r.month, count: Number(r.count) })),
      avgCompletionHours: avgCompletionHours._avg.actualHours ?? 0,
      topEquipmentByWO:   topEquipmentByWO.map(r => ({
        equipment: eqMap[r.equipmentId] ?? { id: r.equipmentId, code:"?", name:"Unknown" },
        count: r._count.id,
      })),
    }));
  });
}
