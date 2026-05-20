# Current Account Status

Updated: 2026-05-18

## TikTok

### Operational

- Official Shopify TikTok app installed.
- TikTok For Business connected through Shopify.
- TikTok Business Center connected through Shopify.
- TikTok Ads Manager connected through Shopify.
- Data sharing confirmed.
- Pixel selected: `TikTok Pixel for Shopify 1779121530`.
- Storefront pixel code observed: `D85JQUJC77UBBEKNOSU0`.
- Pageview event observed.
- ViewContent event observed.
- AddToCart event observed.

### Blocked

TikTok company-information save returns:

```text
CANNOT_PASS_TAX_VALIDATION_CHECK
```

Root cause:

- `ODIADEV AI LTD` exists and has a valid Tax ID.
- TaxPro Max requires OTP through the CAC-registered contact.
- Operator-provided current email/phone did not match the CAC/TaxPro Max masked contacts.
- CAC support ticket was submitted for access/contact recovery.

### Decision

Do not fund or launch from this TikTok Ads Manager until the company/tax validation clears.

## Meta

### Operational

- Shopify Facebook & Instagram app had previously been installed.

### Blocked / Not Yet Completed

- Previous Facebook Page creation failed under the old/current Facebook account.
- Operator decided to create a fresh Facebook account for this project.
- Meta Business Manager, Page, Instagram business connection, ad account, and pixel still need fresh-account setup.

### Decision

Meta is now the fastest formal paid-ads path if the fresh Facebook account can create:

- Page: `Shopwithin`
- Business portfolio: `shopwithin`
- Ad account in NGN or USD if available
- Dataset/Meta Pixel connected to Shopify

## Immediate Launchable Channels

| Channel | Can Start Now? | Notes |
| --- | --- | --- |
| Organic TikTok/Reels/Shorts | Yes | No ad account needed |
| Paid creator posts | Yes | Use UTM links and `#ad` disclosure |
| TikTok Promote | Maybe | Try in mobile app; stop if tax validation appears |
| Meta ads | After fresh account/page/pixel setup | Likely lower friction than current TikTok path |
| TikTok Ads Manager | No | Current account blocked |
