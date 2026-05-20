# TikTok Pixel Verification

Verified: 2026-05-18

## Connected Pixel

- Shopify TikTok app pixel label: `TikTok Pixel for Shopify 1779121530`
- Pixel code observed in storefront network traffic: `D85JQUJC77UBBEKNOSU0`
- Data sharing: confirmed in the Shopify TikTok app
- Billing: not touched
- Ads: not launched

## Storefront Events Observed

| Event | Result | Evidence |
| --- | --- | --- |
| Product page load | Pass | TikTok script loaded from `analytics.tiktok.com/i18n/pixel/shopify.js` |
| Pageview | Pass | POST to `https://analytics.tiktok.com/api/v2/shopify_pixel` with `event: Pageview` |
| AddToCart | Pass | POST to `https://analytics.tiktok.com/api/v2/shopify_pixel` with `event: AddToCart` after Shopify `/cart/add.js` |
| InitiateCheckout | Pending | Checkout-start diagnostics still need TikTok account setup completion |
| CompletePayment/Purchase | Pending | Verify only with Flutterwave sandbox checkout |

## Test URL

```text
https://mxu168-9g.myshopify.com/products/furlift-reusable-pet-hair-detailer?utm_source=tiktok&utm_medium=paid_social&utm_campaign=pixel_test&utm_content=viewcontent_test
```

## Current Blocker

TikTok company information cannot complete yet. The update endpoint returned:

```text
CANNOT_PASS_TAX_VALIDATION_CHECK
```

The address was retried with:

- `Federal Capital Territory`
- `Abuja`
- `170 Golden Spring Estate`
- postal code `90001`
- postal code `900001`

The company Tax ID was found and verified through official CAC/NRS public portals, but TikTok still returned the same validation error. Legacy FIRS/NRS TIN verification said to visit/register on TaxPro Max, which may explain TikTok's rejection if TikTok checks that backend.

This is a real TikTok account/tax validation blocker. The operator must resolve the account-side tax validation issue before adding funds or launching ads.
