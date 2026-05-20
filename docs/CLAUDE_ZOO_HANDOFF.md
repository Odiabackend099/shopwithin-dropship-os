# Dropship OS — Complete Handoff Document for Claude/ZOO Computer

## Project Overview

**Repository**: `/Users/mac/Desktop/Risewithin Shopify/dropship-os/`
**Primary Business**: Nigeria-based Shopify dropshipping operator selling globally with USD checkout
**Payment Gateway**: Flutterwave (primary)
**Validation Budget**: NGN 50,000 (strict)
**Launch Budget**: NGN 10,000 domain/tools + NGN 10,000 AI + NGN 20,000 TikTok + NGN 10,000 buffer

## What Has Been Built

### 1. Core Dropship OS (Monorepo)

**Location**: `/dropship-os/`

**Components**:
- **`packages/core/`**: Shared TypeScript library for scoring, profitability, supplier routing, HMAC verification, retry policy, ad kill-switches, NGN budget gating
- **`apps/api/`**: Fastify API for Shopify/Flutterwave/supplier webhooks, internal operations, metrics, Shopify writes, job enqueueing
- **`apps/admin/`**: Next.js internal dashboard for validation, traffic gates, order/ops status, lean budget control
- **`apps/api/prisma/`**: Database schema for candidates, suppliers, products, orders, jobs, events, profit, audit logs
- **`n8n/workflows/`**: 11 credential-free workflow exports (product discovery, supplier vetting, AI product page generation, Shopify draft publishing, order routing, tracking sync, profitability, support triage, creatives, scorecards, reconciliation)
- **`infra/shopify-theme/`**: Lean Shopify Online Store 2.0 product-page theme assets

**Status**: Production-ready, deployed to Railway

**Documentation**:
- `/docs/ARCHITECTURE.md` — System architecture
- `/docs/N8N_WORKFLOWS.md` — Workflow overview
- `/docs/N8N_WORKFLOWS_DETAILED.md` — Detailed workflow documentation

### 2. UGC Engine (Phase 1 Complete)

**Location**: `/dropship-os/launch/ugc-engine/`

**Purpose**: Production-grade AI UGC content generation factory for TikTok/Reels/Shorts ecommerce creatives

**Status**: Phase 1 Complete — Browser-automation-first implementation with clean API migration path

**Components**:
- **`src/config/`**: Environment variables, product definitions (FurLift)
- **`src/schemas/`**: Zod schemas for characters, scenes, prompts, metadata
- **`src/characters/`**: Character identity engine, persistence, cloning
- **`src/scenes/`**: Scene registry (7 scene types: couch-cleaning, car-seat-cleaning, before-after, unboxing, testimonial, selfie, pet-interaction)
- **`src/prompts/`**: Template library (7 image + 3 video templates), orchestrator with anti-repetition logic
- **`src/generation/`**: Driver interface with 4 implementations (fallback, browser, API, mock)
- **`src/video/`**: FFmpeg pipeline (vertical formatting, subtitle burn-in, CTA overlay, thumbnail extraction)
- **`src/assets/`**: Asset manager, content registry, export indexer
- **`src/qa/`**: Export validation via FFprobe
- **`src/tracking/`**: Cost estimation, usage logging (JSONL)
- **`src/cli.ts`**: CLI with 10 commands (character, UGC, batch, hooks, captions, exports)
- **`workflows/`**: 4 YAML workflow examples for FurLift campaigns
- **`src/tests/`**: Vitest test suite (17 tests passing, 2 skipped due to system font dependency)

**Build Status**: ✅ Compiles successfully
**Test Status**: ✅ 17 tests passing, 2 skipped (subtitle burn-in and smoke test due to FFmpeg drawtext font dependency)

**Documentation**:
- `/launch/ugc-engine/docs/ARCHITECTURE.md`
- `/launch/ugc-engine/docs/SETUP.md`
- `/launch/ugc-engine/docs/API-CONFIG.md`
- `/launch/ugc-engine/docs/TROUBLESHOOTING.md`
- `/launch/ugc-engine/docs/WORKFLOWS.md`
- `/launch/ugc-engine/docs/PROMPT-ENGINEERING.md`
- `/launch/ugc-engine/docs/COST-OPTIMIZATION.md`
- `/launch/ugc-engine/docs/CONSISTENCY.md`
- `/docs/UGC_ENGINE_PRD.md` — Complete PRD

