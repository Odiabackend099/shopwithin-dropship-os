import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  calculateProductScore,
  capColdTestSpend,
  evaluateCreativeValidation,
  fulfillmentLifecycleEventSchema,
  isPublishEligible,
  leanNgnBudget,
  analyticsEventSchema,
  contentPostSchema,
  supplierProductLinkSchema,
  productPublishRequestSchema,
  scoreInputSchema,
  supplierOfferSchema
} from "@dropship-os/core";
import type { AppEnv } from "../env.js";
import type { JobQueue } from "../lib/job-queue.js";
import type { Repository } from "../lib/repository.js";
import type { KlaviyoClient } from "../services/klaviyo.js";
import { creativeLibraryToAssets, type ProductAiService } from "../services/openai.js";
import { ShopifyClient } from "../services/shopify.js";
import type { SupplierClient } from "../services/suppliers.js";

type InternalDeps = {
  env: AppEnv;
  repository: Repository;
  queue: JobQueue;
  shopify: ShopifyClient;
  klaviyo: KlaviyoClient;
  suppliers: SupplierClient;
  ai: ProductAiService;
};

const creativeValidationRequestSchema = z.object({
  organicPostsPublished: z.number().int().min(0),
  creativesProduced: z.number().int().min(0),
  bestOrganicViewCount: z.number().int().min(0),
  bestOrganicClickThroughRate: z.number().min(0).max(100),
  landingPageSessions: z.number().int().min(0),
  addToCarts: z.number().int().min(0),
  requestedDailyBudgetNgn: z.number().min(0)
});

const supplierOfferRequestSchema = z.object({
  candidateExternalId: z.string().min(1),
  offer: supplierOfferSchema
});

const supplierTestOrderSchema = z.object({
  shopifyOrderId: z.string().min(1),
  supplier: z.enum(["zendrop", "cj", "spocket", "autods", "dsers", "manual"]),
  supplierProductId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  shipToCountry: z.enum(["US", "UK", "CA", "EU", "AU"]).default("US"),
  dryRun: z.boolean().default(true),
  simulate: z.boolean().default(false)
});

const supplierProductLinkRequestSchema = supplierProductLinkSchema;

const supplierOrderVisibilitySchema = z.object({
  shopifyOrderId: z.string().min(1),
  productHandle: z.string().min(1),
  shopifySku: z.string().min(1),
  supplier: z.enum(["zendrop", "cj", "spocket", "autods", "dsers", "manual"]).default("zendrop"),
  supplierProductId: z.string().min(1),
  visibleInZendrop: z.boolean(),
  linkedProductCorrect: z.boolean(),
  fulfillmentEligible: z.boolean(),
  zendropOrderStatus: z.string().min(1).default("unfulfilled"),
  evidenceUrl: z.string().url().optional(),
  notes: z.string().default("")
});

const fulfillmentPreflightSchema = z.object({
  shopifyOrderId: z.string().min(1),
  productHandle: z.string().min(1),
  shopifySku: z.string().min(1),
  supplier: z.enum(["zendrop", "cj", "spocket", "autods", "dsers", "manual"]).default("zendrop"),
  targetMarket: z.enum(["US", "UK", "CA", "EU", "AU"]).default("US")
});

const fulfillmentApprovalRequestSchema = fulfillmentPreflightSchema.extend({
  reviewer: z.string().min(1),
  decision: z.enum(["approved", "rejected", "cancelled"]),
  reason: z.string().min(1)
});

const supplierOrderPollSchema = z.object({
  shopifyOrderId: z.string().min(1),
  supplier: z.enum(["zendrop", "cj", "spocket", "autods", "dsers", "manual"]),
  supplierProductId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  mode: z.enum(["dry_run", "simulation", "connected_store", "manual"]).default("connected_store"),
  status: z.enum(["draft", "held", "submitted", "pending", "linked", "approved", "processing", "fulfilled", "shipped", "delivered", "failed", "refunded", "cancelled"]),
  providerOrderId: z.string().optional(),
  lastError: z.string().optional(),
  rawPayload: z.record(z.unknown()).default({})
});

