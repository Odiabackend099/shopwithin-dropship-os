# Event Verification Log

Updated: 2026-05-18

## Verified

| Platform | Event | Result | Evidence |
| --- | --- | --- | --- |
| Shopify | Product page public | Pass | Product page loads |
| Shopify | Add to cart | Pass | Cart updates |
| TikTok | Pageview | Pass | Shopify TikTok pixel request observed |
| TikTok | ViewContent | Pass | Shopify TikTok pixel request observed |
| TikTok | AddToCart | Pass | Shopify TikTok pixel request observed after `/cart/add.js` |

## Pending

| Platform | Event | Reason |
| --- | --- | --- |
| TikTok | InitiateCheckout | Ads setup blocked; checkout event still needs Events Manager confirmation |
| TikTok | CompletePayment | Requires Flutterwave sandbox purchase while TikTok event QA is open |
| Meta | PageView | Fresh Meta pixel not connected |
| Meta | ViewContent | Fresh Meta pixel not connected |
| Meta | AddToCart | Fresh Meta pixel not connected |
| Meta | InitiateCheckout | Fresh Meta pixel not connected |
| Meta | Purchase | Fresh Meta pixel not connected |

## 2026-05-18 Clean Browser QA

Test URL:

```text
https://mxu168-9g.myshopify.com/products/furlift-reusable-pet-hair-detailer?utm_source=traffic_infra&utm_medium=qa&utm_campaign=furlift_event_check&utm_content=mobile_verify_3
```

Observed network requests:

- `GET https://analytics.tiktok.com/i18n/pixel/shopify.js?sdkid=D85JQUJC77UBBEKNOSU0&lib=ttq`
- `POST https://analytics.tiktok.com/api/v2/shopify_pixel` with `event: Pageview`
- `POST https://analytics.tiktok.com/api/v2/shopify_pixel` with `event: ViewContent`
- `POST https://mxu168-9g.myshopify.com/cart/add.js`
- `POST https://analytics.tiktok.com/api/v2/shopify_pixel` with `event: AddToCart`

Screenshot:

```text
launch/traffic-infrastructure/screenshots/product-page-mobile.png
```

## Verification Method

For each platform:

1. Open product page with UTM.
2. Confirm PageView/ViewContent.
3. Add to cart.
4. Confirm AddToCart.
5. Start checkout.
6. Confirm InitiateCheckout.
7. Complete Flutterwave sandbox payment.
8. Confirm Purchase/CompletePayment.
9. Confirm Shopify order and backend webhook.

## No-Spend Rule

No paid campaign launches until the target platform has at least:

- PageView/ViewContent verified.
- AddToCart verified.
- Landing URL tested.
- Campaign budget cap configured.
