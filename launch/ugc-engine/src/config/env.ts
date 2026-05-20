import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  UGC_DRIVER: z.enum(["browser", "api", "fallback", "mock"]).default("fallback"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_IMAGE_MODEL: z.string().default("gpt-image-1"),
  OPENAI_VIDEO_MODEL: z.string().default("sora"),
  UGC_BROWSER_PROFILE_PATH: z.string().optional(),
  UGC_DAILY_GENERATION_CAP: z.coerce.number().int().positive().default(50),
  UGC_RETRY_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  UGC_RETRY_BASE_DELAY_MS: z.coerce.number().int().positive().default(2000),
  UGC_OUTPUT_DIR: z.string().default("generated"),
  UGC_EXPORT_DIR: z.string().default("exports"),
  UGC_CHARACTERS_DIR: z.string().default("characters"),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.string().default("info"),
});

export type UgcEnv = z.infer<typeof envSchema>;

export function loadUgcEnv(source: Record<string, string | undefined> = process.env): UgcEnv {
  return envSchema.parse(source);
}