const profitSnapshotRequestSchema = z.object({
  orderId: z.string().min(1),
  revenueUsd: z.number().min(0),
  paymentFeesUsd: z.number().min(0),
  productCostUsd: z.number().min(0),
  shippingCostUsd: z.number().min(0),
  adSpendUsd: z.number().min(0),
  refundCostUsd: z.number().min(0)
});

const klaviyoEventRequestSchema = z.object({
  email: z.string().email(),
  eventName: z.enum(["Placed Order", "Fulfillment Held", "Tracking Updated", "Abandoned Checkout"]),
  properties: z.record(z.unknown()).default({}),
  time: z.string().datetime().optional()
});

const creativeLibraryRequestSchema = z.object({
  productHandle: z.string().min(1),
  title: z.string().min(1),
  positioning: z.string().min(1),
  priceUsd: z.number().positive(),
  audience: z.array(z.string().min(1)).min(1),
  proofPoints: z.array(z.string().min(1)).min(1),
  generationMode: z.enum(["openai", "deterministic"]).default("openai")
});

const adCampaignRequestSchema = z.object({
  platform: z.enum(["meta", "tiktok"]),
  productHandle: z.string().min(1),
  requestedDailyBudgetNgn: z.number().min(0),
  creativesProduced: z.number().int().min(0),
  organicPostsPublished: z.number().int().min(0),
  bestOrganicViewCount: z.number().int().min(0),
  bestOrganicClickThroughRate: z.number().min(0).max(100),
  landingPageSessions: z.number().int().min(0),
  addToCarts: z.number().int().min(0)
});

