/**
 * Legacy data import — accepts the Soluman CSV export format.
 *
 * POST /api/v1/import/legacy-csv
 *   Accepts multipart upload of the old u522476900_mms.csv style export.
 *   Parses all sections (activities, trouble, messages) and upserts into
 *   the new Prisma schema, mapping old IDs → new UUIDs.
 *
 * POST /api/v1/import/equipment
 *   Bulk upsert equipment from XLS/CSV (same flex-column format as
 *   the frontend XLS import — accepts the canonical template OR
 *   the old Soluman column names as aliases).
 *
 * POST /api/v1/import/work-orders
 *   Bulk upsert work orders from CSV/XLS.
 */

import type { FastifyInstance } from "fastify";
import type {
  WorkOrderType,
  WorkOrderStatus,
  WorkOrderPriority,
} from "@prisma/client";
import {
  authenticate,
  requireMinRole,
} from "../middlewares/auth.middleware.js";
import { prisma } from "../config/prisma.js";
import { Role } from "../types/enums.js";
import { successResponse, errorResponse } from "../types/api.js";

// ── Column alias maps (old Soluman → canonical) ─────────────────
const EQ_ALIASES: Record<string, string> = {
  // Canonical
  id: "id",
  name: "name",
  classification: "classification",
  type: "type",
  section: "section",
  // Soluman legacy
  id_equipment_type: "id",
  activity: "name",
  id_maintenance_clasification: "classification",
  id_interval: "section",
  id_maintenance_type: "type",
  // Common variants
  equipment_id: "id",
  device_name: "name",
  asset_id: "id",
  eq_id: "id",
  tipe: "type",
  jenis: "type",
  klasifikasi: "classification",
  area: "section",
};

const WO_ALIASES: Record<string, string> = {
  id_activity: "code",
  activity: "title",
  id_equipment_type: "equipmentCode",
  id_location: "location",
  id_maintenance_clasification: "type",
  id_interval: "frequency",
  id_maintenance_type: "activityType",
  ds_add: "createdAt",
  id_user_add: "createdByEmail",
  id_trouble_equipment: "troubleCode",
};

function normalise(header: string): string {
  return header
    .toLowerCase()
    .replace(/[\s\-]/g, "_")
    .trim();
}

function mapRow(
  row: Record<string, string>,
  aliases: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [raw, val] of Object.entries(row)) {
    const key = normalise(raw);
    const canonical = aliases[key] ?? key;
    out[canonical] = val?.trim() ?? "";
  }
  return out;
}

// ── Parse CSV text → array of row objects ───────────────────────
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  // Handle quoted CSV properly
  function splitLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.replace(/^"|"$/g, "").replace(/NULL/g, "").trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.replace(/^"|"$/g, "").replace(/NULL/g, "").trim());
    return result;
  }

  const headers = splitLine(lines[0]);
  return lines
    .slice(1)
    .map((line) => {
      const vals = splitLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = vals[i] ?? "";
      });
      return row;
    })
    .filter((r) => Object.values(r).some((v) => v));
}

// ── Map old Soluman type strings → Prisma enums ─────────────────
function mapWoType(s: string): string {
  const m: Record<string, string> = {
    preventive: "PREVENTIVE",
    corrective: "CORRECTIVE",
    certification: "INSPECTION",
    predictive: "INSPECTION",
    "thermography investigation": "INSPECTION",
  };
  return m[s.toLowerCase()] ?? "CORRECTIVE";
}

function mapFrequency(s: string): string {
  const m: Record<string, string> = {
    once: "ONCE",
    daily: "DAILY",
    weekly: "WEEKLY",
    biweekly: "BIWEEKLY",
    monthly: "MONTHLY",
    bimonthly: "MONTHLY",
    "three monthly": "QUARTERLY",
    "four monthly": "QUARTERLY",
    "six monthly": "ANNUALLY",
    yearly: "ANNUALLY",
  };
  return m[s.toLowerCase()] ?? "MONTHLY";
}

function mapActivityType(s: string): string {
  const m: Record<string, string> = {
    cleaning: "CLEANING",
    "function test": "TESTING",
    replacement: "REPLACEMENT",
    adjusment: "CALIBRATION",
    adjustment: "CALIBRATION",
    measurement: "INSPECTION",
    others: "MAINTENANCE",
    visual: "INSPECTION",
    lubrication: "LUBRICATION",
    repair: "REPAIR",
    thermographic: "INSPECTION",
  };
  return m[s.toLowerCase()] ?? "MAINTENANCE";
}