**CLI Commands**:
```bash
# Character management
ugc generate:character --id <id> --name <name> [options]

# Single generation
ugc generate:ugc --product <slug> --scene <id> --type <image|video> \
  --platform <tiktok|reels|shorts|spark> --character <id>

# Batch workflow
ugc generate:batch --workflow <path-to-yaml>

# Hook/CTA libraries
ugc generate:hooks --product <slug>
ugc generate:captions --product <slug>

# Export commands
ugc export:tiktok --input <path> --subtitle <lines...> --cta <text>
ugc export:reels --input <path> --subtitle <lines...> --cta <text>
ugc export:shorts --input <path> --subtitle <lines...> --cta <text>
```

**Cost Model**:
- Image: $0.04 (API driver)
- Video: $0.50 (API driver)
- Fallback driver: Free (FFmpeg only)

**Current Product**: FurLift (SKU: VLOY30HZN) — reusable pet hair detailer

### 3. Agent Skills

**Location**: `/Agent Skills/`

**Available Skills**:
1. **01-digital-products-setup.md** — Digital products setup automation
2. **02-physical-products-printify.md** — Physical products with Printify
3. **03-klaviyo-email-flows.md** — Klaviyo email marketing flows
4. **04-vitals-conversion-tools.md** — Vitals app for conversion optimization

**Purpose**: Reusable automation templates that ZOO Computer can install and execute

## What Needs to Be Built (ZOO Computer)

### ZOO Computer — Shopify Custom App

**Purpose**: Head agent that orchestrates the entire Dropship OS automation stack

**Target**: Shopify Custom App (future: Public App Store listing)
**Base URL**: https://www.zo.computer/
**Command Center**: Telegram Bot (@ZooComputerBot)
**Development Store**: shopwithin.myshopify.com

**Complete Specification**: `/docs/ZOO_COMPUTER_INTEGRATION.md`

### Key Features to Implement

1. **Shopify Custom App**
   - OAuth 2.0 authentication
   - Webhook handlers (orders, products, inventory, customers)
   - API endpoints for all operations
   - Admin dashboard (optional)

2. **Telegram Bot**
   - Authentication via shop domain
   - Command interface (20+ commands)
   - Notifications (orders, inventory, UGC, workflows)
   - Inline buttons for quick actions

3. **API Endpoints**
   - `/skills/install`, `/skills/uninstall`, `/skills/list`, `/skills/run`
   - `/cron/schedule`, `/cron/unschedule`, `/cron/list`
   - `/ugc/generate`, `/ugc/status`
   - `/n8n/trigger`, `/n8n/status`
   - `/telegram/command`
   - `/webhooks/shopify`

4. **Skill System**
   - Parse Agent Skills markdown files
   - Install/uninstall skills
   - Execute skill steps
   - Log progress and results

5. **Cron Job System**
   - Job scheduler (node-cron or BullMQ)
   - Job storage (Redis)
   - Job execution handlers
   - Job status tracking

6. **Integrations**
   - Dropship OS API (existing)
   - UGC Engine (existing)
   - N8N (existing)
   - Shopify Admin API
   - Telegram Bot API

## How to Proceed with ZOO Computer

### Step 1: Research & Planning

**Task**: Research documentation, best practices, use cases, existing real-world solutions

**Resources**:
- Shopify App Development Guide: https://shopify.dev/docs/apps
- Telegram Bot API: https://core.telegram.org/bots/api
- N8N API: https://docs.n8n.io/api/
- Node.js Cron: https://www.npmjs.com/package/node-cron
- BullMQ: https://docs.bullmq.io/

**Best Practices**:
- Use environment variables for all secrets
- Implement HMAC verification for webhooks
- Use rate limiting for API calls
- Implement exponential backoff for retries
- Log all operations for audit trails
- Use structured logging (JSON)
- Implement health checks
- Use database transactions for data consistency

**Existing Solutions**:
- Shopify CLI for app scaffolding
- Shopify App Bridge for admin UI
- Telegraf.js for Telegram bot framework
- node-cron for job scheduling
- BullMQ for distributed job queues

### Step 2: Infrastructure Setup

**Platform**: Railway (recommended for simplicity) or AWS

**Required Services**:
- PostgreSQL (database)
- Redis (cache and job queue)
- Node.js application runtime

