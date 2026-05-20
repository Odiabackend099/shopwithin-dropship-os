import { describe, it, expect } from "vitest";
import {
  characterManifestSchema,
  sceneConfigSchema,
  promptTemplateSchema,
  generationRequestSchema,
  metadataEntrySchema,
  qaReportSchema,
} from "../schemas/index.js";

describe("schema validation", () => {
  it("validates character manifest", () => {
    const valid = {
      id: "test-char",
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      identity: {
        name: "Sarah",
        faceDescriptor: "warm brown eyes, friendly smile",
        vibe: "cozy and authentic",
        outfitStyle: "casual oversized sweater",
        roomAesthetic: "modern boho living room",
      },
    };
    const parsed = characterManifestSchema.parse(valid);
    expect(parsed.id).toBe("test-char");
  });

  it("rejects invalid generation request", () => {
    const invalid = { id: "x", type: "audio", prompt: "" };
    expect(() => generationRequestSchema.parse(invalid)).toThrow();
  });

  it("validates metadata entry", () => {
    const valid = {
      runId: "run-1",
      timestamp: new Date().toISOString(),
      productSlug: "furlift",
      promptsUsed: [],
      generations: [],
      exports: [],
      totalCostEstimateUsd: 0,
      driverUsed: "fallback",
      status: "running",
    };
    const parsed = metadataEntrySchema.parse(valid);
    expect(parsed.runId).toBe("run-1");
  });
});
