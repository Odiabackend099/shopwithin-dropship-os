import { describe, expect, it } from "vitest";
import { capColdTestSpend, evaluateCreativeValidation, leanNgnBudget, validateLeanBudget } from "../src/index.js";

describe("lean NGN launch budget", () => {
  it("allocates exactly NGN 50,000", () => {
    expect(validateLeanBudget(leanNgnBudget)).toBe(true);
  });

  it("caps cold TikTok test spend", () => {
    expect(capColdTestSpend(10000)).toBe(5000);
    expect(capColdTestSpend(3000)).toBe(3000);
  });

  it("blocks paid tests before organic creative validation", () => {
    const decision = evaluateCreativeValidation({
      organicPostsPublished: 5,
      creativesProduced: 8,
      bestOrganicViewCount: 400,
      bestOrganicClickThroughRate: 0.8,
      landingPageSessions: 20,
      addToCarts: 0
    });

    expect(decision.paidTestAllowed).toBe(false);
    expect(decision.reasons).toContain("produce_20_to_30_creatives_first");
  });

  it("allows micro testing after enough creative signal", () => {
    const decision = evaluateCreativeValidation({
      organicPostsPublished: 20,
      creativesProduced: 25,
      bestOrganicViewCount: 1500,
      bestOrganicClickThroughRate: 1.7,
      landingPageSessions: 80,
      addToCarts: 4
    });

    expect(decision.paidTestAllowed).toBe(true);
  });
});
