import { prisma } from "../config/prisma.js";
import type { CreateUserDto, UpdateUserDto, UserQuery } from "../schemas/user.schema.js";
import bcrypt from "bcryptjs";

export class UserRepository {
  async findAll(query: UserQuery) {
    const { page, limit, search, role, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(role   && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName:  { contains: search } },
          { email:     { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id:true, email:true, firstName:true, lastName:true,
          role:true, status:true, phone:true, avatarUrl:true,
          lastLoginAt:true, createdAt:true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id:true, email:true, firstName:true, lastName:true,
        role:true, status:true, phone:true, avatarUrl:true,
        lastLoginAt:true, createdAt:true, updatedAt:true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  async create(data: CreateUserDto) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
      data: { ...data, passwordHash, password: undefined } as any,
      select: {
        id:true, email:true, firstName:true, lastName:true,
        role:true, status:true, createdAt:true,
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id:true, email:true, firstName:true, lastName:true,
        role:true, status:true, phone:true, avatarUrl:true,
      },
    });
  }

  async changePassword(id: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async softDelete(id: string) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: "INACTIVE" as any } });
  }
}

export const userRepository = new UserRepository();
