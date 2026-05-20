# ZOO Computer Integration Plan — Shopify Custom App

## Executive Summary

ZOO Computer will be integrated as a custom Shopify app to orchestrate the entire Dropship OS automation stack. The app will serve as the "head agent" that:
- Installs and manages skills (Agent Skills framework)
- Schedules and executes cron jobs for end-to-end automation
- Communicates via Telegram as a command center
- Integrates with UGC Engine for creative generation
- Orchestrates N8N workflows for operational automation
- Manages Shopify store operations end-to-end

**Target Platform**: Shopify App Store (Custom App)
**Base URL**: https://www.zo.computer/
**Command Center**: Telegram Bot
**Development Store**: shopwithin.myshopify.com (dev environment)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ZOO Computer (Head Agent)                 │
│                    https://zo.computer/                       │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  Shopify     │ │ Telegram │ │  Dropship OS │
│  Custom App  │ │   Bot    │ │   API        │
└──────┬───────┘ └────┬─────┘ └──────┬───────┘
       │              │               │
       │              │               │
       ▼              ▼               ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  Store Data  │ │ Commands │ │  UGC Engine  │
│  (Products,  │ │ (Chat,   │ │  (Creatives) │
│   Orders,    │ │  Alerts) │ │              │
│   Customers) │ │          │ │              │
└──────────────┘ └──────────┘ └──────────────┘
```

## Shopify Custom App Specification

### App Registration

**App Name**: ZOO Computer — Dropship OS Orchestrator
**App Type**: Custom App (public listing planned)
**Development Store**: shopwithin.myshopify.com
**Scopes Required**:
- `read_products`, `write_products` — Product management
- `read_orders`, `write_orders` — Order fulfillment
- `read_inventory`, `write_inventory` — Inventory tracking
- `read_customers`, `write_customers` — Customer management
- `read_content`, `write_content` — Content management
- `read_themes`, `write_themes` — Theme customization
- `read_script_tags`, `write_script_tags` — Frontend scripts
- `read_price_rules`, `write_price_rules` — Discount codes
- `read_checkouts`, `write_checkouts` — Checkout processing
- `read_shipping`, `write_shipping` — Shipping configuration
- `read_fulfillments`, `write_fulfillments` — Fulfillment management
- `read_locations` — Location data
- `read_reports` — Analytics access

### API Endpoints

**Base URL**: `https://api.zo.computer/v1/`

#### Endpoints

1. **POST /install**
   - Purpose: App installation webhook
   - Payload: Shop domain, access token, HMAC
   - Response: Installation confirmation, initial sync trigger

2. **GET /health**
   - Purpose: Health check
   - Response: Status, uptime, active jobs

3. **POST /skills/install**
   - Purpose: Install Agent Skill
   - Payload: Skill ID, configuration
   - Response: Installation status

4. **POST /skills/uninstall**
   - Purpose: Uninstall Agent Skill
   - Payload: Skill ID
   - Response: Uninstallation status

5. **GET /skills/list**
   - Purpose: List installed skills
   - Response: Array of skill metadata

6. **POST /cron/schedule**
   - Purpose: Schedule cron job
   - Payload: Job name, schedule (cron expression), handler
   - Response: Job ID

7. **POST /cron/unschedule**
   - Purpose: Unschedule cron job
   - Payload: Job ID
   - Response: Unschedule confirmation

8. **GET /cron/list**
   - Purpose: List scheduled jobs
   - Response: Array of job metadata

9. **POST /webhooks/shopify**
   - Purpose: Receive Shopify webhooks
   - Payload: Webhook type, topic, data, HMAC
   - Response: Acknowledgment

10. **POST /ugc/generate**
    - Purpose: Trigger UGC Engine generation
    - Payload: Product slug, scene IDs, platform, output variants
    - Response: Generation job ID, status

11. **GET /ugc/status/:jobId**
    - Purpose: Check UGC generation status
    - Response: Job status, output paths

12. **POST /n8n/trigger**
    - Purpose: Trigger N8N workflow
    - Payload: Workflow ID, parameters
    - Response: Workflow execution ID

13. **GET /n8n/status/:executionId**
    - Purpose: Check N8N workflow status
    - Response: Execution status, results

