# Skill: Viral Product Finder

**Purpose:** Daily read-only research to find viral product candidates from TikTok, Amazon, AliExpress, Meta Ads Library, competitor stores, and Google Trends. Score candidates and send Telegram alerts for human approval before supplier vetting.

## Workflow

1. **Search trend sources** (manual or via Zo/browser automation)
2. **Extract candidate data**:
   - Product name
   - Category
   - Source URL
   - Problem solved
   - Viral evidence hooks
   - Estimated sell price
   - Estimated product cost
   - Estimated shipping cost
   - Estimated delivery days
   - Wow factor (0-100)
   - Creative ease (0-100)
   - Demand velocity (0-100)
   - Trend longevity (0-100)
   - Competition (0-100)
   - Ad saturation (0-100)
   - Risk penalties (0-100)
3. **Score candidate** using Dropship OS scoring logic
4. **Classify decision**: publish_ready, draft, watch, reject
5. **Generate report** with Telegram alert template
6. **Queue approved candidates** for supplier vetting workflow

## Inputs

JSON array of candidate objects. See `scripts/viral-product-finder-sample-input.json` for format.

## Outputs

- Markdown report with:
  - Summary by decision
  - Detailed candidate cards
  - Telegram alert template
- Saved to `output/operator/viral-product-finder/report-{timestamp}.md`

## Usage

```bash
# Run with default sample candidates (dry-run)
node scripts/viral-product-finder.mjs --dry-run

# Run with custom input file
node scripts/viral-product-finder.mjs --input path/to/candidates.json

# Run and save report
node scripts/viral-product-finder.mjs --input path/to/candidates.json --output output/operator/viral-product-finder/report.md
```

## Risk Control

- **Read-only by default**: no Shopify writes, no supplier ordering
- **Human approval required** before supplier vetting
- **No financial actions**: never touches payments or refunds
- **Safe to run daily** via cron or manual trigger

## Integration Points

- **Scoring logic**: `packages/core/src/scoring.ts` (calculateProductScore)
- **Supplier vetting**: existing n8n workflow
- **UGC pipeline**: approved products flow to UGC Engine
- **Telegram alerts**: future bot integration

## Future Enhancements

- Browser automation to scrape competitor stores
- TikTok trend monitoring via API
- Google Trends integration
- Auto-enqueue to BullMQ for supplier vetting
- Direct Telegram bot posting
