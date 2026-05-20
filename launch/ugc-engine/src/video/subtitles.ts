import fs from "node:fs";
import path from "node:path";
import { runFFmpeg } from "./ffmpeg.js";

export interface SubtitleStyle {
  fontFile?: string;
  fontSize?: number;
  fontColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  boxColor?: string;
  boxOpacity?: number;
  positionY?: number;
  maxWidth?: number;
}

const defaultStyle: SubtitleStyle = {
  fontSize: 36,
  fontColor: "white",
  outlineColor: "black",
  outlineWidth: 2,
  boxColor: "black",
  boxOpacity: 0.5,
  positionY: 1600,
  maxWidth: 900,
};

function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "'\\''")
    .replace(/:/g, "\\:")
    .replace(/=/g, "\\=")
    .replace(/,/g, "\\,");
}

export async function burnSubtitles(
  inputVideoPath: string,
  outputPath: string,
  lines: string[],
  style?: Partial<SubtitleStyle>
): Promise<{ success: boolean; outputPath: string; error?: string }> {
  const s = { ...defaultStyle, ...style };
  const durationPerLine = 2.5;

  const drawtextFilters = lines.map((line, i) => {
    const start = i * durationPerLine;
    const end = start + durationPerLine;
    const text = escapeDrawtext(line);
    return (
      `drawtext=text='${text}':fontsize=${s.fontSize}:fontcolor=${s.fontColor}:` +
      `borderw=${s.outlineWidth}:bordercolor=${s.outlineColor}:` +
      `x=(w-text_w)/2:y=${s.positionY}:` +
      `box=1:boxcolor=${s.boxColor}@${s.boxOpacity}:` +
      `enable='between(t\\,${start.toFixed(2)}\\,${end.toFixed(2)})'`
    );
  });

  const { code, stderr } = await runFFmpeg({
    inputPath: inputVideoPath,
    outputPath,
    extraFilters: drawtextFilters,
    codec: "libx264",
    pixFmt: "yuv420p",
    audioCodec: "aac",
    extraArgs: ["-movflags", "+faststart"],
  });

  if (code !== 0) {
    return { success: false, outputPath, error: stderr.slice(-500) };
  }

  return { success: true, outputPath };
}

export function writeSrt(lines: string[], outputPath: string, durationPerLine = 2.5): void {
  const entries = lines.map((line, i) => {
    const startSec = i * durationPerLine;
    const endSec = startSec + durationPerLine;
    const start = formatSrtTime(startSec);
    const end = formatSrtTime(endSec);
    return `${i + 1}\n${start} --> ${end}\n${line}\n`;
  });
  fs.writeFileSync(outputPath, entries.join("\n"), "utf8");
}

function formatSrtTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}
