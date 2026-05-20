# Rollback Plan

## Theme
- Duplicate Shopify theme before publishing.
- Keep prior theme unpublished but available.
- Roll back by publishing previous theme.

## Products
- Publish new products as drafts first.
- If a product fails, set status to draft and pause ads.
- Keep supplier mappings in audit logs.

## Automation
- Disable `AUTO_FULFILLMENT_ENABLED` to stop supplier routing.
- Disable `SUPPLIER_AUTO_PAY_ENABLED` to stop supplier payment.
- Disable `AI_AUTO_PUBLISH_ENABLED` to force manual product review.
- Disable `PAID_ADS_ENABLED` to block paid launch workflows.
- Disable `CUSTOMER_AI_AUTO_REPLY_ENABLED` to force human support review.

## Database
- Use Prisma migrations.
- Deploy migrations before code that depends on new columns.
- Roll back code first, then reverse data migration only when no production events depend on the new shape.

## Webhooks
- Keep webhook endpoints stable.
- If a deploy fails, restore prior API image and run reconciliation for the outage window.
