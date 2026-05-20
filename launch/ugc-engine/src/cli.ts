#!/usr/bin/env node
import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { loadUgcEnv } from "./config/env.js";
import { getProduct, furliftProduct } from "./config/products.js";
import { CharacterStore } from "./characters/persistence.js";
import { createCharacterManifest } from "./characters/manifest.js";
import { listScenes } from "./scenes/registry.js";
import { buildGenerationPlan, type OrchestratorOptions } from "./prompts/orchestrator.js";
import { createDriver } from "./generation/index.js";
import { type GenerationRequest, generationRequestSchema, type Platform } from "./schemas/index.js";
import { AssetManager } from "./assets/manager.js";
import { formatForPlatform, extractThumbnail } from "./video/vertical.js";
import { burnSubtitles } from "./video/subtitles.js";
import { addCtaOverlay } from "./video/overlays.js";
import { runQa } from "./qa/validator.js";
import { estimateGenerationCost } from "./tracking/cost.js";
import { UsageTracker } from "./tracking/usage.js";
import { ContentRegistry } from "./assets/registry.js";
import { indexExport } from "./assets/indexer.js";
import yaml from "js-yaml";

const program = new Command();
const env = loadUgcEnv();
const assetMgr = new AssetManager(env.UGC_OUTPUT_DIR, env.UGC_EXPORT_DIR);
const usageTracker = new UsageTracker(path.resolve(env.UGC_OUTPUT_DIR, "tracking"));
const registry = new ContentRegistry(path.resolve(env.UGC_EXPORT_DIR, "registry"));
const charStore = new CharacterStore(path.resolve(env.UGC_CHARACTERS_DIR));

program.name("ugc").description("shopwithin AI UGC Engine CLI").version("1.0.0");

function generateRunId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

program
  .command("generate:character")
  .description("Create a new character identity pack")
  .requiredOption("--id <id>", "Character ID")
  .requiredOption("--name <name>", "Character name")
  .option("--age <age>", "Age", "30")
  .option("--gender <gender>", "female|male|nonbinary", "female")
  .option("--face <desc>", "Face descriptor", "warm brown eyes, natural makeup, friendly smile")
  .option("--vibe <vibe>", "Overall vibe", "cozy, authentic, approachable")
  .option("--outfit <style>", "Outfit style", "casual oversized sweater and leggings")
  .option("--room <aesthetic>", "Room aesthetic", "modern boho living room with neutral tones and plants")
  .option("--pet <desc>", "Pet descriptor")
  .option("--tags <tags>", "Comma-separated tags")
  .action((opts: { id: string; name: string; age: string; gender: string; face: string; vibe: string; outfit: string; room: string; pet?: string; tags?: string }) => {
    const manifest = createCharacterManifest(opts.id, {
      name: opts.name,
      age: Number(opts.age),
      gender: opts.gender as "female" | "male" | "nonbinary",
      faceDescriptor: opts.face,
      vibe: opts.vibe,
      outfitStyle: opts.outfit,
      roomAesthetic: opts.room,
      petDescriptor: opts.pet,
      voiceTone: "warm and conversational",
      accessories: [],
    }, opts.tags ? opts.tags.split(",") : []);

    charStore.save(manifest);
    console.log(`Character created: ${opts.id} at ${path.resolve(env.UGC_CHARACTERS_DIR, opts.id)}`);
  });

