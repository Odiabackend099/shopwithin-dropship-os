import fs from "node:fs";
import path from "node:path";

export interface RegistryEntry {
  runId: string;
  filename: string;
  type: "image" | "video" | "audio" | "subtitle" | "thumbnail" | "overlay";
  platform?: string;
  productSlug: string;
  sceneId?: string;
  tags: string[];
  createdAt: string;
}

export class ContentRegistry {
  private dbPath: string;

  constructor(baseDir: string) {
    fs.mkdirSync(baseDir, { recursive: true });
    this.dbPath = path.join(baseDir, "registry.jsonl");
  }

  register(entry: RegistryEntry): void {
    const line = JSON.stringify(entry) + "\n";
    fs.appendFileSync(this.dbPath, line, "utf8");
  }

  query(filters: Partial<RegistryEntry>): RegistryEntry[] {
    if (!fs.existsSync(this.dbPath)) return [];
    const lines = fs.readFileSync(this.dbPath, "utf8").split("\n").filter(Boolean);
    const all = lines.map((l) => JSON.parse(l) as RegistryEntry);
    return all.filter((e) => {
      for (const [key, value] of Object.entries(filters)) {
        if (value === undefined) continue;
        if ((e as unknown as Record<string, unknown>)[key] !== value) return false;
      }
      return true;
    });
  }

  listByProduct(productSlug: string): RegistryEntry[] {
    return this.query({ productSlug });
  }

  listByPlatform(platform: string): RegistryEntry[] {
    return this.query({ platform });
  }

  listByTag(tag: string): RegistryEntry[] {
    if (!fs.existsSync(this.dbPath)) return [];
    const lines = fs.readFileSync(this.dbPath, "utf8").split("\n").filter(Boolean);
    return lines
      .map((l) => JSON.parse(l) as RegistryEntry)
      .filter((e) => e.tags.includes(tag));
  }
}