**Environment Variables**:
```bash
# Shopify
SHOPIFY_API_KEY=<shopify-api-key>
SHOPIFY_API_SECRET=<shopify-api-secret>
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,...

# Telegram
TELEGRAM_BOT_TOKEN=<telegram-bot-token>
TELEGRAM_WEBHOOK_SECRET=<webhook-secret>

# Database
DATABASE_URL=<postgresql-url>

# Redis
REDIS_URL=<redis-url>

# Dropship OS API
DROPSHIP_OS_API_URL=https://api.shopwithin.com
DROPSHIP_OS_API_KEY=<api-key>

# UGC Engine
UGC_ENGINE_API_URL=https://ugc.shopwithin.com
UGC_ENGINE_API_KEY=<api-key>

# N8N
N8N_API_URL=https://n8n.shopwithin.com
N8N_API_KEY=<api-key>

# Storage
S3_BUCKET_NAME=<bucket-name>
S3_ACCESS_KEY=<access-key>
S3_SECRET_KEY=<secret-key>
S3_REGION=<region>

# Security
JWT_SECRET=<jwt-secret>
ENCRYPTION_KEY=<encryption-key>

# Monitoring
SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=info
```

### Step 3: Shopify App Registration

1. Go to Shopify Partners: https://partners.shopify.com/
2. Create new app: "ZOO Computer — Dropship OS Orchestrator"
3. Select "Custom App"
4. Configure app URL: `https://api.zo.computer`
5. Configure redirect URLs: `https://api.zo.computer/auth/callback`
6. Set required scopes (see ZOO_COMPUTER_INTEGRATION.md)
7. Generate API credentials
8. Install app on development store: shopwithin.myshopify.com

### Step 4: Telegram Bot Registration

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Set bot name: "ZOO Computer"
4. Set bot username: `zo_computer_bot`
5. Receive bot token
6. Set bot token in environment variables
7. Configure webhook URL: `https://api.zo.computer/v1/telegram/webhook`

### Step 5: Application Development

**Tech Stack**:
- **Runtime**: Node.js >= 20
- **Framework**: Fastify (same as Dropship OS API)
- **ORM**: Prisma (same as Dropship OS API)
- **Queue**: BullMQ (with Redis)
- **Validation**: Zod (same as Dropship OS API)
- **Testing**: Vitest (same as UGC Engine)
- **CLI**: Commander (same as UGC Engine)
- **Telegram**: node-telegram-bot-api or Telegraf

**Project Structure**:
```
/zo-computer/
├── package.json
├── tsconfig.json
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── shopify.ts
│   ├── db/
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── client.ts
│   ├── auth/
│   │   ├── shopify.ts
│   │   ├── telegram.ts
│   │   └── jwt.ts
│   ├── api/
│   │   ├── app.ts
│   │   ├── routes/
│   │   │   ├── health.ts
│   │   │   ├── skills.ts
│   │   │   ├── cron.ts
│   │   │   ├── ugc.ts
│   │   │   ├── n8n.ts
│   │   │   ├── telegram.ts
│   │   │   └── webhooks.ts
│   │   └── middleware/
│   ├── skills/
│   │   ├── parser.ts
│   │   ├── installer.ts
│   │   ├── executor.ts
│   │   └── registry.ts
│   ├── cron/
│   │   ├── scheduler.ts
│   │   ├── jobs.ts
│   │   └── handlers/
│   ├── telegram/
│   │   ├── bot.ts
│   │   ├── commands/
│   │   ├── handlers/
│   │   └── notifications/
│   ├── integrations/
│   │   ├── dropship-os.ts
│   │   ├── ugc-engine.ts
│   │   ├── n8n.ts
│   │   └── shopify.ts
│   └── cli.ts
├── prisma/
│   └── schema.prisma
├── tests/
└── docs/
```

### Step 6: Implementation Priority

**Phase 1: Foundation (Week 1-2)**
1. Project scaffolding
2. Database schema (shops, users, skills, jobs, logs)
3. Authentication (Shopify OAuth, Telegram auth)
4. Basic API endpoints (health, install)
5. Telegram bot setup
6. Webhook configuration

**Phase 2: Integrations (Week 3-4)**
1. Dropship OS API client
2. UGC Engine client
3. N8N API client
4. Shopify Admin API client
5. Integration tests

**Phase 3: Skills & Cron (Week 5-6)**
1. Skill parser (markdown to executable)
2. Skill installer
3. Skill executor
4. Cron scheduler
5. Job handlers for existing workflows

**Phase 4: Telegram Commands (Week 7-8)**
1. Authentication commands (/start, /login)
2. Store commands (/products, /orders, /inventory)
3. UGC commands (/ugc generate, /ugc status)
4. Workflow commands (/workflow list, /workflow trigger)
5. Cron commands (/cron list, /cron add, /cron remove)
6. Skill commands (/skills list, /skills install, /skills run)
7. Analytics commands (/metrics, /scorecard)
8. System commands (/health, /logs, /settings, /help)

**Phase 5: Notifications (Week 9)**
1. Order notifications
2. Inventory alerts
3. UGC notifications
4. Workflow notifications
5. System alerts

