import { z } from "zod";

export const WorkOrderStatusEnum = z.enum([
  "DRAFT","OPEN","ASSIGNED","IN_PROGRESS","ON_HOLD","COMPLETED","CANCELLED","CLOSED"
]);
export const WorkOrderPriorityEnum = z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]);
export const WorkOrderTypeEnum = z.enum(["PREVENTIVE","CORRECTIVE","INSPECTION","EMERGENCY"]);

export const createWorkOrderSchema = z.object({
  code:           z.string().min(2).max(50).trim(),
  title:          z.string().min(2).max(200).trim(),
  description:    z.string().max(5000).optional(),
  type:           WorkOrderTypeEnum.default("CORRECTIVE"),
  priority:       WorkOrderPriorityEnum.default("MEDIUM"),
  equipmentId:    z.string().uuid(),
  assignedToId:   z.string().uuid().optional(),
  scheduleId:     z.string().uuid().optional(),
  troubleReportId:z.string().uuid().optional(),
  dueDate:        z.coerce.date().optional(),
  estimatedHours: z.number().positive().optional(),
  notes:          z.string().max(5000).optional(),
});

export const updateWorkOrderSchema = createWorkOrderSchema.partial().omit({ code: true });

export const updateWorkOrderStatusSchema = z.object({
  status: WorkOrderStatusEnum,
  reason: z.string().max(500).optional(),
});

export const workOrderQuerySchema = z.object({
  page:         z.coerce.number().int().positive().default(1),
  limit:        z.coerce.number().int().positive().max(100).default(20),
  search:       z.string().optional(),
  status:       WorkOrderStatusEnum.optional(),
  priority:     WorkOrderPriorityEnum.optional(),
  type:         WorkOrderTypeEnum.optional(),
  equipmentId:  z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  sortBy:       z.enum(["createdAt","updatedAt","dueDate","priority"]).default("createdAt"),
  sortOrder:    z.enum(["asc","desc"]).default("desc"),
});

export const workOrderIdSchema = z.object({ id: z.string().uuid() });

export const createWorkReportSchema = z.object({
  summary:         z.string().min(1).max(5000),
  workDone:        z.string().min(1).max(5000),
  hoursSpent:      z.number().positive(),
  partsUsed:       z.array(z.object({ name:z.string(), qty:z.number() })).optional(),
  findings:        z.string().max(5000).optional(),
  recommendations: z.string().max(5000).optional(),
  attachments:     z.array(z.string()).optional(),
});

export type CreateWorkOrderDto    = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderDto    = z.infer<typeof updateWorkOrderSchema>;
export type UpdateWorkOrderStatus = z.infer<typeof updateWorkOrderStatusSchema>;
export type WorkOrderQuery        = z.infer<typeof workOrderQuerySchema>;
export type CreateWorkReportDto   = z.infer<typeof createWorkReportSchema>;
