# Database Schema

The production schema is implemented in `apps/api/prisma/schema.prisma`.

## Core Entities
- `ProductCandidate`: discovered product idea with source URL, images, niche, and target markets.
- `MarketSignal`: demand, competition, ad saturation, and trend-longevity evidence per source.
- `SupplierOffer`: supplier cost, shipping cost, delivery days, inventory verification, tracking support, and market coverage.
- `SupplierProductLink`: verified Shopify SKU to supplier SKU/product mapping, inventory state, market coverage, shipping profile, margin estimate, and verification expiry.
- `SupplierSyncAudit`: append-only supplier sync audit trail for product links, order visibility checks, preflight, approval, polling, and tracking sync.
- `ProductScore`: weighted product score and decision history.
- `ShopifyProduct`: Shopify draft/live reference and SEO metadata.
- `CreativeAsset`: hooks, scripts, shot lists, thumbnail copy, and CTA by platform.
- `AdExperiment`: spend, CTR inputs, funnel events, revenue, margin, and kill-switch inputs.
- `Order`: Shopify paid/cancelled/refunded order state.
- `OrderRoutingJob`: supplier-routing status and retry state.
- `SupplierOrder`: connected-store, manual, simulation, and dry-run supplier order lifecycle state.
- `FulfillmentAttempt`: supplier order attempt history.
- `FulfillmentApproval`: manual approval record with reviewer, decision, reason, and preflight evidence.
- `FulfillmentLifecycleEvent`: order fulfillment timeline from pending through delivery/refund/failure.
- `TrackingEvent`: carrier/tracking updates from suppliers.
- `ProfitSnapshot`: net profit and margin per order.
- `CustomerTicket`: support triage state and AI eligibility.
- `WebhookEvent`: durable idempotency store.
- `FeatureFlag`: runtime flags mirrored from environment or admin.
- `AuditLog`: actor/action/entity metadata for compliance and rollback.

## Indexes And Constraints
- `WebhookEvent(provider,eventId)` is unique for dedupe.
- `Order.shopifyOrderId` is unique.
- `ShopifyProduct.handle` and `shopifyProductId` are unique.
- `SupplierOffer(supplier,supplierProductId)` is unique.
- `SupplierProductLink(supplier,productHandle,shopifySku)` is unique.
- `FulfillmentApproval(shopifyOrderId,supplier,supplierProductId)` is unique.
- Supplier link verification status, supplier order status, approval status, and fulfillment lifecycle fields are indexed for the admin dashboard.
- Decision and provider/topic fields are indexed for dashboards and alerting.