14. **POST /telegram/command**
    - Purpose: Process Telegram command
    - Payload: Command, user ID, chat ID
    - Response: Command result, response message

### Webhook Handlers

**Shopify Webhooks**:
- `app/uninstalled` — Cleanup shop data
- `orders/create` — Trigger order routing
- `orders/updated` — Update order status
- `orders/paid` — Process payment
- `products/create` — Score new product
- `products/update` — Update product data
- `inventory_levels/update` — Sync inventory
- `customers/create` — Welcome customer
- `customers/update` — Update customer data

## Telegram Command Center

### Bot Registration

**Bot Name**: @ZooComputerBot
**Bot Username**: zo_computer_bot
**Bot Token**: `TELEGRAM_BOT_TOKEN` (environment variable)
**Webhook URL**: `https://api.zo.computer/v1/telegram/webhook`

### Command Structure

#### Authentication

**/start** — Initialize chat
```
/start
→ Welcome message
→ Request shop domain
→ Verify shop has ZOO Computer app installed
→ Generate auth token
→ Link Telegram user to shop
```

**/login** — Authenticate with shop
```
/login <shop-domain>
→ Send auth link to shop admin
→ Verify via Shopify app
→ Link chat to shop
```

#### Store Operations

**/products** — List products
```
/products
→ List all products with status
→ Show inventory levels
→ Show price
→ Show fulfillment status
```

**/products sync** — Sync products from suppliers
```
/products sync
→ Trigger product discovery workflow
→ Show sync progress
→ Report new products
```

**/orders** — List recent orders
```
/orders
→ List last 10 orders
→ Show status, total, customer
→ Show fulfillment status
```

**/orders retry <order-id>** — Retry failed order
```
/orders retry 123456789
→ Trigger order retry workflow
→ Show retry status
```

**/inventory** — Check inventory levels
```
/inventory
→ Show all inventory levels
→ Alert low stock
```

#### UGC Engine Commands

**/ugc generate <product-slug>** — Generate creatives
```
/ugc generate furlift
→ Trigger UGC Engine batch generation
→ Show generation progress
→ Report output paths
```

**/ugc status** — Check UGC generation status
```
/ugc status
→ Show active generation jobs
→ Show completed jobs
→ Show failed jobs
```

**/ugc list** — List generated creatives
```
/ugc list
→ List all creatives
→ Show platform, date, file path
```

#### N8N Workflow Commands

**/workflow list** — List available workflows
```
/workflow list
→ Show all N8N workflows
→ Show status (active/inactive)
→ Show last execution time
```

**/workflow trigger <workflow-id>** — Trigger workflow
```
/workflow trigger 01-product-discovery
→ Trigger N8N workflow
→ Show execution status
```

**/workflow status <execution-id>** — Check workflow status
```
/workflow status abc123
→ Show execution status
→ Show results
```

#### Cron Job Commands

**/cron list** — List scheduled jobs
```
/cron list
→ Show all cron jobs
→ Show schedule
→ Show last run time
→ Show next run time
```

**/cron add <name> <schedule> <handler>** — Add cron job
```
/cron add "daily-product-sync" "0 9 * * *" "product-sync-handler"
→ Schedule cron job
→ Confirm job added
```

**/cron remove <job-id>** — Remove cron job
```
/cron remove 123
→ Unschedule job
→ Confirm removal
```

#### Analytics Commands

**/metrics** — Show store metrics
```
/metrics
→ Show revenue (today, week, month)
→ Show order count
→ Show average order value
→ Show conversion rate
→ Show refund rate
```

**/scorecard** — Show daily scorecard
```
/scorecard
→ Show daily metrics
→ Show operational health
→ Show alerts
```

#### Skill Commands

**/skills list** — List installed skills
```
/skills list
→ Show all Agent Skills
→ Show status
→ Show last run time
```

**/skills install <skill-id>** — Install skill
```
/skills install deep-research-report
→ Install Agent Skill
→ Show installation progress
→ Confirm installation
```

**/skills uninstall <skill-id>** — Uninstall skill
```
/skills uninstall deep-research-report
→ Uninstall Agent Skill
→ Confirm removal
```

