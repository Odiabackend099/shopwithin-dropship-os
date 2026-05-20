import { describe, expect, it } from "vitest";
import { InMemoryRepository } from "../src/lib/repository.js";
import { processProfitSnapshot, processRouteOrder, processTrackingSync } from "../src/workers/processor.js";
import type { ShopifyClient } from "../src/services/shopify.js";

describe("worker processors", () => {
  it("holds routing when no verified fast supplier exists", async () => {
    const repository = new InMemoryRepository();
    await repository.createRoutingJob({ id: "route:1001", shopifyOrderId: "1001", selectedSupplier: "zendrop", status: "queued" });
    const result = await processRouteOrder(
      {
        shopifyOrderId: "1001",
        market: "US",
        offers: [
          {
            supplier: "zendrop",
            supplierProductId: "z-1",
            productCostUsd: 10,
            shippingCostUsd: 5,
            estimatedDeliveryDays: 7,
            inventoryVerified: false,
            supportsTrackingSync: true,
            shipsFrom: "US",
            shipsTo: ["US"],
            sourceUrl: "https://example.com"
          }
        ]
      },
      repository
    );

    expect(result).toEqual({ status: "held", reason: "no_verified_supplier_offer_for_market" });
    expect(repository.jobs.get("route:1001")?.status).toBe("held");
  });

  it("calculates profit snapshots in queued jobs", () => {
    const result = processProfitSnapshot({
      snapshot: {
        orderId: "1002",
        revenueUsd: 120,
        paymentFeesUsd: 5,
        productCostUsd: 35,
        shippingCostUsd: 12,
        adSpendUsd: 25,
        refundCostUsd: 0
      }
    });
    expect(result.netProfitUsd).toBe(43);
  });

  it("syncs tracking by Shopify order ID and records lifecycle state", async () => {
    const repository = new InMemoryRepository();
    const shopify = {
      syncTrackingForOrder: async () => ({ fulfillmentOrderId: "gid://shopify/FulfillmentOrder/1", status: "dry_run" as const }),
      syncTracking: async () => undefined
    } as unknown as ShopifyClient;

    const result = await processTrackingSync(
      {
        payload: {
          shopifyOrderId: "6973205250298",
          supplier: "zendrop",
          trackingNumber: "ZD123",
          carrier: "Zendrop"
        }
      },
      shopify,
      repository
    );

    expect(result).toMatchObject({ status: "dry_run", fulfillmentOrderId: "gid://shopify/FulfillmentOrder/1" });
    expect(repository.trackingEvents[0]).toMatchObject({ shopifyOrderId: "6973205250298", status: "received" });
    expect(repository.fulfillmentLifecycleEvents[0]).toMatchObject({ status: "shipped" });
  });
});
