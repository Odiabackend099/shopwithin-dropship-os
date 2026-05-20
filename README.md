# Dropship OS

Production-oriented AI-assisted Shopify dropshipping operating system for a Nigeria-based operator selling globally with USD checkout, Flutterwave primary payments, and a strict `NGN 50,000` validation budget.

## What Is Included
- Fastify API for Shopify, Flutterwave, and supplier webhooks.
- Next.js admin dashboard for validation, traffic gates, order/ops status, and lean budget control.
- Shared TypeScript core package for scoring, profitability, supplier routing, HMAC checks, retry policy, ad kill-switches, and NGN budget gating.
- Zendrop connected-store fulfillment readiness: product-link verification, order visibility checks, preflight gates, manual approval, supplier audits, lifecycle events, and tracking sync.
- Prisma schema and migration for the operating data model.
- n8n workflow exports for product discovery, supplier vetting, product-page generation, order routing, tracking sync, profitability, support triage, creatives, scorecards, and reconciliation.
- Shopify Online Store 2.0 product-page theme assets.
- Docker, Railway, Vercel, GitHub Actions, environment templates, monitoring, rollback, and SOP documentation.

## Lean Launch Rule
The first goal is not profit. The first goal is finding one product that people click and buy.

The built-in launch budget is:
- `NGN 10,000` domain and basic tools.
- `NGN 10,000` AI creative generation.
- `NGN 20,000` TikTok micro-tests after organic validation.
- `NGN 10,000` retargeting, backups, or operating buffer.

Paid cold testing is blocked until the product has enough organic content and signal. Approved cold tests are capped at `NGN 5,000/day`.

## Local Setup
```bash
pnpm install
cp .env.example .env
docker compose up -d postgres redis
pnpm run db:migrate
pnpm --filter @dropship-os/api dev
pnpm --filter @dropship-os/admin dev
```

Default local URLs:
- API: `http://localhost:4000`
- Admin: `http://localhost:3000`

## Verification
```bash
pnpm typecheck
pnpm test
pnpm build
pnpm run ci
pnpm run launch:check
pnpm run staging:product-smoke
pnpm run staging:order-smoke
```

## Important Safety Defaults
- `AUTO_FULFILLMENT_ENABLED=false`
- `PAID_ADS_ENABLED=false`
- `AI_AUTO_PUBLISH_ENABLED=false`
- `SHOPIFY_LIVE_WRITE_ENABLED=false`
- `SUPPLIER_AUTO_PAY_ENABLED=false`

Do not enable live supplier ordering until test payments, idempotent webhooks, supplier routing, and tracking sync pass staging.

## Fulfillment Rule
Zendrop is operated through its supported Shopify-connected workflow. The OS records and verifies the Zendrop product link, order visibility, approval, and tracking lifecycle, but it does not invent an unsupported Zendrop order-placement API or silently spend supplier money.
