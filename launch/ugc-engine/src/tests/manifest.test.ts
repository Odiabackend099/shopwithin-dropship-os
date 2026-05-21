import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CharacterStore } from "../characters/persistence.js";
import { createCharacterManifest, validateCharacterManifest } from "../characters/manifest.js";

const testDir = path.resolve("src/tests/tmp-characters");

describe("character manifest persistence", () => {
  beforeEach(() => {
    // Clean up test directory
    try {
      const entries = fs.readdirSync(testDir);
      for (const entry of entries) {
        fs.rmSync(path.join(testDir, entry), { recursive: true });
      }
    } catch {}
  });

  it("saves and loads a character manifest", async () => {
    const store = new CharacterStore(testDir);
    const manifest = createCharacterManifest("test-char-1", {
      name: "Test Character",
      faceDescriptor: "blue eyes, short hair",
      vibe: "energetic",
      outfitStyle: "athleisure",
      roomAesthetic: "minimalist studio",
      accessories: [],
    });

    await store.save(manifest);
    const loaded = await store.load("test-char-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe("test-char-1");
    expect(loaded!.name).toBe("Test Character");
  });

  it("lists saved characters", async () => {
    const store = new CharacterStore(testDir);
    const manifest = createCharacterManifest("test-char-2", {
      name: "Another Character",
      faceDescriptor: "green eyes",
      vibe: "calm",
      outfitStyle: "bohemian",
      roomAesthetic: "cozy cottage",
      accessories: [],
    });
    await store.save(manifest);

    const list = await store.list();
    const ids = list.map(m => m.id);
    expect(ids).toContain("test-char-2");
  });

  it("validates a character manifest", () => {
    const valid = {
      id: "x",
      name: "Test",
      version: "1.0.0",
      style: "default",
      traits: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(validateCharacterManifest(valid)).toBe(true);
  });

  it("rejects invalid manifest", () => {
    expect(validateCharacterManifest({ id: 123 })).toBe(false);
    expect(validateCharacterManifest(null)).toBe(false);
    expect(validateCharacterManifest({})).toBe(false);
  });

  it("checks character existence", async () => {
    const store = new CharacterStore(testDir);
    const manifest = createCharacterManifest("test-char-check", { name: "Check Test" });
    await store.save(manifest);

    const exists = await store.exists("test-char-check");
    expect(exists).toBe(true);

    const notExists = await store.exists("non-existent");
    expect(notExists).toBe(false);
  });
});