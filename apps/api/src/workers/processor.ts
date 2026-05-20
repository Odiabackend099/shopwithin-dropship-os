import { Worker } from "bullmq";
import { Redis } from "ioredis";
import {
  calculateProfitSnapshot,
  nextRetryDecision,
  type ProfitSnapshot,
  type SupplierOffer,
  type SupplierName,
  type TargetMarket
} from "@dropship-os/core";
import { loadEnv } from "../env.js";
import { PrismaRepository, type Repository } from "../lib/repository.js";
import { ShopifyClient } from "../services/shopify.js";
import { routeSupplierOffer } from "../services/suppliers.js";

type RouteOrderPayload = {
  shopifyOrderId: string;
  market?: TargetMarket;
  offers?: SupplierOffer[];
  riskLevel?: string;
};

type TrackingPayload = {
  eventId?: string;
  payload: {
    fulfillmentOrderId?: string;
    shopifyOrderId?: string;
    orderId?: string;
    supplier?: string;
    trackingNumber?: string;
    tracking_number?: string;
    trackingUrl?: string;
    tracking_url?: string;
    carrier?: string;
  };
};

type ProfitPayload = {
  snapshot?: Omit<ProfitSnapshot, "netProfitUsd" | "marginPercent">;
};

export async function processRouteOrder(payload: RouteOrderPayload, repository: Repository): Promise<{ status: string; reason?: string }> {
  if (payload.riskLevel === "high" || payload.riskLevel === "blocked") {
    return { status: "held", reason: "high_risk_order_requires_manual_review" };
  }
  const market = payload.market ?? "US";
  const routing = routeSupplierOffer(payload.offers ?? [], market);
  if (routing.status === "held") {
    await repository.updateRoutingJob(`route:${payload.shopifyOrderId}`, "held", routing.reason);
    return { status: "held", reason: routing.reason };
  }
  await repository.updateRoutingJob(`route:${payload.shopifyOrderId}`, "sent");
  return { status: "sent" };
}

export async function processTrackingSync(payload: TrackingPayload, shopify: ShopifyClient, repository?: Repository): Promise<{ status: string; fulfillmentOrderId?: string }> {
  const tracking = payload.payload;
  const trackingNumber = tracking.trackingNumber ?? tracking.tracking_number;
  const trackingUrl = tracking.trackingUrl ?? tracking.tracking_url;
  const shopifyOrderId = tracking.shopifyOrderId ?? tracking.orderId;
  if (!trackingNumber) {
    throw new Error("trackingNumber is required for tracking sync");
  }
  if (tracking.fulfillmentOrderId) {
    await shopify.syncTracking({
      fulfillmentOrderId: tracking.fulfillmentOrderId,
      trackingNumber,
      notifyCustomer: true,
      ...(trackingUrl ? { trackingUrl } : {}),
      ...(tracking.carrier ? { carrier: tracking.carrier } : {})
    });
    return { status: "synced", fulfillmentOrderId: tracking.fulfillmentOrderId };
  }
  if (!shopifyOrderId) {
    throw new Error("shopifyOrderId or fulfillmentOrderId is required for tracking sync");
  }
  const result = await shopify.syncTrackingForOrder({
    shopifyOrderId,
    trackingNumber,
    notifyCustomer: true,
    ...(trackingUrl ? { trackingUrl } : {}),
    ...(tracking.carrier ? { carrier: tracking.carrier } : {})
  });
  if (repository) {
    await repository.recordTrackingEvent({
      shopifyOrderId,
      supplier: (tracking.supplier ?? "manual") as SupplierName,
      trackingNumber,
      ...(trackingUrl ? { trackingUrl } : {}),
      ...(tracking.carrier ? { carrier: tracking.carrier } : {}),
      status: result.status === "synced" ? "synced" : "received",
      rawPayload: { ...tracking, fulfillmentOrderId: result.fulfillmentOrderId, syncStatus: result.status }
    });
    await repository.recordFulfillmentLifecycleEvent({
      shopifyOrderId,
      supplier: (tracking.supplier ?? "manual") as SupplierName,
      status: "shipped",
      message: result.status === "synced" ? "Tracking number synced to Shopify and customer notification requested." : "Tracking sync dry-run recorded; Shopify live writes are disabled.",
      metadata: { trackingNumber, fulfillmentOrderId: result.fulfillmentOrderId, syncStatus: result.status },
      occurredAt: new Date().toISOString()
    });
  }
  return { status: result.status, fulfillmentOrderId: result.fulfillmentOrderId };
}

export function processProfitSnapshot(payload: ProfitPayload): ProfitSnapshot {
  if (!payload.snapshot) {
    throw new Error("snapshot is required");
  }
  return calculateProfitSnapshot(payload.snapshot);
}

export async function startWorker(): Promise<Worker> {
  const env = loadEnv();
  if (!env.REDIS_URL) throw new Error("REDIS_URL is required to start workers");

  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  const repository = new PrismaRepository();
  const shopify = new ShopifyClient(env);

  return new Worker(
    "dropship-os",
    async (job) => {
      try {
        if (job.name === "order.route") return processRouteOrder(job.data as RouteOrderPayload, repository);
        if (job.name === "tracking.sync") return processTrackingSync(job.data as TrackingPayload, shopify, repository);
        if (job.name === "profit.snapshot") return processProfitSnapshot(job.data as ProfitPayload);
        if (job.name === "reconciliation.run") return { status: "queued_reconciliation_window", sinceHours: job.data.sinceHours ?? 6 };
        if (job.name === "product.publish") return { status: "manual_publish_review_required" };
        if (job.name === "product.score") return { status: "score_job_acknowledged" };
        throw new Error(`Unsupported job name ${job.name}`);
      } catch (error) {
        const decision = nextRetryDecision(job.attemptsMade, 5);
        if (decision.deadLetter) {
          await repository.updateRoutingJob(job.id ?? "unknown", "dead_letter", error instanceof Error ? error.message : "unknown error");
        }
        throw error;
      }
    },
    { connection, concurrency: 5 }
  );
}
