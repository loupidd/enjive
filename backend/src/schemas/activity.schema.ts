import { z } from "zod";

export const ActivityTypeEnum = z.enum(["MAINTENANCE","INSPECTION","CALIBRATION","CLEANING","REPAIR","REPLACEMENT","LUBRICATION","TESTING"]);

export const createActivitySchema = z.object({
  type:        ActivityTypeEnum,
  description: z.string().min(1).max(5000),
  equipmentId: z.string().uuid().optional(),
  performedAt: z.coerce.date().optional(),
  duration:    z.number().positive().optional(),
  notes:       z.string().max(5000).optional(),
  attachments: z.array(z.string()).optional(),
});

export const activityQuerySchema = z.object({
  page:        z.coerce.number().int().positive().default(1),
  limit:       z.coerce.number().int().positive().max(100).default(20),
  search:      z.string().optional(),
  type:        ActivityTypeEnum.optional(),
  equipmentId: z.string().uuid().optional(),
  from:        z.coerce.date().optional(),
  to:          z.coerce.date().optional(),
  sortBy:      z.enum(["performedAt","createdAt"]).default("performedAt"),
  sortOrder:   z.enum(["asc","desc"]).default("desc"),
});

export const activityIdSchema = z.object({ id: z.string().uuid() });

export type CreateActivityDto = z.infer<typeof createActivitySchema>;
export type ActivityQuery     = z.infer<typeof activityQuerySchema>;