program
  .command("generate:ugc")
  .description("Generate a single UGC asset")
  .requiredOption("--product <slug>", "Product slug")
  .requiredOption("--scene <id>", "Scene ID")
  .requiredOption("--type <type>", "image|video")
  .option("--platform <p>", "tiktok|reels|shorts|spark", "tiktok")
  .option("--character <id>", "Character ID")
  .action(async (opts: { product: string; scene: string; type: string; platform: string; character?: string }) => {
    const runId = generateRunId();
    const driver = createDriver();
    const product = getProduct(opts.product);
    const plan = buildGenerationPlan(
      {
        productSlug: opts.product,
        sceneIds: [opts.scene],
        templateType: opts.type as "image" | "video",
        platform: opts.platform as Platform,
        characterId: opts.character,
        hookIndex: undefined,
        ctaIndex: undefined,
      },
      runId
    );

    assetMgr.createManifest(runId, opts.product, env.UGC_DRIVER);
    assetMgr.updateStatus(runId, "running");

    const firstPlan = plan.plans[0];
    if (!firstPlan) {
      console.error("No generation plan produced");
      process.exit(1);
    }

    const request: GenerationRequest = generationRequestSchema.parse({
      id: `${runId}-gen-1`,
      runId,
      type: opts.type,
      prompt: firstPlan.prompt,
      productSlug: opts.product,
      platform: opts.platform,
      driver: env.UGC_DRIVER,
      createdAt: new Date().toISOString(),
    });

    const result = opts.type === "image"
      ? await driver.generateImage(request)
      : await driver.generateVideo(request);

    const cost = estimateGenerationCost(request);
    usageTracker.log({
      timestamp: new Date().toISOString(),
      type: opts.type as "image" | "video",
      driver: env.UGC_DRIVER,
      promptLength: firstPlan.prompt.length,
      success: result.success,
      costEstimateUsd: cost,
      retryCount: result.attempts - 1,
      runId,
    });

    assetMgr.addGeneration(runId, { ...request, status: result.success ? "success" : "failed", attempts: result.attempts });

    if (!result.success) {
      console.error(`Generation failed: ${result.errorMessage}`);
      assetMgr.updateStatus(runId, "failed");
      process.exit(1);
    }

    console.log(`Generated: ${result.outputPath}`);
    assetMgr.updateStatus(runId, "completed");
  });

program
  .command("generate:batch")
  .description("Run a workflow YAML batch")
  .requiredOption("--workflow <path>", "Path to workflow YAML file")
  .action(async (opts: { workflow: string }) => {
    const raw = fs.readFileSync(opts.workflow, "utf8");
    const wf = yaml.load(raw) as Record<string, unknown>;
    const runId = generateRunId();
    const driver = createDriver();
    const productSlug = String(wf.productSlug ?? "furlift");
    const product = getProduct(productSlug);
    const sceneIds = (wf.scenes as Array<{ sceneId: string }>)?.map((s) => s.sceneId) ?? ["couch-cleaning"];

    assetMgr.createManifest(runId, productSlug, env.UGC_DRIVER);

    const plan = buildGenerationPlan(
      {
        productSlug,
        sceneIds,
        templateType: "video",
        platform: (wf.platforms as Platform[])?.[0] ?? "tiktok",
        characterId: wf.characterId as string | undefined,
        hookIndex: undefined,
        ctaIndex: undefined,
      },
      runId
    );

    for (const [i, p] of plan.plans.entries()) {
      const request: GenerationRequest = generationRequestSchema.parse({
        id: `${runId}-gen-${i + 1}`,
        runId,
        type: "video",
        prompt: p.prompt,
        productSlug,
        platform: p.platform as Platform,
        driver: env.UGC_DRIVER,
        createdAt: new Date().toISOString(),
      });

      const result = await driver.generateVideo(request);
      const cost = estimateGenerationCost(request);
      usageTracker.log({
        timestamp: new Date().toISOString(),
        type: "video",
        driver: env.UGC_DRIVER,
        promptLength: p.prompt.length,
        success: result.success,
        costEstimateUsd: cost,
        retryCount: result.attempts - 1,
        runId,
      });

      assetMgr.addGeneration(runId, { ...request, status: result.success ? "success" : "failed", attempts: result.attempts });

      if (result.success && result.outputPath) {
        console.log(`  [${i + 1}/${plan.plans.length}] OK: ${result.outputPath}`);
      } else {
        console.error(`  [${i + 1}/${plan.plans.length}] FAILED: ${result.errorMessage}`);
      }
    }

    assetMgr.updateStatus(runId, "completed");
    console.log(`Batch complete. Run ID: ${runId}`);
  });

program
  .command("generate:hooks")
  .description("Output hook library for a product")
  .requiredOption("--product <slug>", "Product slug")
  .action((opts: { product: string }) => {
    const product = getProduct(opts.product);
    console.log(`Hooks for ${product.name}:`);
    for (const hook of product.emotionalHooks) {
      console.log(`  - ${hook}`);
    }
  });

