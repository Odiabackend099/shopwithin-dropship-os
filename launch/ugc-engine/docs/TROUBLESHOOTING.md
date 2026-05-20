# Troubleshooting

## "FFmpeg not found"

Ensure FFmpeg and FFprobe are installed and on your PATH:
```bash
ffmpeg -version
ffprobe -version
```

## "Cannot find module 'zod'"

Run `pnpm install` in `/launch/ugc-engine/`.

## "OPENAI_API_KEY not configured"

The API driver requires a valid key. Either:
- Add `OPENAI_API_KEY` to your `.env`
- Switch to `UGC_DRIVER=fallback` or `UGC_DRIVER=mock`

## Browser driver returns "requires human-in-the-loop"

This is expected. The browser driver is a helper for manual asset generation, not an automated factory. Log in to ChatGPT/Sora via the browser profile, then retry.

## Generation fails with "No generation plan produced"

Check that:
- The product slug exists in `src/config/products.ts`
- The scene ID exists in `src/scenes/registry.ts`
- Scene IDs array is not empty

## Subtitle text is garbled

FFmpeg `drawtext` requires special escaping. The engine handles this automatically. If you pass custom text, avoid these characters: `:`, `=`, `,`, `'`, `\`

## Export dimensions are wrong

The vertical formatter enforces 1080x1920. If the source is a different aspect ratio, FFmpeg will pad with black bars. Use high-resolution source assets to avoid upscaling blur.

## High API costs

Default cost estimates:
- Image: $0.04 per generation
- Video: $0.50 per generation
- Retry: $0.02 (image), $0.10 (video)

Set `UGC_DAILY_GENERATION_CAP` to limit spend. Review `generated/tracking/usage.jsonl` for actual usage.
