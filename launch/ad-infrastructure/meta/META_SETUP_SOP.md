# Meta Ads Setup SOP

## Objective

Prepare Meta Business Manager, Facebook Page, Instagram business connection, Meta Pixel/Dataset, and low-budget Reels/retargeting structure for FurLift without launching spend.

## Account Setup

1. Go to Meta Business Suite or Business Manager.
2. Create or confirm the business portfolio for `shopwithin`.
3. Create or connect a Facebook Page for `shopwithin`.
4. Connect the Instagram business account.
5. Create or confirm one ad account for `shopwithin`.
6. Set ad account currency to `USD` if Meta allows it during creation.
7. Set timezone once and keep it stable.
8. Add the operator as Admin.
9. Add billing/payment method only when the operator is ready. Do not publish ads while doing this.

## Pixel Setup

Preferred path:

1. Shopify Admin -> Sales channels/apps -> install or open `Facebook & Instagram`.
2. Connect the Meta Business Manager, Page, Instagram account, and ad account.
3. Select or create the Meta Pixel/Dataset for `shopwithin`.
4. Use the highest data-sharing setting Shopify allows for the store.
5. Verify events in Meta Events Manager Test Events.

Fallback path:

- Use `pixels/shopify-custom-pixel-meta.js` as a Shopify Custom Pixel only if the official Facebook & Instagram channel cannot be used.
- Do not install both the official channel pixel and the fallback custom pixel at the same time.

## Required Events

- `PageView`: every page view.
- `ViewContent`: product page view.
- `AddToCart`: cart add.
- `InitiateCheckout`: checkout start.
- `Purchase`: completed payment.

## First Campaign Structure

Meta should not receive the first cold-test budget unless TikTok/Reels organic data proves the creative. Use Meta first for Reels placement tests and retargeting.

- Objective: Sales.
- Conversion location: Website.
- Optimization: Purchase when event data exists; otherwise use AddToCart only for learning/validation.
- Placement: Instagram Reels first, then Facebook/Instagram Advantage+ placements after signal.
- Countries: US first; CA/UK/AU later.
- Budget: $1-$2/day test cap while total launch budget is small.
- Status: draft only until operator explicitly enables spend.

## Official References

- Meta Pixel setup: `https://www.facebook.com/help/messenger-app/952192354843755/`
- Meta Business Tools: `https://www.facebook.com/help/331509497253087/`
- Meta Conversions API: `https://www.facebook.com/business/help/AboutConversionsAPI`

