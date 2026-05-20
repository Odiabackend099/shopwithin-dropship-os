import type { FastifyInstance, FastifyRequest } from "fastify";
import { nanoid } from "nanoid";
import {
  assertUsdCheckoutCurrency,
  verifyGenericHexWebhook,
  verifyShopifyWebhook,
  type Order,
  type SupplierName,
  type TrackingEvent
} from "@dropship-os/core";
import type { AppEnv } from "../env.js";
import type { JobQueue } from "../lib/job-queue.js";
import type { Repository } from "../lib/repository.js";
import { webhookCounter } from "./metrics.js";

type WebhookDeps = {
  env: AppEnv;
  repository: Repository;
  queue: JobQueue;
};

export async function webhookRoutes(app: FastifyInstance, deps: WebhookDeps): Promise<void> {
  app.post("/webhooks/shopify/orders-paid", { config: { rawBody: true } }, async (request, reply) => {
    return handleShopifyOrderWebhook("orders/paid", request, reply, deps, true);
  });

  app.post("/webhooks/shopify/orders-cancelled", { config: { rawBody: true } }, async (request, reply) => {
    return handleShopifyOrderWebhook("orders/cancelled", request, reply, deps, false);
  });

  app.post("/webhooks/shopify/refunds-create", { config: { rawBody: true } }, async (request, reply) => {
    return handleShopifyOrderWebhook("refunds/create", request, reply, deps, false);
  });

  app.post("/webhooks/flutterwave", { config: { rawBody: true } }, async (request, reply) => {
    const rawBody = getRawBody(request);
    const eventId = header(request, "x-flw-transaction-id") ?? header(request, "verif-id") ?? nanoid();
    const signatureOk = header(request, "verif-hash") === deps.env.FLUTTERWAVE_SECRET_HASH;
    if (!signatureOk) {
      webhookCounter.inc({ provider: "flutterwave", topic: "payment", result: "bad_signature" });
      return reply.code(401).send({ ok: false });
    }
    const payload = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
    const stored = await deps.repository.recordWebhookEvent({
      provider: "flutterwave",
      eventId,
      topic: String(payload.event ?? "payment"),
      signatureOk,
      rawPayload: payload
    });
    if (!stored.duplicate) {
      await deps.queue.enqueue("profit.snapshot", { provider: "flutterwave", eventId, payload }, { jobId: `flutterwave:${eventId}` });
    }
    webhookCounter.inc({ provider: "flutterwave", topic: "payment", result: stored.duplicate ? "duplicate" : "accepted" });
    return reply.code(202).send({ ok: true, duplicate: stored.duplicate });
  });

  app.post("/webhooks/supplier/tracking", { config: { rawBody: true } }, async (request, reply) => {
    const rawBody = getRawBody(request);
    const eventId = header(request, "x-supplier-event-id") ?? nanoid();
    const signatureOk = verifyGenericHexWebhook(rawBody, header(request, "x-dropship-signature"), deps.env.SUPPLIER_WEBHOOK_SECRET);
    if (!signatureOk) {
      webhookCounter.inc({ provider: "supplier", topic: "tracking", result: "bad_signature" });
      return reply.code(401).send({ ok: false });
    }
    const payload = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
    const stored = await deps.repository.recordWebhookEvent({
      provider: "supplier",
      eventId,
      topic: "tracking",
      signatureOk,
      rawPayload: payload
    });
    if (!stored.duplicate) {
      const trackingEvent = parseSupplierTrackingEvent(payload);
      await deps.repository.recordTrackingEvent(trackingEvent);
      await deps.repository.recordFulfillmentLifecycleEvent({
        shopifyOrderId: trackingEvent.shopifyOrderId,
        supplier: trackingEvent.supplier,
        status: "shipped",
        message: "Supplier tracking webhook received and queued for Shopify sync.",
        metadata: { trackingNumber: trackingEvent.trackingNumber, carrier: trackingEvent.carrier, trackingUrl: trackingEvent.trackingUrl },
        occurredAt: new Date().toISOString()
      });
      await deps.queue.enqueue("tracking.sync", { eventId, payload }, { jobId: `supplier-tracking:${eventId}` });
    }
    webhookCounter.inc({ provider: "supplier", topic: "tracking", result: stored.duplicate ? "duplicate" : "accepted" });
    return reply.code(202).send({ ok: true, duplicate: stored.duplicate });
  });
}

