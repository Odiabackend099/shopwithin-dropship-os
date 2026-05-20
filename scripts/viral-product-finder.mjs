#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const outputDir = path.join(repoRoot, "output", "operator", "viral-product-finder");

const weights = {
  demandVelocity: 0.2,
  margin: 0.15,
  shippingSpeed: 0.15,
  wowFactor: 0.15,
  creativeEase: 0.1,
  trendLongevity: 0.1,
  competition: -0.1,
  adSaturation: -0.05,
  riskPenalties: -1
};

const defaultCandidates = [
  {
    name: "FurLift Pet Hair Remover",
    category: "pet",
    source: "internal-baseline",
    sourceUrl: "launch/ugc-factory/products/sample-products.json#furlift",
    problemSolved: "Embedded pet hair on couches, clothing, and car seats.",
    viralEvidence: ["Strong before/after visual", "Clear pet-owner pain", "Reusable product angle"],
    estimatedSellPriceUsd: 24.95,
    estimatedProductCostUsd: 7.5,
    estimatedShippingCostUsd: 2.5,
    estimatedDeliveryDays: 10,
    wowFactor: 82,
    creativeEase: 92,
    demandVelocity: 78,
    trendLongevity: 72,
    competition: 58,
    adSaturation: 42,
    riskPenalties: 0,
    recommendedCreativeAngles: ["3-second couch transformation", "Lint roller comparison", "Black sweater rescue"]
  },
  {
    name: "Volcano Car Diffuser",
    category: "car",
    source: "sample-catalog",
    sourceUrl: "launch/ugc-factory/products/sample-products.json#volcano-diffuser",
    problemSolved: "Bad car odor and short-lived air fresheners.",
    viralEvidence: ["Visually interesting mist", "Car-cleaning niche fit", "Low-ticket impulse buy"],
    estimatedSellPriceUsd: 19.99,
    estimatedProductCostUsd: 5,
    estimatedShippingCostUsd: 2.25,
    estimatedDeliveryDays: 12,
    wowFactor: 76,
    creativeEase: 84,
    demandVelocity: 72,
    trendLongevity: 62,
    competition: 68,
    adSaturation: 60,
    riskPenalties: 0,
    recommendedCreativeAngles: ["Passenger reaction test", "Before/after odor story", "Car accessory aesthetic shot"]
  },
  {
    name: "Expandable Drawer Organizer",
    category: "organization",
    source: "sample-catalog",
    sourceUrl: "launch/ugc-factory/products/sample-products.json#drawer-organizer",
    problemSolved: "Messy drawers and lost small items.",
    viralEvidence: ["Satisfying transformation", "Home organization evergreen", "Easy UGC demo"],
    estimatedSellPriceUsd: 15.99,
    estimatedProductCostUsd: 4.25,
    estimatedShippingCostUsd: 2,
    estimatedDeliveryDays: 9,
    wowFactor: 70,
    creativeEase: 90,
    demandVelocity: 74,
    trendLongevity: 78,
    competition: 52,
    adSaturation: 35,
    riskPenalties: 0,
    recommendedCreativeAngles: ["Messy drawer reset", "POV: you can finally find things", "Kitchen junk drawer cleanup"]
  },
  {
    name: "Sunrise Alarm Clock",
    category: "wellness",
    source: "sample-catalog",
    sourceUrl: "launch/ugc-factory/products/sample-products.json#wellness-lamp",
    problemSolved: "Harsh alarms and groggy mornings.",
    viralEvidence: ["Morning routine niche", "Wellness angle", "Giftable product"],
    estimatedSellPriceUsd: 44.99,
    estimatedProductCostUsd: 16,
    estimatedShippingCostUsd: 5,
    estimatedDeliveryDays: 14,
    wowFactor: 78,
    creativeEase: 74,
    demandVelocity: 70,
    trendLongevity: 80,
    competition: 64,
    adSaturation: 48,
    riskPenalties: 0,
    recommendedCreativeAngles: ["Alarm sound vs sunrise wakeup", "7-day morning routine test", "Bedroom aesthetic demo"]
  },
  {
    name: "LED Reflective Dog Leash",
    category: "pet",
    source: "sample-catalog",
    sourceUrl: "launch/ugc-factory/products/sample-products.json#led-dog-leash",
    problemSolved: "Unsafe dog walks at night due to low visibility.",
    viralEvidence: ["Safety problem", "Night visual contrast", "Pet-owner emotional hook"],
    estimatedSellPriceUsd: 29.99,
    estimatedProductCostUsd: 8.5,
    estimatedShippingCostUsd: 3.25,
    estimatedDeliveryDays: 11,
    wowFactor: 80,
    creativeEase: 82,
    demandVelocity: 68,
    trendLongevity: 76,
    competition: 46,
    adSaturation: 30,
    riskPenalties: 0,
    recommendedCreativeAngles: ["Night walk visibility test", "Car headlights POV", "Pet safety story"]
  }
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

function shippingSpeedScore(estimatedDeliveryDays) {
  if (estimatedDeliveryDays <= 4) return 100;
  if (estimatedDeliveryDays <= 7) return 88;
  if (estimatedDeliveryDays <= 10) return 74;
  if (estimatedDeliveryDays <= 14) return 50;
  if (estimatedDeliveryDays <= 21) return 25;
  return 5;
}

function grossMarginPercent(priceUsd, productCostUsd, shippingCostUsd) {
  if (priceUsd <= 0) return 0;
  return Number((((priceUsd - productCostUsd - shippingCostUsd) / priceUsd) * 100).toFixed(2));
}

function calculateProductScore(input) {
  const total =
    input.demandVelocity * weights.demandVelocity +
    input.margin * weights.margin +
    input.shippingSpeed * weights.shippingSpeed +
    input.wowFactor * weights.wowFactor +
    input.creativeEase * weights.creativeEase +
    input.trendLongevity * weights.trendLongevity +
    input.competition * weights.competition +
    input.adSaturation * weights.adSaturation -
    input.riskPenalties;

  const normalized = Math.max(0, Math.min(100, Number(total.toFixed(2))));
  const decision = normalized >= 78 ? "publish_ready" : normalized >= 68 ? "draft" : normalized >= 55 ? "watch" : "reject";
  const reasons = [`weighted_score_${normalized}`];
  if (input.demandVelocity >= 75) reasons.push("strong_demand_velocity");
  if (input.margin >= 70) reasons.push("healthy_margin");
  if (input.shippingSpeed >= 74) reasons.push("acceptable_delivery_speed");
  if (input.competition >= 70) reasons.push("competition_pressure");
  if (input.adSaturation >= 70) reasons.push("ad_saturation_risk");
  if (input.riskPenalties > 0) reasons.push("risk_penalty_applied");

  return { ...input, total: normalized, decision, reasons };
}

function scoreCandidate(candidate) {
  const margin = grossMarginPercent(
    candidate.estimatedSellPriceUsd,
    candidate.estimatedProductCostUsd,
    candidate.estimatedShippingCostUsd
  );
  const shippingSpeed = shippingSpeedScore(candidate.estimatedDeliveryDays);

  const input = {
    demandVelocity: candidate.demandVelocity,
    margin,
    shippingSpeed,
    wowFactor: candidate.wowFactor,
    creativeEase: candidate.creativeEase,
    trendLongevity: candidate.trendLongevity,
    competition: candidate.competition,
    adSaturation: candidate.adSaturation,
    riskPenalties: candidate.riskPenalties
  };

  const score = calculateProductScore(input);
  return {
    ...candidate,
    marginPercent: margin,
    shippingSpeedScore: shippingSpeed,
    scoreTotal: score.total,
    scoreDecision: score.decision,
    scoreReasons: score.reasons
  };
}

function generateReport(scoredCandidates) {
  const timestamp = new Date().toISOString();
  const lines = [];
  lines.push(`# Viral Product Finder Report`);
  lines.push(`Generated: ${timestamp}`);
  lines.push(`Total Candidates: ${scoredCandidates.length}`);
  lines.push(``);

  const byDecision = {
    publish_ready: [],
    draft: [],
    watch: [],
    reject: []
  };

  for (const c of scoredCandidates) {
    byDecision[c.scoreDecision].push(c);
  }

  lines.push(`## Summary`);
  lines.push(`- Publish Ready: ${byDecision.publish_ready.length}`);
  lines.push(`- Draft: ${byDecision.draft.length}`);
  lines.push(`- Watch: ${byDecision.watch.length}`);
  lines.push(`- Reject: ${byDecision.reject.length}`);
  lines.push(``);

  if (byDecision.publish_ready.length > 0) {
    lines.push(`## Publish Ready Candidates`);
    for (const c of byDecision.publish_ready) {
      lines.push(`### ${c.name}`);
      lines.push(`- Score: ${c.scoreTotal}`);
      lines.push(`- Category: ${c.category}`);
      lines.push(`- Source: ${c.source}`);
      lines.push(`- Source URL: ${c.sourceUrl}`);
      lines.push(`- Problem Solved: ${c.problemSolved}`);
      lines.push(`- Viral Evidence: ${c.viralEvidence.join(", ")}`);
      lines.push(`- Estimated Price: $${c.estimatedSellPriceUsd}`);
      lines.push(`- Estimated Margin: ${c.marginPercent}%`);
      lines.push(`- Delivery Days: ${c.estimatedDeliveryDays}`);
      lines.push(`- Creative Angles: ${c.recommendedCreativeAngles.join(", ")}`);
      lines.push(`- Recommended Action: APPROVE for supplier vetting`);
      lines.push(``);
    }
  }

  if (byDecision.draft.length > 0) {
    lines.push(`## Draft Candidates`);
    for (const c of byDecision.draft) {
      lines.push(`### ${c.name}`);
      lines.push(`- Score: ${c.scoreTotal}`);
      lines.push(`- Category: ${c.category}`);
      lines.push(`- Margin: ${c.marginPercent}%`);
      lines.push(`- Delivery Days: ${c.estimatedDeliveryDays}`);
      lines.push(`- Reasons: ${c.scoreReasons.join(", ")}`);
      lines.push(`- Recommended Action: HOLD for more data`);
      lines.push(``);
    }
  }

  if (byDecision.watch.length > 0) {
    lines.push(`## Watch Candidates`);
    for (const c of byDecision.watch) {
      lines.push(`- ${c.name} (${c.scoreTotal})`);
    }
  }

  if (byDecision.reject.length > 0) {
    lines.push(`## Rejected Candidates`);
    for (const c of byDecision.reject) {
      lines.push(`- ${c.name} (${c.scoreTotal})`);
    }
  }

  lines.push(`## Telegram Alert Template`);
  lines.push(``);
  if (byDecision.publish_ready.length > 0) {
    lines.push(`🔥 **${byDecision.publish_ready.length} Publish-Ready Products Found**`);
    for (const c of byDecision.publish_ready) {
      lines.push(``);
      lines.push(`**${c.name}**`);
      lines.push(`Score: ${c.scoreTotal} | Margin: ${c.marginPercent}% | Delivery: ${c.estimatedDeliveryDays} days`);
      lines.push(`Problem: ${c.problemSolved}`);
      lines.push(`Angles: ${c.recommendedCreativeAngles[0]}`);
      lines.push(`Source: ${c.sourceUrl}`);
    }
  } else {
    lines.push(`No publish-ready candidates found today.`);
  }

  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.get("input");
  const outputPath = args.get("output") || path.join(outputDir, `report-${Date.now()}.md`);
  const dryRun = args.has("dry-run");

  let candidates = defaultCandidates;

  if (inputPath) {
    const inputFullPath = path.resolve(repoRoot, inputPath);
    if (!fs.existsSync(inputFullPath)) {
      console.error(`Input file not found: ${inputFullPath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(inputFullPath, "utf-8");
    candidates = JSON.parse(content);
  }

  const scoredCandidates = candidates.map(scoreCandidate).sort((a, b) => b.scoreTotal - a.scoreTotal);
  const report = generateReport(scoredCandidates);

  if (dryRun) {
    console.log(report);
    console.log(`\nDry run: no file written.`);
  } else {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report, "utf-8");
    console.log(`Report written to: ${outputPath}`);
    console.log(`\nSummary:`);
    console.log(`- Total candidates: ${scoredCandidates.length}`);
    console.log(`- Publish ready: ${scoredCandidates.filter(c => c.scoreDecision === "publish_ready").length}`);
    console.log(`- Draft: ${scoredCandidates.filter(c => c.scoreDecision === "draft").length}`);
    console.log(`- Watch: ${scoredCandidates.filter(c => c.scoreDecision === "watch").length}`);
    console.log(`- Reject: ${scoredCandidates.filter(c => c.scoreDecision === "reject").length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
