#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const outputDir = path.join(repoRoot, "output", "operator", "analytics-feedback");

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

function classifyPerformance(metrics) {
  const { views, watchTime, ctr, addToCart, purchases } = metrics;

  if (views < 100) return { tier: "insufficient_data", reason: "Low view count" };

  const avgWatchTimePercent = (watchTime / 15) * 100;

  if (ctr >= 3 && addToCart >= 5 && purchases >= 1) {
    return { tier: "winner", reason: "High CTR, strong conversion" };
  }

  if (ctr >= 2 && avgWatchTimePercent >= 60) {
    return { tier: "strong", reason: "Good engagement, potential winner" };
  }

  if (ctr >= 1.5 && avgWatchTimePercent >= 40) {
    return { tier: "promising", reason: "Decent engagement, needs optimization" };
  }

  if (ctr < 1 || avgWatchTimePercent < 30) {
    return { tier: "weak", reason: "Low engagement or CTR" };
  }

  return { tier: "promising", reason: "Mixed signals, test variants" };
}

function generateRecommendation(performance, content) {
  const { tier } = performance;

  switch (tier) {
    case "winner":
      return {
        action: "scale",
        description: "Increase posting frequency, test similar products, create content variations",
        nextCreativeTest: "Test same product with different hook or angle"
      };
    case "strong":
      return {
        action: "optimize",
        description: "A/B test CTAs, test different posting times, try similar content",
        nextCreativeTest: "Test variant with stronger CTA or different music"
      };
    case "promising":
      return {
        action: "iterate",
        description: "Test different hooks, improve first 3 seconds, test new scenes",
        nextCreativeTest: "Test different hook angle (problem vs solution vs social proof)"
      };
    case "weak":
      return {
        action: "pause_or_kill",
        description: "Stop posting this content, analyze why it failed, test new creative direction",
        nextCreativeTest: "Test completely different angle or new product"
      };
    case "insufficient_data":
      return {
        action: "wait",
        description: "Need more views to make decision, continue posting to gather data",
        nextCreativeTest: "Post more content with similar angle to gather baseline"
      };
    default:
      return {
        action: "review",
        description: "Manual review required",
        nextCreativeTest: "Review manually"
      };
  }
}

