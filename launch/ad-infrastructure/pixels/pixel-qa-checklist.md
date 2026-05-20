# Pixel QA Checklist

## Preflight

- Confirm Shopify store is public.
- Confirm product page displays `$24.95 USD`.
- Confirm no duplicate TikTok pixel installation.
- Confirm no duplicate Meta pixel installation.
- Confirm only one event source is active per platform.

## TikTok Test Events

| Step | Expected Event | Expected Parameters | Status |
| --- | --- | --- | --- |
| Open product page | ViewContent | SKU or variant ID, USD, 24.95 | Pending |
| Add to cart | AddToCart | SKU or variant ID, USD, 24.95 | Pending |
| Begin checkout | InitiateCheckout | USD order/cart value | Pending |
| Complete Flutterwave sandbox payment | CompletePayment | USD order value and order ID | Pending |

## Meta Test Events

| Step | Expected Event | Expected Parameters | Status |
| --- | --- | --- | --- |
| Open product page | PageView + ViewContent | SKU or variant ID, USD, 24.95 | Pending |
| Add to cart | AddToCart | SKU or variant ID, USD, 24.95 | Pending |
| Begin checkout | InitiateCheckout | USD order/cart value | Pending |
| Complete Flutterwave sandbox payment | Purchase | USD order value and order ID | Pending |

## Failure Cases

- No product view: pixel not installed, blocked by consent, or wrong account selected.
- Add-to-cart missing: official channel not connected correctly or custom AJAX cart event not mapped.
- Checkout missing: wrong Shopify customer-events setup or unsupported manual theme snippet.
- Purchase missing: checkout event not connected or payment test did not complete.
- Duplicate purchase: both official channel and fallback custom pixel are installed.

