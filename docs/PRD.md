# Global AI Dropshipping Operating System PRD

## Product
Dropship OS is a standalone global Shopify operation for testing and scaling fast-shipping physical products toward the first `$200-$500/day` in revenue. The operator is based in Nigeria, but the target buyers are global. The first milestone under the ultra-lean launch budget is not profit; it is finding one product that earns real clicks, add-to-carts, and purchases without burning the full budget on cold ads.

## Goals
- Discover and score product opportunities daily.
- Publish only products that pass margin, supplier, delivery, risk, and creative-readiness gates.
- Keep checkout reliable with USD as the base currency and Flutterwave as the primary gateway.
- Automate order routing, tracking sync, profit logging, support triage, and daily scorecards.
- Keep launch operations lean enough for a `NGN 50,000` first validation budget.
- Force an organic-first workflow: one active product, 20-30 short-form creatives, 3-5 daily posts, then capped TikTok boosts only after validation signals appear.

## Non-Goals
- No fake reviews, fake scarcity, unsupported health claims, or payment workarounds outside Shopify checkout.
- No automatic supplier purchasing until test payments, webhook idempotency, supplier routing, and tracking sync pass staging.
- No true local-currency checkout promise unless Shopify Payments or Adyen is available.

## Success Metrics
- Product page add-to-cart rate: `>= 3%`.
- Checkout-start-to-purchase rate: `>= 25%`.
- Gross margin before ads: `>= 55%`.
- Target delivery: `<= 10 business days` for supported target markets.
- Refund rate: `< 8%`.
- Chargeback rate: `< 0.8%`.
- Daily revenue milestone: `$200-$500/day` with positive contribution margin.
- Validation milestone: one product with `>= 1.5%` best organic CTR, `>= 20` creatives produced, `>= 15` organic posts published, and add-to-cart activity before paid testing.
- Cold paid test cap: `NGN 3,000-NGN 5,000/day`, never the full budget.

## Launch Stack
- Shopify storefront with USD base currency.
- Flutterwave Shopify gateway in test mode before launch, live mode only after test order success.
- PayPal is optional and not required for the Flutterwave-first launch.
- Zendrop primary supplier, Spocket and CJ fallback, AutoDS/DSers for research or low-cost tests.
- Klaviyo for cart and post-purchase email, AfterSell for post-purchase and thank-you offers, Judge.me for verified reviews, Shopify Inbox first for support.
- Railway for API, worker, Postgres, Redis, and n8n; Vercel for the admin dashboard.

## Ultra-Lean Budget Mode
- `NGN 10,000`: domain and basic tools.
- `NGN 10,000`: AI creative generation, video editing, voiceover, and asset preparation.
- `NGN 20,000`: TikTok micro-tests after organic validation.
- `NGN 10,000`: retargeting, failed-payment recovery, backup app/tool costs, or supplier issue buffer.
- Meta cold prospecting is disabled for this launch mode unless organic validation is already strong; random broad Meta ads are treated as a budget-risk event.
