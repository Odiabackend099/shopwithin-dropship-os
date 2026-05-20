# API Contracts

Base URL: `API_PUBLIC_URL`.

## Public Health
- `GET /healthz`: returns service status and timestamp.
- `GET /metrics`: Prometheus metrics.

## Webhooks
- `POST /webhooks/shopify/orders-paid`
  - Required headers: `x-shopify-hmac-sha256`, `x-shopify-event-id` or `x-shopify-webhook-id`.
  - Behavior: verify HMAC, enforce USD currency, persist order, create held/queued routing job, enqueue `order.route`.
- `POST /webhooks/shopify/orders-cancelled`
  - Same signature rules, persists cancellation event for reconciliation and support.
- `POST /webhooks/shopify/refunds-create`
  - Same signature rules, queues profit adjustment.
- `POST /webhooks/flutterwave`
  - Required header: `verif-hash` matching `FLUTTERWAVE_SECRET_HASH`.
  - Behavior: dedupe and enqueue `profit.snapshot`.
- `POST /webhooks/supplier/tracking`
  - Required headers: `x-supplier-event-id`, `x-dropship-signature`.
  - Behavior: verify supplier HMAC, persist received tracking metadata, and enqueue `tracking.sync`.

## Internal Operations
- `POST /internal/products/score`
  - Body: scoring inputs from `packages/core/src/schemas.ts`.
  - Returns weighted total, decision, and reasons.
- `POST /internal/products/publish`
  - Body: Shopify product draft, score input, and supplier offers.
  - Returns `422` with blockers or queues/creates a Shopify draft.
- `POST /internal/orders/retry`
  - Body: `{ "shopifyOrderId": "1001" }`.
  - Queues supplier routing retry.
- `POST /internal/suppliers/offers`
  - Body: `{ "candidateExternalId": "manual-furlift-2026-05-17", "offer": { ...supplierOffer } }`.
  - Records or updates a vetted supplier offer without triggering an order.
- `POST /internal/suppliers/test-order`
  - Body: `{ "shopifyOrderId": "6973205250298", "supplier": "zendrop", "supplierProductId": "sandbox-furlift-1", "quantity": 1, "shipToCountry": "US", "dryRun": true }`.
  - Creates a dry-run fulfillment attempt while `SUPPLIER_AUTO_PAY_ENABLED=false`.
  - If `dryRun=false` and Zendrop live ordering is requested, the adapter records a held connected-store supplier order instead of calling an undocumented payment endpoint.
- `POST /internal/suppliers/product-links`
  - Body: verified Shopify SKU, Zendrop product URL, supplier SKU, cost, shipping window, inventory, market coverage, and tracking support.
  - Returns `202` when the link passes verification and `422` when SKU, inventory, delivery, tracking, or Zendrop URL checks fail.
- `GET /internal/suppliers/product-links`
  - Query: optional `productHandle`.
  - Returns persisted supplier product links and verification state.
- `POST /internal/suppliers/order-visibility`
  - Body: Shopify order ID, product handle, Shopify SKU, supplier product ID, and Zendrop dashboard visibility checks.
  - Records whether the Shopify order is visible in Zendrop, linked to the correct product, and eligible for fulfillment.
- `POST /internal/suppliers/orders/poll`
  - Body: current supplier order state.
  - Records supplier polling state and audit trail without paying the supplier.
- `POST /internal/fulfillment/preflight`
  - Body: Shopify order ID, product handle, Shopify SKU, supplier, and target market.
  - Verifies paid status, risk level, product link, inventory, market shipping support, tracking support, and link freshness.
- `POST /internal/fulfillment/approve`
  - Body: preflight identifiers plus reviewer, decision, and reason.
  - Records manual approval only. It never triggers supplier payment or live fulfillment.
- `POST /internal/fulfillment/status`
  - Body: fulfillment lifecycle event.
  - Records `pending`, `linked`, `approved`, `processing`, `fulfilled`, `shipped`, `delivered`, `failed`, or `refunded`.
- `GET /internal/fulfillment/ops`
  - Returns supplier product links, supplier orders, approvals, lifecycle events, audits, tracking events, and dashboard summary counts.
- `POST /internal/profit/snapshots`
  - Body: `{ "orderId": "#1001", "revenueUsd": 24.95, "paymentFeesUsd": 1.2, "productCostUsd": 4.8, "shippingCostUsd": 3.2, "adSpendUsd": 0, "refundCostUsd": 0 }`.
  - Stores calculated net profit and margin. `orderId` can be a Shopify order ID or order name.
- `POST /internal/klaviyo/events`
  - Body: `{ "email": "buyer@example.com", "eventName": "Fulfillment Held", "properties": { "orderName": "#1001" } }`.
  - Sends Klaviyo event when `KLAVIYO_PRIVATE_API_KEY` is configured, records a retention event, and otherwise returns dry-run status.
- `POST /internal/analytics/events`
  - Body: `{ "eventId": "organic-page-1", "source": "organic", "type": "page_view", "productHandle": "furlift-reusable-pet-hair-detailer", "metadata": {}, "occurredAt": "2026-05-17T00:00:00.000Z" }`.
  - Idempotently records conversion, ad-spend, supplier, payment, and webhook events.
- `GET /internal/analytics/dashboard`
  - Returns revenue, net profit, AOV, order count, held/failed route counts, refund cost, delayed shipment count, CAC, ROAS, add-to-cart rate, checkout conversion rate, abandoned cart rate, supplier latency, webhook failures, and payment failures.
- `POST /internal/content/generate`
  - Body: product handle, title, positioning, price, audiences, and proof points.
  - Generates and stores `100` hooks, `50` short-form concepts, `30` ad variants, `30` CTAs, and `20` landing-page headlines.
- `POST /internal/content/schedule`
  - Body: `{ "posts": [ ...contentPost ] }`.
  - Stores queued/scheduled organic posts for TikTok, Instagram Reels, YouTube Shorts, and Pinterest.
- `POST /internal/traffic/validate-creative`
  - Body: `{ "organicPostsPublished": 18, "creativesProduced": 24, "bestOrganicViewCount": 2400, "bestOrganicClickThroughRate": 1.8, "landingPageSessions": 88, "addToCarts": 5, "requestedDailyBudgetNgn": 9000 }`.
  - Returns `paidTestAllowed`, `reasons`, the requested budget, and the approved daily budget capped at `NGN 5,000`.
  - Returns `cappedDailyBudgetNgn: 0` when the organic-first gate fails.
  - Also returns `cappedDailyBudgetNgn: 0` while `PAID_ADS_ENABLED=false`, even if the creative gate passes.
- `POST /internal/reconciliation/run`
  - Queues reconciliation for the last 6 hours.
- `POST /internal/ads/campaigns`
  - Body: platform, product handle, requested budget, and validation metrics.
  - Returns `423` and records a zero-spend guard event while `PAID_ADS_ENABLED=false`.

## Error Handling
- Signature failures return `401`.
- Product gating failures return `422`.
- Validation failures return `422`.
- Unexpected errors return `500` and are sent to Sentry when `SENTRY_DSN` is configured.
