# UGC Engine Setup

## Prerequisites

- Node.js >= 20.11.0
- pnpm >= 9.0.0
- FFmpeg >= 6.0 (check with `ffmpeg -version`)
- FFprobe (bundled with FFmpeg)

## Installation

```bash
cd /launch/ugc-engine
pnpm install
```

## Environment Variables

Create a `.env` file in the monorepo root or in `/launch/ugc-engine/`:

```env
# Driver selection: fallback | browser | api | mock
UGC_DRIVER=fallback

# OpenAI API (only needed for api driver)
OPENAI_API_KEY=sk-...
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_VIDEO_MODEL=sora

# Paths
UGC_OUTPUT_DIR=generated
UGC_EXPORT_DIR=exports
UGC_CHARACTERS_DIR=characters

# Browser profile path (only for browser driver)
UGC_BROWSER_PROFILE_PATH=/path/to/browser-profile

# Rate limits
UGC_DAILY_GENERATION_CAP=50
UGC_RETRY_MAX_ATTEMPTS=5
UGC_RETRY_BASE_DELAY_MS=2000
```

## Quick Start

### 1. Create a character
```bash
node dist/cli.js generate:character \
  --id sarah-pet-mom \
  --name "Sarah" \
  --face "warm brown eyes, natural makeup, friendly smile" \
  --vibe "cozy, authentic, approachable" \
  --outfit "casual oversized sweater and leggings" \
  --room "modern boho living room with neutral tones and plants"
```

### 2. Generate hooks
```bash
node dist/cli.js generate:hooks --product furlift
```

### 3. Generate a single UGC asset (fallback driver)
```bash
node dist/cli.js generate:ugc \
  --product furlift \
  --scene couch-cleaning \
  --type video \
  --platform tiktok
```

### 4. Run a workflow batch
```bash
node dist/cli.js generate:batch --workflow workflows/furlift-problem-first.yaml
```

### 5. Export with subtitles and CTA
```bash
node dist/cli.js export:tiktok \
  --input generated/<run-id>/<file>.mp4 \
  --subtitle "Hair everywhere?" "Not anymore." \
  --cta "Tap the link in bio"
```

## Build

```bash
pnpm build
```

## Test

```bash
pnpm test
```
