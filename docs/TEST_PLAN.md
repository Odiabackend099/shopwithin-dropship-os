# Test Plan

## Unit Tests
- Product scoring and publish eligibility.
- Margin and profit math.
- USD currency enforcement.
- Feature flag parsing.
- Retry and dead-letter decisions.
- Shopify and supplier webhook HMAC verification.
- Ad kill-switch rules.
- NGN 50,000 budget allocation math.
- Creative validation gate and `NGN 5,000/day` cold-test cap.
- Zendrop product-link verification, margin calculation, and fulfillment preflight blockers.

## Integration Tests
- Shopify order paid webhook to routing job.
- Duplicate webhook delivery.
- Flutterwave webhook validation.
- Supplier tracking callback to queue.
- Product publish eligibility blockers.
- Creative validation API blocks unvalidated paid spend and caps validated TikTok tests.
- Worker route hold/send outcomes.
- Zendrop product-link persistence with SKU, inventory, shipping, tracking, and margin evidence.
- Zendrop order visibility validation before fulfillment approval.
- Manual fulfillment approval persistence while supplier auto-pay remains disabled.
- Fulfillment operations dashboard payload.
- Tracking sync by Shopify order ID with lifecycle persistence.

## E2E Tests
- Mobile product page loads without overlap.
- Add to cart works.
- Flutterwave test checkout creates an order.
- Flutterwave test checkout appears and completes.
- Abandoned checkout flow triggers.
- AfterSell post-purchase offer appears.
- Tracking email is sent after supplier callback.

## Failure Tests
- Provider 429s trigger retry.
- Supplier out of stock holds order.
- Missing supplier link blocks fulfillment approval.
- Unknown inventory blocks fulfillment approval.
- High-risk Shopify orders cannot be approved for fulfillment.
- Duplicate supplier tracking callbacks are deduped by event ID.
- Payment confirmed but supplier fails.
- Tracking delayed beyond SLA.
- Worker crash does not lose queued job.
- 500 concurrent webhook deliveries dedupe correctly.