**Phase 6: Testing & Launch (Week 10)**
1. End-to-end testing
2. Load testing
3. Security audit
4. Documentation
5. Production deployment
6. Monitoring setup
7. Go-live

### Step 7: Testing Strategy

**Unit Tests**:
- Skill parser
- Skill installer
- Skill executor
- Cron scheduler
- API endpoints
- Telegram command handlers

**Integration Tests**:
- Shopify OAuth flow
- Telegram authentication
- Dropship OS API integration
- UGC Engine integration
- N8N integration
- Webhook handlers

**End-to-End Tests**:
- Product launch workflow
- Order fulfillment workflow
- UGC generation workflow
- Skill installation and execution
- Cron job scheduling and execution

**Manual Testing**:
- Install Shopify app on dev store
- Link Telegram account
- Test all Telegram commands
- Trigger all N8N workflows
- Install and execute Agent Skills
- Schedule cron jobs
- Monitor logs and metrics

## Key Files for Reference

### Dropship OS Core
- `/dropship-os/apps/api/src/app.ts` — Fastify app structure
- `/dropship-os/apps/api/src/routes/internal.ts` — Internal API endpoints
- `/dropship-os/apps/api/src/routes/webhooks.ts` — Webhook handlers
- `/dropship-os/packages/core/src/index.ts` — Shared library exports
- `/dropship-os/apps/api/prisma/schema.prisma` — Database schema

### UGC Engine
- `/dropship-os/launch/ugc-engine/src/cli.ts` — CLI implementation
- `/dropship-os/launch/ugc-engine/src/config/products.ts` — Product definitions
- `/dropship-os/launch/ugc-engine/src/prompts/orchestrator.ts` — Prompt generation
- `/dropship-os/launch/ugc-engine/src/generation/fallback.ts` — Fallback driver
- `/dropship-os/launch/ugc-engine/src/video/ffmpeg.ts` — FFmpeg wrapper
- `/dropship-os/launch/ugc-engine/package.json` — Dependencies

### N8N Workflows
- `/dropship-os/n8n/workflows/01-product-discovery.json`
- `/dropship-os/n8n/workflows/05-order-router.json`
- `/dropship-os/n8n/workflows/09-ad-creative-generator.json`
- `/dropship-os/n8n/workflows/11-reconciliation.json`

### Agent Skills
- `/Agent Skills/01-digital-products-setup.md`
- `/Agent Skills/02-physical-products-printify.md`
- `/Agent Skills/03-klaviyo-email-flows.md`
- `/Agent Skills/04-vitals-conversion-tools.md`

### Documentation
- `/dropship-os/docs/ARCHITECTURE.md`
- `/dropship-os/docs/N8N_WORKFLOWS.md`
- `/dropship-os/docs/N8N_WORKFLOWS_DETAILED.md`
- `/dropship-os/docs/UGC_ENGINE_PRD.md`
- `/dropship-os/docs/ZOO_COMPUTER_INTEGRATION.md`

## Environment Setup

### Prerequisites

- Node.js >= 20.11.0
- pnpm >= 9.0.0
- FFmpeg >= 6.0 (for UGC Engine)
- PostgreSQL (for Dropship OS API and ZOO Computer)
- Redis (for Dropship OS API and ZOO Computer)

### Dropship OS Setup

```bash
cd /Users/mac/Desktop/Risewithin\ Shopify/dropship-os
pnpm install
cp .env.example .env
# Configure environment variables
docker compose up -d postgres redis
pnpm run db:migrate
pnpm --filter @dropship-os/api dev
pnpm --filter @dropship-os/admin dev
```

### UGC Engine Setup

```bash
cd /Users/mac/Desktop/Risewithin\ Shopify/dropship-os/launch/ugc-engine
pnpm install
cp .env.example .env
# Configure environment variables
pnpm build
pnpm test
# Run CLI
node dist/cli.js --help
```

### ZOO Computer Setup (Future)

```bash
# Clone new repository or create new workspace
cd /Users/mac/Desktop/Risewithin\ Shopify/zo-computer
pnpm init
# Follow implementation steps above
```

## Current System Status

### Dropship OS
- ✅ API deployed to Railway
- ✅ Admin dashboard deployed to Vercel
- ✅ Database schema migrated
- ✅ N8N workflows exported
- ✅ Shopify webhooks configured
- ✅ Flutterwave integration configured

