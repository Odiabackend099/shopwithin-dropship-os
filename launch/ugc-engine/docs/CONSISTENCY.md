# Consistency Strategies

## Character Identity Engine

The character manifest locks these attributes across generations:

- **Face descriptor**: Exact facial features (eyes, hair, smile)
- **Vibe**: Personality energy (cozy, energetic, calm)
- **Outfit style**: Clothing worn in every scene
- **Room aesthetic**: Background environment
- **Pet descriptor**: Companion animal details

## Reference Images

Store reference images in `characters/<id>/reference-images/`. When switching to the API driver, these can be used as style references for GPT Image API or Sora image-to-video.

## Scene Consistency

Each scene defines:
- Lighting (e.g., "soft natural window light, warm afternoon tones")
- Props (e.g., "fabric couch, FurLift device")
- Mood (e.g., "satisfying, domestic, relatable")

Keeping lighting and mood consistent across a campaign creates visual coherence even when scenes change.

## Known Limitations

| Issue | Mitigation |
|-------|------------|
| Facial consistency drift | Use reference images + strong face descriptors in prompts |
| Lip sync | Avoid talking-head videos unless using dedicated lip-sync tools |
| Uncanny motion | Prefer subtle motion (zoom, pan) over complex action |
| Watermark risks | Never include platform watermarks in prompts or exports |
| Moderation failures | Keep prompts clean, avoid medical/weapon/sexual content |

## Future API Migration

When OpenAI API is available:
1. Use GPT Image API with reference images for consistent faces
2. Use Sora image-to-video with the same reference frame
3. The existing character manifests and scene configs work unchanged
