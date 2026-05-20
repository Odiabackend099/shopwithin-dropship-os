# Recommended Workflows

## Workflow YAML Format

```yaml
id: unique-workflow-id
name: Human-readable name
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

## Included Example Pipelines

### 1. Problem-First (`furlift-problem-first.yaml`)

Hook: "You love your pet, but you hate the hair everywhere."
Scenes: Couch cleaning, car seat cleaning
Goal: Trigger emotional pain point first, then show solution

### 2. Transformation-First (`furlift-transformation-first.yaml`)

Hook: "Your couch looks like a fur coat."
Scenes: Before/after split, unboxing
Goal: Lead with dramatic visual proof, then curiosity

### 3. Testimonial (`furlift-testimonial.yaml`)

Hook: "Guests are coming in 10 minutes."
Scenes: Talking head testimonial, couch demo
Goal: Build trust through authentic owner story

### 4. Pet Owner POV (`furlift-pet-pov.yaml`)

Hook: "That black sweater is ruined again."
Scenes: Selfie POV, pet interaction
Goal: Relatable first-person moment, quick tip energy

## Execution Order

1. Create character identity
2. Review hook library: `ugc generate:hooks --product furlift`
3. Review CTA library: `ugc generate:captions --product furlift`
4. Run workflow: `ugc generate:batch --workflow workflows/furlift-problem-first.yaml`
5. Export best outputs: `ugc export:tiktok --input <path> --subtitle ... --cta ...`
6. Upload to platform manually or via future upload pipeline
