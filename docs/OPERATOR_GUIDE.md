# AI Commerce Operator - Implementation Guide

Local Zo-style AI worker system built on Dropship OS for safe, human-supervised automation of product research, UGC generation, and content operations.

## What's Implemented

### 1. Viral Product Finder Skill
**Script:** `scripts/viral-product-finder.mjs`
**Docs:** `docs/SKILLS/VIRAL_PRODUCT_FINDER.md`

Daily read-only product research that:
- Scores candidates using Dropship OS scoring logic
- Classifies as publish_ready, draft, watch, or reject
- Generates Telegram alert templates
- Outputs markdown reports

**Usage:**
```bash
# Dry-run with sample data
pnpm operator:viral-finder --dry-run

# Run with custom candidates
pnpm operator:viral-finder --input path/to/candidates.json

# Save report
pnpm operator:viral-finder --input path/to/candidates.json --output output/operator/viral-product-finder/report.md
```

### 2. UGC Worker Skill
**Script:** `scripts/ugc-worker.mjs`
**Docs:** `docs/SKILLS/UGC_WORKER.md`

Transforms approved products into creative plans:
- Selects character, scene, motion, angle
- Generates hooks, captions, CTAs, hashtags
- Targets TikTok, Reels, Shorts, Pinterest
- Outputs markdown with UGC Engine CLI instructions

**Usage:**
```bash
# Dry-run with sample products
pnpm operator:ugc-worker --input scripts/ugc-worker-sample-input.json --dry-run

# Generate plan
pnpm operator:ugc-worker --input path/to/approved-products.json
```

### 3. Analytics Feedback Loop Skill
**Script:** `scripts/analytics-feedback-loop.mjs`
**Docs:** `docs/SKILLS/ANALYTICS_FEEDBACK_LOOP.md`

Ingests content metrics and classifies performance:
- Classifies as winner, strong, promising, weak, or insufficient_data
- Generates recommendations for scaling or killing products
- Suggests next creative tests based on performance
- Product-level analysis across platforms

**Usage:**
```bash
# Dry-run with sample metrics
pnpm operator:analytics --dry-run

# Run with custom metrics
pnpm operator:analytics --input path/to/metrics.json

# Save report
pnpm operator:analytics --input path/to/metrics.json --output path/to/report.md
```

### 4. Daily Workflow Orchestrator
**Script:** `scripts/operator-daily.mjs`

Runs the full daily pipeline:
1. Viral Product Finder (scoring candidates)
2. UGC Worker (creative plans for approved products)
3. Analytics Feedback Loop (performance analysis)

**Usage:**
```bash
# Full daily workflow (dry-run)
pnpm operator:daily --dry-run

# Skip specific steps
pnpm operator:daily --skip-finder
pnpm operator:daily --skip-ugc
pnpm operator:daily --skip-analytics

# Custom input paths
pnpm operator:daily --finder-input path/to/candidates.json --ugc-input path/to/approved-products.json --analytics-input path/to/metrics.json
```

## Daily Workflow

### Step 1: Product Research
Run viral product finder with new candidates from:
- TikTok trends
- Amazon/AliExpress research
- Competitor stores
- Google Trends

```bash
pnpm operator:viral-finder --input daily-candidates.json
```

### Step 2: Review & Approve
Review the report at `output/operator/viral-product-finder/report-{timestamp}.md`
- Check publish-ready candidates
- Verify margins, delivery, wow factor
- Manually approve candidates for UGC

### Step 3: Update UGC Input
Create approved products JSON:
```json
[
  {
    "id": "furlift",
    "name": "FurLift Pet Hair Remover",
    "category": "pet",
    "problemSolved": "Embedded pet hair on couches",
    "estimatedSellPriceUsd": 24.95
  }
]
```

### Step 4: Generate UGC Plans
```bash
pnpm operator:ugc-worker --input approved-products.json
```

### Step 5: Generate Actual Content
Use UGC Engine CLI:
```bash
pnpm ugc:cli generate --product-id furlift --character pet-owner --scene living-room
```

### Step 6: Flow AI Generation
Use the UGC Factory scripts:
```bash
node launch/ugc-factory/scripts/generate-flow-prompts.js
node launch/ugc-factory/scripts/flow-api-integration.js
```

### Step 7: Queue for Posting
Use posting scheduler:
```bash
node launch/ugc-factory/scripts/posting-automation.js
```

### Step 8: Analytics Review
After content has been live for 24-48 hours, collect metrics and run analytics feedback:
```bash
pnpm operator:analytics --input content-metrics.json
```

Review the report at `output/operator/analytics-feedback/analytics-{timestamp}.md` to:
- Identify winning content to scale
- Iterate on promising performers
- Pause or kill weak content
- Plan next creative tests

## Safety Rules

- **Read-only by default**: No Shopify writes, no supplier ordering, no payments
- **Human approval required**: For supplier vetting, product publishing, posting
- **No financial actions**: Never touches refunds, banking, fulfillment approvals
- **Safe for daily automation**: Can run via cron without risk

## Integration Points

- **Scoring logic**: `packages/core/src/scoring.ts`
- **UGC Engine**: `launch/ugc-engine/` (CLI for prompt generation)
- **UGC Factory**: `launch/ugc-factory/` (Flow AI integration, posting)
- **Shopify API**: `apps/api/src/services/shopify.ts` (future draft publishing)
- **Analytics**: `launch/ugc-factory/ad-engine/analytics-tracker.ts`

## File Structure

```
dropship-os/
├── scripts/
│   ├── viral-product-finder.mjs                # Product research skill
│   ├── ugc-worker.mjs                          # UGC generation skill
│   ├── analytics-feedback-loop.mjs            # Analytics feedback skill
│   ├── operator-daily.mjs                      # Daily orchestrator
│   ├── viral-product-finder-sample-input.json
│   ├── ugc-worker-sample-input.json
│   └── analytics-feedback-sample-input.json
├── docs/
│   ├── OPERATOR_GUIDE.md                       # This guide
│   └── SKILLS/
│       ├── VIRAL_PRODUCT_FINDER.md            # Skill documentation
│       ├── UGC_WORKER.md                      # Skill documentation
│       └── ANALYTICS_FEEDBACK_LOOP.md         # Skill documentation
├── output/
│   └── operator/
│       ├── viral-product-finder/
│       ├── ugc-worker/
│       └── analytics-feedback/
└── packages/core/src/
    └── scoring.ts                              # Shared scoring logic
```

## Next Enhancements

### Future Skills
- Competitor Monitor (browser automation)
- TikTok Growth Operator (content calendar)
- Store Optimizer (page A/B testing)

### Infrastructure
- BullMQ job queue integration
- Telegram bot for alerts/approvals
- Cron job scheduling
- Audit logging