**/skills run <skill-id>** — Run skill manually
```
/skills run deep-research-report
→ Execute skill
→ Show progress
→ Return results
```

#### System Commands

**/health** — System health check
```
/health
→ Show API status
→ Show database status
→ Show Redis status
→ Show Shopify connection status
→ Show UGC Engine status
→ Show N8N status
```

**/logs** — View recent logs
```
/logs
→ Show last 50 log entries
→ Filter by level (info, warning, error)
```

**/settings** — View settings
```
/settings
→ Show environment variables
→ Show feature flags
→ Show configuration
```

**/help** — Show help
```
/help
→ List all commands
→ Show command syntax
→ Show examples
```

### Message Types

**Text Messages** — Commands and queries
**Inline Buttons** — Quick actions (e.g., "Sync Products", "Generate UGC")
**Media Messages** — Send generated creatives (images, videos)
**Location Messages** — Not used (future: local inventory)
**Contact Messages** — Not used (future: customer support)

### Notification Types

**Order Notifications**:
- New order received
- Order paid
- Order shipped
- Order delivered
- Order failed

**Inventory Alerts**:
- Low stock warning
- Out of stock alert
- Inventory synced

**UGC Notifications**:
- UGC generation started
- UGC generation completed
- UGC generation failed
- New creative ready

**Workflow Notifications**:
- Workflow started
- Workflow completed
- Workflow failed
- Reconciliation results

**System Alerts**:
- API error
- Database error
- Rate limit warning
- Security alert

## Agent Skills Integration

### Skill Repository

**Location**: `/Agent Skills/`

**Available Skills**:
1. **01-digital-products-setup.md** — Digital products setup automation
2. **02-physical-products-printify.md** — Physical products with Printify
3. **03-klaviyo-email-flows.md** — Klaviyo email marketing flows
4. **04-vitals-conversion-tools.md** — Vitals app for conversion optimization

### Skill Installation Process

1. **Skill Definition**:
   ```markdown
   ---
   description: Skill description
   ---
   Skill implementation steps
   ```

2. **Skill Parser**:
   - Parse markdown frontmatter
   - Extract description and steps
   - Validate skill syntax
   - Generate skill metadata

3. **Skill Installer**:
   - Create skill directory
   - Copy skill files
   - Configure skill dependencies
   - Register skill in database

4. **Skill Executor**:
   - Load skill configuration
   - Execute skill steps
   - Log progress
   - Return results

### Skill Execution via Telegram

**Command**:
```
/skills run <skill-id>
```

**Process**:
1. Load skill definition
2. Validate skill prerequisites
3. Execute skill steps sequentially
4. Report progress to Telegram
5. Return final result

**Example**:
```
/skills run 01-digital-products-setup
→ Starting digital products setup...
→ Step 1: Creating digital product folder structure... ✓
→ Step 2: Configuring Shopify digital product settings... ✓
→ Step 3: Setting up delivery automation... ✓
→ Digital products setup complete!
```

## Cron Job System

### Job Scheduler

**Technology**: node-cron or BullMQ with cron plugin

**Job Storage**: Redis (for distributed execution)

**Job Types**:
1. **Product Discovery** — Every 6 hours
2. **Supplier Vetting** — On-demand
3. **AI Product Page Generation** — On-demand
4. **Shopify Draft Publishing** — On-demand
5. **Order Routing** — On webhook
6. **Tracking Sync** — On webhook
7. **Profitability Sync** — Every hour
8. **Customer Support Triage** — On webhook
9. **Ad Creative Generation** — On-demand
10. **Daily Scorecard** — Daily
11. **Reconciliation** — Every 6 hours

### Cron Expression Examples

```javascript
// Every 6 hours
"0 */6 * * *"

// Every hour
"0 * * * *"

// Daily at 9 AM
"0 9 * * *"

// Weekly on Monday at 9 AM
"0 9 * * 1"

// Monthly on 1st at 9 AM
"0 9 1 * *"
```

### Job Execution Flow

