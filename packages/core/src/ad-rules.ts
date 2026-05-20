import type { AdExperiment } from "./types.js";

export type KillSwitchDecision = {
  pause: boolean;
  reasons: string[];
};

export function evaluateKillSwitch(ad: AdExperiment): KillSwitchDecision {
  const reasons: string[] = [];
  const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
  const atcRate = ad.productPageSessions > 0 ? (ad.addToCarts / ad.productPageSessions) * 100 : 0;

  if (ad.spendUsd >= 15 && ctr < 0.8) reasons.push("ctr_below_0_8_after_min_spend");
  if (ad.productPageSessions >= 100 && atcRate < 3) reasons.push("add_to_cart_below_3_percent_after_100_sessions");
  if (ad.checkoutStarts >= 3 && ad.purchases === 0) reasons.push("three_checkout_starts_no_purchase");
  if (ad.contributionMarginUsd < 0 && ad.consecutiveNegativeMarginDays >= 2) reasons.push("negative_margin_two_days");

  return { pause: reasons.length > 0, reasons };
}