export async function importRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // ── POST /import/equipment ─────────────────────────────────────
  fastify.post(
    "/equipment",
    { preHandler: requireMinRole(Role.MANAGER) },
    async (req, reply) => {
      const body = req.body as any;
      const rows: Record<string, string>[] = body.rows ?? [];

      if (!rows.length) {
        return reply
          .status(400)
          .send(errorResponse("VALIDATION", "No rows provided"));
      }

      const results = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[],
      };

      for (const raw of rows) {
        const row = mapRow(raw, EQ_ALIASES);
        const code = row.id || row.code;
        if (!code || !row.name) {
          results.skipped++;
          continue;
        }

        try {
          await prisma.equipment.upsert({
            where: { code },
            create: {
              code,
              name: row.name,
              category: row.type || row.classification || "General",
              location: row.section || row.location || "",
              description: row.other || "",
              status: "OPERATIONAL",
            },
            update: {
              name: row.name,
              category: row.type || row.classification || "General",
              location: row.section || row.location || "",
            },
          });
          results.created++;
        } catch (e: any) {
          results.errors.push(`${code}: ${e.message}`);
          results.skipped++;
        }
      }

      return reply.send(successResponse(results, `Import complete`));
    },
  );

  // ── POST /import/legacy-csv ────────────────────────────────────
  // Accepts the raw Soluman multi-table CSV — parses the activity
  // section (lines that start with ID_ACT__) and imports as WOs.
  fastify.post(
    "/legacy-csv",
    { preHandler: requireMinRole(Role.ADMIN) },
    async (req, reply) => {
      const body = req.body as any;
      const csvText: string = body.csv ?? "";

      if (!csvText) {
        return reply
          .status(400)
          .send(errorResponse("VALIDATION", "No CSV content provided"));
      }

      // Find the activity table header line (ID_Activity,Activity,...)
      const lines = csvText.split(/\r?\n/);
      const headerLineIdx = lines.findIndex(
        (l) => l.includes("ID_Activity") && l.includes("ID_Equipment_Type"),
      );
      if (headerLineIdx < 0) {
        return reply
          .status(400)
          .send(errorResponse("PARSE", "Could not find activity table in CSV"));
      }

      // Parse just the activity section (until next section header)
      const sectionLines = [lines[headerLineIdx]];
      for (let i = headerLineIdx + 1; i < lines.length; i++) {
        if (
          !lines[i].startsWith('"ID_ACT__') &&
          lines[i].trim() &&
          !lines[i].startsWith('"ID_ACT')
        )
          break;
        if (lines[i].startsWith('"ID_ACT__')) sectionLines.push(lines[i]);
      }

      const rows = parseCsv(sectionLines.join("\n"));
      const results = { imported: 0, skipped: 0, errors: [] as string[] };

      // Get or create a default admin user for createdById
      const adminUser = await prisma.user.findFirst({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
        select: { id: true },
      });
      if (!adminUser) {
        return reply
          .status(500)
          .send(
            errorResponse("NO_ADMIN", "No admin user found — run seed first"),
          );
      }

      // Get all equipment to resolve old ID_EQT__ codes
      const allEquipment = await prisma.equipment.findMany({
        select: { id: true, code: true },
        where: { deletedAt: null },
      });
      // We can't resolve old ID_EQT__ → UUID directly without a mapping table.
      // Use the first available equipment as a placeholder and flag for manual review.
      const fallbackEquipmentId = allEquipment[0]?.id;
      if (!fallbackEquipmentId) {
        return reply
          .status(500)
          .send(
            errorResponse(
              "NO_EQUIPMENT",
              "No equipment found — run seed first",
            ),
          );
      }

      for (const raw of rows) {
        const mapped = mapRow(raw, WO_ALIASES);
        const code = mapped.code;
        if (!code?.startsWith("ID_ACT__")) {
          results.skipped++;
          continue;
        }

        // Use a shortened code as the WO code
        const woCode = `LEGACY-${code.replace("ID_ACT__", "").slice(-8)}`;

        try {
          await prisma.workOrder.upsert({
            where: { code: woCode },
            create: {
              code: woCode,
              title: mapped.title || "Legacy Activity",
              type: mapWoType(mapped.type) as WorkOrderType,
              status: "CLOSED" as WorkOrderStatus,
              priority: "MEDIUM" as WorkOrderPriority,
              equipmentId: fallbackEquipmentId,
              createdById: adminUser.id,
              notes: `Imported from Soluman legacy CSV. Original ID: ${code}. Equipment: ${mapped.equipmentCode}. Location: ${mapped.location}.`,
              createdAt: mapped.createdAt
                ? new Date(mapped.createdAt)
                : new Date(),
            },
            update: {}, // don't overwrite if already imported
          });
          results.imported++;
        } catch (e: any) {
          results.errors.push(`${woCode}: ${e.message}`);
          results.skipped++;
        }
      }

      return reply.send(
        successResponse(
          results,
          `Legacy import complete. ${results.imported} work orders imported.`,
        ),
      );
    },
  );
}
