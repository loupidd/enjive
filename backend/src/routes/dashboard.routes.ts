import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.middleware.js";
import { prisma } from "../config/prisma.js";
import { successResponse } from "../types/api.js";

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", async (_req, reply) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // ── All queries in one Promise.all ──────────────────────────
    const [
      totalEquipment,
      operationalEquipment,
      openWorkOrders,
      completedThisMonth,
      openTrouble,
      criticalTrouble,
      overdueWorkOrders,
      // Aggregations for charts
      woByType,
      woByStatus,
      woByMonth,
      recentWorkOrders,
      recentTrouble,
    ] = await Promise.all([
      // ── KPIs ──────────────────────────────────────────────────
      prisma.equipment.count({ where: { deletedAt: null } }),
      prisma.equipment.count({
        where: { deletedAt: null, status: "OPERATIONAL" },
      }),
      prisma.workOrder.count({
        where: {
          deletedAt: null,
          status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] },
        },
      }),
      prisma.workOrder.count({
        where: {
          deletedAt: null,
          status: "COMPLETED",
          completedAt: { gte: monthStart },
        },
      }),
      prisma.troubleReport.count({
        where: {
          deletedAt: null,
          status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] },
        },
      }),
      prisma.troubleReport.count({
        where: {
          deletedAt: null,
          severity: "CRITICAL",
          status: { not: "CLOSED" },
        },
      }),
      prisma.workOrder.count({
        where: {
          deletedAt: null,
          dueDate: { lt: now },
          status: { notIn: ["COMPLETED", "CANCELLED", "CLOSED"] },
        },
      }),

      // ── Chart: WOs by classification type (all time) ──────────
      prisma.workOrder.groupBy({
        by: ["type"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),

      // ── Chart: WOs by status (this year) ──────────────────────
      prisma.workOrder.groupBy({
        by: ["status"],
        where: { deletedAt: null, createdAt: { gte: yearStart } },
        _count: { _all: true },
      }),

      // ── Chart: WO completions per month (last 12 months) ──────
      prisma.workOrder.findMany({
        where: {
          deletedAt: null,
          status: "COMPLETED",
          completedAt: {
            gte: new Date(now.getFullYear() - 1, now.getMonth(), 1),
            lte: now,
          },
        },
        select: { completedAt: true },
      }),

      // ── Recent activity ────────────────────────────────────────
      prisma.workOrder.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          code: true,
          title: true,
          status: true,
          priority: true,
          equipment: { select: { name: true, code: true } },
          assignedTo: { select: { firstName: true, lastName: true } },
          dueDate: true,
          createdAt: true,
        },
      }),
      prisma.troubleReport.findMany({
        where: {
          deletedAt: null,
          status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          code: true,
          title: true,
          severity: true,
          status: true,
          equipment: { select: { name: true, code: true } },
          reportedBy: { select: { firstName: true, lastName: true } },
          createdAt: true,
        },
      }),
    ]);

    // ── Transform byType → { PREVENTIVE: n, CORRECTIVE: n, ... }
    const byType: Record<string, number> = {};
    for (const row of woByType) {
      byType[row.type] = row._count._all;
    }

    // ── Transform byStatus → { OPEN: n, COMPLETED: n, ... }
    const byStatus: Record<string, number> = {};
    for (const row of woByStatus) {
      byStatus[row.status] = row._count._all;
    }

    // ── Transform completedAt rows → monthly buckets (last 12m)
    const monthBuckets: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthBuckets[key] = 0;
    }
    for (const wo of woByMonth) {
      if (!wo.completedAt) continue;
      const key = `${wo.completedAt.getFullYear()}-${String(wo.completedAt.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthBuckets) monthBuckets[key]++;
    }
    const byMonth = Object.entries(monthBuckets).map(([month, count]) => ({
      month,
      count,
    }));

    return reply.send(
      successResponse({
        kpi: {
          totalEquipment,
          operationalEquipment,
          equipmentAvailability:
            totalEquipment > 0
              ? Math.round((operationalEquipment / totalEquipment) * 100)
              : 100,
          openWorkOrders,
          completedThisMonth,
          openTrouble,
          criticalTrouble,
          overdueWorkOrders,
        },
        byType,
        byStatus,
        byMonth,
        recentWorkOrders,
        recentTrouble,
      }),
    );
  });
}
