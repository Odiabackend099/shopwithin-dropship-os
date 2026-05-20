# TikTok Ads Setup SOP

## Objective

Prepare TikTok Business Center, Ads Manager, TikTok Pixel, and low-budget Spark Ad testing for FurLift without launching spend.

## Account Setup

1. Go to TikTok Business Center.
2. Create or confirm the business portfolio for `shopwithin`.
3. Set account currency to `USD` if TikTok allows selection during ad account creation.
4. Set timezone deliberately before creating campaigns. Use the timezone the operator will report from consistently.
5. Create one Ads Manager account for `shopwithin`.
6. Add the operator as Admin. Avoid sharing the account password.
7. Add payment method only when the operator is ready. Do not launch campaigns while adding payment.

## Pixel Setup

Preferred path:

1. Shopify Admin -> Sales channels/apps -> install or open `TikTok`.
2. Connect the TikTok Business Center and Ads Manager account.
3. Create/select the TikTok Pixel for `shopwithin`.
4. Confirm store currency and product catalog data show USD.
5. Verify the pixel events in TikTok Events Manager.

Fallback path:

- Use `pixels/shopify-custom-pixel-tiktok.js` as a Shopify Custom Pixel only if the official app/channel path cannot be used.
- Do not install both the official TikTok app pixel and the fallback custom pixel at the same time. Duplicate events will damage reporting.

## Required Events

- `ViewContent`: product page view.
- `AddToCart`: cart add.
- `InitiateCheckout`: checkout start.
- `CompletePayment`: paid checkout.

## Event Parameters

Use these values where available:

- `content_id`: `VLOY30HZN` or Shopify variant ID `52404939948313`.
- `content_type`: `product`.
- `content_name`: `FurLift Reusable Pet Hair Detailer`.
- `value`: numeric cart/order value.
- `currency`: `USD`.

## Campaign Safety

- Do not publish campaigns during setup.
- Do not enable automatic rules that increase budgets.
- Do not use Smart Performance Campaigns until the pixel has real event data.
- Do not optimize for `CompletePayment` until the pixel can see checkout events reliably.
- Initial paid test should use the winning organic post as Spark creative.

## First Paid Test Structure

- Objective: Website conversions.
- Optimization event: `AddToCart` first if purchase data is zero; move to `CompletePayment` only after real purchases.
- Placement: TikTok only.
- Countries: start with one primary market, usually US, then test CA/UK/AU later.
- Budget: $2-$4/day equivalent, respecting the NGN 3,000-NGN 5,000/day guardrail.
- Creatives: 2 variants max at the same time.
- Landing page: FurLift product page with UTM parameters.

## Official References

- TikTok supported Shopify events: `https://ads.tiktok.com/help/article/supported-events-shopify`
- TikTok Shopify pixel setup: `https://ads.us.tiktok.com/help/article/tiktok-pixel-shopify`

