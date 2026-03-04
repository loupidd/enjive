import type { FastifyRequest, FastifyReply } from "fastify";
import { Role, hasRole } from "../types/enums.js";
import { errorResponse } from "../types/api.js";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

declare module "fastify" {
  interface FastifyRequest {
    user: JwtPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send(errorResponse("UNAUTHORIZED", "Invalid or missing token"));
  }
}

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = request.user?.role as Role;
    const allowed = roles.some((r) => hasRole(userRole, r));
    if (!allowed) {
      return reply.status(403).send(errorResponse("FORBIDDEN", "Insufficient permissions"));
    }
  };
}

export function requireMinRole(minRole: Role) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = request.user?.role as Role;
    if (!hasRole(userRole, minRole)) {
      return reply.status(403).send(errorResponse("FORBIDDEN", "Insufficient permissions"));
    }
  };
}
