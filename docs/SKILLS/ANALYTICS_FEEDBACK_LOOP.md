# Skill: Analytics Feedback Loop

**Purpose:** Ingest TikTok/Reels/Shorts metrics, classify content performance (winner/strong/promising/weak), generate recommendations for scaling or killing products, and suggest next creative tests.

## Workflow

1. **Ingest content metrics** from platform analytics or manual input
2. **Classify performance** based on:
   - Views
   - Watch time
   - CTR (click-through rate)
   - Add to cart
   - Purchases
3. **Determine tier**:
   - **Winner**: CTR >= 3%, add to cart >= 5%, purchases >= 1
   - **Strong**: CTR >= 2%, watch time >= 60%
   - **Promising**: CTR >= 1.5%, watch time >= 40%
   - **Weak**: CTR < 1% or watch time < 30%
   - **Insufficient Data**: Views < 100
4. **Generate recommendations**:
   - Scale winners
   - Optimize strong performers
   - Iterate promising content
   - Pause or kill weak content
5. **Product-level analysis** across platforms
6. **Suggest next creative tests** based on performance

## Inputs

JSON array of content metrics with:
- `content`: productName, platform, hook, angle
- `metrics`: views, watchTime, ctr, addToCart, purchases

## Outputs

- Markdown report with:
  - Summary by tier
  - Detailed winner/strong analysis
  - Product-level recommendations
  - Next creative test suggestions
- Saved to `output/operator/analytics-feedback/analytics-{timestamp}.md`

## Usage

```bash
# Run with default sample metrics (dry-run)
node scripts/analytics-feedback-loop.mjs --dry-run

# Run with custom metrics
node scripts/analytics-feedback-loop.mjs --input path/to/metrics.json

# Save report
node scripts/analytics-feedback-loop.mjs --input path/to/metrics.json --output path/to/report.md
```

## Risk Control

- **Read-only analysis**: no posting, no Shopify writes
- **Recommendations only**: human decides whether to act
- **Safe to run daily** after content posting

## Integration Points

- **Posting Scheduler**: source of content metrics
- **Analytics Tracker**: `launch/ugc-factory/ad-engine/analytics-tracker.ts`
- **UGC Worker**: feeds back into creative iteration
- **Product Research**: informs which products to scale or kill

## Performance Classification Rules

### Winner
- CTR >= 3%
- Add to cart >= 5%
- Purchases >= 1
- **Action**: Scale posting frequency, test similar products

### Strong
- CTR >= 2%
- Watch time >= 60%
- **Action**: A/B test CTAs, test posting times, similar content

### Promising
- CTR >= 1.5%
- Watch time >= 40%
- **Action**: Test different hooks, improve first 3 seconds

### Weak
- CTR < 1% OR watch time < 30%
- **Action**: Pause posting, analyze failure, test new direction

### Insufficient Data
- Views < 100
- **Action**: Wait for more data, continue posting to gather baseline

## Future Enhancements

- Direct API integration with TikTok/Instagram/YouTube analytics
- Automatic metric collection from posting scheduler
- Machine learning for better performance prediction
- Auto-trigger UGC Worker with new creative tests
- Integration with Shopify to track actual revenue
