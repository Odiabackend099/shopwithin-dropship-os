import { type PromptTemplate, promptTemplateSchema, type CharacterManifest, type SceneConfig } from "../schemas/index.js";
import { type ProductDefinition } from "../config/products.js";

const imagePrompts: PromptTemplate[] = [
  {
    id: "img-ugc-lifestyle",
    name: "UGC Lifestyle Photo",
    type: "image",
    template:
      "A realistic UGC-style photo of {{creatorDescription}} in a {{roomAesthetic}}. {{actionDescription}}. {{productVisual}} is clearly visible in their hand. Natural phone-camera quality, slightly warm filter, authentic home environment. No text, no watermarks, no logos other than product.",
    variables: ["creatorDescription", "roomAesthetic", "actionDescription", "productVisual"],
    tags: ["ugc", "lifestyle", "photo"],
  },
  {
    id: "img-product-demo",
    name: "Product Demo Still",
    type: "image",
    template:
      "A crisp product demonstration photo: {{productVisual}} being used on {{demoSurface}}. Close-up angle, bright natural lighting, clean background. Visible hair being lifted. Commercial quality but still authentic. No text overlays.",
    variables: ["productVisual", "demoSurface"],
    tags: ["product", "demo", "close-up"],
  },
  {
    id: "img-testimonial-frame",
    name: "Testimonial Frame",
    type: "image",
    template:
      "A medium close-up portrait of {{creatorDescription}} holding {{productVisual}}, smiling genuinely in a {{roomAesthetic}}. Soft window light, slightly blurred background. Warm, trustworthy, authentic feel. No text.",
    variables: ["creatorDescription", "productVisual", "roomAesthetic"],
    tags: ["testimonial", "portrait", "trust"],
  },
  {
    id: "img-before-after-split",
    name: "Before After Split",
    type: "image",
    template:
      "A before-and-after split image showing {{demoSurface}} covered in pet hair on the left, and completely clean on the right after using {{productVisual}}. Dramatic contrast, consistent lighting. Clean layout. No text.",
    variables: ["demoSurface", "productVisual"],
    tags: ["before-after", "transformation", "proof"],
  },
];

const videoPrompts: PromptTemplate[] = [
  {
    id: "vid-demo-action",
    name: "Demo Action Video",
    type: "video",
    template:
      "A short authentic UGC video: {{creatorDescription}} in a {{roomAesthetic}}. {{actionDescription}}. {{productVisual}} is used in a quick satisfying motion. Natural handheld camera feel, warm lighting, ambient home sounds. 5 seconds. No text, no watermarks.",
    variables: ["creatorDescription", "roomAesthetic", "actionDescription", "productVisual"],
    tags: ["ugc", "video", "demo"],
  },
  {
    id: "vid-testimonial-talking",
    name: "Testimonial Talking Clip",
    type: "video",
    template:
      "An authentic talking-head video: {{creatorDescription}} speaking directly to camera in a {{roomAesthetic}}. They hold {{productVisual}} and gesture naturally. Warm, genuine, unscripted feel. Slight camera shake. 8 seconds. No text overlays.",
    variables: ["creatorDescription", "roomAesthetic", "productVisual"],
    tags: ["testimonial", "talking", "authentic"],
  },
  {
    id: "vid-pov-quick-tip",
    name: "POV Quick Tip",
    type: "video",
    template:
      "Selfie POV video: {{creatorDescription}} shows {{demoSurface}} covered in hair. They grab {{productVisual}} and swipe once. Hair disappears. Quick, casual, authentic phone footage. Bright indoor light. 4 seconds. No text.",
    variables: ["creatorDescription", "demoSurface", "productVisual"],
    tags: ["pov", "quick-tip", "selfie"],
  },
];

const allTemplates = [...imagePrompts, ...videoPrompts];
const templateMap = new Map<string, PromptTemplate>(allTemplates.map((t) => [t.id, t]));

export function getTemplate(id: string): PromptTemplate {
  const t = templateMap.get(id);
  if (!t) throw new Error(`Unknown template id: ${id}`);
  return t;
}

export function listTemplates(type?: "image" | "video"): PromptTemplate[] {
  if (type) return allTemplates.filter((t) => t.type === type);
  return allTemplates;
}

export function validateTemplate(data: unknown): PromptTemplate {
  return promptTemplateSchema.parse(data);
}

export interface RenderContext {
  product: ProductDefinition;
  character: CharacterManifest | undefined;
  scene: SceneConfig | undefined;
  hook: string | undefined;
  cta: string | undefined;
}

export function renderTemplate(templateId: string, ctx: RenderContext): string {
  const tmpl = getTemplate(templateId);
  let rendered = tmpl.template;

  const subs: Record<string, string> = {
    productName: ctx.product.name,
    productVisual: ctx.product.visualDescriptors[0] ?? ctx.product.name,
    problemStatement: ctx.product.problemStatement,
    transformationStatement: ctx.product.transformationStatement,
    price: `$${ctx.product.priceUsd.toFixed(2)}`,
    targetAudience: ctx.product.targetAudience,
    demoSurface: ctx.product.demoProps[0] ?? "a fabric surface",
    hook: ctx.hook ?? "",
    cta: ctx.cta ?? ctx.product.ctaVariants[0] ?? "",
  };

  if (ctx.character) {
    subs.creatorDescription =
      `${ctx.character.identity.gender ?? "a person"} with ${ctx.character.identity.faceDescriptor}, wearing ${ctx.character.identity.outfitStyle}`;
    subs.roomAesthetic = ctx.character.identity.roomAesthetic;
    subs.vibe = ctx.character.identity.vibe;
    subs.pet = ctx.character.identity.petDescriptor ?? "no pet";
  } else {
    subs.creatorDescription = "a relatable pet owner";
    subs.roomAesthetic = "cozy modern living room";
    subs.vibe = "warm and authentic";
    subs.pet = "a friendly pet";
  }

  if (ctx.scene) {
    subs.actionDescription = ctx.scene.promptContext;
    subs.sceneMood = ctx.scene.mood ?? "";
    subs.lighting = ctx.scene.lighting ?? "natural light";
  } else {
    subs.actionDescription = "demonstrating the product";
    subs.sceneMood = "relatable";
    subs.lighting = "natural light";
  }

  for (const [key, value] of Object.entries(subs)) {
    rendered = rendered.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value);
  }

  return rendered;
}
