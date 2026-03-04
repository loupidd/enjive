import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";

export interface UploadResult {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface StorageDriver {
  save(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult>;
  delete(filename: string): Promise<void>;
}

// ─── Local Storage Driver ──────────────────────────────────────
class LocalStorageDriver implements StorageDriver {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = path.resolve(basePath);
  }

  async save(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
    await fs.mkdir(this.basePath, { recursive: true });

    const ext = path.extname(originalName);
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(this.basePath, filename);

    await fs.writeFile(filePath, buffer);

    return {
      filename,
      originalName,
      url: `/uploads/${filename}`,
      size: buffer.length,
      mimeType,
    };
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.basePath, filename);
    await fs.unlink(filePath).catch(() => {});
  }
}

// ─── S3 Storage Driver (stub – future) ────────────────────────
class S3StorageDriver implements StorageDriver {
  async save(_buffer: Buffer, _originalName: string, _mimeType: string): Promise<UploadResult> {
    throw new Error("S3 driver not yet implemented");
  }

  async delete(_filename: string): Promise<void> {
    throw new Error("S3 driver not yet implemented");
  }
}

// ─── Factory ──────────────────────────────────────────────────
function createStorageDriver(): StorageDriver {
  if (env.UPLOAD_DRIVER === "s3") return new S3StorageDriver();
  return new LocalStorageDriver(env.UPLOAD_LOCAL_PATH);
}

export const storage = createStorageDriver();