```
Cron Scheduler
    ↓
Job Triggered
    ↓
Load Job Configuration
    ↓
Execute Handler
    ↓
Log Progress
    ↓
Update Job Status
    ↓
Notify via Telegram (if configured)
```

## End-to-End Automation Flow

### Product Launch Automation

```
1. Product Discovery (Cron: Every 6 hours)
   → N8N Workflow 01 triggers
   → API scores candidates
   → High-scoring candidates queued

2. Supplier Vetting (Manual Trigger)
   → N8N Workflow 02 triggers
   → API vets suppliers
   → Approved suppliers stored

3. AI Product Page Generation (Manual Trigger)
   → N8N Workflow 03 triggers
   → API validates score
   → OpenAI generates product page
   → Draft stored in Shopify

4. UGC Creative Generation (Manual Trigger)
   → Telegram: /ugc generate <product-slug>
   → UGC Engine generates creatives
   → Assets stored in S3/CDN
   → URLs returned to Telegram

5. Shopify Draft Publishing (Manual Trigger)
   → N8N Workflow 04 triggers
   → API publishes draft
   → Product goes live
   → Notification sent to Telegram

6. Ad Campaign Setup (Manual Trigger)
   → Telegram: /workflow trigger ad-creative-generator
   → N8N Workflow 09 triggers
   → Creative brief generated
   → UGC Engine creatives attached
   → Meta Ads API campaign created
```

### Order Fulfillment Automation

```
1. Order Created (Shopify Webhook)
   → API receives webhook
   → HMAC verified
   → Order stored
   → Telegram notification sent

2. Order Paid (Shopify Webhook)
   → API receives webhook
   → Payment verified
   → Routing job queued
   → Telegram notification sent

3. Order Routing (Worker Job)
   → API selects supplier
   → Routing state created
   → Supplier API called
   → Tracking number received
   → Telegram notification sent

4. Tracking Sync (Supplier Webhook)
   → N8N Workflow 06 triggers
   → API updates tracking
   → Shopify tracking updated
   → Telegram notification sent

5. Order Delivered (Shopify Webhook)
   → API receives webhook
   → Order status updated
   → Profit snapshot calculated
   → Telegram notification sent

6. Reconciliation (Cron: Every 6 hours)
   → N8N Workflow 11 triggers
   → API compares states
   → Gaps identified
   → Corrections applied
   → Report sent to Telegram
```

## Security Model

### Authentication

**Shopify App Authentication**:
- OAuth 2.0 flow
- Access token stored in database
- Token refreshed automatically
- HMAC verification for webhooks

**Telegram Authentication**:
- Chat ID linked to shop domain
- Auth token generated per chat
- Token stored in database
- Token expires after 30 days

**API Authentication**:
- API key required for all endpoints
- API key stored in environment variables
- Rate limiting per API key
- IP whitelisting (optional)

### Authorization

**Shopify Scopes**:
- Fine-grained permissions per endpoint
- Scope validation on each request
- Scope audit logging

**Telegram Permissions**:
- User role per shop (admin, operator, viewer)
- Role-based command access
- Audit logging for all commands

### Data Encryption

**At Rest**:
- Database encryption (AES-256)
- Environment variables encrypted
- Secrets stored in vault (HashiCorp Vault or AWS Secrets Manager)

**In Transit**:
- HTTPS/TLS 1.3
- Certificate pinning
- HMAC verification for webhooks

### Audit Logging

**Events Logged**:
- All API requests
- All Telegram commands
- All cron job executions
- All skill installations/executions
- All Shopify webhook events
- All N8N workflow triggers

**Log Storage**:
- Structured JSON logs
- Stored in Supabase or sent to Sentry
- Retention policy: 90 days
- Searchable by shop, user, event type

## Deployment Architecture

**ZOO Computer API**:
- **Platform**: Supabase Edge Functions or Vercel
- **Runtime**: Node.js >= 20
- **Database**: Supabase PostgreSQL (managed)
- **Auth**: Supabase Auth (built-in)
- **Storage**: Supabase Storage (built-in)
- **Real-time**: Supabase Real-time (built-in)

**Dropship OS API**:
- **Platform**: Supabase Edge Functions or Vercel
- **Database**: Supabase PostgreSQL (managed)
- **Cache**: Supabase Real-time or Redis (optional)
- **Storage**: Supabase Storage (built-in)

