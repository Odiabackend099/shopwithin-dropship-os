# Flutterwave Integration Guide

1. Create a Flutterwave for Business account and complete verification.
2. In Shopify, go to Settings -> Payments -> Add payment methods -> search Flutterwave.
3. Install the current Flutterwave payment app.
4. Add test and live API keys in the Flutterwave Shopify configuration.
5. Keep Flutterwave in test mode while `NODE_ENV` is not production.
6. Configure `FLUTTERWAVE_SECRET_HASH` in Flutterwave dashboard and in the API environment.
7. Send test checkout through Shopify using Flutterwave test mode.
8. Confirm `/webhooks/flutterwave` receives a signed event.
9. Disable test mode only after:
   - Shopify order is created.
   - Flutterwave payment status is successful.
   - Order routing job is held or queued correctly.
   - Profit snapshot job is queued.

## shopwithin Current State

- Shopify store: `shopwithin`
- Shopify domain: `mxu168-9g.myshopify.com`
- Store currency: `USD`
- Provider installed: `Flutterwave - Africa Payments`
- Provider state: active in Shopify test mode
- Shopify payment-capture method: automatic at checkout
- `.env` state: `FLUTTERWAVE_TEST_MODE=true`
- PayPal and Stripe are not part of this launch path.
- Staging checkout reached Flutterwave hosted checkout for `USD 24.95`.
- Flutterwave displayed the test-mode banner and card-entry form.
- Staging payment completed in Flutterwave test mode.
- Shopify confirmation: `YZHGPFMK3`.
- Shopify order ID: `7122424365337`.
- The Shopify paid-order webhook reached Dropship OS and was persisted with a held supplier route.

Do not turn off Flutterwave test mode until a full staging checkout proves:

- Shopify creates a paid order.
- Shopify `orders/paid` reaches `/webhooks/shopify/orders-paid`.
- The Dropship OS persists the order.
- Supplier routing remains held because `AUTO_FULFILLMENT_ENABLED=false` and `SUPPLIER_AUTO_PAY_ENABLED=false`.

Codex must not enter real card details. Flutterwave sandbox test details may be entered only when the operator explicitly instructs it in the active session.

## Payment Risk Rules
- Supplier purchase never starts before confirmed payment.
- High-risk Shopify orders remain held.
- Refund and chargeback evidence is stored against the Shopify order.
- PayPal is optional for this launch; Flutterwave is the required checkout path.
- Stripe stays disabled unless the store is legally eligible and `STRIPE_ENABLED=true`.
