import { type GenerationRequest } from "../schemas/index.js";

const COST_PER_IMAGE_USD = 0.04;
const COST_PER_VIDEO_USD = 0.50;
const COST_PER_FFMPEG_MINUTE_USD = 0.001;
const COST_PER_RETRY_IMAGE_USD = 0.02;
const COST_PER_RETRY_VIDEO_USD = 0.10;

export function estimateGenerationCost(request: GenerationRequest): number {
  switch (request.type) {
    case "image":
      return COST_PER_IMAGE_USD + request.attempts * COST_PER_RETRY_IMAGE_USD;
    case "video":
      return COST_PER_VIDEO_USD + request.attempts * COST_PER_RETRY_VIDEO_USD;
    default:
      return 0;
  }
}

export function estimateFFmpegCost(durationSec: number): number {
  return (durationSec / 60) * COST_PER_FFMPEG_MINUTE_USD;
}

export function estimateBatchCost(requests: GenerationRequest[]): number {
  return requests.reduce((sum, r) => sum + estimateGenerationCost(r), 0);
}
