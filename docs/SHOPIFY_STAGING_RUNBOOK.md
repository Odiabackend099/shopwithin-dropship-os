# Shopify Staging Runbook

This runbook is for the first real staging pass. It intentionally keeps live writes, paid ads, supplier auto-pay, and auto-fulfillment disabled.

## Local Artifacts
- Theme ZIP: `dist/theme/dropship-os-theme.zip`
- Theme source: `infra/shopify-theme`
- First product draft: `launch/first-product/shopify-product-draft.json`
- Product publish payload: `launch/first-product/product-publish-request.json`
- Launch pack and scripts: `launch/first-product/FIRST_PRODUCT_LAUNCH.md`

## Create The Development Store
1. Log in to Shopify Partner Dashboard.
2. Go to `Stores`.
3. Select `Add store` then `Create development store`.
4. Purpose: `Create a store to test and build`.
5. Store name: use a standalone name for the dropshipping test, not RiseWithin.
6. Data: start empty unless you need Shopify generated test data.
7. After creation, record the `myshopify.com` domain in `.env` as `SHOPIFY_SHOP_DOMAIN`.

Current store:

- Store name: `shopwithin`
- Shopify domain: `mxu168-9g.myshopify.com`
- First product: `FurLift Reusable Pet Hair Detailer`
- Product handle: `furlift-reusable-pet-hair-detailer`
- Product price: `$24.95 USD`
- Product SKU: `VLOY30HZN`
- Payment provider: `Flutterwave - Africa Payments`
- Payment state: active in Shopify test mode; no real customer transactions are processed while test mode is on.
- Current live theme: `Horizon`
- Uploaded draft theme: `dropship-os-theme` from `dist/theme/dropship-os-theme.zip`
- Zendrop shipping profile: `Zendrop`, with `FurLift Reusable Pet Hair Detailer` assigned.

## Store Currency
1. In Shopify admin, go to `Settings > Store details`.
2. Set store currency to `USD`.
3. Confirm `.env` keeps `SHOPIFY_STORE_BASE_CURRENCY=USD`.
4. After any currency change, re-check product prices. FurLift must remain `$24.95 USD`.

## Theme Upload
1. In Shopify admin, go to `Online Store > Themes`.
2. In draft themes, choose `Import theme`.
3. Upload `dist/theme/dropship-os-theme.zip`.
4. Preview the theme first.
5. Do not publish until the product page and checkout copy are reviewed on mobile.

Current status:

- `dropship-os-theme` has been uploaded as an unpublished draft theme.
- Keep it unpublished until the operator approves a live storefront theme switch.
- Shopify still shows the storefront as password protected until a store address is added; the operator must provide address/legal details personally.

## Flutterwave Test Mode
1. Log in to Flutterwave.
2. Confirm the dashboard is in test mode.
3. Copy test public key, secret key, and secret hash into `.env`.
4. Install/configure Flutterwave in Shopify payments according to the Flutterwave Shopify app flow.
5. Keep `FLUTTERWAVE_TEST_MODE=true` until a full test order is complete.

Current status:

- Flutterwave keys are configured in `.env`.
- Shopify lists `Flutterwave - Africa Payments` under supported payment methods.
- Shopify shows the provider as `Test mode`; the provider page shows `Test mode is on`.
- Payment capture is `Automatically at checkout`.

## PayPal
PayPal is skipped for this Flutterwave-first launch. Do not block staging or launch-readiness on PayPal sandbox credentials.

## Webhooks
1. Create Shopify webhooks for:
   - `orders/paid` -> `${API_PUBLIC_URL}/webhooks/shopify/orders-paid`
   - `orders/cancelled` -> `${API_PUBLIC_URL}/webhooks/shopify/orders-cancelled`
   - `refunds/create` -> `${API_PUBLIC_URL}/webhooks/shopify/refunds-create`
2. Save the Shopify webhook secret as `SHOPIFY_WEBHOOK_SECRET`.
3. Run `pnpm run staging:order-smoke` before using a real Shopify checkout.

Current status:

- Public API tunnel: `https://arumlike-lustfully-armida.ngrok-free.dev`
- Shopify webhook signing secret from `shopwithin` is saved in `.env`.
- Registered Shopify webhooks:
  - `Order payment` -> `https://arumlike-lustfully-armida.ngrok-free.dev/webhooks/shopify/orders-paid`
  - `Order cancellation` -> `https://arumlike-lustfully-armida.ngrok-free.dev/webhooks/shopify/orders-cancelled`
  - `Refund create` -> `https://arumlike-lustfully-armida.ngrok-free.dev/webhooks/shopify/refunds-create`
- All three webhooks use JSON and Shopify API version `2026-04`.

## First Staging Order
1. Run `pnpm run launch:check`.
2. Start Postgres and Redis. Use `docker compose up -d postgres redis` when Docker is available; otherwise use the local services already listening on ports `5432` and `6379`.
3. Run `pnpm run db:migrate`.
4. Confirm these flags are still false:
   - `AUTO_FULFILLMENT_ENABLED`
   - `SHOPIFY_LIVE_WRITE_ENABLED`
   - `SUPPLIER_AUTO_PAY_ENABLED`
   - `PAID_ADS_ENABLED`
5. Create or queue the FurLift product draft.
6. Use Flutterwave test checkout.
7. Confirm the `orders/paid` webhook reaches the API.
8. Confirm routing job status is `held`.
9. Do not place a supplier order during staging.
10. Codex must not enter card details unless the operator explicitly instructs it to use Flutterwave sandbox test details in the active session. Codex must never enter real card details.

Current checkout status:

- FurLift is available on the storefront at `$24.95 USD`.
- The product was initially unavailable because the `Zendrop` shipping profile existed but had `0 products`.
- FurLift has been moved into the `Zendrop` shipping profile and saved.
- The checkout reaches Flutterwave hosted checkout in test mode for `USD 24.95`.
- Flutterwave displays the test-mode banner and card entry screen.
- Staging payment completed in Flutterwave test mode.
- Shopify confirmation: `YZHGPFMK3`.
- Shopify order: `#1001`.
- Shopify order ID: `7122424365337`.
- Shopify admin state: test order, paid, unfulfilled, assigned to Zendrop fulfillment.
- Dropship OS state: order persisted as paid `USD`, Shopify webhook signature valid, route job held, no supplier order created for this order.
- Zendrop state: order `#1001` imported, customer order `Received`, Zendrop payment `Unpaid`, order status `Unfulfilled`, mapped to SKU `VLOY30HZN`, variant `New Blue`, order total `$6.48`.
- Fulfillment safety state: Zendrop `Fulfill` action was visible but not clicked; no supplier payment was made.
- Launch readiness remains intentionally blocked until tracking sync or a real delivery lifecycle is verified.

## Verification Commands
```bash
pnpm run launch:check
pnpm run staging:product-smoke
pnpm run staging:order-smoke
pnpm run ci
```
