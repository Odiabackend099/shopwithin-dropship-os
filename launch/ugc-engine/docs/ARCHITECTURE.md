# UGC Engine Architecture

## Overview

The `@dropship-os/ugc-engine` is a browser-automation-first, API-migration-ready AI UGC content factory. It generates consistent TikTok/Reels/Shorts ecommerce creatives using a modular pipeline architecture.

## System Diagram

```
CLI / Workflow YAML
    |
    v
Prompt Orchestrator  --->  Character Identity Engine  --->  Scene Registry
    |                              |                              |
    |                              v                              v
    +-------------------->  Rendered Prompt  <------------------+
    |
    v
Generation Driver  (Browser / API / Fallback / Mock)
    |
    v
Raw Asset (image/video)
    |
    v
Video Pipeline (FFmpeg)
    |---> Vertical Format (1080x1920)
    |---> Subtitle Burn-in
    |---> CTA Overlay
    |---> Thumbnail Extract
    |
    v
Export (TikTok / Reels / Shorts / Spark)
    |
    v
Asset Manager + Registry + QA + Cost Tracking
```

## Module Reference

| Module | Path | Responsibility |
|--------|------|----------------|
| Character Identity | `src/characters/` | JSON manifests, reference images, consistency tracking |
| Scene Generator | `src/scenes/` | 7 scene types with prompt context, props, lighting |
| Prompt Orchestrator | `src/prompts/` | Template rendering, dynamic injection, anti-repetition |
| Generation Driver | `src/generation/` | Abstract interface; Browser/API/Fallback/Mock implementations |
| Video Pipeline | `src/video/` | FFmpeg wrappers, subtitles, overlays, vertical formatting |
| Asset Manager | `src/assets/` | Metadata JSON, manifests, versioning, registry, indexer |
| QA Layer | `src/qa/` | Dimension/audio/corruption validation via FFprobe |
| Cost Tracking | `src/tracking/` | Usage JSONL logs, cost estimation, driver stats |
| CLI | `src/cli.ts` | All commands: generate, export, batch, hooks, captions |

## Driver Strategy

The `GenerationDriver` interface isolates the generation step. Current default is `FallbackDriver`, which uses FFmpeg to create placeholder videos with zoom/pan motion and text overlays. This enables full pipeline testing without API keys or browser logins.

To switch drivers, set `UGC_DRIVER`:
- `fallback` — FFmpeg-based motion (default, no API key needed)
- `browser` — Playwright MCP to ChatGPT/Sora web (requires manual login)
- `api` — OpenAI SDK (requires `OPENAI_API_KEY`)
- `mock` — Copies fixture files (for CI/testing)

## File Naming Convention

Exports follow deterministic naming:
```
<product-slug>-<scene-id>-v<variant>-<platform>-<timestamp>.mp4
```

Example:
```
furlift-couch-cleaning-v1-tiktok-2026-05-19T08-30-00.mp4
```
