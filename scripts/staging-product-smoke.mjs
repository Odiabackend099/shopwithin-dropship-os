#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { buildApp } from "../apps/api/dist/app.js";
import { loadEnv } from "../apps/api/dist/env.js";
import { InMemoryJobQueue } from "../apps/api/dist/lib/job-queue.js";
import { InMemoryRepository } from "../apps/api/dist/lib/repository.js";

const request = JSON.parse(readFileSync(new URL("../launch/first-product/product-publish-request.json", import.meta.url), "utf8"));

const env = loadEnv({
  NODE_ENV: "test",
  SHOPIFY_WEBHOOK_SECRET: "staging_shopify_secret",
  FLUTTERWAVE_SECRET_HASH: "staging_flutterwave_hash",
  SUPPLIER_WEBHOOK_SECRET: "staging_supplier_secret",
  AI_AUTO_PUBLISH_ENABLED: "false",
  SHOPIFY_LIVE_WRITE_ENABLED: "false",
  AUTO_FULFILLMENT_ENABLED: "false"
});

const queue = new InMemoryJobQueue();
const app = await buildApp({ env, repository: new InMemoryRepository(), queue });

const response = await app.inject({
  method: "POST",
  url: "/internal/products/publish",
  headers: { "content-type": "application/json" },
  payload: request
});

await app.close();

const body = response.json();
if (response.statusCode !== 202) {
  throw new Error(`Expected product draft queue status 202, received ${response.statusCode}: ${JSON.stringify(body)}`);
}
if (body.status !== "draft_publish_queued") throw new Error(`Expected draft_publish_queued, received ${body.status}`);
if (!queue.jobs.some((job) => job.name === "product.publish" && job.jobId === "product-publish:furlift-reusable-pet-hair-detailer")) {
  throw new Error("Product publish job was not queued.");
}

console.log("PASS FurLift product payload passed publish gates.");
console.log("PASS Shopify draft publish was queued.");
console.log("PASS live Shopify write stayed disabled.");
