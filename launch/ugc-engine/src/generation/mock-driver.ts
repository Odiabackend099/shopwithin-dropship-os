import fs from "node:fs";
import path from "node:path";
import { type GenerationDriver, type GenerationResult } from "./driver.js";
import { type GenerationRequest } from "../schemas/index.js";
import { loadUgcEnv } from "../config/env.js";

export class MockDriver implements GenerationDriver {
  readonly name = "mock";

  async generateImage(request: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();
    const env = loadUgcEnv();
    const outDir = path.resolve(env.UGC_OUTPUT_DIR);
    fs.mkdirSync(outDir, { recursive: true });

    const outputPath = path.join(outDir, `${request.runId}-${request.id}-mock.png`);
    fs.copyFileSync(
      path.join(process.cwd(), "tests", "fixtures", "mock-image.png"),
      outputPath
    );

    return {
      requestId: request.id,
      success: true,
      outputPath,
      durationMs: Date.now() - start,
      attempts: request.attempts + 1,
    };
  }

  async generateVideo(request: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();
    const env = loadUgcEnv();
    const outDir = path.resolve(env.UGC_OUTPUT_DIR);
    fs.mkdirSync(outDir, { recursive: true });

    const outputPath = path.join(outDir, `${request.runId}-${request.id}-mock.mp4`);
    fs.copyFileSync(
      path.join(process.cwd(), "tests", "fixtures", "mock-video.mp4"),
      outputPath
    );

    return {
      requestId: request.id,
      success: true,
      outputPath,
      durationMs: Date.now() - start,
      attempts: request.attempts + 1,
    };
  }

  async isAvailable(): Promise<boolean> {
    const fixtureDir = path.join(process.cwd(), "tests", "fixtures");
    return (
      fs.existsSync(path.join(fixtureDir, "mock-image.png")) &&
      fs.existsSync(path.join(fixtureDir, "mock-video.mp4"))
    );
  }
}
