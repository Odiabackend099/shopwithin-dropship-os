# N8N Workflows — Detailed Documentation

## Overview

The Dropship OS uses n8n for workflow automation between external systems (Shopify, suppliers, payment gateways) and the internal API. Workflows are credential-free JSON exports that call API endpoints with retry logic and batching patterns.

**Location**: `/n8n/workflows/`
**Environment Variable**: `$API_PUBLIC_URL` (base URL for API calls)
**Operating Rule**: No credentials stored in workflow JSON; all secrets from n8n credentials or environment variables.

## Workflow Architecture

### Design Principles

1. **Credential-Free**: No API keys, tokens, or secrets in workflow JSON
2. **API-First**: Workflows call internal API endpoints instead of writing directly to databases
3. **Retry Logic**: All HTTP nodes include retry settings (3-5 tries, 5000ms wait)
4. **Batching**: Large lists use `Split In Batches` + `Wait` nodes for rate limiting
5. **Webhook Triggers**: Manual or scheduled triggers for workflow initiation
6. **Response Mode**: Webhooks use `responseNode` or `lastNode` for synchronous responses

### Common Patterns

#### HTTP Request with Retry
```json
{
  "parameters": {
    "method": "POST",
    "url": "={{$env.API_PUBLIC_URL}}/internal/products/score",
    "sendBody": true,
    "contentType": "json",
    "options": {
      "retry": {
        "maxTries": 3,
        "waitBetweenTries": 5000
      }
    }
  }
}
```

#### Rate-Limited Batching
```json
{
  "parameters": {
    "batchSize": 1,
    "options": {}
  },
  "type": "n8n-nodes-base.splitInBatches"
}
```
Followed by:
```json
{
  "parameters": {
    "amount": 1,
    "unit": "seconds"
  },
  "type": "n8n-nodes-base.wait"
}
```

#### Webhook Response
```json
{
  "parameters": {
    "respondWith": "json",
    "responseBody": "{\"ok\":true,\"status\":\"queued\"}"
  },
  "type": "n8n-nodes-base.respondToWebhook"
}
```

## Workflows

### 01-Product-Discovery

**Purpose**: Scheduled product discovery seed and scoring

**Trigger**: Schedule (every 6 hours)

**Flow**:
1. **Every 6 Hours** (schedule) →
2. **Seed Discovery Sources** (set node: sources, markets) →
3. **Score Discovery Batch** (HTTP POST to `/internal/products/score`)

**API Payload**:
```json
{
  "demandVelocity": 80,
  "margin": 75,
  "shippingSpeed": 74,
  "wowFactor": 80,
  "creativeEase": 85,
  "trendLongevity": 70,
  "competition": 35,
  "adSaturation": 30,
  "riskPenalties": 0
}
```

**Purpose**: Automates product candidate scoring from discovery sources (TikTok, Meta Ads Library, Amazon Movers, Google Trends, AliExpress, Shopify Spy).

**Integration Point**: API validates scoring and queues high-scoring candidates for AI product page generation.

---

### 02-Supplier-Vetting

**Purpose**: Supplier offer vetting with rate-limited batching

**Trigger**: Webhook (`/supplier-vetting`)

**Flow**:
1. **Candidate Approved** (webhook) →
2. **Loop Over Supplier Offers** (split in batches, size 1) →
3. **Rate Limit Wait** (1 second) →
4. **Respond** (webhook response: `supplier_vetting_started`)

**Purpose**: Processes supplier candidate approval events with rate limiting to avoid API overload.

**Integration Point**: API routes to supplier vetting service, performs background checks, and stores vetting results.

---

### 03-AI-Product-Page-Generation

**Purpose**: Score validation before AI product page generation

**Trigger**: Webhook (`/ai-product-page`)

**Flow**:
1. **Generate Page Request** (webhook) →
2. **Validate Score** (HTTP POST to `/internal/products/score` with dynamic values)

**API Payload** (with defaults):
```json
{
  "demandVelocity": 75,
  "margin": 75,
  "shippingSpeed": 74,
  "wowFactor": 80,
  "creativeEase": 85,
  "trendLongevity": 70,
  "competition": 30,
  "adSaturation": 30,
  "riskPenalties": 0
}
```

**Purpose**: Ensures product meets scoring threshold before expensive AI page generation.

**Integration Point**: API validates score, triggers OpenAI product page generation, and stores draft content.

---

### 04-Shopify-Draft-Publisher

**Purpose**: Queues Shopify draft publishing

**Trigger**: Webhook (`/shopify-draft-publisher`)

**Flow**:
1. **Publish Draft Request** (webhook) →
2. **Queue Shopify Draft** (HTTP POST to `/internal/products/publish` with full JSON body)

**Purpose**: Publishes AI-generated product drafts to Shopify as draft products.

