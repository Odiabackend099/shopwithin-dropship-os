# API Configuration

## OpenAI API Driver

When you have a valid OpenAI API key, switch to the API driver:

```env
UGC_DRIVER=api
OPENAI_API_KEY=sk-...
```

The `ApiDriver` uses:
- `openai.images.generate` for images (model: `gpt-image-1`)
- Sora API for videos (stubbed pending API availability)

## Browser Driver

The `BrowserDriver` uses Playwright MCP to drive web UIs. It is not fully automated because ChatGPT and Sora web interfaces require human login, CAPTCHA handling, and 2FA.

### Setup

1. Set `UGC_BROWSER_PROFILE_PATH` to a persistent browser profile directory.
2. Run the browser helper to log in manually.
3. The driver will reuse that session for subsequent generations.

### Limitations

- Requires human-in-the-loop for initial login
- Not suitable for CI/automated tests
- Sequential generation only (no batch parallelization)
- Page layout changes may break selectors

## Fallback Driver

The default `FallbackDriver` requires no API keys. It uses FFmpeg to create:
- Placeholder images with text overlays
- Placeholder videos with Ken Burns zoom/pan motion and text

This enables full pipeline testing and development without API access.

## Mock Driver

For CI and unit tests, the `MockDriver` copies fixture files instead of generating. Requires:
```
tests/fixtures/mock-image.png
tests/fixtures/mock-video.mp4
```
