# Shipping Expectations

FurLift must be sold with conservative shipping promises.

## Launch Promise

Use this customer-facing promise until actual Zendrop delivery data proves faster performance:

- Processing: `1-3 business days`
- Estimated delivery: `7-15 business days`
- Tracking: sent after carrier scan is available

Do not promise same-day dispatch, guaranteed delivery dates, or local warehouse shipping unless Zendrop product evidence proves it for the exact variant.

## Supplier Verification Fields

Every supplier link stores:

- `shipsFrom`
- `shipsTo`
- `estimatedDeliveryMinDays`
- `estimatedDeliveryMaxDays`
- `shippingProfile`
- `inventoryState`
- `trackingSyncSupported`

The API blocks fulfillment approval if the customer market is not included in `shipsTo`.

## Delay Thresholds

Operational alerts:

- More than 3 days with no supplier processing movement: review Zendrop order.
- More than 5 days with no tracking after fulfillment: contact supplier support.
- More than 15 business days in transit: proactively email customer.
- More than 21 business days with no delivery scan: prepare refund/replacement decision.

## Product Page Copy

Use truthful copy:

> Orders are processed in 1-3 business days. Tracked delivery usually arrives in 7-15 business days depending on destination and carrier scans.

Do not hide shipping times. Hidden shipping creates chargebacks, bad reviews, and payment risk.