**N8N**:
- **Platform**: Supabase Edge Functions or self-hosted
- **Database**: Supabase PostgreSQL
- **Credentials**: Encrypted in n8n credential store

**Telegram Bot**:
- **Platform**: Hosted on Supabase Edge Functions
- **Webhook**: HTTPS endpoint on Supabase Edge Functions
- **Webhook Secret**: Environment variable

### Environment Variables

**ZOO Computer API**:
```bash
# Shopify
SHOPIFY_API_KEY=<shopify-api-key>
SHOPIFY_API_SECRET=<shopify-api-secret>
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,...

# Telegram
TELEGRAM_BOT_TOKEN=<telegram-bot-token>
TELEGRAM_WEBHOOK_SECRET=<webhook-secret>

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
SUPABASE_STORAGE_URL=https://xxxxxxxxxxxxx.supabase.co/storage/v1/object

# Dropship OS API
DROPSHIP_OS_API_URL=https://api.shopwithin.com
DROPSHIP_OS_API_KEY=<api-key>

# UGC Engine
UGC_ENGINE_API_URL=https://ugc.shopwithin.com
UGC_ENGINE_API_KEY=<api-key>

# N8N
N8N_API_URL=https://n8n.shopwithin.com
N8N_API_KEY=<api-key>

# Security
JWT_SECRET=<jwt-secret>
ENCRYPTION_KEY=<encryption-key>

# Monitoring
SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=info
```

### Deployment Steps

1. **Infrastructure Setup**:
   - Create Supabase project at https://supabase.com
   - Configure PostgreSQL database
   - Enable Supabase Auth
   - Create storage buckets (ugc-assets, product-images, documents)
   - Configure environment variables

2. **Application Deployment**:
   - Push code to GitHub
   - Deploy to Vercel (API and Admin)
   - Or deploy to Supabase Edge Functions
   - Configure build settings
   - Deploy application

3. **Shopify App Registration**:
   - Create custom app in Shopify Admin
   - Configure app URL and redirect URLs
   - Set required scopes
   - Generate API credentials

4. **Telegram Bot Setup**:
   - Create bot via BotFather
   - Set bot token in environment variables
   - Configure webhook URL
   - Test webhook connection

5. **N8N Integration**:
   - Import workflows from `/n8n/workflows/`
   - Configure API credentials
   - Set webhook URLs
   - Activate workflows

6. **Testing**:
   - Test Shopify app installation
   - Test Telegram authentication
   - Test all commands
   - Test webhook handlers
   - Test cron jobs
   - Test skill installation/execution

## Monitoring & Observability

### Metrics

**Application Metrics**:
- Request rate
- Response time
- Error rate
- Active cron jobs
- Skill execution count
- Telegram message count

**Business Metrics**:
- Products discovered
- Orders processed
- UGC creatives generated
- N8N workflows executed
- Revenue generated

### Logging

**Log Levels**:
- ERROR: Critical errors requiring immediate attention
- WARN: Warning signs of potential issues
- INFO: Normal operational events
- DEBUG: Detailed debugging information

**Log Destinations**:
- Console (development)
- Supabase (production logs)
- Sentry (error tracking)


### Alerting

**Alert Channels**:
- Email (on-call team)
- Slack (operational team)
- Telegram (store operators)

**Alert Conditions**:
- API error rate > 5%
- Database connection failures
- Supabase rate limits
- Shopify API rate limits
- Telegram bot unreachable
- Cron job failures
- UGC Engine failures
- N8N workflow failures

## Cost Estimation

### Infrastructure Costs (Monthly)

**Supabase** (estimated):
- Database (PostgreSQL): $0-25 (Free tier: 500MB, Pro: 8GB for $25)
- Auth: $0-25 (Free tier: 50,000 MAU, Pro: 100,000 MAU for $25)
- Storage: $0-5 (Free tier: 1GB, Pro: $0.021/GB)
- Edge Functions: $0-2 (Free tier: 500K invocations, Pro: $2/1M invocations)
- **Total**: $0-57/month (Free tier: $0, Pro tier: $57)

