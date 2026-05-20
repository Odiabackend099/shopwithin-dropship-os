#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args.set(key, true);
    } else {
      args.set(key, next);
      index += 1;
    }
  }
  return args;
}

async function runViralProductFinder(inputPath, dryRun) {
  console.log("\n🔍 Running Viral Product Finder...");
  const cmd = `node scripts/viral-product-finder.mjs --input "${inputPath}" ${dryRun ? "--dry-run" : ""}`;
  try {
    execSync(cmd, { cwd: repoRoot, stdio: "inherit" });
    return true;
  } catch (error) {
    console.error("Viral Product Finder failed:", error.message);
    return false;
  }
}

async function runUgcWorker(inputPath, dryRun) {
  console.log("\n🎬 Running UGC Worker...");
  const cmd = `node scripts/ugc-worker.mjs --input "${inputPath}" ${dryRun ? "--dry-run" : ""}`;
  try {
    execSync(cmd, { cwd: repoRoot, stdio: "inherit" });
    return true;
  } catch (error) {
    console.error("UGC Worker failed:", error.message);
    return false;
  }
}

async function runAnalyticsFeedback(inputPath, dryRun) {
  console.log("\n📊 Running Analytics Feedback Loop...");
  const cmd = `node scripts/analytics-feedback-loop.mjs --input "${inputPath}" ${dryRun ? "--dry-run" : ""}`;
  try {
    execSync(cmd, { cwd: repoRoot, stdio: "inherit" });
    return true;
  } catch (error) {
    console.error("Analytics Feedback Loop failed:", error.message);
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = args.has("dry-run");
  const skipFinder = args.has("skip-finder");
  const skipUgc = args.has("skip-ugc");
  const skipAnalytics = args.has("skip-analytics");
  const finderInput = args.get("finder-input") || "scripts/viral-product-finder-sample-input.json";
  const ugcInput = args.get("ugc-input") || "scripts/ugc-worker-sample-input.json";
  const analyticsInput = args.get("analytics-input") || "scripts/analytics-feedback-sample-input.json";

  console.log("🚀 AI Commerce Operator - Daily Workflow");
  console.log(`Dry run: ${dryRun ? "YES" : "NO"}`);

  const results = {
    viralFinder: "skipped",
    ugcWorker: "skipped",
    analytics: "skipped"
  };

  if (!skipFinder) {
    results.viralFinder = await runViralProductFinder(finderInput, dryRun) ? "success" : "failed";
  }

  if (!skipUgc) {
    results.ugcWorker = await runUgcWorker(ugcInput, dryRun) ? "success" : "failed";
  }

  if (!skipAnalytics) {
    results.analytics = await runAnalyticsFeedback(analyticsInput, dryRun) ? "success" : "failed";
  }

  console.log("\n📊 Daily Workflow Summary:");
  console.log(`- Viral Product Finder: ${results.viralFinder}`);
  console.log(`- UGC Worker: ${results.ugcWorker}`);
  console.log(`- Analytics Feedback Loop: ${results.analytics}`);
  console.log("\n📝 Next Steps:");
  console.log("1. Review viral product finder report for publish-ready candidates");
  console.log("2. Manually approve candidates and update UGC worker input");
  console.log("3. Run UGC Engine CLI for approved products: pnpm ugc:cli generate");
  console.log("4. Generate Flow AI prompts from UGC Engine outputs");
  console.log("5. Queue content for posting scheduler");
  console.log("6. Review analytics report to iterate on winning content");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