### UGC Engine
- ✅ Phase 1 complete
- ✅ All core modules implemented
- ✅ CLI functional
- ✅ Tests passing (17/19, 2 skipped)
- ✅ Documentation complete
- ✅ Example workflows created
- ⏳ Phase 2 (API integration) pending
- ⏳ Phase 3 (advanced features) pending
- ⏳ Phase 4 (commercialization) pending

### N8N Workflows
- ✅ 11 workflows exported
- ✅ Credential-free design
- ✅ Retry logic configured
- ✅ Batching patterns implemented
- ⏳ Workflows need to be imported to n8n instance
- ⏳ Credentials need to be configured

### Agent Skills
- ✅ 4 skills defined
- ✅ Markdown format established
- ⏳ Skill parser not implemented
- ⏳ Skill installer not implemented
- ⏳ Skill executor not implemented

### ZOO Computer
- ⏳ Not started
- ⏳ Needs full implementation
- ⏳ See ZOO_COMPUTER_INTEGRATION.md for complete spec

## Next Actions for ZOO Computer

### Immediate (This Week)

1. **Research Phase**
   - Read Shopify App Development Guide
   - Read Telegram Bot API documentation
   - Research existing Shopify automation apps
   - Research Telegram bot best practices
   - Study existing Agent Skills format

2. **Planning Phase**
   - Create detailed implementation plan
   - Define database schema
   - Define API endpoints
   - Define Telegram commands
   - Define cron jobs
   - Create project timeline

3. **Infrastructure Phase**
   - Create Railway project
   - Provision PostgreSQL
   - Provision Redis
   - Configure environment variables
   - Set up monitoring (Sentry)

### Short-Term (Next 2 Weeks)

1. **Foundation Phase**
   - Scaffold project
   - Set up database schema
   - Implement authentication
   - Set up Telegram bot
   - Implement basic API endpoints

2. **Integration Phase**
   - Integrate with Dropship OS API
   - Integrate with UGC Engine
   - Integrate with N8N
   - Test all integrations

### Medium-Term (Next 4 Weeks)

1. **Features Phase**
   - Implement skill system
   - Implement cron system
   - Implement Telegram commands
   - Implement notifications

2. **Testing Phase**
   - Unit tests
   - Integration tests
   - End-to-end tests
   - Manual testing

### Long-Term (Next 8 Weeks)

1. **Launch Phase**
   - Production deployment
   - Monitoring setup
   - Documentation
   - User training

2. **Optimization Phase**
   - Performance optimization
   - Cost optimization
   - Feature enhancements
   - User feedback integration

## Important Notes

### Safety Defaults

Dropship OS has safety defaults that must be respected:
- `AUTO_FULFILLMENT_ENABLED=false`
- `PAID_ADS_ENABLED=false`
- `AI_AUTO_PUBLISH_ENABLED=false`
- `SHOPIFY_LIVE_WRITE_ENABLED=false`
- `SUPPLIER_AUTO_PAY_ENABLED=false`

Do not enable live supplier ordering until test payments, idempotent webhooks, supplier routing, and tracking sync pass staging.

### Budget Constraints

- Validation budget: NGN 50,000 (strict)
- Launch budget: NGN 10,000 + NGN 10,000 + NGN 20,000 + NGN 10,000 = NGN 50,000
- Paid cold testing blocked until organic validation
- Approved cold tests capped at NGN 5,000/day

### Lean Launch Rule

The first goal is not profit. The first goal is finding one product that people click and buy.

### Fulfillment Rule

Zendrop is operated through its supported Shopify-connected workflow. The OS records and verifies the Zendrop product link, order visibility, approval, and tracking lifecycle, but it does not invent an unsupported Zendrop order-placement API or silently spend supplier money.

## Contact & Support

**Repository**: `/Users/mac/Desktop/Risewithin Shopify/dropship-os/`
**Documentation**: `/dropship-os/docs/`
**UGC Engine**: `/dropship-os/launch/ugc-engine/`
**N8N Workflows**: `/dropship-os/n8n/workflows/`
**Agent Skills**: `/Agent Skills/`

## Summary

You have a complete, production-ready Dropship OS with:
- ✅ Core API and admin dashboard
- ✅ Database schema and migrations
- ✅ N8N workflow automation
- ✅ UGC Engine (Phase 1 complete)
- ✅ Agent Skills framework (defined)

You need to build:
- ⏳ ZOO Computer (Shopify custom app with Telegram command center)
- ⏳ Skill system implementation
- ⏳ Cron job system
- ⏳ Telegram bot with 20+ commands
- ⏳ Integration with all existing components

All documentation is complete. Follow the ZOO_COMPUTER_INTEGRATION.md specification for implementation details.

Good luck! 🚀
