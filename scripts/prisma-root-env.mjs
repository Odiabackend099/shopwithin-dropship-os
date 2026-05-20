#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const envPath = new URL("../.env", import.meta.url);
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/prisma-root-env.mjs <prisma args>");
  process.exit(1);
}

function parseEnv(contents) {
  const env = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    env[trimmed.slice(0, separator)] = trimmed.slice(separator + 1);
  }
  return env;
}

const env = {
  ...process.env,
  ...(existsSync(envPath) ? parseEnv(readFileSync(envPath, "utf8")) : {})
};

const result = spawnSync("pnpm", ["--filter", "@dropship-os/api", "exec", "prisma", ...args], {
  env,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
