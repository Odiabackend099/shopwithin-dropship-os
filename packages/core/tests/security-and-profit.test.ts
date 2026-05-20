import { describe, expect, it } from "vitest";
import {
  calculateProfitSnapshot,
  evaluateFulfillmentPreflight,
  evaluateKillSwitch,
  hmacSha256Base64,
  nextRetryDecision,
  verifyShopifyWebhook,
  verifySupplierProductLink
} from "../src/index.js";

describe("security, retry, profit, and ad controls", () => {
  it("verifies Shopify HMAC using the raw body", () => {
    const body = Buffer.from(JSON.stringify({ id: 123 }));
    const secret = "shpss_test";
    const signature = hmacSha256Base64(body, secret);
    expect(verifyShopifyWebhook(body, signature, secret)).toBe(true);
    expect(verifyShopifyWebhook(body, "bad", secret)).toBe(false);
  });

  it("moves exhausted retries to dead letter", () => {
    expect(nextRetryDecision(4, 5).deadLetter).toBe(false);
    expect(nextRetryDecision(5, 5).deadLetter).toBe(true);
  });

  it("calculates net profit", () => {
    const snapshot = calculateProfitSnapshot({
      orderId: "1001",
      revenueUsd: 100,
      paymentFeesUsd: 4,
      productCostUsd: 25,
      shippingCostUsd: 8,
      adSpendUsd: 20,
      refundCostUsd: 0
    });
    expect(snapshot.netProfitUsd).toBe(43);
    expect(snapshot.marginPercent).toBe(43);
  });

  it("pauses losing ads", () => {
    const decision = evaluateKillSwitch({
      id: "ad-1",
      productHandle: "portable-neck-fan",
      platform: "meta",
      spendUsd: 20,
      impressions: 5000,
      clicks: 20,
      productPageSessions: 100,
      addToCarts: 1,
      checkoutStarts: 3,
      purchases: 0,
      revenueUsd: 0,
      contributionMarginUsd: -20,
      consecutiveNegativeMarginDays: 2
    });
    expect(decision.pause).toBe(true);
    expect(decision.reasons.length).toBeGreaterThan(1);
  });

  it("verifies a real Zendrop product link contract without calling unsupported APIs", () => {
    const verification = verifySupplierProductLink({
      productHandle: "furlift-reusable-pet-hair-detailer",
      shopifySku: "VLOY30HZN",
      supplier: "zendrop",
      supplierProductId: "2102110",
      supplierSku: "ZD-VLOY30HZN",
      supplierProductUrl: "https://app.zendrop.com/product/2102110",
      productCostUsd: 6.25,
      shippingCostUsd: 3.95,
      retailPriceUsd: 24.95,
      estimatedDeliveryMinDays: 7,
      estimatedDeliveryMaxDays: 12,
      shipsFrom: "China",
      shipsTo: ["US", "UK", "CA", "EU", "AU"],
      inventoryState: "in_stock",
      inventoryQuantity: 500,
      trackingSyncSupported: true,
      shippingProfile: "Zendrop standard tracked",
      verificationStatus: "pending",
      verificationSource: "zendrop_dashboard",
      marginEstimatePercent: 0,
      rawPayload: {}
    });

    expect(verification.status).toBe("verified");
    expect(verification.marginEstimatePercent).toBe(59.12);
  });

  it("blocks fulfillment when the supplier link is missing or inventory is unknown", () => {
    const missing = evaluateFulfillmentPreflight({
      link: null,
      targetMarket: "US",
      orderRiskLevel: "low",
      paymentStatus: "paid",
      supplierAutoPayEnabled: false
    });
    expect(missing.ready).toBe(false);
    expect(missing.blockers).toContain("supplier_product_link_missing");

    const unknownInventory = evaluateFulfillmentPreflight({
      link: {
        productHandle: "furlift-reusable-pet-hair-detailer",
        shopifySku: "VLOY30HZN",
        supplier: "zendrop",
        supplierProductId: "2102110",
        supplierSku: "ZD-VLOY30HZN",
        supplierProductUrl: "https://app.zendrop.com/product/2102110",
        productCostUsd: 6.25,
        shippingCostUsd: 3.95,
        retailPriceUsd: 24.95,
        estimatedDeliveryMinDays: 7,
        estimatedDeliveryMaxDays: 12,
        shipsFrom: "China",
        shipsTo: ["US"],
        inventoryState: "unknown",
        trackingSyncSupported: true,
        shippingProfile: "Zendrop standard tracked",
        verificationStatus: "verified",
        verificationSource: "zendrop_dashboard",
        marginEstimatePercent: 59.12,
        rawPayload: {}
      },
      targetMarket: "US",
      orderRiskLevel: "low",
      paymentStatus: "paid",
      supplierAutoPayEnabled: false
    });
    expect(unknownInventory.ready).toBe(false);
    expect(unknownInventory.blockers).toContain("supplier_inventory_not_verified");
  });
});
