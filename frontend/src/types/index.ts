// ─── Enums (mirroring backend) ─────────────────────────────────

export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "TECHNICIAN"
  | "VIEWER";

export type EquipmentStatus =
  | "OPERATIONAL"
  | "UNDER_MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "DECOMMISSIONED";

export type WorkOrderStatus =
  | "DRAFT"
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED"
  | "CLOSED";

export type WorkOrderPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type WorkOrderType =
  | "PREVENTIVE"
  | "CORRECTIVE"
  | "INSPECTION"
  | "EMERGENCY";

export type TroubleStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";
export type TroubleSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ScheduleFrequency =
  | "ONCE"
  | "DAILY"
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "ANNUALLY";

// ─── Models ───────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: string;
  phone?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  location?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: EquipmentStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  installDate?: string;
}

export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  description?: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  equipmentId: string;
  equipment?: Equipment;
  assignedToId?: string;
  assignedTo?: User;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TroubleReport {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: TroubleSeverity;
  status: TroubleStatus;
  equipmentId: string;
  equipment?: Equipment;
  reportedById: string;
  reportedBy?: User;
  imageUrl?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

type TroubleView = {
  id: string;
  code: string;

  equipmentId: string;
  equipmentType: string;

  name: string;
  date: string;
  age: number;

  operation: string;
  reporter: string;

  status: "Alert" | "Open-Pending" | "Open-WO-Done" | "Finished";

  woId: string | null;
  woStatus: string | null;

  timeline: any[];

  // keep original API status
  _apiStatus: TroubleStatus;
};

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  frequency: ScheduleFrequency;
  startDate: string;
  endDate?: string;
  nextRunAt?: string;
  isActive: boolean;
  equipmentId: string;
  equipment?: Equipment;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response wrappers ────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
