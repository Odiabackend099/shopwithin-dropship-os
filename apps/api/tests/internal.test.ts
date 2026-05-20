import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { loadEnv } from "../src/env.js";
import { InMemoryJobQueue } from "../src/lib/job-queue.js";
import { InMemoryRepository } from "../src/lib/repository.js";

describe("internal routes", () => {
  const testEnv = (overrides: Record<string, string> = {}) =>
    loadEnv({ NODE_ENV: "test", SHOPIFY_WEBHOOK_SECRET: "shop", FLUTTERWAVE_SECRET_HASH: "fw", SUPPLIER_WEBHOOK_SECRET: "sup", ...overrides });

  it("scores product candidates", async () => {
    const app = await buildApp({
      env: testEnv(),
      repository: new InMemoryRepository(),
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/products/score",
      payload: {
        demandVelocity: 100,
        margin: 100,
        shippingSpeed: 100,
        wowFactor: 100,
        creativeEase: 100,
        trendLongevity: 100,
        competition: 0,
        adSaturation: 0,
        riskPenalties: 0
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().decision).toBe("publish_ready");
    await app.close();
  });

  it("blocks product publishing when market delivery coverage is missing", async () => {
    const app = await buildApp({
      env: testEnv(),
      repository: new InMemoryRepository(),
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/products/publish",
      payload: {
        candidateExternalId: "cand-1",
        shopifyProduct: {
          title: "Portable Neck Fan",
          handle: "portable-neck-fan",
          bodyHtml: "<p>This is a mobile-first product page with benefits, proof, shipping details, FAQs, and clear trust messaging for global shoppers.</p>",
          vendor: "Dropship OS",
          productType: "Gadgets",
          tags: ["summer", "travel"],
          priceUsd: 49,
          seoTitle: "Portable Neck Fan for Travel",
          seoDescription: "Shop a portable neck fan with USD checkout, tracked delivery, and fast-shipping supplier checks.",
          faqs: [
            { question: "Is tracking included?", answer: "Yes, tracking is synced once the supplier provides it." },
            { question: "How long is shipping?", answer: "Target delivery is under ten business days in supported markets." },
            { question: "Can I return it?", answer: "Returns follow the published store policy and product eligibility." }
          ],
          trustBadges: ["Secure USD checkout", "Tracked shipping", "Support included"],
          ugcVideoUrls: []
        },
        score: {
          demandVelocity: 95,
          margin: 90,
          shippingSpeed: 90,
          wowFactor: 90,
          creativeEase: 90,
          trendLongevity: 85,
          competition: 15,
          adSaturation: 10,
          riskPenalties: 0
        },
        supplierOffers: [
          {
            supplier: "zendrop",
            supplierProductId: "z-1",
            productCostUsd: 12,
            shippingCostUsd: 4,
            estimatedDeliveryDays: 7,
            inventoryVerified: true,
            supportsTrackingSync: true,
            shipsFrom: "US",
            shipsTo: ["US"],
            sourceUrl: "https://example.com/z"
          }
        ]
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().blockers).toContain("target_market_delivery_gap");
    await app.close();
  });

  it("blocks paid traffic before organic creative validation", async () => {
    const app = await buildApp({
      env: testEnv(),
      repository: new InMemoryRepository(),
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/traffic/validate-creative",
      payload: {
        organicPostsPublished: 4,
        creativesProduced: 8,
        bestOrganicViewCount: 300,
        bestOrganicClickThroughRate: 0.4,
        landingPageSessions: 12,
        addToCarts: 0,
        requestedDailyBudgetNgn: 8000
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      paidTestAllowed: false,
      cappedDailyBudgetNgn: 0
    });
    expect(response.json().reasons).toContain("publish_more_organic_posts_before_paid");
    await app.close();
  });

  it("caps validated TikTok micro-test budgets at NGN 5000 per day", async () => {
    const app = await buildApp({
      env: testEnv({ PAID_ADS_ENABLED: "true" }),
      repository: new InMemoryRepository(),
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/traffic/validate-creative",
      payload: {
        organicPostsPublished: 18,
        creativesProduced: 24,
        bestOrganicViewCount: 2400,
        bestOrganicClickThroughRate: 1.8,
        landingPageSessions: 88,
        addToCarts: 5,
        requestedDailyBudgetNgn: 9000
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      paidTestAllowed: true,
      cappedDailyBudgetNgn: 5000
    });
    expect(response.json().reasons).toContain("cold_test_daily_budget_capped_to_5000_ngn");
    await app.close();
  });

  it("keeps paid traffic blocked when the paid ads flag is disabled", async () => {
    const app = await buildApp({
      env: testEnv({ PAID_ADS_ENABLED: "false" }),
      repository: new InMemoryRepository(),
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/traffic/validate-creative",
      payload: {
        organicPostsPublished: 18,
        creativesProduced: 24,
        bestOrganicViewCount: 2400,
        bestOrganicClickThroughRate: 1.8,
        landingPageSessions: 88,
        addToCarts: 5,
        requestedDailyBudgetNgn: 3000
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      paidTestAllowed: false,
      cappedDailyBudgetNgn: 0
    });
    expect(response.json().reasons).toContain("paid_ads_feature_flag_disabled");
    await app.close();
  });

  it("records supplier offers for vetted sourcing", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv(),
      repository,
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/suppliers/offers",
      payload: {
        candidateExternalId: "pet-hair-remover",
        offer: {
          supplier: "zendrop",
          supplierProductId: "zendrop-phr-1",
          productCostUsd: 8.5,
          shippingCostUsd: 4,
          estimatedDeliveryDays: 7,
          inventoryVerified: true,
          supportsTrackingSync: true,
          shipsFrom: "US",
          shipsTo: ["US", "UK", "CA"],
          sourceUrl: "https://example.com/zendrop/pet-hair-remover"
        }
      }
    });

    expect(response.statusCode).toBe(202);
    expect(repository.supplierOffers.get("zendrop:zendrop-phr-1")).toMatchObject({
      candidateExternalId: "pet-hair-remover",
      inventoryVerified: true
    });
    await app.close();
  });

  it("dry-runs supplier test orders while supplier auto-pay is disabled", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv({ SUPPLIER_AUTO_PAY_ENABLED: "false" }),
      repository,
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/suppliers/test-order",
      payload: {
        shopifyOrderId: "6973205250298",
        supplier: "zendrop",
        supplierProductId: "zendrop-phr-1",
        quantity: 1,
        shipToCountry: "US",
        dryRun: true
      }
    });

    expect(response.statusCode).toBe(202);
    expect(response.json().attempt).toMatchObject({
      shopifyOrderId: "6973205250298",
      supplier: "zendrop",
      status: "dry_run"
    });
    expect(repository.fulfillmentAttempts).toHaveLength(1);
    expect(repository.supplierOrders.get("zendrop:6973205250298:zendrop-phr-1")).toMatchObject({
      mode: "dry_run",
      status: "draft"
    });
    await app.close();
  });

  it("holds Zendrop connected-store orders instead of inventing unsupported live API calls", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv({ SUPPLIER_AUTO_PAY_ENABLED: "true" }),
      repository,
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/suppliers/test-order",
      payload: {
        shopifyOrderId: "6973205250298",
        supplier: "zendrop",
        supplierProductId: "zendrop-phr-1",
        quantity: 1,
        shipToCountry: "US",
        dryRun: false
      }
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      ok: false,
      attempt: {
        status: "held",
        error: "zendrop_public_order_api_unavailable_use_connected_shopify_fulfillment"
      }
    });
    expect(repository.supplierOrders.get("zendrop:6973205250298:zendrop-phr-1")).toMatchObject({
      mode: "connected_store",
      status: "held"
    });
    await app.close();
  });

  it("verifies and persists the FurLift Zendrop product link with inventory and shipping evidence", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv(),
      repository,
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/suppliers/product-links",
      payload: furliftZendropLink()
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toMatchObject({
      ok: true,
      link: {
        productHandle: "furlift-reusable-pet-hair-detailer",
        supplier: "zendrop",
        verificationStatus: "verified",
        marginEstimatePercent: 59.12
      }
    });
    expect(repository.supplierProductLinks.get("zendrop:furlift-reusable-pet-hair-detailer:VLOY30HZN")).toMatchObject({
      inventoryState: "in_stock",
      trackingSyncSupported: true
    });
    expect(repository.supplierSyncAudits[0]).toMatchObject({ action: "product_link_verified", status: "passed" });
    await app.close();
  });

  it("blocks invalid Zendrop links instead of pretending product mapping is verified", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv(),
      repository,
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/suppliers/product-links",
      payload: {
        ...furliftZendropLink(),
        inventoryState: "unknown"
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().blockers).toContain("supplier_inventory_not_verified");
    await app.close();
  });

  it("validates Zendrop order visibility before allowing fulfillment approval", async () => {
    const repository = new InMemoryRepository();
    await repository.upsertOrder(
      {
        shopifyOrderId: "6973205250298",
        orderName: "#1001",
        paymentStatus: "paid",
        riskLevel: "low",
        currency: "USD",
        subtotalUsd: 24.95,
        shippingUsd: 0,
        taxUsd: 0,
        customerEmail: "buyer@example.com",
        createdAt: new Date().toISOString()
      },
      {}
    );
    const app = await buildApp({
      env: testEnv({ SUPPLIER_AUTO_PAY_ENABLED: "false" }),
      repository,
      queue: new InMemoryJobQueue()
    });
    await app.inject({ method: "POST", url: "/internal/suppliers/product-links", payload: furliftZendropLink() });

    const visibility = await app.inject({
      method: "POST",
      url: "/internal/suppliers/order-visibility",
      payload: {
        shopifyOrderId: "6973205250298",
        productHandle: "furlift-reusable-pet-hair-detailer",
        shopifySku: "VLOY30HZN",
        supplier: "zendrop",
        supplierProductId: "2102110",
        visibleInZendrop: true,
        linkedProductCorrect: true,
        fulfillmentEligible: true,
        zendropOrderStatus: "unfulfilled"
      }
    });
    const preflight = await app.inject({
      method: "POST",
      url: "/internal/fulfillment/preflight",
      payload: {
        shopifyOrderId: "6973205250298",
        productHandle: "furlift-reusable-pet-hair-detailer",
        shopifySku: "VLOY30HZN",
        supplier: "zendrop",
        targetMarket: "US"
      }
    });

    expect(visibility.statusCode).toBe(202);
    expect(preflight.statusCode).toBe(200);
    expect(preflight.json().preflight.ready).toBe(true);
    expect(repository.supplierOrders.get("zendrop:6973205250298:2102110")).toMatchObject({ status: "linked" });
    await app.close();
  });

  it("records manual fulfillment approval without triggering supplier auto-pay", async () => {
    const repository = new InMemoryRepository();
    await repository.upsertOrder(
      {
        shopifyOrderId: "6973205250298",
        orderName: "#1001",
        paymentStatus: "paid",
        riskLevel: "low",
        currency: "USD",
        subtotalUsd: 24.95,
        shippingUsd: 0,
        taxUsd: 0,
        customerEmail: "buyer@example.com",
        createdAt: new Date().toISOString()
      },
      {}
    );
    const app = await buildApp({
      env: testEnv({ SUPPLIER_AUTO_PAY_ENABLED: "false" }),
      repository,
      queue: new InMemoryJobQueue()
    });
    await app.inject({ method: "POST", url: "/internal/suppliers/product-links", payload: furliftZendropLink() });

    const response = await app.inject({
      method: "POST",
      url: "/internal/fulfillment/approve",
      payload: {
        shopifyOrderId: "6973205250298",
        productHandle: "furlift-reusable-pet-hair-detailer",
        shopifySku: "VLOY30HZN",
        supplier: "zendrop",
        targetMarket: "US",
        reviewer: "operator",
        decision: "approved",
        reason: "Order visible in Zendrop, SKU and variant confirmed."
      }
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toMatchObject({ ok: true, supplierAutoPayEnabled: false });
    expect(repository.fulfillmentApprovals.get("6973205250298:zendrop:2102110")).toMatchObject({ status: "approved" });
    expect(repository.supplierOrders.get("zendrop:6973205250298:2102110")).toMatchObject({ status: "approved" });
    await app.close();
  });

  it("blocks approval when fulfillment preflight fails", async () => {
    const repository = new InMemoryRepository();
    await repository.upsertOrder(
      {
        shopifyOrderId: "risk-1",
        orderName: "#1002",
        paymentStatus: "paid",
        riskLevel: "high",
        currency: "USD",
        subtotalUsd: 24.95,
        shippingUsd: 0,
        taxUsd: 0,
        customerEmail: "buyer@example.com",
        createdAt: new Date().toISOString()
      },
      {}
    );
    const app = await buildApp({
      env: testEnv({ SUPPLIER_AUTO_PAY_ENABLED: "false" }),
      repository,
      queue: new InMemoryJobQueue()
    });
    await app.inject({ method: "POST", url: "/internal/suppliers/product-links", payload: furliftZendropLink() });

    const response = await app.inject({
      method: "POST",
      url: "/internal/fulfillment/approve",
      payload: {
        shopifyOrderId: "risk-1",
        productHandle: "furlift-reusable-pet-hair-detailer",
        shopifySku: "VLOY30HZN",
        supplier: "zendrop",
        targetMarket: "US",
        reviewer: "operator",
        decision: "approved",
        reason: "Trying to approve a high-risk order"
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().preflight.blockers).toContain("order_risk_requires_manual_review");
    expect(repository.fulfillmentApprovals.size).toBe(0);
    await app.close();
  });

  it("stores calculated profit snapshots", async () => {
    const app = await buildApp({
      env: testEnv(),
      repository: new InMemoryRepository(),
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/profit/snapshots",
      payload: {
        orderId: "1001",
        revenueUsd: 39.99,
        paymentFeesUsd: 1.76,
        productCostUsd: 8.5,
        shippingCostUsd: 4,
        adSpendUsd: 3,
        refundCostUsd: 0
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().snapshot).toMatchObject({
      orderId: "1001",
      netProfitUsd: 22.73
    });
    await app.close();
  });

  it("keeps Klaviyo events in dry-run mode without a private API key", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv(),
      repository,
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/klaviyo/events",
      payload: {
        email: "buyer@example.com",
        eventName: "Fulfillment Held",
        properties: { orderName: "#1001", reason: "auto_fulfillment_disabled" }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ ok: true, status: "dry_run", eventName: "Fulfillment Held" });
    expect(repository.retentionEvents.size).toBe(1);
    await app.close();
  });

  it("dedupes analytics events and feeds dashboard conversion metrics", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv(),
      repository,
      queue: new InMemoryJobQueue()
    });

    const event = {
      eventId: "organic-page-1",
      source: "organic",
      type: "page_view",
      productHandle: "furlift-reusable-pet-hair-detailer",
      metadata: { path: "/products/furlift-reusable-pet-hair-detailer" },
      occurredAt: new Date().toISOString()
    };
    const first = await app.inject({ method: "POST", url: "/internal/analytics/events", payload: event });
    const second = await app.inject({ method: "POST", url: "/internal/analytics/events", payload: event });

    expect(first.statusCode).toBe(202);
    expect(second.statusCode).toBe(200);
    expect(second.json()).toMatchObject({ duplicate: true });
    await app.close();
  });

  it("generates and stores the complete first-product creative library", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv({ OPENAI_API_KEY: "" }),
      repository,
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/content/generate",
      payload: {
        productHandle: "furlift-reusable-pet-hair-detailer",
        title: "FurLift Reusable Pet Hair Detailer",
        positioning: "Reusable pet hair removal for couches, car seats, rugs, and pet beds",
        priceUsd: 24.95,
        audience: ["dog owners", "cat owners", "car owners"],
        proofPoints: ["visible before and after", "no sticky sheets", "manual reusable tool"]
      }
    });

    expect(response.statusCode).toBe(202);
    expect(response.json().counts).toMatchObject({
      hooks: 100,
      shortFormConcepts: 50,
      adVariants: 30,
      ctaVariants: 30,
      headlineVariants: 20
    });
    expect(repository.generatedContentAssets.length).toBe(280);
    await app.close();
  });

  it("schedules organic content posts without publishing credentials", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv(),
      repository,
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/content/schedule",
      payload: {
        posts: [
          {
            productHandle: "furlift-reusable-pet-hair-detailer",
            platform: "tiktok",
            status: "scheduled",
            scheduledFor: new Date(Date.now() + 86400000).toISOString(),
            hook: "I thought my couch was clean.",
            caption: "Pet hair before and after.",
            metrics: {}
          }
        ]
      }
    });

    expect(response.statusCode).toBe(202);
    expect(repository.contentPosts).toHaveLength(1);
    await app.close();
  });

  it("blocks paid campaign creation while paid ads are disabled", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv({ PAID_ADS_ENABLED: "false" }),
      repository,
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/internal/ads/campaigns",
      payload: {
        platform: "tiktok",
        productHandle: "furlift-reusable-pet-hair-detailer",
        requestedDailyBudgetNgn: 5000,
        creativesProduced: 30,
        organicPostsPublished: 20,
        bestOrganicViewCount: 2400,
        bestOrganicClickThroughRate: 1.8,
        landingPageSessions: 120,
        addToCarts: 6
      }
    });

    expect(response.statusCode).toBe(423);
    expect(response.json().reasons).toContain("paid_ads_feature_flag_disabled");
    expect(repository.analyticsEvents.size).toBe(1);
    await app.close();
  });

  it("aggregates the analytics dashboard from orders, held routing jobs, and profit snapshots", async () => {
    const repository = new InMemoryRepository();
    await repository.upsertOrder(
      {
        shopifyOrderId: "6973205250298",
        orderName: "#1001",
        paymentStatus: "paid",
        riskLevel: "low",
        currency: "USD",
        subtotalUsd: 39.99,
        shippingUsd: 0,
        taxUsd: 0,
        customerEmail: "buyer@example.com",
        createdAt: new Date().toISOString()
      },
      {}
    );
    await repository.createRoutingJob({ id: "route:6973205250298", shopifyOrderId: "6973205250298", selectedSupplier: "zendrop", status: "held" });
    await repository.upsertProfitSnapshot({
      orderId: "1001",
      revenueUsd: 39.99,
      paymentFeesUsd: 1.76,
      productCostUsd: 8.5,
      shippingCostUsd: 4,
      adSpendUsd: 3,
      refundCostUsd: 0
    });

    const app = await buildApp({
      env: testEnv(),
      repository,
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "GET",
      url: "/internal/analytics/dashboard"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().dashboard).toMatchObject({
      revenueUsd: 39.99,
      netProfitUsd: 22.73,
      orderCount: 1,
      heldRoutingJobs: 1,
      failedRoutingJobs: 0,
      averageOrderValueUsd: 39.99
    });
    await app.close();
  });

  it("returns fulfillment operations visibility for admin dashboards", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv(),
      repository,
      queue: new InMemoryJobQueue()
    });
    await app.inject({ method: "POST", url: "/internal/suppliers/product-links", payload: furliftZendropLink() });

    const response = await app.inject({ method: "GET", url: "/internal/fulfillment/ops" });

    expect(response.statusCode).toBe(200);
    expect(response.json().fulfillment.summary).toMatchObject({
      linkedProducts: 1,
      verifiedLinks: 1,
      supplierFailures: 0
    });
    await app.close();
  });

  it("counts only active supplier lifecycle failures in fulfillment operations", async () => {
    const repository = new InMemoryRepository();
    const app = await buildApp({
      env: testEnv(),
      repository,
      queue: new InMemoryJobQueue()
    });

    await app.inject({
      method: "POST",
      url: "/internal/fulfillment/status",
      payload: {
        shopifyOrderId: "6973205250298",
        supplier: "zendrop",
        status: "failed",
        message: "Zendrop connection blocked at Shopify billing approval.",
        metadata: { blockedAt: "shopify_app_subscription_approval" },
        occurredAt: "2026-05-17T20:11:12.000Z"
      }
    });

    const failedResponse = await app.inject({ method: "GET", url: "/internal/fulfillment/ops" });
    expect(failedResponse.json().fulfillment.summary.supplierFailures).toBe(1);

    await app.inject({
      method: "POST",
      url: "/internal/fulfillment/status",
      payload: {
        shopifyOrderId: "6973205250298",
        supplier: "zendrop",
        status: "linked",
        message: "Zendrop store connection recovered and order is visible.",
        metadata: { visibleInZendrop: true },
        occurredAt: "2026-05-17T20:21:12.000Z"
      }
    });

    const recoveredResponse = await app.inject({ method: "GET", url: "/internal/fulfillment/ops" });
    expect(recoveredResponse.json().fulfillment.summary.supplierFailures).toBe(0);
    await app.close();
  });
});

function furliftZendropLink() {
  return {
    productHandle: "furlift-reusable-pet-hair-detailer",
    shopifyProductId: "6973205250298",
    shopifyVariantId: "variant-1",
    shopifySku: "VLOY30HZN",
    supplier: "zendrop",
    supplierProductId: "2102110",
    supplierVariantId: "2102110-default",
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
    rawPayload: { evidence: "operator verified in Zendrop dashboard" }
  };
}
