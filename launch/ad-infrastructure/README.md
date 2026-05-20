# shopwithin Ad Infrastructure

This package prepares paid traffic for the FurLift launch without launching ads or creating spend.

## Current Store

- Store: `shopwithin`
- Product: `FurLift Reusable Pet Hair Detailer`
- Product URL: `https://mxu168-9g.myshopify.com/products/furlift-reusable-pet-hair-detailer`
- Price verified on storefront: `$24.95 USD`
- SKU: `VLOY30HZN`

## Safety State

- Paid ads remain disabled.
- No campaign has been launched.
- No billing charge has been triggered.
- No auto-spend escalation is configured.
- Supplier auto-pay remains out of scope.

## Folder Map

- `tiktok/`: TikTok Business Center, Ads Manager, pixel, and campaign setup.
- `meta/`: Meta Business Manager, Page, Instagram, pixel, and campaign setup.
- `pixels/`: Shopify pixel installation and verification assets.
- `tracking/`: UTM rules and final URL templates.
- `campaign-templates/`: low-budget campaign structures and naming conventions.
- `sops/`: safety, launch readiness, and daily operating procedures.
- `reporting/`: metrics dictionary and reporting sheets.

## Required Manual Steps

These require the operator because they involve login, legal/business choices, account ownership, or billing:

1. Create or confirm TikTok Business Center and TikTok Ads Manager.
2. Create or confirm Meta Business Manager, Facebook Page, and Instagram business connection.
3. Add billing/payment methods only when ready.
4. Generate TikTok Pixel ID and Meta Pixel/Dataset ID.
5. Paste pixel IDs into Shopify using official app/channel flows or the fallback custom pixel templates in `pixels/`.

## Verification Gate

The ad stack is not launch-ready until:

- TikTok Pixel fires `ViewContent`, `AddToCart`, `InitiateCheckout`, and `CompletePayment`.
- Meta Pixel fires `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, and `Purchase`.
- Test events show the correct product ID, price, currency `USD`, and SKU.
- UTM links resolve to the live product page.
- `PAID_ADS_ENABLED=false` remains unchanged until the operator explicitly approves a paid test.