export async function internalRoutes(app: FastifyInstance, deps: InternalDeps): Promise<void> {
  app.post("/internal/products/score", async (request) => {
    const input = scoreInputSchema.parse(request.body);
    return calculateProductScore(input);
  });

  app.post("/internal/products/publish", async (request, reply) => {
    const body = productPublishRequestSchema.parse(request.body);
    const score = calculateProductScore(body.score);
    const eligibility = isPublishEligible({
      score,
      priceUsd: body.shopifyProduct.priceUsd,
      supplierOffers: body.supplierOffers,
      requiredMarkets: ["US", "UK", "CA", "EU", "AU"],
      blockedRiskCategory: false
    });

    if (!eligibility.eligible) {
      return reply.code(422).send({ ok: false, blockers: eligibility.blockers, score });
    }
    if (!deps.env.flags.aiAutoPublishEnabled) {
      await deps.queue.enqueue("product.publish", body, { jobId: `product-publish:${body.shopifyProduct.handle}` });
      return reply.code(202).send({ ok: true, status: "draft_publish_queued", score });
    }

    const { compareAtPriceUsd, ...productDraft } = body.shopifyProduct;
    const created = await deps.shopify.createDraftProduct({
      ...productDraft,
      ...(compareAtPriceUsd ? { compareAtPriceUsd } : {})
    });
    return { ok: true, status: "draft_created", score, ...created };
  });

  app.post("/internal/orders/retry", async (request) => {
    const body = request.body as { shopifyOrderId?: string };
    if (!body.shopifyOrderId) throw new Error("shopifyOrderId is required");
    await deps.queue.enqueue("order.route", { shopifyOrderId: body.shopifyOrderId, retry: true }, { jobId: `route:${body.shopifyOrderId}:retry` });
    return { ok: true, status: "retry_queued" };
  });

  app.post("/internal/suppliers/offers", async (request, reply) => {
    const body = supplierOfferRequestSchema.parse(request.body);
    await deps.repository.upsertSupplierOffer(body.candidateExternalId, body.offer);
    return reply.code(202).send({ ok: true, status: "supplier_offer_recorded" });
  });

  app.post("/internal/suppliers/product-links", async (request, reply) => {
    const body = supplierProductLinkRequestSchema.parse(request.body);
    const verification = deps.suppliers.verifyProductLink(body);
    const stored = await deps.repository.upsertSupplierProductLink(verification.link);
    await deps.repository.recordSupplierSyncAudit({
      supplier: stored.supplier,
      action: verification.status === "verified" ? "product_link_verified" : "product_link_recorded",
      entityType: "product_link",
      entityId: `${stored.productHandle}:${stored.shopifySku}`,
      status: verification.status === "verified" ? "passed" : "blocked",
      message: verification.status === "verified" ? "Supplier product link verified from supported Zendrop connected-store evidence." : "Supplier product link recorded but blocked by verification checks.",
      metadata: { blockers: verification.blockers, warnings: verification.warnings, supplierProductUrl: stored.supplierProductUrl },
      occurredAt: new Date().toISOString()
    });
    return reply.code(verification.status === "verified" ? 202 : 422).send({
      ok: verification.status === "verified",
      link: stored,
      blockers: verification.blockers,
      warnings: verification.warnings,
      operatorAction: verification.operatorAction
    });
  });

  app.get("/internal/suppliers/product-links", async (request) => {
    const query = z.object({ productHandle: z.string().optional() }).parse(request.query);
    return { ok: true, links: await deps.repository.listSupplierProductLinks(query.productHandle) };
  });

  app.post("/internal/suppliers/order-visibility", async (request, reply) => {
    const body = supplierOrderVisibilitySchema.parse(request.body);
    const link = await deps.repository.getSupplierProductLink({ supplier: body.supplier, productHandle: body.productHandle, shopifySku: body.shopifySku });
    const passed = link !== null && body.visibleInZendrop && body.linkedProductCorrect && body.fulfillmentEligible && link.supplierProductId === body.supplierProductId;
    await deps.repository.upsertSupplierOrder({
      shopifyOrderId: body.shopifyOrderId,
      supplier: body.supplier,
      supplierProductId: body.supplierProductId,
      quantity: 1,
      mode: "connected_store",
      status: passed ? "linked" : "held",
      lastError: passed ? undefined : "zendrop_order_visibility_or_link_validation_failed",
      rawPayload: body
    });
    await deps.repository.recordFulfillmentLifecycleEvent({
      shopifyOrderId: body.shopifyOrderId,
      supplier: body.supplier,
      status: passed ? "linked" : "failed",
      message: passed ? "Shopify order is visible in Zendrop and mapped to the expected supplier variant." : "Zendrop order visibility or linked-product validation failed.",
      metadata: { ...body, linkFound: Boolean(link), expectedSupplierProductId: link?.supplierProductId },
      occurredAt: new Date().toISOString()
    });
    await deps.repository.recordSupplierSyncAudit({
      supplier: body.supplier,
      action: "order_visibility_checked",
      entityType: "order",
      entityId: body.shopifyOrderId,
      status: passed ? "passed" : "blocked",
      message: passed ? "Order visibility verified in Zendrop connected-store workflow." : "Order is not safe to fulfill from Zendrop yet.",
      metadata: { ...body, linkFound: Boolean(link), expectedSupplierProductId: link?.supplierProductId },
      occurredAt: new Date().toISOString()
    });
    return reply.code(passed ? 202 : 422).send({ ok: passed, status: passed ? "linked" : "blocked", linkFound: Boolean(link) });
  });

  app.post("/internal/suppliers/test-order", async (request, reply) => {
    const body = supplierTestOrderSchema.parse(request.body);
    const result = await deps.suppliers.createOrder(body);
    await deps.repository.recordFulfillmentAttempt(result.attempt);
    await deps.repository.upsertSupplierOrder(result.supplierOrder);
    if (result.attempt.status === "held") {
      await deps.repository.recordAnalyticsEvent({
        eventId: `supplier-held:${body.shopifyOrderId}:${body.supplierProductId}`,
        source: "supplier",
        type: "webhook_failed",
        shopifyOrderId: body.shopifyOrderId,
        metadata: { supplier: body.supplier, reason: result.attempt.error, operatorAction: result.operatorAction },
        occurredAt: new Date().toISOString()
      });
    }
    const attempt = result.attempt;
    const statusCode = attempt.status === "dry_run" || attempt.status === "sent" ? 202 : 409;
    return reply.code(statusCode).send({ ok: attempt.status === "dry_run" || attempt.status === "sent", attempt, supplierOrder: result.supplierOrder, operatorAction: result.operatorAction });
  });

  app.post("/internal/suppliers/orders/poll", async (request, reply) => {
    const body = supplierOrderPollSchema.parse(request.body);
    const polled = await deps.suppliers.pollOrder(body);
    await deps.repository.upsertSupplierOrder(polled);
    await deps.repository.recordSupplierSyncAudit({
      supplier: polled.supplier,
      action: "supplier_order_polled",
      entityType: "order",
      entityId: polled.shopifyOrderId,
      status: polled.status === "failed" ? "failed" : "info",
      message: `Supplier order polled with status ${polled.status}.`,
      metadata: { providerOrderId: polled.providerOrderId, supplierProductId: polled.supplierProductId },
      occurredAt: new Date().toISOString()
    });
    return reply.code(202).send({ ok: true, supplierOrder: polled });
  });

  app.post("/internal/fulfillment/preflight", async (request, reply) => {
    const body = fulfillmentPreflightSchema.parse(request.body);
    const order = await deps.repository.getOrder(body.shopifyOrderId);
    if (!order) return reply.code(404).send({ ok: false, error: "order_not_found" });
    const link = await deps.repository.getSupplierProductLink({ supplier: body.supplier, productHandle: body.productHandle, shopifySku: body.shopifySku });
    const preflight = deps.suppliers.preflightFulfillment({ order, link, targetMarket: body.targetMarket });
    await deps.repository.recordSupplierSyncAudit({
      supplier: body.supplier,
      action: "fulfillment_preflight",
      entityType: "order",
      entityId: body.shopifyOrderId,
      status: preflight.ready ? "passed" : "blocked",
      message: preflight.ready ? "Fulfillment preflight passed; manual approval is still required." : "Fulfillment preflight blocked order approval.",
      metadata: { ...preflight, productHandle: body.productHandle, shopifySku: body.shopifySku },
      occurredAt: new Date().toISOString()
    });
    await deps.repository.recordFulfillmentLifecycleEvent({
      shopifyOrderId: body.shopifyOrderId,
      supplier: body.supplier,
      status: preflight.ready ? "pending" : "failed",
      message: preflight.ready ? "Fulfillment preflight passed and is waiting for manual approval." : "Fulfillment preflight failed.",
      metadata: preflight,
      occurredAt: new Date().toISOString()
    });
    return reply.code(preflight.ready ? 200 : 422).send({ ok: preflight.ready, preflight });
  });

  app.post("/internal/fulfillment/approve", async (request, reply) => {
    const body = fulfillmentApprovalRequestSchema.parse(request.body);
    const order = await deps.repository.getOrder(body.shopifyOrderId);
    if (!order) return reply.code(404).send({ ok: false, error: "order_not_found" });
    const link = await deps.repository.getSupplierProductLink({ supplier: body.supplier, productHandle: body.productHandle, shopifySku: body.shopifySku });
    const preflight = deps.suppliers.preflightFulfillment({ order, link, targetMarket: body.targetMarket });
    if (body.decision === "approved" && !preflight.ready) {
      return reply.code(422).send({ ok: false, status: "blocked", preflight });
    }
    const approval = await deps.repository.upsertFulfillmentApproval({
      shopifyOrderId: body.shopifyOrderId,
      supplier: body.supplier,
      supplierProductId: link?.supplierProductId ?? "unlinked",
      status: body.decision,
      reviewer: body.reviewer,
      reason: body.reason,
      preflight,
      ...(body.decision === "approved" ? { approvedAt: new Date().toISOString() } : {})
    });
    if (link) {
      await deps.repository.upsertSupplierOrder({
        shopifyOrderId: body.shopifyOrderId,
        supplier: body.supplier,
        supplierProductId: link.supplierProductId,
        quantity: 1,
        mode: "connected_store",
        status: body.decision === "approved" ? "approved" : "held",
        rawPayload: { approval, safety: "manual_approval_recorded_no_supplier_payment_attempted" }
      });
    }
    await deps.repository.recordFulfillmentLifecycleEvent({
      shopifyOrderId: body.shopifyOrderId,
      supplier: body.supplier,
      status: body.decision === "approved" ? "approved" : "failed",
      message: body.decision === "approved" ? "Manual fulfillment approval recorded. Operator may fulfill in Zendrop dashboard without enabling auto-pay." : `Fulfillment ${body.decision}.`,
      metadata: { approval, supplierAutoPayEnabled: deps.env.flags.supplierAutoPayEnabled },
      occurredAt: new Date().toISOString()
    });
    await deps.repository.recordSupplierSyncAudit({
      supplier: body.supplier,
      action: "approval_recorded",
      entityType: "approval",
      entityId: body.shopifyOrderId,
      status: body.decision === "approved" ? "passed" : "blocked",
      message: body.decision === "approved" ? "Manual approval recorded; no supplier payment was triggered by the API." : "Fulfillment approval did not proceed.",
      metadata: { decision: body.decision, reason: body.reason, reviewer: body.reviewer },
      occurredAt: new Date().toISOString()
    });
    return reply.code(body.decision === "approved" ? 202 : 200).send({ ok: true, approval, preflight, supplierAutoPayEnabled: deps.env.flags.supplierAutoPayEnabled });
  });

  app.post("/internal/fulfillment/status", async (request, reply) => {
    const body = fulfillmentLifecycleEventSchema.parse(request.body);
    await deps.repository.recordFulfillmentLifecycleEvent(body);
    return reply.code(202).send({ ok: true, status: "fulfillment_status_recorded" });
  });

  app.get("/internal/fulfillment/ops", async () => {
    return { ok: true, fulfillment: await deps.repository.getFulfillmentOpsDashboard() };
  });

  app.post("/internal/profit/snapshots", async (request) => {
    const body = profitSnapshotRequestSchema.parse(request.body);
    const snapshot = await deps.repository.upsertProfitSnapshot(body);
    return { ok: true, snapshot };
  });

  app.post("/internal/klaviyo/events", async (request, reply) => {
    const body = klaviyoEventRequestSchema.parse(request.body);
    const result = await deps.klaviyo.createEvent(body);
    await deps.repository.recordRetentionEvent({
      provider: "klaviyo",
      eventId: `${body.eventName}:${body.email}:${body.time ?? new Date().toISOString()}`,
      customerEmail: body.email,
      eventName: body.eventName,
      status: result.status,
      payload: body.properties
    });
    return reply.code(result.status === "sent" ? 202 : 200).send({ ok: true, ...result });
  });

  app.post("/internal/analytics/events", async (request, reply) => {
    const body = analyticsEventSchema.parse(request.body);
    const result = await deps.repository.recordAnalyticsEvent(body);
    return reply.code(result.duplicate ? 200 : 202).send({ ok: true, ...result });
  });

  app.get("/internal/analytics/dashboard", async () => {
    const dashboard = await deps.repository.getAnalyticsDashboard();
    return { ok: true, dashboard };
  });

  app.post("/internal/content/generate", async (request, reply) => {
    const body = creativeLibraryRequestSchema.parse(request.body);
    const library = await deps.ai.generateCreativeLibrary(body);
    const assets = creativeLibraryToAssets(body.productHandle, library);
    const stored = await deps.repository.recordGeneratedContentAssets(assets);
    return reply.code(202).send({
      ok: true,
      stored,
      counts: {
        hooks: library.hooks.length,
        shortFormConcepts: library.shortFormConcepts.length,
        adVariants: library.adVariants.length,
        ctaVariants: library.ctaVariants.length,
        headlineVariants: library.headlineVariants.length
      }
    });
  });

  app.post("/internal/content/schedule", async (request, reply) => {
    const body = z.object({ posts: z.array(contentPostSchema).min(1).max(120) }).parse(request.body);
    const stored = await deps.repository.scheduleContentPosts(body.posts);
    return reply.code(202).send({ ok: true, stored });
  });

  app.post("/internal/traffic/validate-creative", async (request) => {
    const body = creativeValidationRequestSchema.parse(request.body);
    const { requestedDailyBudgetNgn, ...validationInput } = body;
    const decision = evaluateCreativeValidation(validationInput);
    const reasons = [...decision.reasons];
    const paidTestAllowed = decision.paidTestAllowed && deps.env.flags.paidAdsEnabled;

    if (decision.paidTestAllowed && !deps.env.flags.paidAdsEnabled) {
      reasons.push("paid_ads_feature_flag_disabled");
    }

    const cappedDailyBudgetNgn = paidTestAllowed ? capColdTestSpend(requestedDailyBudgetNgn) : 0;

    if (paidTestAllowed && cappedDailyBudgetNgn < requestedDailyBudgetNgn) {
      reasons.push("cold_test_daily_budget_capped_to_5000_ngn");
    }

    return {
      ok: true,
      paidTestAllowed,
      requestedDailyBudgetNgn,
      cappedDailyBudgetNgn,
      reasons,
      budget: leanNgnBudget
    };
  });

  app.post("/internal/ads/campaigns", async (request, reply) => {
    const body = adCampaignRequestSchema.parse(request.body);
    const decision = evaluateCreativeValidation({
      organicPostsPublished: body.organicPostsPublished,
      creativesProduced: body.creativesProduced,
      bestOrganicViewCount: body.bestOrganicViewCount,
      bestOrganicClickThroughRate: body.bestOrganicClickThroughRate,
      landingPageSessions: body.landingPageSessions,
      addToCarts: body.addToCarts
    });
    const reasons = [...decision.reasons];
    if (!deps.env.flags.paidAdsEnabled) reasons.push("paid_ads_feature_flag_disabled");
    const paidTestAllowed = deps.env.flags.paidAdsEnabled && decision.paidTestAllowed;
    const cappedDailyBudgetNgn = paidTestAllowed ? capColdTestSpend(body.requestedDailyBudgetNgn) : 0;
    await deps.repository.recordAnalyticsEvent({
      eventId: `ad-campaign-request:${body.platform}:${body.productHandle}:${Date.now()}`,
      source: body.platform,
      type: "ad_spend",
      productHandle: body.productHandle,
      valueUsd: 0,
      metadata: { requestedDailyBudgetNgn: body.requestedDailyBudgetNgn, cappedDailyBudgetNgn, paidTestAllowed, reasons },
      occurredAt: new Date().toISOString()
    });
    if (!paidTestAllowed) {
      return reply.code(423).send({ ok: false, status: "blocked", cappedDailyBudgetNgn, reasons });
    }
    return reply.code(202).send({ ok: true, status: "campaign_creation_queued", cappedDailyBudgetNgn, reasons });
  });

  app.post("/internal/reconciliation/run", async () => {
    await deps.queue.enqueue("reconciliation.run", { sinceHours: 6 }, { jobId: `reconciliation:${Date.now()}` });
    return { ok: true, status: "reconciliation_queued" };
  });
}
