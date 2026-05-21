import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { readFeatureFlags } from "@dropship-os/core";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PUBLIC_URL: z.string().url().default("http://localhost:4000"),
  LOG_LEVEL: z.string().default("info"),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().optional(),
  SHOPIFY_SHOP_DOMAIN: z.string().min(1).default("example.myshopify.com"),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_API_VERSION: z.string().default("2026-04"),
  SHOPIFY_WEBHOOK_SECRET: z.string().min(1).default("test_shopify_secret"),
  VAPI_PRIVATE_KEY: z.string().optional(),
  VAPI_PUBLIC_KEY: z.string().optional(),
  SHOPIFY_STORE_BASE_CURRENCY: z.literal("USD").default("USD"),
  FLUTTERWAVE_SECRET_HASH: z.string().min(1).default("test_flutterwave_hash"),
  FLUTTERWAVE_TEST_MODE: z.coerce.boolean().default(true),
  SUPPLIER_WEBHOOK_SECRET: z.string().min(1).default("test_supplier_secret"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-5.2"),
  ZENDROP_API_KEY: z.string().optional(),
  ZENDROP_CONNECTED_STORE_ENABLED: z.coerce.boolean().default(true),
  CJ_API_KEY: z.string().optional(),
  KLAVIYO_PRIVATE_API_KEY: z.string().optional(),
  KLAVIYO_REVISION: z.string().default("2026-02-15"),
  META_ACCESS_TOKEN: z.string().optional(),
  META_AD_ACCOUNT_ID: z.string().optional(),
  TIKTOK_ACCESS_TOKEN: z.string().optional(),
  TIKTOK_ADVERTISER_ID: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional()
});

export type AppEnv = z.infer<typeof envSchema> & {
  flags: ReturnType<typeof readFeatureFlags>;
};

export function loadEnv(source: Record<string, string | undefined> = process.env): AppEnv {
  const localEnv = source === process.env ? readLocalEnvFile() : {};
  if (source === process.env) {
    for (const [key, value] of Object.entries(localEnv)) {
      process.env[key] ??= value;
    }
  }
  const mergedSource = source === process.env ? { ...localEnv, ...source } : source;
  const parsed = envSchema.parse(mergedSource);
  return { ...parsed, flags: readFeatureFlags(mergedSource) };
}

function readLocalEnvFile(): Record<string, string> {
  const cwd = process.cwd();
  const candidates = [path.join(cwd, ".env"), path.resolve(cwd, "..", ".env"), path.resolve(cwd, "..", "..", ".env")];
  const envPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!envPath) return {};

  const values: Record<string, string> = {};
  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    const rawValue = match[2];
    if (!key || rawValue === undefined) continue;
    values[key] = unquoteEnvValue(rawValue.trim());
  }
  return values;
}

function unquoteEnvValue(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
