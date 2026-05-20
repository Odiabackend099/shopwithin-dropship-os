import type { ProductScore, ProductScoreInput, SupplierOffer, TargetMarket } from "./types.js";

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
} as const;

export function calculateProductScore(input: ProductScoreInput): ProductScore {
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
  const reasons = buildScoreReasons(input, normalized);
  const decision = normalized >= 78 ? "publish_ready" : normalized >= 68 ? "draft" : normalized >= 55 ? "watch" : "reject";

  return { ...input, total: normalized, decision, reasons };
}

export function calculateGrossMarginPercent(priceUsd: number, productCostUsd: number, shippingCostUsd: number): number {
  if (priceUsd <= 0) return 0;
  return Number((((priceUsd - productCostUsd - shippingCostUsd) / priceUsd) * 100).toFixed(2));
}

export function shippingSpeedScore(estimatedDeliveryDays: number): number {
  if (estimatedDeliveryDays <= 4) return 100;
  if (estimatedDeliveryDays <= 7) return 88;
  if (estimatedDeliveryDays <= 10) return 74;
  if (estimatedDeliveryDays <= 14) return 50;
  if (estimatedDeliveryDays <= 21) return 25;
  return 5;
}

export function isPublishEligible(args: {
  score: ProductScore;
  priceUsd: number;
  supplierOffers: SupplierOffer[];
  requiredMarkets: TargetMarket[];
  blockedRiskCategory: boolean;
}): { eligible: boolean; blockers: string[] } {
  const blockers: string[] = [];
  const fastestOffer = [...args.supplierOffers].sort((a, b) => a.estimatedDeliveryDays - b.estimatedDeliveryDays)[0];
  const bestMargin = Math.max(
    ...args.supplierOffers.map((offer) => calculateGrossMarginPercent(args.priceUsd, offer.productCostUsd, offer.shippingCostUsd))
  );
  const verifiedOffers = args.supplierOffers.filter((offer) => offer.inventoryVerified);
  const hasTwoOffers = args.supplierOffers.length >= 2;
  const hasFastSingleVerifiedOffer = verifiedOffers.some((offer) => offer.estimatedDeliveryDays <= 10);
  const marketCoverage = args.requiredMarkets.every((market) =>
    args.supplierOffers.some((offer) => offer.shipsTo.includes(market) && offer.estimatedDeliveryDays <= 10)
  );

  if (args.score.total < 78) blockers.push("score_below_78");
  if (bestMargin < 55) blockers.push("gross_margin_below_55_percent");
  if (!fastestOffer || fastestOffer.estimatedDeliveryDays > 10) blockers.push("delivery_over_10_days");
  if (args.blockedRiskCategory) blockers.push("blocked_risk_category");
  if (!hasTwoOffers && !hasFastSingleVerifiedOffer) blockers.push("insufficient_supplier_redundancy");
  if (!marketCoverage) blockers.push("target_market_delivery_gap");

  return { eligible: blockers.length === 0, blockers };
}

function buildScoreReasons(input: ProductScoreInput, total: number): string[] {
  const reasons: string[] = [`weighted_score_${total}`];
  if (input.demandVelocity >= 75) reasons.push("strong_demand_velocity");
  if (input.margin >= 70) reasons.push("healthy_margin");
  if (input.shippingSpeed >= 74) reasons.push("acceptable_delivery_speed");
  if (input.competition >= 70) reasons.push("competition_pressure");
  if (input.adSaturation >= 70) reasons.push("ad_saturation_risk");
  if (input.riskPenalties > 0) reasons.push("risk_penalty_applied");
  return reasons;
}
