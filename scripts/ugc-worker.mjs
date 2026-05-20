#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const ugcEngineDist = path.join(repoRoot, "launch", "ugc-engine", "dist", "cli.js");
const outputDir = path.join(repoRoot, "output", "operator", "ugc-worker");

const defaultCharacters = [
  { id: "pet-owner", name: "Sarah", tone: "casual", audience: "pet-owners" },
  { id: "problem-solver", name: "Alex", tone: "direct", audience: "general" },
  { id: "reviewer", name: "Jordan", tone: "enthusiastic", audience: "shoppers" }
];

const defaultScenes = [
  { id: "kitchen", name: "Kitchen counter", props: ["product", "before-mess", "after-clean"] },
  { id: "living-room", name: "Living room couch", props: ["product", "pet", "mess"] },
  { id: "bedroom", name: "Bedside table", props: ["product", "lighting"] },
  { id: "bathroom", name: "Bathroom shelf", props: ["product", "mirror"] },
  { id: "car", name: "Car interior", props: ["product", "dashboard"] }
];

const defaultMotions = [
  { id: "zoom-in", description: "Quick zoom to product" },
  { id: "pan-left", description: "Pan left to reveal problem" },
  { id: "pan-right", description: "Pan right to show solution" },
  { id: "slow-push", description: "Slow push forward" },
  { id: "quick-cut", description: "Rapid cut to result" }
];

const defaultAngles = [
  "before-after-transformation",
  "problem-pain-point",
  "demonstration-tutorial",
  "comparison-test",
  "emotional-story"
];

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

function selectRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateUgcPlan(product) {
  const character = selectRandom(defaultCharacters);
  const scene = selectRandom(defaultScenes);
  const motion = selectRandom(defaultMotions);
  const angle = selectRandom(defaultAngles);

  return {
    productId: product.id || product.name,
    productName: product.name,
    category: product.category,
    character,
    scene,
    motion,
    angle,
    hooks: [
      `Stop scrolling if you hate ${product.problemSolved.toLowerCase()}`,
      `This $${product.estimatedSellPriceUsd} product changed my life`,
      `I wish I knew about this sooner`,
      `POV: you finally fixed ${product.problemSolved.toLowerCase()}`
    ],
    captions: [
      `Finally solved ${product.problemSolved.toLowerCase()} with this!`,
      `No more ${product.problemSolved.toLowerCase()} thanks to this find`,
      `Your ${product.category} game changer is here`
    ],
    cta: "Link in bio",
    hashtags: ["#fyp", "#viral", product.category, "#musthave", "#trending"],
    estimatedDuration: "15-30s",
    platforms: ["TikTok", "Instagram Reels", "YouTube Shorts", "Pinterest"]
  };
}

function generateReport(plans) {
  const timestamp = new Date().toISOString();
  const lines = [];
  lines.push(`# UGC Worker Report`);
  lines.push(`Generated: ${timestamp}`);
  lines.push(`Total Plans: ${plans.length}`);
  lines.push(``);

  for (const plan of plans) {
    lines.push(`## ${plan.productName}`);
    lines.push(``);
    lines.push(`**Character:** ${plan.character.name} (${plan.character.tone})`);
    lines.push(`**Scene:** ${plan.scene.name}`);
    lines.push(`**Motion:** ${plan.motion.description}`);
    lines.push(`**Angle:** ${plan.angle}`);
    lines.push(``);
    lines.push(`### Hooks`);
    for (const hook of plan.hooks) {
      lines.push(`- ${hook}`);
    }
    lines.push(``);
    lines.push(`### Captions`);
    for (const caption of plan.captions) {
      lines.push(`- ${caption}`);
    }
    lines.push(``);
    lines.push(`**CTA:** ${plan.cta}`);
    lines.push(`**Hashtags:** ${plan.hashtags.join(" ")}`);
    lines.push(`**Platforms:** ${plan.platforms.join(", ")}`);
    lines.push(`**Duration:** ${plan.estimatedDuration}`);
    lines.push(``);
  }

  lines.push(`## Next Steps`);
  lines.push(`1. Review and approve plans`);
  lines.push(`2. Run UGC Engine CLI for approved plans:`);
  lines.push(`   \`pnpm ugc:cli generate --product-id <id> --character <id> --scene <id>\``);
  lines.push(`3. Generate Flow AI prompts from outputs`);
  lines.push(`4. Queue content for posting scheduler`);
  lines.push(``);

  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.get("input");
  const outputPath = args.get("output") || path.join(outputDir, `ugc-plan-${Date.now()}.md`);
  const dryRun = args.has("dry-run");

  if (!inputPath) {
    console.error("Error: --input path/to/approved-products.json is required");
    console.error("\nUsage:");
    console.error("  node scripts/ugc-worker.mjs --input path/to/approved-products.json");
    console.error("  node scripts/ugc-worker.mjs --input path/to/approved-products.json --dry-run");
    process.exit(1);
  }

  const inputFullPath = path.resolve(repoRoot, inputPath);
  if (!fs.existsSync(inputFullPath)) {
    console.error(`Input file not found: ${inputFullPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(inputFullPath, "utf-8");
  const products = JSON.parse(content);

  const plans = products.map(generateUgcPlan);
  const report = generateReport(plans);

  if (dryRun) {
    console.log(report);
    console.log(`\nDry run: no file written.`);
  } else {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report, "utf-8");
    console.log(`UGC plan written to: ${outputPath}`);
    console.log(`\nSummary:`);
    console.log(`- Total products: ${products.length}`);
    console.log(`- Plans generated: ${plans.length}`);
    console.log(`\nNext: Run UGC Engine CLI to generate actual content`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
