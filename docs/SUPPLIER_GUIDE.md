# Supplier Integration Guide

## Priority
1. Zendrop: primary fast-shipping supplier for US-first tests.
2. Spocket: fallback for US/EU products with stronger brand presentation.
3. CJ: fallback for broader sourcing and private-agent transition.
4. AutoDS: research and secondary automation only.
5. DSers: low-cost AliExpress tests only, not default scaling.

## Product Gate
- At least `55%` gross margin before ads.
- Target delivery `<= 10 business days`.
- Inventory verified.
- Tracking sync available.
- At least two offers, or one fast verified supplier offer.
- No blocked categories: ingestibles, medical claims, weapons, counterfeit goods, regulated electronics without certification, and copyrighted character products.

## Order Gate
- Payment status must be `paid`.
- Risk level must not be `high` or `blocked`.
- Auto-fulfillment must be enabled by feature flag.
- Supplier auto-pay must remain disabled until first 10 orders are manually checked.
- Use `POST /internal/suppliers/test-order` with `dryRun: true` before any live supplier purchase.
- Keep `SUPPLIER_AUTO_PAY_ENABLED=false` until dry-run attempts, tracking sync, and manual sample checks pass.

## Zendrop Operating Mode
Zendrop is treated as a Shopify-connected supplier, not a generic public order-placement API. Orders should enter Zendrop through the connected Shopify store, product linking, and Zendrop fulfillment controls. The backend records the supplier order lifecycle, blocks unsupported live API calls, and surfaces the exact operator action required when a Zendrop order needs dashboard fulfillment.

Safe statuses:
- `dry_run`: no supplier payment attempted.
- `held`: operator review required.
- `connected_store`: Shopify-connected Zendrop workflow required.
- `fulfilled`: tracking received and synced.

## Operator Endpoints
- `POST /internal/suppliers/offers`: records vetted offers for a product candidate.
- `POST /internal/suppliers/test-order`: records a fulfillment dry run or held attempt. Current live ordering remains deliberately gated; Zendrop/CJ adapters must not pay suppliers while `SUPPLIER_AUTO_PAY_ENABLED=false`.
- `POST /webhooks/supplier/tracking`: accepts signed supplier tracking callbacks, persists the received event, and queues Shopify tracking sync.
- `GET /internal/analytics/dashboard`: verifies held routing, delayed shipment count, and profit impact before scaling.

## Failure Recovery
- Out of stock: hold order, contact customer within 12 hours, offer substitute or refund.
- Supplier API failure: retry with backoff, then dead-letter.
- Tracking delay over 5 business days: send proactive customer update.
- Delivery beyond SLA: mark delayed and include in daily scorecard.
