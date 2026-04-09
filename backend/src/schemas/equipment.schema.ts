import { z } from "zod";

export const EquipmentStatusEnum = z.enum([
  "OPERATIONAL",
  "UNDER_MAINTENANCE",
  "OUT_OF_SERVICE",
  "DECOMMISSIONED",
]);

export const createEquipmentSchema = z.object({
  code: z.string().min(2).max(50).trim(),
  name: z.string().min(2).max(200).trim(),
  description: z.string().max(2000).optional(),
  category: z.string().min(1).max(100).trim(),
  location: z.string().max(200).optional(),
  manufacturer: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  serialNumber: z.string().max(100).optional(),
  purchaseDate: z.coerce.date().optional(),
  warrantyExpiry: z.coerce.date().optional(),
  status: EquipmentStatusEnum.default("OPERATIONAL"),
  specifications: z.record(z.unknown()).optional(),
});

export const updateEquipmentSchema = createEquipmentSchema.partial().omit({ code: true });

export const equipmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20),
  search: z.string().optional(),
  status: EquipmentStatusEnum.optional(),
  category: z.string().optional(),
  sortBy: z.enum(["name", "code", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  userSite: z.string().optional(),
});

export const equipmentIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateEquipmentDto = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentDto = z.infer<typeof updateEquipmentSchema>;
export type EquipmentQuery = z.infer<typeof equipmentQuerySchema>;
