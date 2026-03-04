export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
  requestId?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── Helpers ───────────────────────────────────────────────────
export function successResponse<T>(data: T, message?: string, meta?: PaginationMeta): ApiSuccess<T> {
  return { success: true, data, ...(message && { message }), ...(meta && { meta }) };
}

export function errorResponse(code: string, message: string, details?: unknown): ApiError {
  return {
    success: false,
    error: { code, message, ...(details && { details }) },
  };
}

export function paginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
