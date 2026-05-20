# Supplier Approval Flow

Manual approval protects cash, customer trust, and supplier accuracy.

## Approval Preconditions

The system blocks approval unless all are true:

- Shopify order exists in the database.
- Order payment status is `paid`.
- Order risk level is not `high` or `blocked`.
- FurLift SKU is linked to a verified Zendrop product.
- Supplier inventory is `in_stock` or `low_stock`.
- Supplier ships to the customer market.
- Tracking sync support is verified.
- Supplier link verification has not expired.

## Approval Command

```bash
curl -X POST "$API_PUBLIC_URL/internal/fulfillment/approve" \
  -H "content-type: application/json" \
  -d '{
    "shopifyOrderId": "6973205250298",
    "productHandle": "furlift-reusable-pet-hair-detailer",
    "shopifySku": "VLOY30HZN",
    "supplier": "zendrop",
    "targetMarket": "US",
    "reviewer": "operator",
    "decision": "approved",
    "reason": "Order visible in Zendrop, linked variant confirmed, inventory available."
  }'
```

## What Approval Does

Approval does:

- Persist an approval record.
- Persist the preflight result.
- Update the supplier order status to `approved`.
- Add a lifecycle event.
- Add a supplier audit event.

Approval does not:

- Pay Zendrop.
- Submit a live supplier order.
- Mark Shopify fulfilled.
- Send customer tracking.
- Enable auto-fulfillment.

## Rejection

Use `decision=rejected` when any check fails. Record the exact reason so the next operator can recover without guessing.

Common rejection reasons:

- Zendrop order not visible.
- Incorrect linked product.
- Variant unavailable.
- Shipping region blocked.
- Fraud or risk review required.
- Customer address issue.

## Rollback

If approval was recorded by mistake:

1. Do not fulfill in Zendrop.
2. Record a new approval with `decision=cancelled`.
3. Add a fulfillment lifecycle event with `failed`.
4. Leave Shopify unfulfilled.
5. If customer payment must be reversed, process refund through Shopify/Flutterwave and record the refund event.
