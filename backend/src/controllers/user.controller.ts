import type { FastifyRequest, FastifyReply } from "fastify";
import { userService } from "../services/user.service.js";
import {
  userQuerySchema, userIdSchema,
  createUserSchema, updateUserSchema, changePasswordSchema,
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
    return reply.send(successResponse(await userService.update(id, data), "User updated"));
  },

  async changePassword(req: FastifyRequest, reply: FastifyReply) {
    const { id } = userIdSchema.parse(req.params);
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    // Only allow self or admin
    const requesterId = (req as any).user.sub;
    const requesterRole = (req as any).user.role;
    if (requesterId !== id && !["ADMIN","SUPER_ADMIN"].includes(requesterRole)) {
      const err = new Error("Forbidden") as any; err.statusCode = 403; throw err;
    }
    await userService.changePassword(id, currentPassword, newPassword);
    return reply.send(successResponse(null, "Password changed"));
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = userIdSchema.parse(req.params);
    await userService.delete(id);
    return reply.send(successResponse(null, "User deleted"));
  },
};