**Integration Point**: API validates draft, applies Shopify product schema, and creates draft via Shopify Admin API. Gated by `SHOPIFY_LIVE_WRITE_ENABLED`.

---

### 05-Order-Router

**Purpose**: Manual retry for failed order routing

**Trigger**: Webhook (`/order-router`)

**Flow**:
1. **Manual Retry Webhook** (webhook) →
2. **Retry Routing** (HTTP POST to `/internal/orders/retry` with full JSON body) →
3. **Respond** (webhook response: `routing_retry_queued`)

**Purpose**: Allows manual retry of failed order routing operations.

**Integration Point**: API re-queues order routing job, selects new supplier, and updates order status.

---

### 06-Tracking-Sync

**Purpose**: Forwards supplier tracking callbacks to API

**Trigger**: Webhook (`/tracking-sync`)

**Flow**:
1. **Supplier Tracking Callback** (webhook) →
2. **Forward To API** (HTTP POST to `/webhooks/supplier/tracking` with full JSON body) →
3. **Respond** (webhook response: `{"ok":true}`)

**Purpose**: Relays tracking number updates from suppliers to internal API.

**Integration Point**: API verifies HMAC, updates order tracking, queues Shopify tracking sync, and triggers profit snapshot.

---

### 07-Profitability-Sync

**Purpose**: Hourly metric rollup entrypoint

**Trigger**: Schedule (every hour)

**Flow**:
1. **Hourly** (schedule) →
2. **Metric Set** (set node: dashboard metrics)

**Metrics**:
```
revenue, net_profit, cac, roas, aov, refund_rate, shipping_delays
```

**Purpose**: Schedules hourly profitability metric calculation.

**Integration Point**: API aggregates order data, calculates profitability metrics, and stores for dashboard display.

---

### 08-Customer-Support-Triage

**Purpose**: Gates AI customer replies

**Trigger**: Webhook (`/support-triage`)

**Flow**:
1. **Support Message** (webhook) →
2. **AI Reply Gate** (if node: checks `CUSTOMER_AI_AUTO_REPLY_ENABLED === 'true'`) →
3. **Respond** (webhook response: `triaged`)

**Purpose**: Conditionally enables AI auto-replies based on feature flag.

**Integration Point**: API routes to AI support service (OpenAI) if enabled, otherwise queues for human review.

---

### 09-Ad-Creative-Generator

**Purpose**: Creates creative brief outputs

**Trigger**: Webhook (`/ad-creative-generator`)

**Flow**:
1. **Creative Request** (webhook) →
2. **Creative Brief Rules** (set node: outputs, rules)

**Outputs**:
```
3 scripts, 10 hooks, 5 shot lists, 3 thumbnails
```

**Rules**:
```
hook in first 3-6 seconds; native UGC style
```

**Purpose**: Generates creative brief parameters for UGC Engine integration.

**Integration Point**: API passes brief to UGC Engine CLI or API for creative generation.

---

### 10-Daily-Scorecard

**Purpose**: Fetches API metrics daily

**Trigger**: Schedule (daily)

**Flow**:
1. **Daily** (schedule) →
2. **Fetch Metrics** (HTTP GET to `/metrics`)

**Purpose**: Daily metric aggregation for scorecard generation.

**Integration Point**: API returns aggregated metrics for operational dashboards.

---

### 11-Reconciliation

**Purpose**: Queues 6-hour reconciliation

**Trigger**: Schedule (every 6 hours)

**Flow**:
1. **Every 6 Hours** (schedule) →
2. **Queue Reconciliation** (HTTP POST to `/internal/reconciliation/run` with `sinceHours: 6`)

**Purpose**: Detects and recovers missed webhooks or data inconsistencies.

**Integration Point**: API compares Shopify, supplier, and internal order states, identifies gaps, and triggers correction jobs.

---

## Environment Variables

### Required for All Workflows

- `API_PUBLIC_URL`: Base URL for internal API (e.g., `https://api.shopwithin.com`)

### Optional for Specific Workflows

- `CUSTOMER_AI_AUTO_REPLY_ENABLED`: `true`/`false` (for workflow 08)
- `SHOPIFY_LIVE_WRITE_ENABLED`: `true`/`false` (for workflow 04)
- `AUTO_FULFILLMENT_ENABLED`: `true`/`false` (for workflow 05)

## Security Model

### HMAC Verification

- **Shopify Webhooks**: Raw-body HMAC SHA-256 base64 verification
- **Supplier Webhooks**: Raw-body HMAC SHA-256 hex verification
- **Flutterwave Callbacks**: `verif-hash` verification

### Credential Storage

- **n8n Credentials**: API keys, OAuth tokens stored in n8n credential manager
- **Environment Variables**: Workflow-level secrets via `$env` variables
- **Workflow JSON**: No credentials, only references to credentials or env vars

