import { describe, it, expect } from "vitest";
import { createDriver, FallbackDriver, MockDriver } from "../generation/index.js";
import { buildGenerationPlan } from "../prompts/orchestrator.js";
import { getProduct } from "../config/products.js";
import { CharacterStore } from "../characters/persistence.js";
import { createCharacterManifest } from "../characters/manifest.js";
import { AssetManager } from "../assets/manager.js";
import fs from "node:fs";
import path from "node:path";

const testOutDir = path.resolve("src/tests/tmp-smoke/generated");
const testExportDir = path.resolve("src/tests/tmp-smoke/exports");

describe("smoke test — full pipeline with fallback driver", () => {
  it.skip("generates a batch plan and executes with fallback driver (requires FFmpeg drawtext)", async () => {
    fs.mkdirSync(testOutDir, { recursive: true });
    fs.mkdirSync(testExportDir, { recursive: true });

    const product = getProduct("furlift");
    const runId = `smoke-${Date.now()}`;

    const plan = buildGenerationPlan(
      {
        productSlug: "furlift",
        sceneIds: ["couch-cleaning"],
        templateType: "video",
        platform: "tiktok",
        characterId: undefined,
        hookIndex: undefined,
        ctaIndex: undefined,
      },
      runId
    );

    expect(plan.plans.length).toBeGreaterThan(0);
    expect(plan.product.slug).toBe("furlift");

    const driver = new FallbackDriver();
    const available = await driver.isAvailable();
    expect(available).toBe(true);

    const firstPlan = plan.plans[0]!;
    const result = await driver.generateVideo({
      id: `${runId}-gen-1`,
      runId,
      type: "video",
      prompt: firstPlan.prompt,
      productSlug: "furlift",
      platform: "tiktok",
      driver: "fallback",
      status: "pending",
      aspectRatio: "9:16",
      attempts: 0,
      maxAttempts: 5,
      createdAt: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
    expect(result.outputPath).toBeDefined();
    expect(fs.existsSync(result.outputPath!)).toBe(true);
  });

  it("creates and persists a character identity", () => {
    const charDir = path.resolve("src/tests/tmp-smoke/characters");
    const store = new CharacterStore(charDir);

    const manifest = createCharacterManifest("smoke-char", {
      name: "Smoke Test Character",
      faceDescriptor: "bright smile, freckles",
      vibe: "warm and inviting",
      outfitStyle: "denim jacket and white tee",
      roomAesthetic: "scandinavian living room",
      accessories: [],
    }, ["test", "smoke"]);

    store.save(manifest);
    const loaded = store.load("smoke-char");
    expect(loaded).not.toBeNull();
    expect(loaded!.tags).toContain("smoke");
  });

  it("asset manager creates and loads metadata", () => {
    const mgr = new AssetManager(testOutDir, testExportDir);
    const runId = `meta-${Date.now()}`;

    const entry = mgr.createManifest(runId, "furlift", "fallback");
    expect(entry.runId).toBe(runId);
    expect(entry.status).toBe("running");

    mgr.updateStatus(runId, "completed");
    const loaded = mgr.loadMetadata(runId);
    expect(loaded!.status).toBe("completed");
  });
});
