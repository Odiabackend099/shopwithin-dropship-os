import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { type GenerationDriver, type GenerationResult } from "./driver.js";
import { type GenerationRequest } from "../schemas/index.js";
import { loadUgcEnv } from "../config/env.js";

function generateRunId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function runFFmpeg(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => { stdout += String(d); });
    proc.stderr.on("data", (d) => { stderr += String(d); });
    proc.on("close", (code) => {
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });
}

export class FallbackDriver implements GenerationDriver {
  readonly name = "fallback";

  async generateImage(request: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();
    const env = loadUgcEnv();
    const outDir = path.resolve(env.UGC_OUTPUT_DIR);
    fs.mkdirSync(outDir, { recursive: true });

    const filename = `${request.runId}-${request.id}-fallback.png`;
    const outputPath = path.join(outDir, filename);

    const width = 1080;
    const height = 1920;

    const { code, stderr } = await runFFmpeg([
      "-f", "lavfi",
      "-i", `color=c=0x2d2d2d:s=${width}x${height}`,
      "-vf",
      `drawtext=text='FurLift Demo Placeholder':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2,` +
      `drawtext=text='${request.prompt.slice(0, 80).replace(/'/g, "'\\''")}':fontcolor=aaaaaa:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2+60`,
      "-frames:v", "1",
      "-y",
      outputPath,
    ]);

    if (code !== 0) {
      return {
        requestId: request.id,
        success: false,
        errorMessage: `FFmpeg placeholder generation failed: ${stderr.slice(-500)}`,
        durationMs: Date.now() - start,
        attempts: request.attempts + 1,
      };
    }

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

    const filename = `${request.runId}-${request.id}-fallback.mp4`;
    const outputPath = path.join(outDir, filename);

    const width = 1080;
    const height = 1920;
    const durationSec = 5;
    const fps = 30;
    const totalFrames = durationSec * fps;

    const zoomExpr = `zoom='1+0.3*t/${durationSec}'`;
    const panExpr = `x='(iw-zoom*iw)/2':y='(ih-zoom*ih)/2'`;

    const { code, stderr } = await runFFmpeg([
      "-f", "lavfi",
      "-i", `color=c=0x2d2d2d:s=${width}x${height}:d=${durationSec}`,
      "-vf",
      `${zoomExpr},${panExpr},` +
      `drawtext=text='FurLift Demo Video':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:enable='lte(t,${durationSec})',` +
      `drawtext=text='${request.prompt.slice(0, 60).replace(/'/g, "'\\''")}':fontcolor=cccccc:fontsize=22:x=(w-text_w)/2:y=(h-text_h)/2+60:enable='lte(t,${durationSec})'`,
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-r", String(fps),
      "-t", String(durationSec),
      "-y",
      outputPath,
    ]);

    if (code !== 0) {
      return {
        requestId: request.id,
        success: false,
        errorMessage: `FFmpeg video generation failed: ${stderr.slice(-500)}`,
        durationMs: Date.now() - start,
        attempts: request.attempts + 1,
      };
    }

    return {
      requestId: request.id,
      success: true,
      outputPath,
      durationMs: Date.now() - start,
      attempts: request.attempts + 1,
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const { code } = await runFFmpeg(["-version"]);
      return code === 0;
    } catch {
      return false;
    }
  }
}
