# Ad Infrastructure Verification

Generated: 2026-05-18

## Local Infrastructure

| Check | Result |
| --- | --- |
| Folder structure created | Pass |
| TikTok SOP and templates | Pass |
| Meta SOP and templates | Pass |
| Pixel install docs | Pass |
| Pixel fallback JS syntax | Pass |
| UTM links prepared | Pass |
| Reporting templates prepared | Pass |
| Campaign structure JSON valid | Pass |

## Storefront

| Check | Result |
| --- | --- |
| Product page opens | Pass |
| Product title visible | Pass |
| Price displays in USD | Pass |
| Add to cart works | Pass |
| UTM product URLs return HTTP 200 | Pass |
| Mobile-friendly Shopify product page snapshot captured | Pass |

Screenshot:

```text
output/playwright/shopwithin-ad-infra-product-page.png
```

## Pixel State

| Check | Result |
| --- | --- |
| Shopify Web Pixels Manager present | Pass |
| Official Shopify TikTok app installed | Pass |
| TikTok For Business connected through Shopify | Pass |
| TikTok Business Center connected through Shopify | Pass |
| TikTok Ads Manager connected | Pass |
| TikTok data sharing confirmed | Pass |
| TikTok pixel connected | Pass |
| Meta pixel connected | Paused by operator |
| TikTok `Pageview` firing | Pass |
| TikTok `AddToCart` firing | Pass |
| TikTok checkout/purchase events | Pending TikTok tax validation and sandbox checkout verification |
| Meta events firing | Paused by operator |

## Spend Safety

The existing Dropship OS paid campaign endpoint was tested while `PAID_ADS_ENABLED=false`.

Result:

```json
{
  "ok": false,
  "status": "blocked",
  "cappedDailyBudgetNgn": 0,
  "reasons": [
    "publish_more_organic_posts_before_paid",
    "produce_20_to_30_creatives_first",
    "no_click_or_view_signal_yet",
    "paid_ads_feature_flag_disabled"
  ]
}
```

This is the correct state. The infrastructure is prepared, but paid spend remains blocked.

## External Setup Still Required

These cannot be completed by code alone because they require operator tax/legal choices and billing ownership:

- TikTok company-information tax validation.
- TaxPro Max / TikTok tax review if required by TikTok validation.
- TikTok checkout/purchase event verification in Events Manager after tax validation.
- Billing method addition.

No ad account was charged. No ad was launched.

## Live Setup Progress

See `live-account-setup-status.md` for the latest browser/account state. TikTok is now the active setup path. Meta/Facebook setup is paused because the operator will create a separate Facebook account for this project later.
