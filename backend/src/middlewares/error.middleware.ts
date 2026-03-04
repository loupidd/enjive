import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { errorResponse } from "../types/api.js";
import { env } from "../config/env.js";

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error({ err: error, url: request.url, method: request.method });

  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(422).send(
      errorResponse("VALIDATION_ERROR", "Validation failed", error.flatten().fieldErrors)
    );
  }

  // Fastify validation errors
  if ("statusCode" in error && error.statusCode === 400 && error.validation) {
    return reply.status(400).send(
      errorResponse("BAD_REQUEST", error.message, error.validation)
    );
  }

  // JWT errors
  if (error.message?.includes("jwt") || error.message?.includes("token")) {
    return reply.status(401).send(errorResponse("UNAUTHORIZED", "Invalid token"));
  }

  // Prisma unique constraint
  if ("code" in error && (error as any).code === "P2002") {
    return reply.status(409).send(
      errorResponse("CONFLICT", "A record with this data already exists")
    );
  }

  // Prisma not found
  if ("code" in error && (error as any).code === "P2025") {
    return reply.status(404).send(errorResponse("NOT_FOUND", "Record not found"));
  }

  const statusCode = "statusCode" in error ? (error.statusCode ?? 500) : 500;
  const isDev = env.NODE_ENV === "development";

  return reply.status(statusCode).send({
    ...errorResponse("INTERNAL_ERROR", isDev ? error.message : "An unexpected error occurred"),
    ...(isDev && { stack: error.stack }),
  });
}
