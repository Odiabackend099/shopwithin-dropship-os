# Fulfillment Operations

## Operating Model

The system is fulfillment-ready, not auto-spend-ready.

Orders enter this flow:

1. Shopify receives a paid USD order.
2. Shopify sends `orders/paid` webhook.
3. API verifies raw-body HMAC.
4. API persists the order and creates a held routing job.
5. Zendrop imports the unfulfilled Shopify order through the connected store.
6. Operator confirms the order is visible in Zendrop.
7. Operator confirms the Shopify SKU is linked to the correct Zendrop variant.
8. API preflight verifies payment, risk, inventory, shipping region, tracking support, and link freshness.
9. Operator records approval.
10. Operator fulfills the order in Zendrop dashboard.
11. Tracking is received and synced to Shopify when live writes are enabled.

## Safety Flags

These remain off for first fulfillment:

```env
AUTO_FULFILLMENT_ENABLED=false
SUPPLIER_AUTO_PAY_ENABLED=false
SHOPIFY_LIVE_WRITE_ENABLED=false
PAID_ADS_ENABLED=false
```

`SUPPLIER_AUTO_PAY_ENABLED=false` means the API never attempts supplier payment. Approval records operator intent only.

## Status Lifecycle

Supported fulfillment lifecycle statuses:

- `pending`
- `linked`
- `approved`
- `processing`
- `fulfilled`
- `shipped`
- `delivered`
- `failed`
- `refunded`

Lifecycle events are stored in `FulfillmentLifecycleEvent` and shown in the admin dashboard.

## Failure Handling

If the order does not appear in Zendrop:

1. Confirm the Zendrop app is connected to the correct Shopify store.
2. Confirm the Shopify order is unfulfilled.
3. Confirm the product is linked or linkable in Zendrop.
4. Record a failed order visibility check.
5. Keep the Shopify order unfulfilled until the issue is resolved.

If Zendrop store connection reaches Shopify app billing approval and approval is disabled:

1. Do not add a billing method during staging.
2. Do not approve subscription usage billing without explicit operator approval.
3. Record a `failed` lifecycle event with `blockedAt=shopify_app_subscription_approval`.
4. Keep the FurLift supplier link unverified.
5. Treat `pnpm run launch:check` failure as correct until the billing gate is resolved and a real Zendrop product link is verified.

If inventory is unavailable:

1. Do not approve fulfillment.
2. Record the supplier link with `inventoryState=out_of_stock`.
3. Contact Zendrop support or source an alternate supplier.
4. Update the product page if shipping or availability materially changes.

If tracking is missing:

1. Poll Zendrop dashboard manually.
2. Record a lifecycle event with `processing` or `failed`.
3. Notify the customer only with truthful shipping status.
4. Do not mark Shopify fulfilled without a real tracking number.

## shopwithin Staging Fulfillment State

Current verified state for the first `shopwithin` staging order:

- Shopify order `#1001` / `7122424365337` is paid and unfulfilled.
- Dropship OS persisted the order as paid in `USD`.
- The routing job is held; no automatic supplier order was created.
- Zendrop imported the order through the connected Shopify store.
- Zendrop maps the line item to product `Portable Fabric and Pet Hair Remover`, SKU `VLOY30HZN`, variant `New Blue`.
- Zendrop payment is `Unpaid`.
- Zendrop status is `Unfulfilled`.
- Zendrop order total shown for fulfillment is `$6.48`.
- The `Fulfill` action is available in Zendrop, but it has not been used.

This proves order visibility and SKU mapping. It does not prove physical fulfillment, tracking sync, delivery speed, packaging quality, or product quality. Keep auto-fulfillment and supplier auto-pay disabled until the first manually paid supplier order completes a real delivery lifecycle.
