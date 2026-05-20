# Live Account Setup Status

Updated: 2026-05-18

## Browser Session

- Existing Playwright browser was kept open.
- Existing browser tabs remain the source of truth for the logged-in session.
- Storage state path: `/Users/mac/.codex/shopwithin-auth/ad-platforms-storage-state.json`
- File permissions: owner-only.
- Note: the current Playwright CLI context exported an empty storage-state file, so do not rely on that file to restore TikTok/Shopify auth. Keep the active browser session open.

## Open Tabs

1. FurLift cart/product test path.
2. Meta Business Suite.
3. TikTok Business Center account creation.
4. Facebook Page creation.
5. Shopify Customer Events.
6. Shopify Facebook & Instagram app setup.
7. Shopify TikTok app setup.
8. NRS/FIRS TIN verification.
9. CAC/iCRP public search.
10. NRS Tax ID Portal.
11. TikTok Ads direct settings attempt.

Meta/Facebook is paused by operator decision. Do not continue the Meta/Facebook setup in this browser session.

## TikTok

Status: Shopify app installed, TikTok account connected, Ads Manager connected, data sharing confirmed, pixel firing on storefront.

Completed:

- Official Shopify `TikTok` app installed.
- TikTok app developer verified as `TikTok Inc.`.
- TikTok For Business account connected through Shopify.
- TikTok Business Center connection completed inside the Shopify TikTok app.
- Ads Manager connected through Shopify after operator completed the final `Sign up and connect`.
- Currency selected: `USD`.
- Timezone selected: `(UTC+01:00) Africa/Lagos`.
- Data Sharing confirmed with the selected Shopify TikTok pixel.
- Pixel selected in Shopify TikTok app: `TikTok Pixel for Shopify 1779121530`.
- Pixel code observed on storefront network requests: `D85JQUJC77UBBEKNOSU0`.
- Product page `Pageview` event observed posting to `https://analytics.tiktok.com/api/v2/shopify_pixel`.
- Product add-to-cart action observed posting `AddToCart` to `https://analytics.tiktok.com/api/v2/shopify_pixel`.
- Billing/payment: not touched.
- Ads: not launched.

Current blocker:

- TikTok company information save is blocked by TikTok's tax validation response: `CANNOT_PASS_TAX_VALIDATION_CHECK`.
- CAC/iCRP public search verified `ODIADEV AI LTD`, `RC 8989175`, status `ACTIVE`.
- NRS Tax ID Portal verified the company by RC number and matched it to a Tax ID. The full Tax ID is not committed to this repo.
- Legacy FIRS/NRS TIN verification returned: `Kindly visit your taxoffice and register on TaxPro Max`.
- Retried TikTok company information with the verified Tax ID and postal codes `90001` and `900001`; both attempts still returned `CANNOT_PASS_TAX_VALIDATION_CHECK`.
- Direct `ads.tiktok.com` account settings returned HTTP `403`, so legal-name correction could not be attempted from direct Ads Manager in this session.
- TaxPro Max found `ODIADEV AI LTD` by RC number, but OTP validation requires the exact CAC-registered contact. The operator-provided email and phone were rejected with `Email details do not match!` and `Phone details do not match!`.
- CAC forgot-password accepted `austyneguale@gmail.com` and said a reset email was sent, but the operator reported no email arrived.
- CAC Help & Support complaint form was submitted under `Login` requesting account/contact recovery or update guidance for `ODIADEV AI LTD (RC 8989175)`.
- Payment is still set to manual payment. No balance was added.

Pending after operator resolves TikTok tax validation:

- Register/activate the company tax profile in TaxPro Max or complete any TikTok-required account review if needed.
- Finish the remaining Shopify TikTok app setup screen if TikTok enables `Finish Setup`.
- Verify checkout-start event from the TikTok Events Manager side.
- Verify purchase event only through a Flutterwave sandbox order.
- Add billing/balance only after the operator explicitly approves it.

## Meta

Status: paused by operator decision.

Completed:

- Existing Meta Business Suite login confirmed.
- Existing selected asset is `Odiadev AI`, which is not the desired shopwithin asset.
- New business portfolio modal opened.
- Business portfolio name filled as `shopwithin`.
- Official Shopify `Facebook & Instagram` app installed.
- Facebook account authorization completed.

Do not continue:

- Operator will create a new Facebook account for this project later.
- Do not create/select Meta business assets from the current account.
- Do not install/configure Meta pixel from this account.

Blocked:

- Meta app is parked at business portfolio selection with non-shopwithin portfolios visible.
- Selecting one would be risky and is intentionally paused.

## Facebook Page

Status: paused.

Attempted:

- Page name: `Shopwithin`
- Category: `Shopping & retail`
- Bio: `Reusable pet hair cleanup tools and practical home products for pet owners.`

Result:

- Meta returned: `An error occurred while creating the page. Please ensure that you are following Page policies.`

Second attempt:

- Page name changed to `Shopwithin Store`.

Result:

- Same generic Page-policy error.

Interpretation:

- This is likely account-side or policy/security-related, not a form-completion issue.
- A Facebook Protect notice also appeared and said the account requires stronger security by 22 June 2026.
- Operator will create a fresh Facebook account for this project later.

## Shopify Admin

Status: available.

Completed:

- Shopify admin is logged in and accessible.
- Official TikTok app installed.
- Official Facebook & Instagram app installed but paused.
- Customer Events page is open in another tab.

Pending:

- Finish TikTok Ads Manager signup.
- Connect TikTok pixel through the Shopify TikTok app.
- Verify TikTok events before adding money.

## Spend Safety

- No ads launched.
- No campaigns published.
- No billing/payment method touched.
- No auto-spend or auto-scale rules created.
- Dropship OS campaign endpoint still blocks paid launch while `PAID_ADS_ENABLED=false`.
