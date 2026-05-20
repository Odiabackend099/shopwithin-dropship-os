import type { DailyAnalyticsSnapshot, ProfitSnapshot } from "./types.js";
import { normalizeUsd } from "./currency.js";

export function calculateProfitSnapshot(args: Omit<ProfitSnapshot, "netProfitUsd" | "marginPercent">): ProfitSnapshot {
  const netProfitUsd = normalizeUsd(
    args.revenueUsd - args.paymentFeesUsd - args.productCostUsd - args.shippingCostUsd - args.adSpendUsd - args.refundCostUsd
  );
  const marginPercent = args.revenueUsd <= 0 ? 0 : normalizeUsd((netProfitUsd / args.revenueUsd) * 100);
  return { ...args, netProfitUsd, marginPercent };
}

export function calculateRoas(revenueUsd: number, adSpendUsd: number): number {
  return adSpendUsd <= 0 ? 0 : normalizeUsd(revenueUsd / adSpendUsd);
}

export function calculateCac(adSpendUsd: number, purchases: number): number {
  return purchases <= 0 ? 0 : normalizeUsd(adSpendUsd / purchases);
}

export function calculateRate(numerator: number, denominator: number): number {
  return denominator <= 0 ? 0 : normalizeUsd((numerator / denominator) * 100);
}

export function classifyProductWinLoss(snapshot: DailyAnalyticsSnapshot): "insufficient_data" | "winner" | "watch" | "loser" {
  if (snapshot.sessions < 100 && snapshot.purchases < 3) return "insufficient_data";
  const roas = calculateRoas(snapshot.revenueUsd, snapshot.adSpendUsd);
  const atcRate = calculateRate(snapshot.addToCarts, snapshot.sessions);
  if (snapshot.netProfitUsd > 0 && roas >= 1.5 && atcRate >= 3) return "winner";
  if (snapshot.netProfitUsd < 0 && snapshot.sessions >= 100 && atcRate < 3) return "loser";
  return "watch";
}
