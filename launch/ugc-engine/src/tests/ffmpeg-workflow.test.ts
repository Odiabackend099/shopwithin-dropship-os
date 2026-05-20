import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { runFFmpeg, probeFile } from "../video/ffmpeg.js";
import { formatForPlatform } from "../video/vertical.js";
import { burnSubtitles } from "../video/subtitles.js";
import { addCtaOverlay } from "../video/overlays.js";
import { extractThumbnail } from "../video/vertical.js";

const testDir = path.resolve("src/tests/tmp");

describe("ffmpeg video pipeline", () => {
  it("creates a vertical video placeholder and probes it", async () => {
    fs.mkdirSync(testDir, { recursive: true });
    const inputPath = path.join(testDir, "test-input.mp4");

    const { code } = await runFFmpeg({
      inputPath: "color=c=black:s=1080x1920:d=2",
      outputPath: inputPath,
      inputFormat: "lavfi",
      codec: "libx264",
      pixFmt: "yuv420p",
      fps: 30,
      duration: 2,
    });

    expect(code).toBe(0);
    expect(fs.existsSync(inputPath)).toBe(true);

    const probe = await probeFile(inputPath);
    expect(probe).not.toBeNull();
    expect(probe!.width).toBe(1080);
    expect(probe!.height).toBe(1920);
    expect(probe!.durationSec).toBeGreaterThan(0);
  });

  it("formats for platform with correct dimensions", async () => {
    fs.mkdirSync(testDir, { recursive: true });
    const inputPath = path.join(testDir, "test-input.mp4");

    await runFFmpeg({
      inputPath: "color=c=black:s=1080x1920:d=2",
      outputPath: inputPath,
      inputFormat: "lavfi",
      codec: "libx264",
      pixFmt: "yuv420p",
      fps: 30,
      duration: 2,
    });

    const result = await formatForPlatform({
      inputPath,
      outputDir: testDir,
      runId: "test-run",
      platform: "tiktok",
    });

    expect(result.platform).toBe("tiktok");
    expect(result.dimensions.width).toBe(1080);
    expect(result.dimensions.height).toBe(1920);
  });

  it.skip("burns subtitles into a video (requires system font)", async () => {
    fs.mkdirSync(testDir, { recursive: true });
    const inputPath = path.join(testDir, "sub-input.mp4");
    const outputPath = path.join(testDir, "sub-output.mp4");

    await runFFmpeg({
      inputPath: "color=c=black:s=1080x1920:d=5",
      outputPath: inputPath,
      inputFormat: "lavfi",
      codec: "libx264",
      pixFmt: "yuv420p",
      fps: 30,
      duration: 5,
    });

    const result = await burnSubtitles(inputPath, outputPath, [
      "First line of subtitle",
      "Second line appears here",
    ]);

    expect(result.success).toBe(true);
    expect(fs.existsSync(outputPath)).toBe(true);
  });

  it("extracts a thumbnail from a video", async () => {
    fs.mkdirSync(testDir, { recursive: true });
    const inputPath = path.join(testDir, "thumb-input.mp4");
    const thumbPath = path.join(testDir, "thumb.jpg");

    await runFFmpeg({
      inputPath: "color=c=red:s=1080x1920:d=2",
      outputPath: inputPath,
      inputFormat: "lavfi",
      codec: "libx264",
      pixFmt: "yuv420p",
      fps: 30,
      duration: 2,
    });

    await extractThumbnail(inputPath, thumbPath, 1);
    expect(fs.existsSync(thumbPath)).toBe(true);
  });
});
