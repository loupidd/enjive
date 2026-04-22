import type { FastifyRequest, FastifyReply } from "fastify";
import { userService } from "../services/user.service.js";
import {
  userQuerySchema,
  userIdSchema,
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
} from "../schemas/user.schema.js";
import { successResponse } from "../types/api.js";

export const userController = {
  async getAll(req: FastifyRequest, reply: FastifyReply) {
    const query = userQuerySchema.parse(req.query);
    const { items, meta } = await userService.getAll(query);
    return reply.send(successResponse(items, undefined, meta));
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = userIdSchema.parse(req.params);
    return reply.send(successResponse(await userService.getById(id)));
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const data = createUserSchema.parse(req.body);
    const user = await userService.create(data);
    return reply.status(201).send(successResponse(user, "User created"));
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = userIdSchema.parse(req.params);
    const data = updateUserSchema.parse(req.body);
    return reply.send(
      successResponse(await userService.update(id, data), "User updated"),
    );
  },

  async changePassword(req: FastifyRequest, reply: FastifyReply) {
    const { id } = userIdSchema.parse(req.params);
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body,
    );
    // Only allow self or admin
    const requesterId = (req as any).user.sub;
    const requesterRole = (req as any).user.role;
    if (
      requesterId !== id &&
      !["ADMIN", "SUPER_ADMIN"].includes(requesterRole)
    ) {
      const err = new Error("Forbidden") as any;
      err.statusCode = 403;
      throw err;
    }
    await userService.changePassword(id, currentPassword, newPassword);
    return reply.send(successResponse(null, "Password changed"));
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = userIdSchema.parse(req.params);
    await userService.delete(id);
    return reply.send(successResponse(null, "User deleted"));
  },

  // SUPER_ADMIN only — force-reset any user password without knowing current
  async resetPassword(req: FastifyRequest, reply: FastifyReply) {
    const { id } = userIdSchema.parse(req.params);
    const { newPassword } = req.body as { newPassword: string };
    if (!newPassword || newPassword.length < 8) {
      const err = new Error("Password must be at least 8 characters") as any;
      err.statusCode = 400;
      throw err;
    }
    const target = await userService.findById(id);
    if (!target) {
      const err = new Error("User not found") as any;
      err.statusCode = 404;
      throw err;
    }
    // Prevent resetting another SUPER_ADMIN (self-reset is allowed)
    const requesterId = (req as any).user.sub;
    if (target.role === "SUPER_ADMIN" && requesterId !== id) {
      const err = new Error("Cannot reset another Super Admin password") as any;
      err.statusCode = 403;
      throw err;
    }
    await userService.forceResetPassword(id, newPassword);
    return reply.send(
      successResponse(
        { userId: id, email: target.email },
        "Password reset successfully",
      ),
    );
  },
};
