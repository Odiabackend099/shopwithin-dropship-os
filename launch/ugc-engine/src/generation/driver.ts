import { type GenerationRequest } from "../schemas/index.js";

export interface GenerationResult {
  requestId: string;
  success: boolean;
  outputPath?: string;
  errorMessage?: string;
  durationMs: number;
  attempts: number;
}

export interface GenerationDriver {
  readonly name: string;
  generateImage(request: GenerationRequest): Promise<GenerationResult>;
  generateVideo(request: GenerationRequest): Promise<GenerationResult>;
  isAvailable(): Promise<boolean>;
}
