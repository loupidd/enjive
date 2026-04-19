/**
 * Public routes — no authentication required.
 * Used by QR code scans and public equipment recap pages.
 */
import type { FastifyInstance } from "fastify";
import { prisma } from "../config/prisma.js";
import { successResponse, errorResponse } from "../types/api.js";

export async function publicRoutes(fastify: FastifyInstance) {
  // GET /api/v1/public/equipment/:code
  // Returns equipment spec + recent maintenance + active trouble
  // No auth required — safe to embed in QR codes
  fastify.get<{ Params: { code: string } }>(
    "/equipment/:code",
    async (req, reply) => {
      const { code } = req.params;

      const eq = await prisma.equipment.findFirst({
        where: { code, deletedAt: null },
      });

      if (!eq) {
        return reply
          .status(404)
          .send(errorResponse("NOT_FOUND", "Equipment not found"));
      }

      const [completedWOs, activeTrouble] = await Promise.all([
        prisma.workOrder.findMany({
          where: {
            equipmentId: eq.id,
            status: { in: ["COMPLETED", "CLOSED"] },
            deletedAt: null,
          },
          orderBy: { completedAt: "desc" },
          take: 30,
          select: {
            id: true,
            code: true,
            title: true,
            type: true,
            status: true,
            completedAt: true,
            createdAt: true,
            assignedTo: { select: { firstName: true, lastName: true } },
          },
        }),
        prisma.troubleReport.findMany({
          where: {
            equipmentId: eq.id,
            status: { notIn: ["CLOSED", "RESOLVED", "REJECTED"] },
            deletedAt: null,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            code: true,
            title: true,
            severity: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

      return reply.send(
        successResponse({
          equipment: eq,
          maintenance: completedWOs,
          trouble: activeTrouble,
        }),
      );
    },
  );
}
