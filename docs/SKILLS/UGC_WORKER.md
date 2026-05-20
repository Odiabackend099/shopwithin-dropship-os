# Skill: UGC Worker

**Purpose:** Transform approved products into ready-to-use UGC content plans including characters, scenes, hooks, captions, and posting schedules. Connects to existing UGC Engine and Factory pipelines.

## Workflow

1. **Read approved products** from viral product finder output or manual input
2. **Select creative elements**:
   - Character identity (persona, tone, audience)
   - Scene (location, props)
   - Motion (camera movement)
   - Content angle (transformation, pain point, tutorial, etc.)
3. **Generate content plan**:
   - Hooks (4 variants)
   - Captions (3 variants)
   - CTA
   - Hashtags
   - Platform targets
   - Estimated duration
4. **Output markdown report** with all creative variants
5. **Queue for UGC Engine** to generate actual prompts and assets

## Inputs

JSON array of approved product objects with at least:
- `id` or `name`
- `category`
- `problemSolved`
- `estimatedSellPriceUsd`

## Outputs

- Markdown report with:
  - Product-specific creative plans
  - Hooks, captions, CTAs, hashtags
  - Platform targeting
  - Next steps for UGC Engine CLI
- Saved to `output/operator/ugc-worker/ugc-plan-{timestamp}.md`

## Usage

```bash
# Run with approved products input
node scripts/ugc-worker.mjs --input path/to/approved-products.json

# Dry-run to preview
node scripts/ugc-worker.mjs --input path/to/approved-products.json --dry-run

# Specify custom output path
node scripts/ugc-worker.mjs --input path/to/approved-products.json --output path/to/plan.md
```

## Risk Control

- **Read-only by default**: no posting, no Shopify writes
- **Human review required** before actual content generation
- **Safe to run daily** after product approval

## Integration Points

- **Viral Product Finder**: approved products flow as input
- **UGC Engine CLI**: `pnpm ugc:cli generate` for actual prompt generation
- **UGC Factory**: workflow for hooks, scripts, captions, master prompts
- **Posting Scheduler**: queue approved content for calendar

## Default Creative Elements

**Characters:**
- Sarah (pet-owner, casual)
- Alex (problem-solver, direct)
- Jordan (reviewer, enthusiastic)

**Scenes:**
- Kitchen counter
- Living room couch
- Bedroom bedside
- Bathroom shelf
- Car interior

**Motions:**
- Zoom in
- Pan left/right
- Slow push
- Quick cut

**Angles:**
- Before-after transformation
- Problem pain point
- Demonstration tutorial
- Comparison test
- Emotional story

## Future Enhancements

- Dynamic character/scene selection based on product category
- Integration with UGC Engine for direct prompt generation
- Auto-queue to posting scheduler
- A/B testing framework for creative variants
