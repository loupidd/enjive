import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import type { LoginDto, RegisterDto } from "../schemas/auth.schema.js";

export class AuthService {
  async login(fastify: any, dto: LoginDto) {
    const user = await prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user || user.status !== "ACTIVE") {
      const err = new Error("Invalid credentials") as Error & {
        statusCode: number;
      };
      err.statusCode = 401;
      throw err;
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      const err = new Error("Invalid credentials") as Error & {
        statusCode: number;
      };
      err.statusCode = 401;
      throw err;
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      site: (user as any).site ?? "EDA",
    };
    const token = fastify.jwt.sign(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { token, user: safeUser };
  }

  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      const err = new Error("Email already in use") as Error & {
        statusCode: number;
      };
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role as any,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async me(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      const err = new Error("User not found") as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    return user;
  }
}

export const authService = new AuthService();
