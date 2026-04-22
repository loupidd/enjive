import { userRepository } from "../repositories/user.repository.js";
import bcrypt from "bcryptjs";
import type {
  CreateUserDto,
  UpdateUserDto,
  UserQuery,
} from "../schemas/user.schema.js";
import { paginationMeta } from "../types/api.js";

export class UserService {
  async getAll(query: UserQuery) {
    const { items, total } = await userRepository.findAll(query);
    return { items, meta: paginationMeta(total, query.page, query.limit) };
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) this.notFound();
    return user;
  }

  async create(data: CreateUserDto) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const err = new Error("Email already in use") as any;
      err.statusCode = 409;
      throw err;
    }
    return userRepository.create(data);
  }

  async update(id: string, data: UpdateUserDto) {
    await this.getById(id);
    return userRepository.update(id, data);
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = (await userRepository.findByEmail("")) as any; // get with hash
    const fullUser = await import("../config/prisma.js").then((m) =>
      m.prisma.user.findUnique({ where: { id } }),
    );
    if (!fullUser) this.notFound();
    const valid = await bcrypt.compare(currentPassword, fullUser.passwordHash);
    if (!valid) {
      const err = new Error("Current password is incorrect") as any;
      err.statusCode = 401;
      throw err;
    }
    return userRepository.changePassword(id, newPassword);
  }

  // Used by resetPassword controller
  async findById(id: string) {
    return userRepository.findById(id);
  }

  // SUPER_ADMIN force reset — no current password verification
  async forceResetPassword(id: string, newPassword: string) {
    return userRepository.changePassword(id, newPassword);
  }

  async delete(id: string) {
    await this.getById(id);
    return userRepository.softDelete(id);
  }

  private notFound(): never {
    const err = new Error("User not found") as any;
    err.statusCode = 404;
    throw err;
  }
}

export const userService = new UserService();
