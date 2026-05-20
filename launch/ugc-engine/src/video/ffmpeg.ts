import { spawn } from "node:child_process";

export interface FFmpegOptions {
  inputPath: string;
  outputPath: string;
  inputFormat?: string;
  width?: number;
  height?: number;
  fps?: number;
  duration?: number;
  bitrate?: string;
  codec?: string;
  pixFmt?: string;
  audioCodec?: string;
  audioBitrate?: string;
  extraFilters?: string[];
  extraArgs?: string[];
}

export function buildFFmpegArgs(opts: FFmpegOptions): string[] {
  const args: string[] = ["-y"];
  if (opts.inputFormat) {
    args.push("-f", opts.inputFormat);
  }
  args.push("-i", opts.inputPath);

  if (opts.duration !== undefined) {
    args.push("-t", String(opts.duration));
  }

  const filters: string[] = [];

  if (opts.width && opts.height) {
    filters.push(`scale=${opts.width}:${opts.height}:force_original_aspect_ratio=decrease,pad=${opts.width}:${opts.height}:(ow-iw)/2:(oh-ih)/2`);
  }

  if (opts.extraFilters && opts.extraFilters.length > 0) {
    filters.push(...opts.extraFilters);
  }

  if (filters.length > 0) {
    args.push("-vf", filters.join(","));
  }

  if (opts.fps) {
    args.push("-r", String(opts.fps));
  }

  if (opts.codec) {
    args.push("-c:v", opts.codec);
  }

  if (opts.pixFmt) {
    args.push("-pix_fmt", opts.pixFmt);
  }

  if (opts.bitrate) {
    args.push("-b:v", opts.bitrate);
  }

  if (opts.audioCodec) {
    args.push("-c:a", opts.audioCodec);
  }

  if (opts.audioBitrate) {
    args.push("-b:a", opts.audioBitrate);
  }

  if (opts.extraArgs) {
    args.push(...opts.extraArgs);
  }

  args.push(opts.outputPath);
  return args;
}

export async function runFFmpeg(opts: FFmpegOptions): Promise<{ code: number; stderr: string }> {
  const args = buildFFmpegArgs(opts);
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d) => { stderr += String(d); });
    proc.on("close", (code) => {
      resolve({ code: code ?? 0, stderr });
    });
  });
}

export async function probeFile(filePath: string): Promise<{
  width: number;
  height: number;
  durationSec: number;
  hasAudio: boolean;
  bitrate: number;
} | null> {
  return new Promise((resolve) => {
    const proc = spawn("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,duration,bit_rate",
      "-show_entries", "format=duration,bit_rate",
      "-of", "json",
      filePath,
    ], { stdio: ["ignore", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => { stdout += String(d); });
    proc.stderr.on("data", (d) => { stderr += String(d); });

    proc.on("close", async (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }
      try {
        const data = JSON.parse(stdout);
        const stream = data.streams?.[0] ?? {};
        const format = data.format ?? {};

        const hasAudio = await new Promise<boolean>((r) => {
          const aproc = spawn("ffprobe", [
            "-v", "error",
            "-select_streams", "a",
            "-show_entries", "stream=codec_type",
            "-of", "csv=p=0",
            filePath,
          ], { stdio: ["ignore", "pipe", "pipe"] });
          let aout = "";
          aproc.stdout.on("data", (d) => { aout += String(d); });
          aproc.on("close", () => r(aout.trim() === "audio"));
        });

        resolve({
          width: Number(stream.width ?? 0),
          height: Number(stream.height ?? 0),
          durationSec: Number(format.duration ?? stream.duration ?? 0),
          hasAudio,
          bitrate: Number(format.bit_rate ?? stream.bit_rate ?? 0),
        });
      } catch {
        resolve(null);
      }
    });
  });
}