function generateReport(contentMetrics) {
  const timestamp = new Date().toISOString();
  const lines = [];
  lines.push(`# Analytics Feedback Loop Report`);
  lines.push(`Generated: ${timestamp}`);
  lines.push(`Total Content Analyzed: ${contentMetrics.length}`);
  lines.push(``);

  const tiers = {
    winner: [],
    strong: [],
    promising: [],
    weak: [],
    insufficient_data: []
  };

  for (const item of contentMetrics) {
    const performance = classifyPerformance(item.metrics);
    const recommendation = generateRecommendation(performance, item.content);
    const analysis = {
      ...item,
      performance,
      recommendation
    };
    tiers[performance.tier].push(analysis);
  }

  lines.push(`## Summary`);
  lines.push(`- Winners: ${tiers.winner.length}`);
  lines.push(`- Strong: ${tiers.strong.length}`);
  lines.push(`- Promising: ${tiers.promising.length}`);
  lines.push(`- Weak: ${tiers.weak.length}`);
  lines.push(`- Insufficient Data: ${tiers.insufficient_data.length}`);
  lines.push(``);

  if (tiers.winner.length > 0) {
    lines.push(`## 🏆 Winners - Scale These`);
    for (const item of tiers.winner) {
      lines.push(`### ${item.content.productName}`);
      lines.push(`- Platform: ${item.content.platform}`);
      lines.push(`- Views: ${item.metrics.views}`);
      lines.push(`- CTR: ${item.metrics.ctr}%`);
      lines.push(`- Add to Cart: ${item.metrics.addToCart}`);
      lines.push(`- Purchases: ${item.metrics.purchases}`);
      lines.push(`- Reason: ${item.performance.reason}`);
      lines.push(`- Action: ${item.recommendation.action}`);
      lines.push(`- Next Test: ${item.recommendation.nextCreativeTest}`);
      lines.push(``);
    }
  }

  if (tiers.strong.length > 0) {
    lines.push(`## 💪 Strong - Optimize These`);
    for (const item of tiers.strong) {
      lines.push(`### ${item.content.productName}`);
      lines.push(`- Platform: ${item.content.platform}`);
      lines.push(`- CTR: ${item.metrics.ctr}%`);
      lines.push(`- Action: ${item.recommendation.action}`);
      lines.push(`- Next Test: ${item.recommendation.nextCreativeTest}`);
      lines.push(``);
    }
  }

  if (tiers.promising.length > 0) {
    lines.push(`## 📈 Promising - Iterate`);
    for (const item of tiers.promising) {
      lines.push(`- ${item.content.productName} (${item.content.platform}) - ${item.recommendation.action}`);
    }
  }

  if (tiers.weak.length > 0) {
    lines.push(`## ⚠️ Weak - Pause or Kill`);
    for (const item of tiers.weak) {
      lines.push(`- ${item.content.productName} (${item.content.platform}) - ${item.recommendation.action}`);
    }
  }

  lines.push(`## Product-Level Recommendations`);
  const productMap = new Map();
  for (const item of contentMetrics) {
    const productName = item.content.productName;
    if (!productMap.has(productName)) {
      productMap.set(productName, []);
    }
    productMap.get(productName).push(item);
  }

  for (const [productName, items] of productMap) {
    const avgCtr = items.reduce((sum, item) => sum + item.metrics.ctr, 0) / items.length;
    const totalPurchases = items.reduce((sum, item) => sum + item.metrics.purchases, 0);
    const topTier = items.map(item => classifyPerformance(item.metrics).tier).sort((a, b) => {
      const tierOrder = { winner: 5, strong: 4, promising: 3, weak: 2, insufficient_data: 1 };
      return tierOrder[b] - tierOrder[a];
    })[0];

    lines.push(`### ${productName}`);
    lines.push(`- Avg CTR: ${avgCtr.toFixed(2)}%`);
    lines.push(`- Total Purchases: ${totalPurchases}`);
    lines.push(`- Best Performance: ${topTier}`);
    lines.push(`- Recommendation: ${topTier === "winner" ? "Scale this product" : topTier === "strong" ? "Test more variants" : topTier === "promising" ? "Iterate creative" : "Pause or kill"}`);
    lines.push(``);
  }

  return lines.join("\n");
}

const defaultMetrics = [
  {
    content: {
      productName: "FurLift Pet Hair Remover",
      platform: "TikTok",
      hook: "Stop scrolling if you hate pet hair",
      angle: "before-after-transformation"
    },
    metrics: {
      views: 1250,
      watchTime: 12,
      ctr: 3.2,
      addToCart: 8,
      purchases: 2
    }
  },
  {
    content: {
      productName: "Expandable Drawer Organizer",
      platform: "TikTok",
      hook: "Messy drawer transformation",
      angle: "problem-pain-point"
    },
    metrics: {
      views: 850,
      watchTime: 8,
      ctr: 1.8,
      addToCart: 3,
      purchases: 0
    }
  },
  {
    content: {
      productName: "Volcano Car Diffuser",
      platform: "Instagram Reels",
      hook: "Car odor hack",
      angle: "demonstration-tutorial"
    },
    metrics: {
      views: 320,
      watchTime: 5,
      ctr: 0.9,
      addToCart: 1,
      purchases: 0
    }
  }
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.get("input");
  const outputPath = args.get("output") || path.join(outputDir, `analytics-${Date.now()}.md`);
  const dryRun = args.has("dry-run");

  let metrics = defaultMetrics;

  if (inputPath) {
    const inputFullPath = path.resolve(repoRoot, inputPath);
    if (!fs.existsSync(inputFullPath)) {
      console.error(`Input file not found: ${inputFullPath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(inputFullPath, "utf-8");
    metrics = JSON.parse(content);
  }

  const report = generateReport(metrics);

  if (dryRun) {
    console.log(report);
    console.log(`\nDry run: no file written.`);
  } else {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report, "utf-8");
    console.log(`Analytics report written to: ${outputPath}`);
    console.log(`\nSummary:`);
    console.log(`- Total content analyzed: ${metrics.length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
