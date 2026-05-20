# Pixel Installation Guide

## Preferred Installation Order

Use official Shopify app/channel integrations first:

1. TikTok app/channel for TikTok Pixel.
2. Facebook & Instagram app/channel for Meta Pixel/Dataset.

This keeps Shopify checkout events connected to the platforms through Shopify's supported customer-events infrastructure.

## Avoid Duplicate Pixels

Never install both of these at the same time for the same platform:

- Official Shopify app/channel pixel.
- Manual theme snippet.
- Shopify Custom Pixel fallback.
- Google Tag Manager fallback.

Duplicate events can inflate add-to-cart/purchase counts and confuse ad optimization.

## TikTok Required Events

| Shopify event | TikTok event |
| --- | --- |
| product_viewed | ViewContent |
| product_added_to_cart | AddToCart |
| checkout_started | InitiateCheckout |
| checkout_completed | CompletePayment |

## Meta Required Events

| Shopify event | Meta event |
| --- | --- |
| page_viewed | PageView |
| product_viewed | ViewContent |
| product_added_to_cart | AddToCart |
| checkout_started | InitiateCheckout |
| checkout_completed | Purchase |

## Fallback Templates

Use these only if official app/channel integration is unavailable:

- `shopify-custom-pixel-tiktok.js`
- `shopify-custom-pixel-meta.js`

Replace only the pixel ID constants, then paste into Shopify Admin -> Settings -> Customer events -> Add custom pixel.

## Verification Flow

1. Open TikTok Events Manager Test Events or Meta Events Manager Test Events.
2. Open the FurLift product page.
3. Confirm product view event.
4. Click Add to cart.
5. Confirm add-to-cart event.
6. Begin checkout.
7. Confirm checkout-start event.
8. Complete one Flutterwave sandbox checkout.
9. Confirm purchase/complete-payment event with value and currency.

## Current Storefront Finding

The product page currently loads Shopify Web Pixels Manager and exposes correct product data:

- Product ID: `10628065001753`
- Variant ID: `52404939948313`
- SKU: `VLOY30HZN`
- Currency: `USD`
- Price: `24.95`

TikTok and Meta pixel IDs were not visible in the fetched storefront HTML at the time this file was generated, so external account setup and pixel connection are still required.

