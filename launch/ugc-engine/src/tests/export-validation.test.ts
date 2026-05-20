import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { validateExport } from "../qa/validator.js";
import { type ExportConfig } from "../schemas/index.js";
import { runFFmpeg } from "../video/ffmpeg.js";

const testDir = path.resolve("src/tests/tmp-qa");

describe("export validation", () => {
  it("passes validation for a correctly sized video", async () => {
    fs.mkdirSync(testDir, { recursive: true });
    const videoPath = path.join(testDir, "valid-video.mp4");

    await runFFmpeg({
      inputPath: "color=c=black:s=1080x1920:d=3",
      outputPath: videoPath,
      inputFormat: "lavfi",
      codec: "libx264",
      pixFmt: "yuv420p",
      fps: 30,
      duration: 3,
      extraArgs: ["-an"],
    });

    const config: ExportConfig = {
      id: "test-1",
      runId: "run-1",
      platform: "tiktok",
      sourceAssetPath: videoPath,
      outputPath: videoPath,
      dimensions: { width: 1080, height: 1920 },
      durationSec: 3,
      hasSubtitles: false,
      hasCtaOverlay: false,
      hasThumbnail: false,
      processedAt: new Date().toISOString(),
    };

    const checks = await validateExport(config);
    const dimCheck = checks.find((c) => c.check === "dimensions");
    expect(dimCheck!.passed).toBe(true);
  });

  it("fails validation for wrong dimensions", async () => {
    fs.mkdirSync(testDir, { recursive: true });
    const videoPath = path.join(testDir, "wrong-dim.mp4");

    await runFFmpeg({
      inputPath: "color=c=black:s=640x480:d=2",
      outputPath: videoPath,
      inputFormat: "lavfi",
      codec: "libx264",
      pixFmt: "yuv420p",
      fps: 30,
      duration: 2,
      extraArgs: ["-an"],
    });

    const config: ExportConfig = {
      id: "test-2",
      runId: "run-1",
      platform: "tiktok",
      sourceAssetPath: videoPath,
      outputPath: videoPath,
      dimensions: { width: 1080, height: 1920 },
      hasSubtitles: false,
      hasCtaOverlay: false,
      hasThumbnail: false,
      processedAt: new Date().toISOString(),
    };

    const checks = await validateExport(config);
    const dimCheck = checks.find((c) => c.check === "dimensions");
    expect(dimCheck!.passed).toBe(false);
  });
});
