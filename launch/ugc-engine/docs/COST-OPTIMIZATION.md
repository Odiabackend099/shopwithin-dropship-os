# Cost Optimization

## Default Cost Model

| Asset Type | Base Cost | Retry Cost |
|------------|-----------|------------|
| Image | $0.04 | $0.02 |
| Video | $0.50 | $0.10 |
| FFmpeg processing | ~$0.001/min | — |

## Cost Controls

1. **Daily Cap**: `UGC_DAILY_GENERATION_CAP=50` limits generations per day
2. **Driver Selection**: Use `fallback` or `mock` for testing; switch to `api` only for production
3. **Batch Efficiency**: One workflow batch generates multiple variants from the same scene/hook combo
4. **Retry Limits**: `UGC_RETRY_MAX_ATTEMPTS=5` prevents infinite retry loops

## Monitoring

Usage is logged to `generated/tracking/usage.jsonl`. Query stats:

```typescript
import { UsageTracker } from "./src/tracking/usage.js";
const tracker = new UsageTracker("generated/tracking");
console.log(tracker.statsByDriver());
console.log(tracker.totalCostUsd());
```

## Reducing Spend

- Generate images first to validate prompts before video generation
- Use the fallback driver to preview motion/composition before paying for API generation
- Reuse the same character across many scenes to amortize consistency setup
