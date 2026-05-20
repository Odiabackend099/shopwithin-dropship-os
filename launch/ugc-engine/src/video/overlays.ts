import { runFFmpeg } from "./ffmpeg.js";

export interface CtaOverlayOptions {
  inputPath: string;
  outputPath: string;
  text: string;
  position?: "top" | "bottom" | "center";
  fontSize?: number;
  fontColor?: string;
  bgColor?: string;
  bgOpacity?: number;
  padding?: number;
}

export async function addCtaOverlay(opts: CtaOverlayOptions): Promise<{ success: boolean; error?: string }> {
  const {
    inputPath,
    outputPath,
    text,
    position = "bottom",
    fontSize = 42,
    fontColor = "white",
    bgColor = "black",
    bgOpacity = 0.7,
    padding = 12,
  } = opts;

  const yPos = position === "top" ? 60 : position === "bottom" ? 1700 : 960;

  const filter =
    `drawtext=text='${escapeDrawtext(text)}':fontsize=${fontSize}:fontcolor=${fontColor}:` +
    `x=(w-text_w)/2:y=${yPos}:` +
    `box=1:boxcolor=${bgColor}@${bgOpacity}:boxborderw=${padding}`;

  const { code, stderr } = await runFFmpeg({
    inputPath,
    outputPath,
    extraFilters: [filter],
    codec: "libx264",
    pixFmt: "yuv420p",
    audioCodec: "aac",
    extraArgs: ["-movflags", "+faststart"],
  });

  if (code !== 0) {
    return { success: false, error: stderr.slice(-500) };
  }

  return { success: true };
}

function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "'\\''")
    .replace(/:/g, "\\:")
    .replace(/=/g, "\\=")
    .replace(/,/g, "\\,");
}
