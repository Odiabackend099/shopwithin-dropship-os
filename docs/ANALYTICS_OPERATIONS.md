# Analytics Operations

## Event Model
All measurable behavior is recorded through `AnalyticsEvent`:
- `page_view`
- `add_to_cart`
- `checkout_started`
- `purchase`
- `refund`
- `ad_spend`
- `payment_failed`
- `webhook_failed`
- `supplier_submitted`
- `supplier_fulfilled`
- `content_published`

`eventId` is unique. Replays return duplicate instead of double-counting.

## Dashboard Metrics
`GET /internal/analytics/dashboard` returns:
- Revenue, net profit, AOV, refund cost.
- Ad spend, CAC, ROAS.
- Add-to-cart rate, checkout conversion rate, abandoned cart rate.
- Held and failed routing jobs.
- Delayed shipment count.
- Supplier latency.
- Webhook and payment failure counts.

## Profit Snapshots
Use `POST /internal/profit/snapshots` after a paid order, refund, or cost update. The endpoint accepts either Shopify order ID or order name and resolves it to the persisted order row.

## Alert Thresholds
- Net profit negative for two consecutive days.
- Add-to-cart below `3%` after `100` sessions.
- Checkout starts `>= 3` with zero purchases.
- Refund rate above `8%`.
- Chargeback rate above `0.8%`.
- Delayed shipments above `3`.
- Any dead-letter routing job.

## Paid Spend Safety
`POST /internal/ads/campaigns` records a zero-spend guard event while `PAID_ADS_ENABLED=false`. No campaign creation request is sent to Meta or TikTok unless the feature flag and creative validation gate both pass.
