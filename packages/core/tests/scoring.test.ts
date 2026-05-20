import { describe, expect, it } from "vitest";
import { calculateGrossMarginPercent, calculateProductScore, isPublishEligible, shippingSpeedScore } from "../src/index.js";

describe("product scoring", () => {
  it("calculates weighted score and publish readiness", () => {
    const score = calculateProductScore({
      demandVelocity: 100,
      margin: 100,
      shippingSpeed: 100,
      wowFactor: 100,
      creativeEase: 100,
      trendLongevity: 100,
      competition: 0,
      adSaturation: 0,
      riskPenalties: 0
    });

    expect(score.total).toBeGreaterThanOrEqual(78);
    expect(score.decision).toBe("publish_ready");
  });

  it("blocks products that miss supplier redundancy or delivery targets", () => {
    const score = calculateProductScore({
      demandVelocity: 95,
      margin: 90,
      shippingSpeed: 88,
      wowFactor: 90,
      creativeEase: 85,
      trendLongevity: 80,
      competition: 20,
      adSaturation: 15,
      riskPenalties: 0
    });

    const result = isPublishEligible({
      score,
      priceUsd: 49,
      requiredMarkets: ["US"],
      blockedRiskCategory: false,
      supplierOffers: [
        {
          supplier: "zendrop",
          supplierProductId: "z-1",
          productCostUsd: 12,
          shippingCostUsd: 5,
          estimatedDeliveryDays: 14,
          inventoryVerified: true,
          supportsTrackingSync: true,
          shipsFrom: "US",
          shipsTo: ["US"],
          sourceUrl: "https://example.com/z-1"
        }
      ]
    });

    expect(result.eligible).toBe(false);
    expect(result.blockers).toContain("delivery_over_10_days");
  });

  it("scores shipping speed and margin", () => {
    expect(shippingSpeedScore(7)).toBe(88);
    expect(calculateGrossMarginPercent(50, 12, 6)).toBe(64);
  });
});
