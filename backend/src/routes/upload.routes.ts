/**
 * File upload routes — POST /api/v1/upload
 *
 * Accepts multipart/form-data with up to 10 images.
 * Saves files to /uploads/{entityType}/{entityId}/ volume.
 * Returns array of public URLs.
 *
 * POST /upload/images
 *   fields: entityType (work-order|trouble|equipment|activity)
 *           entityId   (UUID or code)
 *           files[]    (image/jpeg, image/png, image/webp — max 5MB each)
 */
import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.middleware.js";
import { eventsBus } from "../services/events.service.js";
import { successResponse, errorResponse } from "../types/api.js";
import { env } from "../config/env.js";
import { createWriteStream, mkdirSync } from "fs";
import { join, extname } from "path";
import { pipeline } from "stream/promises";
import { randomUUID } from "crypto";

const UPLOADS_DIR = env.UPLOADS_DIR;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_FILES = 10;

function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true });
}

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // POST /api/v1/upload/images
  fastify.post<{ Body: { entityType: string; entityId: string } }>(
    "/images",
    async (req, reply) => {
      if (!req.isMultipart()) {
        return reply
          .status(400)
          .send(errorResponse("NOT_MULTIPART", "Must be multipart/form-data"));
      }

      const parts = req.parts();
      let entityType = "";
      let entityId = "";
      const savedUrls: string[] = [];
      let fileCount = 0;

      for await (const part of parts) {
        if (part.type === "field") {
          if (part.fieldname === "entityType")
            entityType = part.value as string;
          if (part.fieldname === "entityId") entityId = part.value as string;
          continue;
        }

        // It's a file
        if (fileCount >= MAX_FILES) {
          await part.toBuffer(); // drain
          continue;
        }

        if (!ALLOWED_MIME.has(part.mimetype)) {
          await part.toBuffer(); // drain
          continue;
        }

        if (!entityType || !entityId) {
          await part.toBuffer();
          continue;
        }

        const ext = extname(part.filename || ".jpg") || ".jpg";
        const filename = `${randomUUID()}${ext}`;
        const dir = join(UPLOADS_DIR, entityType, entityId);
        ensureDir(dir);

        const dest = join(dir, filename);
        await pipeline(part.file, createWriteStream(dest));

        const url = `/uploads/${entityType}/${entityId}/${filename}`;
        savedUrls.push(url);
        fileCount++;
      }

      if (!savedUrls.length) {
        return reply
          .status(400)
          .send(errorResponse("NO_FILES", "No valid files uploaded"));
      }

      // Broadcast upload completion so other clients can refresh
      eventsBus.broadcast(
        {
          type: "upload:done",
          payload: { entityType, entityId, url: savedUrls[0] },
        },
        (req as any).user.site,
      );

      return reply.send(
        successResponse(
          { urls: savedUrls, count: savedUrls.length },
          "Files uploaded",
        ),
      );
    },
  );

  // DELETE /api/v1/upload/images  — remove a specific file by url
  fastify.delete<{ Body: { url: string } }>("/images", async (req, reply) => {
    const { url } = req.body as { url: string };
    if (!url?.startsWith("/uploads/")) {
      return reply
        .status(400)
        .send(errorResponse("INVALID_URL", "Invalid file URL"));
    }

    const filePath = join(UPLOADS_DIR, url.replace("/uploads/", ""));
    try {
      const { unlink } = await import("fs/promises");
      await unlink(filePath);
      return reply.send(successResponse(null, "File deleted"));
    } catch {
      return reply
        .status(404)
        .send(errorResponse("NOT_FOUND", "File not found"));
    }
  });
}
