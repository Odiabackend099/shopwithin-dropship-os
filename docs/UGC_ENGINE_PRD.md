# UGC Engine Product Requirements Document

## Executive Summary

The UGC Engine is a production-grade AI User-Generated Content generation factory for `shopwithin` (Dropship OS). It automates the creation of consistent TikTok/Reels/Shorts ecommerce creatives using OpenAI APIs, reusable AI creator identities, automated workflows, and scalable ad-generation pipelines.

**Status**: Phase 1 Complete — Browser-automation-first implementation with clean API migration path
**Repository**: `/dropship-os/launch/ugc-engine/`
**Primary Product**: FurLift (SKU: VLOY30HZN) — reusable pet hair detailer

## Problem Statement

Ecommerce dropshipping requires high-volume, consistent UGC-style video creatives for TikTok, Instagram Reels, and YouTube Shorts. Manual creative production is:
- **Expensive**: $50-200 per video from creators
- **Inconsistent**: Different faces, vibes, lighting across assets
- **Slow**: Days to weeks for creative iteration
- **Unscalable**: Cannot test hundreds of hooks/scenes rapidly

The UGC Engine solves this by:
- Generating reusable AI creator "identity packs" with consistent face, vibe, outfit, room aesthetic, and pet
- Automating prompt orchestration with anti-repetition logic
- Supporting multiple generation drivers (browser automation, OpenAI API, FFmpeg fallback)
- Processing videos for platform-specific vertical formats (1080x1920)
- Tracking costs and usage for budget control

## Target Users

- **Primary**: Dropship OS operators (Nigeria-based, selling globally)
- **Secondary**: Marketing teams needing rapid creative iteration
- **Tertiary**: Future Shopify app users (if commercialized)

## Core Features

### 1. Character Identity Engine

**Location**: `src/characters/`

Create reusable AI creator identities with:
- **Face descriptor**: Exact facial features (eyes, hair, smile)
- **Vibe**: Personality energy (cozy, energetic, calm)
- **Outfit style**: Clothing worn in every scene
- **Room aesthetic**: Background environment
- **Pet descriptor**: Companion animal details
- **Accessories**: Additional props/items
- **Reference images**: Stored in `characters/<id>/reference-images/`

**CLI Command**:
```bash
ugc generate:character --id sarah-pet-mom --name "Sarah" \
  --face "warm brown eyes, natural makeup, friendly smile" \
  --vibe "cozy, authentic, approachable" \
  --outfit "casual oversized sweater and leggings" \
  --room "modern boho living room with neutral tones and plants"
```

### 2. Scene Generator

**Location**: `src/scenes/registry.ts`

7 pre-built UGC scene types:
- `couch-cleaning`: Pet hair removal on fabric couch
- `car-seat-cleaning`: Car interior hair removal
- `before-after`: Split-screen transformation
- `unboxing`: Product reveal excitement
- `testimonial`: Talking-head owner story
- `selfie`: First-person POV with product
- `pet-interaction`: Pet using the product

Each scene defines:
- **Prompt context**: Action description, lighting, mood
- **Props**: Demo surfaces and items
- **Platform suitability**: TikTok, Reels, Shorts, Spark

### 3. Prompt Orchestrator

**Location**: `src/prompts/orchestrator.ts`

Dynamic prompt generation with:
- **Template system**: 7 image + 3 video prompt templates
- **Variable substitution**: Product, character, scene, hook, CTA
- **Anti-repetition**: Cycles through hooks and scenes per `runId`
- **Hook injection**: Selects from product's emotional hook library
- **CTA injection**: Selects from product's CTA variants

**Output**: Rendered prompts ready for generation drivers

### 4. Generation Drivers

**Location**: `src/generation/`

Abstract driver interface with 4 implementations:

| Driver | Use Case | Requirements | Cost |
|--------|----------|--------------|------|
| **Fallback** (default) | Testing, development, no API key | FFmpeg installed | Free |
| **Browser** | Manual ChatGPT/Sora web UI | Playwright MCP, browser profile | Free (manual) |
| **API** | Production automation | OpenAI API key | $0.04/image, $0.50/video |
| **Mock** | CI/testing | Fixture files | Free |

**Selection**: Set `UGC_DRIVER` environment variable

### 5. Video Pipeline

**Location**: `src/video/`

FFmpeg-based processing:
- **Vertical formatting**: 1080x1920 for TikTok/Reels/Shorts
- **Subtitle burn-in**: Text overlay with SRT support
- **CTA overlay**: "Tap the link in bio" text + box
- **Thumbnail extraction**: Frame capture at timestamp
- **Platform specs**: Different encoding per platform

### 6. Asset Manager

**Location**: `src/assets/`

Metadata persistence and indexing:
- **Run manifests**: JSON metadata per generation run
- **Content registry**: JSONL index of all assets
- **Export indexer**: Deterministic file naming
- **Version tracking**: Timestamp-based asset versions

### 7. QA Layer

**Location**: `src/qa/validator.ts`

Export validation via FFprobe:
- **Dimensions**: 1080x1920 check
- **Duration**: Minimum video length
- **Audio**: Audio presence check
- **Corruption**: File integrity validation

