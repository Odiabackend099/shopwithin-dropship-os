# Operational Status

Updated: 2026-05-19

## Can Launch Immediately

- Organic TikTok posts.
- Instagram Reels organic posts.
- YouTube Shorts organic posts.
- Paid creator posts with UTM links.
- TikTok Promote if the mobile app allows website traffic without the current tax-validation blocker.

## Cannot Launch Yet

- Meta ads until billing/payment is added by the operator, Meta event receipt is verified, and ad identity/Page requirements are confirmed in Ads Manager.
- Meta event verification until Events Manager shows activity from dataset `971950502213246`.
- TikTok Ads Manager campaigns from the currently blocked account.

## Current Meta Assets

- Business portfolio: `Shopwithin`
- Business ID: `990501983779852`
- Ad account: `Shopwithin USD Ad Account`
- Ad account ID: `26070663195942187`
- Currency: `USD`
- Time zone: `(GMT+01:00) Africa/Lagos`
- Billing/payment method: not added.
- Dataset/pixel: `Shopwithin Pixel`
- Dataset/pixel ID: `971950502213246`
- Dataset is connected to ad account `26070663195942187`.
- Shopify Facebook & Instagram app is installed/visible in `shopwithin`.
- Facebook account is connected inside Shopify.
- Shopify sees the `Shopwithin` business portfolio.
- Data sharing preference: `Enhanced`.
- Shopify is connected to dataset `971950502213246`.
- Meta Product Catalog Terms accepted by operator.
- Shopify Facebook & Instagram channel status: active.
- Product catalog status in Shopify channel: `Approved`, `1 product`.
- Meta test traffic sent to the FurLift product page.
- Storefront test actions completed: View product page, AddToCart, and reached checkout.
- Events Manager status at last check: `No activity yet`; Meta notes event activity may take several minutes to appear.

## Current Meta Blocker

- Facebook account is logged in as `Samuel Oko Eguale`.
- Page creation was attempted for:
  - Page name: `Shopwithin`
  - Category: `Shopping & retail`
  - Bio: `Practical pet hair cleanup tools and home essentials for pet owners who want cleaner couches, clothes, and car seats.`
- Facebook blocked creation with:
  - `Account too new to create a Page: Your account is too new to create a Page. Please try again in one hour.`
- After the wait window, Business Settings Page creation also failed with:
  - `Unable to add Facebook Page`
  - `An error occurred while creating the Page.`
- First blocked attempt observed: `2026-05-18 21:18 WAT`.
- Evidence screenshot:
  - `launch/first-paid-traffic/screenshots/facebook-page-too-new-blocker.png`
  - `launch/first-paid-traffic/screenshots/facebook-page-policy-error-after-wait.png`
  - `launch/first-paid-traffic/screenshots/meta-business-page-create-error.png`
- This is a Meta account trust/Page-creation gate. Do not create duplicate accounts or retry aggressively.

## Browser State

- Use the persistent Meta/Facebook browser profile only:
  - Profile: `~/.codex/shopwithin-browser-profiles/facebook-meta`
  - Open command: `pnpm browser:meta`
- Active session name: `facebook-meta-visible`
- Do not use temporary Playwright profiles for Facebook/Meta setup.
- Do not use `playwright open` for navigation after the browser is running. Use `goto`, `click`, `fill`, and `snapshot` only.
- Do not close the browser after login. If the browser must be reopened, use `pnpm browser:meta` so the same profile is reused.
- The earlier temporary `first-paid-traffic` Playwright session died and its login state was not recoverable. The durable profile above is the recovery path.

## Safest First Paid Campaign

Meta Sales/Traffic test to FurLift product page.

If Purchase event verifies:

```text
Objective: Sales
Optimization: Purchase
```

If only PageView/ViewContent/AddToCart verify:

```text
Objective: Traffic or Sales optimized for landing page views/AddToCart
```

## First Signals To Monitor

Within first NGN 5,000 spend:

- Link CTR.
- CPC.
- Landing page sessions.
- AddToCart.
- Comments asking where to buy.
- Checkout starts.

Ignore vanity view counts if they do not create sessions or add-to-cart.
