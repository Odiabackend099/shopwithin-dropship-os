import path from "node:path";
import { runFFmpeg, probeFile } from "./ffmpeg.js";
import type { Platform } from "../schemas/index.js";

export interface VerticalFormatOptions {
  inputPath: string;
  outputDir: string;
  runId: string;
  platform: Platform;
  ctaText?: string;
  subtitleLines?: string[];
}

const PLATFORM_SPECS: Record<Platform, { width: number; height: number; maxDurationSec: number; fps: number }> = {
  tiktok: { width: 1080, height: 1920, maxDurationSec: 60, fps: 30 },
  reels: { width: 1080, height: 1920, maxDurationSec: 90, fps: 30 },
  shorts: { width: 1080, height: 1920, maxDurationSec: 60, fps: 30 },
  spark: { width: 1080, height: 1920, maxDurationSec: 60, fps: 30 },
};

export async function formatForPlatform(opts: VerticalFormatOptions): Promise<{
  outputPath: string;
  platform: Platform;
  dimensions: { width: number; height: number };
}> {
  const specs = PLATFORM_SPECS[opts.platform];
  if (!specs) throw new Error(`Unknown platform: ${opts.platform}`);
  const baseName = path.basename(opts.inputPath, path.extname(opts.inputPath));
  const outputPath = path.join(
    opts.outputDir,
    `${baseName}-${opts.platform}.mp4`
  );

  const { code, stderr } = await runFFmpeg({
    inputPath: opts.inputPath,
    outputPath,
    width: specs.width,
    height: specs.height,
    fps: specs.fps,
    codec: "libx264",
    pixFmt: "yuv420p",
    audioCodec: "aac",
    audioBitrate: "128k",
    extraArgs: ["-movflags", "+faststart", "-t", String(specs.maxDurationSec)],
  });

  if (code !== 0) {
    throw new Error(`Vertical formatting failed: ${stderr.slice(-500)}`);
  }

  return {
    outputPath,
    platform: opts.platform,
    dimensions: { width: specs.width, height: specs.height },
  };
}

export async function extractThumbnail(
  videoPath: string,
  outputPath: string,
  timeSec = 1
): Promise<void> {
  const { code, stderr } = await runFFmpeg({
    inputPath: videoPath,
    outputPath,
    extraArgs: ["-ss", String(timeSec), "-vframes", "1"],
  });
  if (code !== 0) {
    throw new Error(`Thumbnail extraction failed: ${stderr.slice(-500)}`);
  }
}
