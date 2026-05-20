# Architecture

## Components
- `packages/core`: shared scoring, schemas, HMAC verification, feature flags, retries, profit math, supplier routing, and ad kill-switch rules.
- `apps/api`: Fastify API for webhooks, internal operations, metrics, Shopify writes, and job enqueueing.
- `apps/admin`: Next.js internal dashboard for product pipeline, revenue, risk, and traffic controls.
- `apps/api/prisma`: database schema for candidates, suppliers, products, orders, jobs, events, profit, and audit logs.
- `n8n/workflows`: credential-free workflow exports that call API endpoints and apply batching/retry patterns.
- `infra/shopify-theme`: lean Shopify Online Store 2.0 product-page layer.

## Data Flow
1. Discovery sources feed candidates into n8n.
2. n8n calls `/internal/products/score`.
3. Publish-ready products are queued through `/internal/products/publish`.
4. Shopify order webhooks hit `/webhooks/shopify/orders-paid`.
5. API verifies HMAC, dedupes event IDs, stores payload, and queues routing.
6. Worker selects a fast verified supplier and creates a held or sent routing state.
7. Supplier tracking callbacks hit `/webhooks/supplier/tracking`.
8. API queues Shopify tracking sync and profit snapshots.
9. Admin dashboard displays product readiness, metrics, and operational risk.

## Reliability Decisions
- Webhooks are persisted before work is enqueued.
- Duplicate deliveries are ignored by provider/event ID.
- Queue jobs use exponential backoff and dead-letter state after repeated failure.
- Shopify writes are gated by `SHOPIFY_LIVE_WRITE_ENABLED`.
- Supplier purchasing is gated by `AUTO_FULFILLMENT_ENABLED` and `SUPPLIER_AUTO_PAY_ENABLED`.
- Reconciliation runs every 6 hours to recover missed webhooks.

## Security Decisions
- Shopify webhooks use raw-body HMAC SHA-256 base64 verification.
- Supplier webhooks use raw-body HMAC SHA-256 hex verification.
- Flutterwave callbacks require `verif-hash`.
- Secrets live in environment variables only.
- Workflow exports contain no credentials.
- High-risk orders are held for manual review.