### 8. Cost Tracking

**Location**: `src/tracking/`

Usage logging and estimation:
- **JSONL logs**: `generated/tracking/usage.jsonl`
- **Cost estimates**: $0.04/image, $0.50/video
- **Driver stats**: Usage by driver type
- **Daily caps**: `UGC_DAILY_GENERATION_CAP` limit

### 9. CLI

**Location**: `src/cli.ts`

Command-line interface for all operations:

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

## Technical Architecture

### Module Structure

```
/launch/ugc-engine/
├── package.json
├── tsconfig.json
├── src/
│   ├── config/
│   │   ├── env.ts          # Environment variables
│   │   └── products.ts     # Product definitions (FurLift)
│   ├── schemas/
│   │   └── index.ts        # Zod schemas for all entities
│   ├── characters/
│   │   ├── manifest.ts     # Character identity utilities
│   │   ├── persistence.ts  # Character store (filesystem)
│   │   └── engine.ts       # Character cloning
│   ├── scenes/
│   │   └── registry.ts     # Scene definitions
│   ├── prompts/
│   │   ├── templates.ts    # Prompt template library
│   │   └── orchestrator.ts # Prompt generation logic
│   ├── generation/
│   │   ├── driver.ts       # Driver interface
│   │   ├── browser-driver.ts
│   │   ├── api-driver.ts
│   │   ├── fallback.ts
│   │   ├── mock-driver.ts
│   │   └── index.ts        # Driver factory
│   ├── video/
│   │   ├── ffmpeg.ts       # FFmpeg command builder
│   │   ├── subtitles.ts    # Subtitle burn-in
│   │   ├── overlays.ts     # CTA overlay
│   │   └── vertical.ts     # Platform formatting
│   ├── assets/
│   │   ├── manager.ts      # Metadata persistence
│   │   ├── registry.ts     # Content registry
│   │   └── indexer.ts      # Export naming
│   ├── qa/
│   │   └── validator.ts     # Export validation
│   ├── tracking/
│   │   ├── cost.ts         # Cost estimation
│   │   └── usage.ts        # Usage logging
│   ├── tests/              # Vitest test suite
│   ├── cli.ts              # CLI entry point
│   └── index.ts            # Package exports
├── workflows/              # YAML workflow definitions
├── docs/                   # Architecture, setup, troubleshooting
└── .gitignore
```

### Data Flow

```
CLI / Workflow YAML
    ↓
Prompt Orchestrator (renders template with product/character/scene)
    ↓
Generation Driver (Browser/API/Fallback/Mock)
    ↓
Raw Asset (image/video)
    ↓
Video Pipeline (FFmpeg: vertical format, subtitles, CTA, thumbnail)
    ↓
Export (TikTok/Reels/Shorts/Spark)
    ↓
Asset Manager + Registry + QA + Cost Tracking
```

### Technology Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js >= 20.11.0
- **Package Manager**: pnpm >= 9.0.0
- **Schema Validation**: Zod
- **CLI**: Commander
- **YAML**: js-yaml
- **Video Processing**: FFmpeg >= 6.0
- **Testing**: Vitest
- **API Client**: OpenAI SDK (optional)

## Product Definitions

### FurLift (Current Product)

**SKU**: VLOY30HZN
**Name**: FurLift Reusable Pet Hair Detailer
**Price**: $29.99
**Category**: Pet Supplies
**Niche**: Pet grooming tools

**Emotional Hooks**:
- "You love your pet, but you hate the hair everywhere."
- "Guests are coming in 10 minutes."
- "That black sweater is ruined again."
- "Your couch looks like a fur coat."
- "Lint rollers are a waste of money."

**CTA Variants**:
- "Tap the link in bio"
- "Get yours now"
- "Limited time offer"
- "Free shipping today"
- "See it in action"

**Demo Props**:
- Fabric couch
- Car seat
- Black sweater
- White bedspread
- Pet blanket

**Visual Descriptors**:
- Bright blue ergonomic handle
- Compact handheld design
- Reusable adhesive surface
- Easy-release mechanism

## Workflow Examples

### Problem-First Hook Workflow

**File**: `workflows/furlift-problem-first.yaml`

```yaml
id: furlift-problem-first
name: FurLift Problem-First Hook
productSlug: furlift
characterId: sarah-pet-mom
scenes:
  - sceneId: couch-cleaning
    hookVariant: 0
    ctaVariant: 0
  - sceneId: car-seat-cleaning
    hookVariant: 1
    ctaVariant: 2
platforms:
  - tiktok
  - reels
outputVariants: 3
```

**Execution**:
```bash
ugc generate:batch --workflow workflows/furlift-problem-first.yaml
```

### Export with Subtitles and CTA

```bash
ugc export:tiktok \
  --input generated/<run-id>/<file>.mp4 \
  --subtitle "Hair everywhere?" "Not anymore." \
  --cta "Tap the link in bio"
```

## Cost Model

### Default Cost Estimates

