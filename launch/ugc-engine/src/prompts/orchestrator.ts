import { getProduct, type ProductDefinition } from "../config/products.js";
import { type CharacterManifest } from "../characters/manifest.js";
import { getScene } from "../scenes/registry.js";
import { type SceneConfig } from "../schemas/index.js";
import { renderTemplate, type RenderContext } from "./templates.js";

export interface OrchestratorOptions {
  productSlug: string;
  characterId: string | undefined;
  sceneIds: string[];
  templateType: "image" | "video";
  hookIndex: number | undefined;
  ctaIndex: number | undefined;
  platform: "tiktok" | "reels" | "shorts" | "spark";
}

interface HistoryTracker {
  hooks: Set<number>;
  scenes: Set<string>;
}

const history = new Map<string, HistoryTracker>();

function getTracker(runId: string): HistoryTracker {
  if (!history.has(runId)) {
    history.set(runId, { hooks: new Set(), scenes: new Set() });
  }
  return history.get(runId)!;
}

export function pickNextHook(product: ProductDefinition, runId: string): string {
  const tracker = getTracker(runId);
  const hooks = product.emotionalHooks;
  for (let i = 0; i < hooks.length; i++) {
    if (!tracker.hooks.has(i)) {
      tracker.hooks.add(i);
      return hooks[i]!;
    }
  }
  const randomIdx = Math.floor(Math.random() * hooks.length);
  return hooks[randomIdx]!;
}

export function pickNextScene(sceneIds: string[], runId: string): SceneConfig {
  if (sceneIds.length === 0) throw new Error("No sceneIds provided");
  const tracker = getTracker(runId);
  for (const id of sceneIds) {
    if (!tracker.scenes.has(id)) {
      tracker.scenes.add(id);
      return getScene(id);
    }
  }
  const randomId = sceneIds[Math.floor(Math.random() * sceneIds.length)]!;
  return getScene(randomId);
}

export function buildGenerationPlan(opts: OrchestratorOptions, runId: string) {
  const product = getProduct(opts.productSlug);
  const hook = pickNextHook(product, runId);
  const scene = pickNextScene(opts.sceneIds, runId);
  const cta = product.ctaVariants[opts.ctaIndex ?? 0] ?? product.ctaVariants[0] ?? "Tap the link in bio";

  const templateIds = opts.templateType === "image"
    ? ["img-ugc-lifestyle", "img-product-demo", "img-testimonial-frame", "img-before-after-split"]
    : ["vid-demo-action", "vid-testimonial-talking", "vid-pov-quick-tip"];

  const plans = templateIds.map((templateId) => {
    const ctx: RenderContext = {
      product,
      character: undefined,
      scene,
      hook,
      cta,
    };
    const prompt = renderTemplate(templateId, ctx);
    return {
      templateId,
      prompt,
      platform: opts.platform,
      sceneId: scene.id,
      productSlug: opts.productSlug,
      runId,
    };
  });

  return {
    runId,
    product,
    scene,
    hook,
    cta,
    plans,
  };
}
