import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CharacterStore } from "../characters/persistence.js";
import { createCharacterManifest, validateCharacterManifest } from "../characters/manifest.js";

const testDir = path.resolve("src/tests/tmp-characters");

describe("character manifest persistence", () => {
  it("saves and loads a character manifest", () => {
    const store = new CharacterStore(testDir);
    const manifest = createCharacterManifest("test-char-1", {
      name: "Test Character",
      faceDescriptor: "blue eyes, short hair",
      vibe: "energetic",
      outfitStyle: "athleisure",
      roomAesthetic: "minimalist studio",
      accessories: [],
    });

    store.save(manifest);
    const loaded = store.load("test-char-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe("test-char-1");
    expect(loaded!.identity.name).toBe("Test Character");
  });

  it("lists saved characters", () => {
    const store = new CharacterStore(testDir);
    const manifest = createCharacterManifest("test-char-2", {
      name: "Another Character",
      faceDescriptor: "green eyes",
      vibe: "calm",
      outfitStyle: "bohemian",
      roomAesthetic: "cozy cottage",
      accessories: [],
    });
    store.save(manifest);

    const list = store.list();
    expect(list).toContain("test-char-1");
    expect(list).toContain("test-char-2");
  });

  it("validates a character manifest", () => {
    const valid = {
      id: "x",
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      identity: {
        name: "X",
        faceDescriptor: "x",
        vibe: "x",
        outfitStyle: "x",
        roomAesthetic: "x",
      },
    };
    expect(() => validateCharacterManifest(valid)).not.toThrow();

    const invalid = { id: "x" };
    expect(() => validateCharacterManifest(invalid)).toThrow();
  });
});
