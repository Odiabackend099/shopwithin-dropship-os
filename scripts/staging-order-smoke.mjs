#!/usr/bin/env node
import { hmacSha256Base64 } from "../packages/core/dist/hmac.js";
import { buildApp } from "../apps/api/dist/app.js";
import { loadEnv } from "../apps/api/dist/env.js";
import { InMemoryJobQueue } from "../apps/api/dist/lib/job-queue.js";
import { InMemoryRepository } from "../apps/api/dist/lib/repository.js";

const env = loadEnv({
  NODE_ENV: "test",
  SHOPIFY_WEBHOOK_SECRET: "staging_shopify_secret",
  FLUTTERWAVE_SECRET_HASH: "staging_flutterwave_hash",
  SUPPLIER_WEBHOOK_SECRET: "staging_supplier_secret",
  AUTO_FULFILLMENT_ENABLED: "false",
  PAID_ADS_ENABLED: "false",
  SHOPIFY_LIVE_WRITE_ENABLED: "false",
  SUPPLIER_AUTO_PAY_ENABLED: "false"
});

const repository = new InMemoryRepository();
const queue = new InMemoryJobQueue();
const app = await buildApp({ env, repository, queue });

const payload = {
  id: "staging-1001",
  name: "#STAGING-1001",
  currency: "USD",
  subtotal_price: "24.95",
  total_tax: "0.00",
  email: "staging-buyer@example.com",
  risk_level: "low",
  created_at: new Date().toISOString()
};

const body = JSON.stringify(payload);
const signature = hmacSha256Base64(Buffer.from(body), env.SHOPIFY_WEBHOOK_SECRET);
const eventId = "staging-orders-paid-1001";

const first = await app.inject({
  method: "POST",
  url: "/webhooks/shopify/orders-paid",
  headers: {
    "content-type": "application/json",
    "x-shopify-hmac-sha256": signature,
    "x-shopify-event-id": eventId
  },
  payload: body
});

const duplicate = await app.inject({
  method: "POST",
  url: "/webhooks/shopify/orders-paid",
  headers: {
    "content-type": "application/json",
    "x-shopify-hmac-sha256": signature,
    "x-shopify-event-id": eventId
  },
  payload: body
});

const routingJob = repository.jobs.get("route:staging-1001");
const order = repository.orders.get("staging-1001");
const queuedRoute = queue.jobs.find((job) => job.name === "order.route");

await app.close();

if (first.statusCode !== 202) throw new Error(`Expected first webhook 202, received ${first.statusCode}`);
if (duplicate.statusCode !== 202 || duplicate.json().duplicate !== true) throw new Error("Duplicate webhook was not idempotent.");
if (!order) throw new Error("Order was not persisted.");
if (order.currency !== "USD") throw new Error(`Expected USD order currency, received ${order.currency}`);
if (!routingJob) throw new Error("Routing job was not created.");
if (routingJob.status !== "held") throw new Error(`Expected routing job to be held, received ${routingJob.status}`);
if (queuedRoute) throw new Error("Held order should not be queued for supplier routing while auto-fulfillment is disabled.");

console.log("PASS staging orders/paid webhook accepted.");
console.log("PASS duplicate delivery is idempotent.");
console.log("PASS order currency is USD.");
console.log("PASS routing job status is held because AUTO_FULFILLMENT_ENABLED=false.");
console.log("PASS supplier auto-send is blocked and no route job was queued.");
