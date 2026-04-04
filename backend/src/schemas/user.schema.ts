import { z } from "zod";

export const RoleEnum       = z.enum(["SUPER_ADMIN","ADMIN","MANAGER","TECHNICIAN","VIEWER"]);
export const UserStatusEnum = z.enum(["ACTIVE","INACTIVE","SUSPENDED"]);

export const createUserSchema = z.object({
  email:     z.string().email().toLowerCase(),
  password:  z.string().min(8).max(100),
  firstName: z.string().min(1).max(100).trim(),
  lastName:  z.string().min(1).max(100).trim(),
  role:      RoleEnum.default("TECHNICIAN"),
  phone:     z.string().max(20).optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName:  z.string().min(1).max(100).trim().optional(),
  role:      RoleEnum.optional(),
  status:    UserStatusEnum.optional(),
  phone:     z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).max(100),
});

export const userQuerySchema = z.object({
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().positive().max(100).default(50),
  search:    z.string().optional(),
  role:      RoleEnum.optional(),
  status:    UserStatusEnum.optional(),
  sortBy:    z.enum(["firstName","lastName","email","createdAt"]).default("firstName"),
  sortOrder: z.enum(["asc","desc"]).default("asc"),
});

export const userIdSchema = z.object({ id: z.string().uuid() });

export type CreateUserDto   = z.infer<typeof createUserSchema>;
export type UpdateUserDto   = z.infer<typeof updateUserSchema>;
export type UserQuery       = z.infer<typeof userQuerySchema>;