**Vercel** (for API and Admin hosting):
- Hobby: $0/month (100GB bandwidth, 6GB build output)
- Pro: $20/month (1TB bandwidth, unlimited builds)
- **Total**: $0-20/month

**Alternative: AWS** (estimated):
- RDS (db.t3.micro): $15-25
- ElastiCache (cache.t3.micro): $15-25
- ECS (t3.small): $20-30
- S3 (100GB): $2.30
- CloudFront (1TB transfer): $85
- **Total**: $137-167/month

### Shopify App Costs

**Custom App**: Free
**Public App Listing**: $0 (no listing fee)
**Revenue Share**: 0% (custom app, no Shopify commission)

### Telegram Bot Costs

**Bot API**: Free
**Storage**: Free (no media storage in Telegram)
**Bandwidth**: Free (included in API)

### UGC Engine Costs

**API Usage**: $5-50/month (depending on volume)
**Fallback Driver**: Free (FFmpeg only)

### N8N Costs

**Self-hosted**: Free (infrastructure only)
**Cloud**: $20-100/month (depending on plan)

### Total Estimated Monthly Cost

**Minimum**: $0-20/month (Supabase free tier + Vercel Hobby, free services)
**Typical**: $20-77/month (Supabase Pro + Vercel Pro + API usage)
**Maximum**: $157-327/month (AWS + high API usage)

## Success Metrics

### Technical Metrics

- **Uptime**: >99.9%
- **Response Time**: <500ms p95
- **Error Rate**: <1%
- **Cron Job Success Rate**: >99%
- **Telegram Bot Response Time**: <2s

### Operational Metrics

- **Products Discovered**: 10-50/week
- **Orders Processed**: 100-1000/month
- **UGC Creatives Generated**: 50-200/month
- **N8N Workflows Executed**: 100-500/day
- **Telegram Commands Processed**: 100-500/day

### Business Metrics

- **Revenue Growth**: 20-50% month-over-month
- **Order Processing Time**: <5 minutes
- **Creative Generation Time**: <10 minutes
- **Customer Satisfaction**: >4.5/5
- **Cost Savings**: 90% vs manual operations

## Timeline

### Phase 1: Foundation (Week 1-2)
- Shopify custom app registration
- Basic API endpoints
- Telegram bot setup
- Authentication flow
- Database schema

### Phase 2: Integration (Week 3-4)
- Shopify webhook handlers
- Dropship OS API integration
- UGC Engine integration
- N8N workflow integration
- Skill system implementation

### Phase 3: Automation (Week 5-6)
- Cron job system
- Skill execution engine
- End-to-end workflows
- Testing and debugging
- Documentation

### Phase 4: Launch (Week 7-8)
- Production deployment
- Monitoring setup
- Alert configuration
- User training
- Go-live

## Risks & Mitigation

### Technical Risks

**Risk**: Shopify API rate limits
**Mitigation**: Implement exponential backoff, queue requests, monitor rate limit headers

**Risk**: Telegram bot blocked
**Mitigation**: Use official API, comply with terms of service, implement rate limiting

**Risk**: Database connection failures
**Mitigation**: Implement connection pooling, retry logic, health checks

**Risk**: Cron job failures
**Mitigation**: Implement dead letter queue, alert on failures, manual retry capability

### Business Risks

**Risk**: Shopify app approval delays
**Mitigation**: Start with custom app, apply for public listing later

**Risk**: User adoption low
**Mitigation**: Provide excellent documentation, offer training, responsive support

**Risk**: Cost overruns
**Mitigation**: Monitor usage, implement usage caps, optimize infrastructure

## Next Steps

1. **Create Shopify custom app** in development store
2. **Register Telegram bot** via BotFather
3. **Set up Railway project** with PostgreSQL and Redis
4. **Implement basic API** with authentication
5. **Implement Telegram bot** with basic commands
6. **Integrate with Dropship OS API**
7. **Integrate with UGC Engine**
8. **Import and configure N8N workflows**
9. **Implement skill system**
10. **Implement cron job system**
11. **Test end-to-end workflows**
12. **Deploy to production**
13. **Monitor and iterate**
