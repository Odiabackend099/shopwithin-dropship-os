# n8n Workflows

Workflow exports live in `n8n/workflows`.

## Workflows
- `01-product-discovery`: scheduled discovery seed and score call.
- `02-supplier-vetting`: supplier-offer vetting with batching.
- `03-ai-product-page-generation`: score validation before page generation.
- `04-shopify-draft-publisher`: queues Shopify draft publishing.
- `05-order-router`: manual routing retry.
- `06-tracking-sync`: forwards supplier tracking callbacks to the API.
- `07-profitability-sync`: hourly metric rollup entrypoint.
- `08-customer-support-triage`: gates AI customer replies.
- `09-ad-creative-generator`: creates creative brief outputs.
- `10-daily-scorecard`: fetches API metrics daily.
- `11-reconciliation`: queues 6-hour reconciliation.

## Operating Rules
- No credentials are stored in workflow JSON.
- All workflow secrets come from n8n credentials or environment variables.
- HTTP nodes use retry settings.
- Large lists must use Loop Over Items or Split In Batches plus Wait nodes.
- Workflows call the API instead of writing directly to Shopify.
