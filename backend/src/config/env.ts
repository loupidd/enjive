import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_PORT: z.coerce.number().default(3000),
  APP_NAME: z.string().default("Enjive"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  UPLOAD_DRIVER: z.enum(["local", "s3"]).default("local"),
  UPLOAD_LOCAL_PATH: z.string().default("./uploads"),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().default(20),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