async function handleShopifyOrderWebhook(
  topic: string,
  request: FastifyRequest,
  reply: { code: (statusCode: number) => { send: (payload: unknown) => unknown } },
  deps: WebhookDeps,
  createRoutingJob: boolean
): Promise<unknown> {
  const rawBody = getRawBody(request);
  const eventId = header(request, "x-shopify-event-id") ?? header(request, "x-shopify-webhook-id") ?? nanoid();
  const signatureOk = verifyShopifyWebhook(rawBody, header(request, "x-shopify-hmac-sha256"), deps.env.SHOPIFY_WEBHOOK_SECRET);
  if (!signatureOk) {
    webhookCounter.inc({ provider: "shopify", topic, result: "bad_signature" });
    return reply.code(401).send({ ok: false });
  }

  const payload = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
  const stored = await deps.repository.recordWebhookEvent({
    provider: "shopify",
    eventId,
    topic,
    signatureOk,
    rawPayload: payload
  });
  if (stored.duplicate) {
    webhookCounter.inc({ provider: "shopify", topic, result: "duplicate" });
    return reply.code(202).send({ ok: true, duplicate: true });
  }

  const order = parseShopifyOrder(payload);
  await deps.repository.upsertOrder(order, payload);

  if (createRoutingJob) {
    const status = deps.env.flags.autoFulfillmentEnabled && order.riskLevel !== "high" && order.riskLevel !== "blocked" ? "queued" : "held";
    const jobId = `route:${order.shopifyOrderId}`;
    await deps.repository.createRoutingJob({
      id: jobId,
      shopifyOrderId: order.shopifyOrderId,
      selectedSupplier: "zendrop",
      status
    });
    if (status === "queued") {
      await deps.queue.enqueue("order.route", { shopifyOrderId: order.shopifyOrderId, riskLevel: order.riskLevel }, { jobId });
    }
  }

  await deps.repository.markWebhookProcessed("shopify", eventId);
  webhookCounter.inc({ provider: "shopify", topic, result: "accepted" });
  return reply.code(202).send({ ok: true, duplicate: false });
}

function parseSupplierTrackingEvent(payload: Record<string, unknown>): TrackingEvent {
  const shopifyOrderId = String(payload.shopifyOrderId ?? payload.orderId ?? "");
  const trackingNumber = String(payload.trackingNumber ?? payload.tracking_number ?? "");
  if (!shopifyOrderId || !trackingNumber) {
    throw new Error("shopifyOrderId and trackingNumber are required for supplier tracking webhook");
  }

  const supplier = String(payload.supplier ?? "manual") as SupplierName;
  const trackingUrl = optionalString(payload.trackingUrl ?? payload.tracking_url);
  const carrier = optionalString(payload.carrier);
  return {
    shopifyOrderId,
    supplier,
    trackingNumber,
    ...(trackingUrl ? { trackingUrl } : {}),
    ...(carrier ? { carrier } : {}),
    status: "received",
    rawPayload: payload
  };
}

function parseShopifyOrder(payload: Record<string, unknown>): Order {
  const currency = String(payload.currency ?? "USD");
  assertUsdCheckoutCurrency(currency);
  return {
    shopifyOrderId: String(payload.id),
    orderName: String(payload.name ?? payload.order_number ?? payload.id),
    paymentStatus: "paid",
    riskLevel: String(payload.risk_level ?? "low") as Order["riskLevel"],
    currency,
    subtotalUsd: Number(payload.subtotal_price ?? 0),
    shippingUsd: parseShopMoney(payload.total_shipping_price_set) ?? Number(payload.total_shipping_price ?? 0),
    taxUsd: Number(payload.total_tax ?? 0),
    customerEmail: String(payload.email ?? "unknown@example.com"),
    createdAt: String(payload.created_at ?? new Date().toISOString())
  };
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim() ? value : undefined;
}

function parseShopMoney(value: unknown): number | undefined {
  if (!value || typeof value !== "object") return undefined;
  const shopMoney = (value as { shop_money?: { amount?: unknown } }).shop_money;
  if (!shopMoney) return undefined;
  const amount = Number(shopMoney.amount);
  return Number.isFinite(amount) ? amount : undefined;
}

function getRawBody(request: FastifyRequest): Buffer {
  const rawBody = (request as FastifyRequest & { rawBody?: Buffer }).rawBody;
  if (rawBody) return rawBody;
  const rawRequestBody = (request.raw as typeof request.raw & { rawBody?: Buffer }).rawBody;
  if (rawRequestBody) return rawRequestBody;
  return Buffer.from(JSON.stringify(request.body ?? {}));
}

function header(request: FastifyRequest, name: string): string | undefined {
  const value = request.headers[name];
  if (Array.isArray(value)) return value[0];
  return value;
}
