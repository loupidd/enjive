import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.middleware.js";
import { prisma } from "../config/prisma.js";
import { successResponse } from "../types/api.js";

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // GET /api/v1/dashboard — KPI counts + recent activity
  fastify.get("/", async (_req, reply) => {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1); // start of month

    const [
      totalEquipment,
      operationalEquipment,
      openWorkOrders,
      completedThisMonth,
      openTrouble,
      criticalTrouble,
      overdueWorkOrders,
      recentWorkOrders,
      recentTrouble,
    ] = await Promise.all([
      prisma.equipment.count({ where: { deletedAt: null } }),
      prisma.equipment.count({ where: { deletedAt: null, status: "OPERATIONAL" } }),
      prisma.workOrder.count({ where: { deletedAt: null, status: { in: ["OPEN","ASSIGNED","IN_PROGRESS"] } } }),
      prisma.workOrder.count({ where: { deletedAt: null, status: "COMPLETED", completedAt: { gte: start } } }),
      prisma.troubleReport.count({ where: { deletedAt: null, status: { in: ["OPEN","ACKNOWLEDGED","IN_PROGRESS"] } } }),
      prisma.troubleReport.count({ where: { deletedAt: null, severity: "CRITICAL", status: { not: "CLOSED" } } }),
      prisma.workOrder.count({
        where: { deletedAt: null, dueDate: { lt: now }, status: { notIn: ["COMPLETED","CANCELLED","CLOSED"] } },
      }),
      prisma.workOrder.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id:true, code:true, title:true, status:true, priority:true,
          equipment: { select: { name:true } },
          assignedTo: { select: { firstName:true, lastName:true } },
          dueDate:true, createdAt:true,
        },
      }),
      prisma.troubleReport.findMany({
        where: { deletedAt: null, status: { in: ["OPEN","ACKNOWLEDGED"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id:true, code:true, title:true, severity:true, status:true,
          equipment: { select: { name:true } },
          reportedBy: { select: { firstName:true, lastName:true } },
          createdAt:true,
        },
      }),
    ]);

    return reply.send(successResponse({
      kpi: {
        totalEquipment,
        operationalEquipment,
        equipmentAvailability: totalEquipment > 0
          ? Math.round((operationalEquipment / totalEquipment) * 100)
          : 100,
        openWorkOrders,
        completedThisMonth,
        openTrouble,
        criticalTrouble,
        overdueWorkOrders,
      },
      recentWorkOrders,
      recentTrouble,
    }));
  });
}