program
  .command("generate:captions")
  .description("Output caption/CTA library for a product")
  .requiredOption("--product <slug>", "Product slug")
  .action((opts: { product: string }) => {
    const product = getProduct(opts.product);
    console.log(`CTAs for ${product.name}:`);
    for (const cta of product.ctaVariants) {
      console.log(`  - ${cta}`);
    }
    console.log("\nHashtags:");
    console.log(`  ${product.hashtags.join(" ")}`);
  });

program
  .command("export:tiktok")
  .description("Export raw asset as TikTok-ready video")
  .requiredOption("--input <path>", "Input video path")
  .option("--subtitle <lines...>", "Subtitle lines")
  .option("--cta <text>", "CTA text")
  .action(async (opts: { input: string; subtitle?: string[]; cta?: string }) => {
    await exportForPlatform(opts.input, "tiktok", opts.subtitle, opts.cta);
  });

program
  .command("export:reels")
  .description("Export raw asset as Instagram Reels-ready video")
  .requiredOption("--input <path>", "Input video path")
  .option("--subtitle <lines...>", "Subtitle lines")
  .option("--cta <text>", "CTA text")
  .action(async (opts: { input: string; subtitle?: string[]; cta?: string }) => {
    await exportForPlatform(opts.input, "reels", opts.subtitle, opts.cta);
  });

program
  .command("export:shorts")
  .description("Export raw asset as YouTube Shorts-ready video")
  .requiredOption("--input <path>", "Input video path")
  .option("--subtitle <lines...>", "Subtitle lines")
  .option("--cta <text>", "CTA text")
  .action(async (opts: { input: string; subtitle?: string[]; cta?: string }) => {
    await exportForPlatform(opts.input, "shorts", opts.subtitle, opts.cta);
  });

async function exportForPlatform(
  inputPath: string,
  platform: Platform,
  subtitleLines?: string[],
  ctaText?: string
): Promise<void> {
  const exportDir = path.resolve(env.UGC_EXPORT_DIR, platform);
  fs.mkdirSync(exportDir, { recursive: true });

  let currentPath = inputPath;

  if (subtitleLines && subtitleLines.length > 0) {
    const subPath = currentPath.replace(/\.mp4$/, "-sub.mp4");
    const subResult = await burnSubtitles(currentPath, subPath, subtitleLines);
    if (subResult.success) {
      currentPath = subPath;
    } else {
      console.error(`Subtitle burn failed: ${subResult.error}`);
    }
  }

  if (ctaText) {
    const ctaPath = currentPath.replace(/\.mp4$/, "-cta.mp4");
    const ctaResult = await addCtaOverlay({ inputPath: currentPath, outputPath: ctaPath, text: ctaText });
    if (ctaResult.success) {
      currentPath = ctaPath;
    } else {
      console.error(`CTA overlay failed: ${ctaResult.error}`);
    }
  }

  const outPath = path.join(exportDir, path.basename(inputPath, ".mp4") + `-${platform}.mp4`);
  const result = await formatForPlatform({
    inputPath: currentPath,
    outputDir: exportDir,
    runId: generateRunId(),
    platform,
  });

  const idx = indexExport(exportDir, "furlift", "unknown", 1, platform, "mp4");
  registry.register({
    runId: idx.runId,
    filename: path.basename(result.outputPath),
    type: "video",
    platform,
    productSlug: "furlift",
    tags: [platform, "export"],
    createdAt: new Date().toISOString(),
  });

  const thumbPath = outPath.replace(".mp4", "-thumb.jpg");
  await extractThumbnail(result.outputPath, thumbPath, 1);
  registry.register({
    runId: idx.runId,
    filename: path.basename(thumbPath),
    type: "thumbnail",
    platform,
    productSlug: "furlift",
    tags: [platform, "thumbnail"],
    createdAt: new Date().toISOString(),
  });

  console.log(`Exported: ${result.outputPath}`);
  console.log(`Thumbnail: ${thumbPath}`);
}

program.parse();
