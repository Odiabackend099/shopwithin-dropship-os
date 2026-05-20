# Tracking Sync

Tracking is persisted before Shopify sync is attempted.

## Supplier Tracking Webhook

Endpoint:

```http
POST /webhooks/supplier/tracking
```

Headers:

```http
x-supplier-event-id: unique-event-id
x-dropship-signature: hmac-sha256-hex(raw-body, SUPPLIER_WEBHOOK_SECRET)
```

Payload:

```json
{
  "shopifyOrderId": "6973205250298",
  "supplier": "zendrop",
  "trackingNumber": "TRACKING123",
  "trackingUrl": "https://carrier.example/track/TRACKING123",
  "carrier": "Zendrop"
}
```

The API verifies the HMAC, dedupes by supplier event ID, stores `TrackingEvent(status=received)`, records a fulfillment lifecycle event, and queues `tracking.sync`.

## Shopify Sync

When `SHOPIFY_LIVE_WRITE_ENABLED=false`, tracking sync runs as a dry-run and records state without writing to Shopify.

When `SHOPIFY_LIVE_WRITE_ENABLED=true`, the worker:

1. Finds the open Shopify fulfillment order by Shopify order ID.
2. Calls Shopify fulfillment creation with tracking number.
3. Requests customer notification.
4. Records a synced tracking event and lifecycle event.

## Duplicate Safety

Duplicate supplier tracking webhooks with the same `x-supplier-event-id` are acknowledged but not reprocessed.

## Failure Recovery

If Shopify sync fails:

1. Keep the original received tracking event.
2. Retry the queued job.
3. If retries exhaust, inspect the dead-letter queue.
4. Confirm the Shopify order still has an open fulfillment order.
5. Manually add tracking in Shopify if needed.
