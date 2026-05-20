# Meta Launch SOP

## Before Launch

1. Fresh Facebook account is created and stable.
2. Facebook/Meta is opened through the persistent browser profile:

```bash
pnpm browser:meta
```

Do not use temporary browser sessions for this setup. Keep the browser open after login.

3. If Facebook asks for login, the operator logs in directly in that persistent browser window.
4. `Shopwithin` Facebook Page exists or an existing operator-owned Page is attached to the `Shopwithin` business portfolio.
5. Instagram business account is connected.
6. Meta ad account is created.
7. Meta pixel/dataset is created and connected through Shopify Facebook & Instagram.
8. Events are verified:
   - PageView
   - ViewContent
   - AddToCart
   - InitiateCheckout
   - Purchase if possible through Flutterwave sandbox
9. Campaign is in draft.
10. Budget cap is confirmed.
11. Operator approves launch.

## New Account Gate

If Facebook returns:

```text
Account too new to create a Page: Your account is too new to create a Page. Please try again in one hour.
```

Stop retrying. Leave the account logged in, wait at least one hour, then retry Page creation from the same persistent browser session. Do not create multiple replacement Facebook accounts, because repeated new accounts increase Meta trust risk.

If the one-hour retry returns:

```text
Unable to add Facebook Page
An error occurred while creating the Page.
```

Do not brute-force repeated Page creation. Continue building the ad account and dataset/pixel, then use one of the compliant paths:

- attach an existing operator-owned Facebook Page,
- let the fresh account age with email/phone verification and 2FA enabled,
- retry Page creation later from the same stable session.

## Build

Campaign:

```text
META_Sales_FurLift_FirstTraffic_202605
```

Budget:

```text
NGN 3,000-5,000/day
```

Ad sets:

- `US_CA_UK_AU_BroadPetOwners`
- `US_CA_UK_AU_PetOwners_Cleaning`

Placements:

- Advantage+ placements if using Sales and Meta recommends it.
- If manual, prioritize Instagram Reels, Stories, Facebook Feed, Facebook Reels.

## Review After 12 Hours

- Is spend delivering?
- Is CTR above 0.8-1%?
- Are sessions visible in Shopify?
- Any AddToCart?
- Any comments/questions?

## Review After 24 Hours

- Kill clear losers.
- Keep one winner alive.
- Do not scale without AddToCart.
