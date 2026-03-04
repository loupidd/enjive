// ─── Role Enum ─────────────────────────────────────────────────
export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  TECHNICIAN = "TECHNICIAN",
  VIEWER = "VIEWER",
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 5,
  [Role.ADMIN]: 4,
  [Role.MANAGER]: 3,
  [Role.TECHNICIAN]: 2,
  [Role.VIEWER]: 1,
};

// ─── WorkOrder Status Machine ──────────────────────────────────
export enum WorkOrderStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  CLOSED = "CLOSED",
}

/** Valid transitions: from → allowed next statuses */
export const WORK_ORDER_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.DRAFT]:       [WorkOrderStatus.OPEN, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.OPEN]:        [WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.ASSIGNED]:    [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.ON_HOLD, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.ON_HOLD, WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.ON_HOLD]:     [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.COMPLETED]:   [WorkOrderStatus.CLOSED],
  [WorkOrderStatus.CANCELLED]:   [],
  [WorkOrderStatus.CLOSED]:      [],
};

// ─── Trouble Status Machine ────────────────────────────────────
export enum TroubleStatus {
  OPEN = "OPEN",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED",
}

export const TROUBLE_TRANSITIONS: Record<TroubleStatus, TroubleStatus[]> = {
  [TroubleStatus.OPEN]:         [TroubleStatus.ACKNOWLEDGED, TroubleStatus.REJECTED],
  [TroubleStatus.ACKNOWLEDGED]: [TroubleStatus.IN_PROGRESS, TroubleStatus.REJECTED],
  [TroubleStatus.IN_PROGRESS]:  [TroubleStatus.RESOLVED],
  [TroubleStatus.RESOLVED]:     [TroubleStatus.CLOSED],
  [TroubleStatus.CLOSED]:       [],
  [TroubleStatus.REJECTED]:     [],
};

// ─── Equipment Status ──────────────────────────────────────────
export enum EquipmentStatus {
  OPERATIONAL = "OPERATIONAL",
  UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
  DECOMMISSIONED = "DECOMMISSIONED",
}

// ─── Helpers ───────────────────────────────────────────────────
export function canTransitionWorkOrder(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return WORK_ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionTrouble(from: TroubleStatus, to: TroubleStatus): boolean {
  return TROUBLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