| Asset Type | Base Cost | Retry Cost |
|------------|-----------|------------|
| Image | $0.04 | $0.02 |
| Video | $0.50 | $0.10 |
| FFmpeg processing | ~$0.001/min | — |

### Cost Controls

- **Daily Cap**: `UGC_DAILY_GENERATION_CAP=50` (default)
- **Driver Selection**: Use `fallback` or `mock` for testing
- **Retry Limits**: `UGC_RETRY_MAX_ATTEMPTS=5`
- **Usage Monitoring**: `generated/tracking/usage.jsonl`

### Example Costs

- **10 videos**: $5.00 (API driver)
- **100 images**: $4.00 (API driver)
- **Batch workflow (3 variants)**: $1.50 (API driver)

## Security & Privacy

- **No credentials in workflows**: All secrets in environment variables
- **HMAC verification**: Shopify and supplier webhooks verified
- **API key protection**: Never logged or exposed
- **File system isolation**: Generated assets in `generated/` directory
- **Reference images**: Stored in character directories, not uploaded

## Migration Path to OpenAI API

### Current State (Phase 1)
- Browser-automation-first
- Fallback driver as default
- API driver stubbed (requires valid API key)

### Future State (Phase 2)
1. Obtain valid OpenAI API key
2. Set `UGC_DRIVER=api`
3. Configure `OPENAI_IMAGE_MODEL=gpt-image-1`
4. Configure `OPENAI_VIDEO_MODEL=sora` (when available)
5. Add reference images to API requests for face consistency
6. Implement retry logic with exponential backoff
7. Add rate limit handling

### Browser Automation Fallback
- **Purpose**: Manual generation via ChatGPT/Sora web UI
- **Use Case**: When API key unavailable or for human-in-the-loop
- **Limitations**: Requires login, CAPTCHA, 2FA; not automated

## Success Metrics

### Technical Metrics
- **Build success**: TypeScript compilation without errors
- **Test coverage**: >80% for core modules
- **FFmpeg compatibility**: Works on macOS, Linux, Windows

### Operational Metrics
- **Generation speed**: <30s per video (fallback), <60s (API)
- **Success rate**: >95% generation success
- **Cost accuracy**: Estimated within 10% of actual

### Business Metrics (Future)
- **Creative throughput**: 50+ creatives per day
- **Cost savings**: 90% vs manual creators ($5 vs $50 per video)
- **Time to market**: Hours vs days for creative iteration

## Dependencies

### System Dependencies
- FFmpeg >= 6.0 (with libx264, libavformat, libavcodec)
- FFprobe (bundled with FFmpeg)
- Node.js >= 20.11.0
- pnpm >= 9.0.0

### npm Dependencies
- `zod`: Schema validation
- `commander`: CLI framework
- `js-yaml`: Workflow parsing
- `openai`: API client (optional, for API driver)

### Monorepo Integration
- Extends `/dropship-os/tsconfig.base.json`
- Uses `@dropship-os/core` for shared schemas (future)
- Scripts in root `package.json`:
  - `ugc:build`: Build ugc-engine
  - `ugc:test`: Run tests
  - `ugc:cli`: Run CLI

## Known Limitations

### Current Limitations
- **Face consistency**: Requires reference images for API driver
- **Lip sync**: Not supported; avoid talking-head videos
- **Motion complexity**: Prefer subtle motion (zoom/pan) over complex action
- **Watermark risk**: Never include platform watermarks in prompts
- **Moderation**: Avoid medical/weapon/sexual content to prevent API blocks

### Platform-Specific Limitations
- **TikTok**: 9:16 aspect ratio only
- **Reels**: Same as TikTok
- **Shorts**: Same as TikTok
- **Spark**: Not yet implemented

## Future Roadmap

### Phase 2: API Integration
- Full OpenAI API driver implementation
- Reference image support for face consistency
- Sora video API integration
- Retry logic with exponential backoff
- Rate limit handling

### Phase 3: Advanced Features
- Multi-character campaigns
- A/B testing framework
- Creative performance analytics
- Auto-pause based on CTR/conversion
- Integration with Klaviyo email campaigns

### Phase 4: Commercialization
- Shopify App Store listing
- SaaS pricing model
- Multi-tenant support
- Web UI for non-technical users
- API for third-party integration

## Documentation

- **Architecture**: `docs/ARCHITECTURE.md`
- **Setup**: `docs/SETUP.md`
- **API Config**: `docs/API-CONFIG.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Workflows**: `docs/WORKFLOWS.md`
- **Prompt Engineering**: `docs/PROMPT-ENGINEERING.md`
- **Cost Optimization**: `docs/COST-OPTIMIZATION.md`
- **Consistency**: `docs/CONSISTENCY.md`

## Support & Maintenance

### Issue Reporting
- GitHub Issues in `/dropship-os` repository
- Include: CLI command, environment variables, error output

### Maintenance Tasks
- Update OpenAI API models as released
- Monitor FFmpeg version compatibility
- Add new scene types as needed
- Update cost estimates based on actual usage

### Backup & Recovery
- Character manifests: Backed up in `characters/` directory
- Generated assets: Backed up in `generated/` directory
- Usage logs: JSONL format, easy to parse and restore
