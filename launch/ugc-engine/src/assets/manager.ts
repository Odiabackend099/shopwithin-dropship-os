import fs from "node:fs";
import path from "node:path";
import { type MetadataEntry, metadataEntrySchema, type GenerationRequest, type ExportConfig } from "../schemas/index.js";

export class AssetManager {
  constructor(
    private outputDir: string,
    private exportDir: string
  ) {}

  private runDir(runId: string): string {
    return path.join(this.outputDir, runId);
  }

  ensureRunDir(runId: string): void {
    fs.mkdirSync(this.runDir(runId), { recursive: true });
  }

  saveMetadata(entry: MetadataEntry): void {
    this.ensureRunDir(entry.runId);
    const p = path.join(this.runDir(entry.runId), "metadata.json");
    fs.writeFileSync(p, JSON.stringify(entry, null, 2), "utf8");
  }

  loadMetadata(runId: string): MetadataEntry | null {
    const p = path.join(this.runDir(runId), "metadata.json");
    if (!fs.existsSync(p)) return null;
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    return metadataEntrySchema.parse(raw);
  }

  addGeneration(runId: string, request: GenerationRequest): void {
    const meta = this.loadMetadata(runId);
    if (!meta) {
      throw new Error(`No metadata found for run ${runId}`);
    }
    meta.generations.push(request);
    this.saveMetadata(meta);
  }

  addExport(runId: string, exportConfig: ExportConfig): void {
    const meta = this.loadMetadata(runId);
    if (!meta) {
      throw new Error(`No metadata found for run ${runId}`);
    }
    meta.exports.push(exportConfig);
    this.saveMetadata(meta);
  }

  updateStatus(runId: string, status: MetadataEntry["status"]): void {
    const meta = this.loadMetadata(runId);
    if (!meta) return;
    meta.status = status;
    this.saveMetadata(meta);
  }

  listRuns(): string[] {
    if (!fs.existsSync(this.outputDir)) return [];
    return fs.readdirSync(this.outputDir).filter((entry) => {
      const p = path.join(this.outputDir, entry);
      return fs.statSync(p).isDirectory();
    });
  }

  createManifest(runId: string, productSlug: string, driverUsed: MetadataEntry["driverUsed"]): MetadataEntry {
    const now = new Date().toISOString();
    const entry: MetadataEntry = {
      runId,
      timestamp: now,
      productSlug,
      sceneIds: [],
      promptsUsed: [],
      generations: [],
      exports: [],
      totalCostEstimateUsd: 0,
      driverUsed,
      status: "running",
    };
    this.saveMetadata(entry);
    return entry;
  }
}
