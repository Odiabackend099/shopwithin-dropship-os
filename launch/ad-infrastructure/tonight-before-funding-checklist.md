# Tonight Before Funding Checklist

Do not add money until these are done.

## Operator Actions

### TikTok

1. Use the open Shopify TikTok app tab.
2. Resolve the TikTok company-information tax validation blocker:
   - TikTok returned `CANNOT_PASS_TAX_VALIDATION_CHECK`.
   - Enter only the tax/legal details you know are correct.
   - Do not let anyone guess or fabricate tax information.
3. Confirm the Shopify TikTok setup can reach `Finish Setup`.
4. Keep payment on manual balance.
5. Do not add billing until these are true:
   - TikTok tax validation is resolved.
   - Pixel Pageview is still firing.
   - Pixel AddToCart is still firing.
   - Checkout-start tracking is visible in TikTok diagnostics or Events Manager.
   - Flutterwave checkout still works in sandbox.

### Meta

Paused. The operator will create a new Facebook account for this project later.

Do not continue Meta setup from the existing account.

### Shopify

1. Keep Shopify logged in.
2. Keep the official TikTok Shopify app installed.
3. Use the Shopify TikTok app for pixel/data-sharing setup after Ads Manager signup.
4. Do not use fallback custom pixels unless the official TikTok app cannot create/connect a pixel.

## Funding Rule

When NGN 50,000 becomes available:

- Fund TikTok only.
- Keep daily spend below the NGN 3,000-NGN 5,000 guardrail.
- Keep all campaigns in draft until pixel events are verified.
- Do not fund Meta.
- Do not add funds before the TikTok tax-validation issue is cleared.

## Launch Rule

No paid campaign is allowed until:

- TikTok pixel events fire correctly.
- TikTok company/tax validation is cleared.
- The product URL opens with UTMs.
- Add-to-cart works from ad landing links.
- Flutterwave checkout still works.
- `PAID_ADS_ENABLED=false` remains off until explicit operator approval.
