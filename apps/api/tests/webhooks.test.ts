import { describe, expect, it } from "vitest";
import { hmacSha256Base64, hmacSha256Hex } from "@dropship-os/core";
import { buildApp } from "../src/app.js";
import { loadEnv } from "../src/env.js";
import { InMemoryJobQueue } from "../src/lib/job-queue.js";
import { InMemoryRepository } from "../src/lib/repository.js";

describe("webhook routes", () => {
  it("accepts signed Shopify order webhook and dedupes repeated delivery", async () => {
    const env = loadEnv({
      NODE_ENV: "test",
      SHOPIFY_WEBHOOK_SECRET: "shopify_secret",
      FLUTTERWAVE_SECRET_HASH: "fw_hash",
      SUPPLIER_WEBHOOK_SECRET: "supplier_secret",
      AUTO_FULFILLMENT_ENABLED: "false"
    });
    const repository = new InMemoryRepository();
    const queue = new InMemoryJobQueue();
    const app = await buildApp({ env, repository, queue });

    const payload = {
      id: "1001",
      name: "#1001",
      currency: "USD",
      subtotal_price: "79.00",
      total_tax: "0.00",
      email: "buyer@example.com",
      risk_level: "low",
      created_at: "2026-05-17T12:00:00Z"
    };
    const body = JSON.stringify(payload);
    const signature = hmacSha256Base64(Buffer.from(body), "shopify_secret");

    const first = await app.inject({
      method: "POST",
      url: "/webhooks/shopify/orders-paid",
      headers: {
        "content-type": "application/json",
        "x-shopify-hmac-sha256": signature,
        "x-shopify-event-id": "evt-1"
      },
      payload: body
    });
    const second = await app.inject({
      method: "POST",
      url: "/webhooks/shopify/orders-paid",
      headers: {
        "content-type": "application/json",
        "x-shopify-hmac-sha256": signature,
        "x-shopify-event-id": "evt-1"
      },
      payload: body
    });

    expect(first.statusCode).toBe(202);
    expect(second.json()).toMatchObject({ duplicate: true });
    expect(repository.orders.get("1001")?.currency).toBe("USD");
    expect(repository.jobs.get("route:1001")?.status).toBe("held");
    expect(queue.jobs.some((job) => job.name === "order.route")).toBe(false);
    await app.close();
  });

  it("queues supplier routing only when auto fulfillment is enabled", async () => {
    const env = loadEnv({
      NODE_ENV: "test",
      SHOPIFY_WEBHOOK_SECRET: "shopify_secret",
      FLUTTERWAVE_SECRET_HASH: "fw_hash",
      SUPPLIER_WEBHOOK_SECRET: "supplier_secret",
      AUTO_FULFILLMENT_ENABLED: "true"
    });
    const repository = new InMemoryRepository();
    const queue = new InMemoryJobQueue();
    const app = await buildApp({ env, repository, queue });

    const body = JSON.stringify({
      id: "1003",
      name: "#1003",
      currency: "USD",
      subtotal_price: "79.00",
      total_tax: "0.00",
      email: "buyer@example.com",
      risk_level: "low",
      created_at: "2026-05-17T12:00:00Z"
    });
    const signature = hmacSha256Base64(Buffer.from(body), "shopify_secret");

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/shopify/orders-paid",
      headers: {
        "content-type": "application/json",
        "x-shopify-hmac-sha256": signature,
        "x-shopify-event-id": "evt-3"
      },
      payload: body
    });

    expect(response.statusCode).toBe(202);
    expect(repository.jobs.get("route:1003")?.status).toBe("queued");
    expect(queue.jobs.some((job) => job.name === "order.route")).toBe(true);
    await app.close();
  });

  it("verifies Shopify HMAC against exact raw bytes, not reserialized JSON", async () => {
    const env = loadEnv({
      NODE_ENV: "test",
      SHOPIFY_WEBHOOK_SECRET: "shopify_secret",
      FLUTTERWAVE_SECRET_HASH: "fw_hash",
      SUPPLIER_WEBHOOK_SECRET: "supplier_secret",
      AUTO_FULFILLMENT_ENABLED: "false"
    });
    const app = await buildApp({ env, repository: new InMemoryRepository(), queue: new InMemoryJobQueue() });
    const body =
      "{\"id\":1004,\"name\":\"#1004\",\"currency\":\"USD\",\"admin_graphql_api_id\":\"gid:\\/\\/shopify\\/Order\\/1004\",\"subtotal_price\":\"24.95\",\"total_tax\":\"0.00\",\"email\":\"buyer@example.com\"}";
    const signature = hmacSha256Base64(Buffer.from(body), "shopify_secret");

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/shopify/orders-paid",
      headers: {
        "content-type": "application/json",
        "x-shopify-hmac-sha256": signature,
        "x-shopify-event-id": "evt-4"
      },
      payload: body
    });

    expect(response.statusCode).toBe(202);
    await app.close();
  });

  it("rejects unsigned Shopify webhook", async () => {
    const app = await buildApp({
      env: loadEnv({ NODE_ENV: "test", SHOPIFY_WEBHOOK_SECRET: "secret", FLUTTERWAVE_SECRET_HASH: "fw", SUPPLIER_WEBHOOK_SECRET: "sup" }),
      repository: new InMemoryRepository(),
      queue: new InMemoryJobQueue()
    });

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/shopify/orders-paid",
      headers: { "content-type": "application/json", "x-shopify-hmac-sha256": "bad" },
      payload: JSON.stringify({ id: "1002", currency: "USD" })
    });

    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("accepts supplier tracking only with valid HMAC", async () => {
    const env = loadEnv({ NODE_ENV: "test", SHOPIFY_WEBHOOK_SECRET: "shop", FLUTTERWAVE_SECRET_HASH: "fw", SUPPLIER_WEBHOOK_SECRET: "sup" });
    const repository = new InMemoryRepository();
    const queue = new InMemoryJobQueue();
    const app = await buildApp({ env, repository, queue });
    const body = JSON.stringify({ shopifyOrderId: "1001", supplier: "zendrop", trackingNumber: "1Z999", carrier: "UPS" });
    const signature = hmacSha256Hex(Buffer.from(body), "sup");

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/supplier/tracking",
      headers: {
        "content-type": "application/json",
        "x-supplier-event-id": "track-1",
        "x-dropship-signature": signature
      },
      payload: body
    });

    expect(response.statusCode).toBe(202);
    expect(queue.jobs[0]?.name).toBe("tracking.sync");
    expect(repository.trackingEvents[0]).toMatchObject({
      shopifyOrderId: "1001",
      supplier: "zendrop",
      trackingNumber: "1Z999",
      status: "received"
    });
    await app.close();
  });
});