### Retry Strategy

- **Max Tries**: 3-5 depending on workflow
- **Wait Between Tries**: 5000ms (5 seconds)
- **Exponential Backoff**: Not configured (linear wait)

## Deployment

### Importing Workflows

1. Open n8n web UI
2. Go to **Workflows** → **Import from File**
3. Select workflow JSON from `/n8n/workflows/`
4. Configure webhook URLs and credentials
5. Activate workflow

### Webhook URL Configuration

Webhook URLs are configured in n8n after import. Base URL pattern:
```
https://<n8n-instance>/webhook/<workflow-path>
```

Examples:
- Product discovery: `https://n8n.shopwithin.com/webhook/product-discovery`
- Order router: `https://n8n.shopwithin.com/webhook/order-router`
- Tracking sync: `https://n8n.shopwithin.com/webhook/tracking-sync`

### Credential Setup

1. **Shopify Admin API**: OAuth 2.0 credential in n8n
2. **Supplier APIs**: API key credentials (Zendrop, etc.)
3. **Flutterwave**: API key credential
4. **Internal API**: HTTP Basic Auth or API key credential

## Monitoring

### Workflow Execution Logs

- **n8n UI**: Execution history per workflow
- **API Logs**: `/metrics` endpoint for API call metrics
- **Error Tracking**: Sentry integration for workflow failures

### Alerting

- **Failed Workflows**: Configure n8n error email notifications
- **API Failures**: Sentry alerts on 5xx errors
- **Reconciliation Gaps**: Daily report from workflow 11

## Integration with UGC Engine

### Workflow 09: Ad Creative Generator

This workflow provides creative brief parameters that integrate with the UGC Engine:

**Integration Options**:

1. **CLI Integration**:
   ```bash
   ugc generate:batch --workflow workflows/furlift-problem-first.yaml
   ```

2. **API Integration** (future):
   ```typescript
   await fetch(`${API_PUBLIC_URL}/internal/ugc/generate`, {
     method: 'POST',
     body: JSON.stringify({
       productSlug: 'furlift',
       scenes: [...],
       platforms: ['tiktok', 'reels'],
       outputVariants: 3
     })
   });
   ```

3. **Webhook Integration** (future):
   - Add webhook trigger to UGC Engine CLI
   - Workflow 09 calls UGC Engine webhook with creative brief
   - UGC Engine returns generated creative URLs

### Data Flow

```
N8N Workflow 09 (Creative Brief)
    ↓
UGC Engine Prompt Orchestrator
    ↓
Generation Driver (Browser/API/Fallback)
    ↓
Video Pipeline (FFmpeg)
    ↓
Export (TikTok/Reels/Shorts)
    ↓
Asset Manager + Registry
    ↓
N8N Workflow (Creative Upload to Shopify/Meta Ads)
```

## Troubleshooting

### Common Issues

1. **Webhook Not Triggering**: Check webhook URL configuration and workflow activation status
2. **HTTP Request Failing**: Verify `API_PUBLIC_URL` is set and API is reachable
3. **Rate Limit Errors**: Increase `Wait` node duration or reduce batch size
4. **Credential Errors**: Verify n8n credentials are correctly configured
5. **HMAC Verification Failing**: Check webhook secret configuration

### Debug Mode

Enable n8n debug logging:
```bash
export N8N_LOG_LEVEL=debug
export N8N_LOG_OUTPUT=console
```

### Test Mode

Deactivate production workflows and create test versions with:
- Different webhook paths (e.g., `/test-<path>`)
- Test API endpoints (e.g., `API_PUBLIC_URL=https://api-test.shopwithin.com`)
- Mock data in Set nodes

## Future Enhancements

### Planned Workflows

1. **12-Inventory-Sync**: Real-time inventory monitoring and low-stock alerts
2. **13-Price-Optimization**: Dynamic pricing based on competitor analysis
3. **14-Review-Aggregation**: Collect and analyze product reviews from multiple sources
4. **15-Social-Listening**: Monitor social media for brand mentions and sentiment
5. **16-UGC-Distribution**: Automatically distribute UGC creatives to social platforms

### Enhancements to Existing Workflows

- **Workflow 01**: Add TikTok API integration for trending product detection
- **Workflow 09**: Direct integration with UGC Engine API (when available)
- **Workflow 10**: Add email/sms scorecard delivery
- **Workflow 11**: Add automatic correction for detected gaps

### Automation Opportunities

- **Product Lifecycle**: Auto-archiving low-performing products after 30 days
- **Supplier Rotation**: Auto-switch suppliers on repeated fulfillment failures
- **Ad Spend Optimization**: Auto-pause ads with ROAS < 1.0 for 7 days
- **Customer Win-Back**: Auto-send win-back emails after 60 days of inactivity
