import { z } from "zod";

export const FrequencyEnum   = z.enum(["ONCE","DAILY","WEEKLY","BIWEEKLY","MONTHLY","QUARTERLY","ANNUALLY"]);
export const ActivityTypeEnum = z.enum(["MAINTENANCE","INSPECTION","CALIBRATION","CLEANING","REPAIR","REPLACEMENT","LUBRICATION","TESTING"]);

export const createScheduleSchema = z.object({
  title:          z.string().min(2).max(200).trim(),
  description:    z.string().max(5000).optional(),
  frequency:      FrequencyEnum.default("MONTHLY"),
  startDate:      z.coerce.date(),
  endDate:        z.coerce.date().optional(),
  equipmentId:    z.string().uuid(),
  activityType:   ActivityTypeEnum.default("MAINTENANCE"),
  estimatedHours: z.number().positive().optional(),
  isActive:       z.boolean().default(true),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export const scheduleQuerySchema = z.object({
  page:        z.coerce.number().int().positive().default(1),
  limit:       z.coerce.number().int().positive().max(100).default(20),
  search:      z.string().optional(),
  frequency:   FrequencyEnum.optional(),
  equipmentId: z.string().uuid().optional(),
  isActive:    z.coerce.boolean().optional(),
  sortBy:      z.enum(["startDate","nextRunAt","createdAt"]).default("nextRunAt"),
  sortOrder:   z.enum(["asc","desc"]).default("asc"),
});

export const scheduleIdSchema = z.object({ id: z.string().uuid() });

export type CreateScheduleDto = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleDto = z.infer<typeof updateScheduleSchema>;
export type ScheduleQuery     = z.infer<typeof scheduleQuerySchema>;
