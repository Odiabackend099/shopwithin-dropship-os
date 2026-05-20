# Prompt Engineering Guide

## Template System

All prompts use `{{variable}}` substitution. Available variables:

| Variable | Source |
|----------|--------|
| `productName` | Product definition |
| `productVisual` | First visual descriptor |
| `problemStatement` | Product problem statement |
| `transformationStatement` | Product transformation statement |
| `price` | Product price formatted |
| `targetAudience` | Product audience |
| `demoSurface` | First demo prop |
| `creatorDescription` | Character identity |
| `roomAesthetic` | Character room aesthetic |
| `actionDescription` | Scene prompt context |
| `lighting` | Scene lighting |
| `hook` | Selected emotional hook |
| `cta` | Selected CTA variant |

## Anti-Repetition

The orchestrator tracks hook and scene usage per `runId`:
- Hooks cycle through the product's emotional hook list before repeating
- Scenes cycle through the requested scene IDs before repeating
- This prevents identical creatives in a single batch

## Adding New Templates

Edit `src/prompts/templates.ts`:

```typescript
{
  id: "my-custom-template",
  name: "Custom Template",
  type: "image",
  template: "A photo of {{creatorDescription}} using {{productVisual}}...",
  variables: ["creatorDescription", "productVisual"],
  tags: ["custom"],
}
```

## Consistency Tips

- Always include the same `characterId` across a campaign
- Reference the same room aesthetic in every prompt
- Use identical lighting descriptors per character
- Avoid vague terms like "a person" — use specific character descriptors
