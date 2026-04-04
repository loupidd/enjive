import { z } from "zod";

export const TroubleStatusEnum   = z.enum(["OPEN","ACKNOWLEDGED","IN_PROGRESS","RESOLVED","CLOSED","REJECTED"]);
export const TroubleSeverityEnum = z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]);

export const createTroubleSchema = z.object({
  code:        z.string().min(2).max(50).trim(),
  title:       z.string().min(2).max(200).trim(),
  description: z.string().min(1).max(5000),
  severity:    TroubleSeverityEnum.default("MEDIUM"),
  equipmentId: z.string().uuid(),
  imageUrl:    z.string().url().optional(),
  notes:       z.string().max(5000).optional(),
});

export const updateTroubleSchema = createTroubleSchema.partial().omit({ code: true });

export const updateTroubleStatusSchema = z.object({
  status: TroubleStatusEnum,
  reason: z.string().max(500).optional(),
});

export const troubleQuerySchema = z.object({
  page:        z.coerce.number().int().positive().default(1),
  limit:       z.coerce.number().int().positive().max(100).default(20),
  search:      z.string().optional(),
  status:      TroubleStatusEnum.optional(),
  severity:    TroubleSeverityEnum.optional(),
  equipmentId: z.string().uuid().optional(),
  sortBy:      z.enum(["createdAt","updatedAt","severity"]).default("createdAt"),
  sortOrder:   z.enum(["asc","desc"]).default("desc"),
});

export const troubleIdSchema = z.object({ id: z.string().uuid() });

export type CreateTroubleDto    = z.infer<typeof createTroubleSchema>;
export type UpdateTroubleDto    = z.infer<typeof updateTroubleSchema>;
export type UpdateTroubleStatus = z.infer<typeof updateTroubleStatusSchema>;
export type TroubleQuery        = z.infer<typeof troubleQuerySchema>;
