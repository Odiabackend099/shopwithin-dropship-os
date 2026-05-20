import OpenAI from "openai";
import { type GenerationDriver, type GenerationResult } from "./driver.js";
import { type GenerationRequest } from "../schemas/index.js";
import { loadUgcEnv } from "../config/env.js";

export class ApiDriver implements GenerationDriver {
  readonly name = "api";
  private client: OpenAI | null = null;

  constructor() {
    const env = loadUgcEnv();
    if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
  }

  async generateImage(request: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();
    if (!this.client) {
      return {
        requestId: request.id,
        success: false,
        errorMessage: "OPENAI_API_KEY not configured. Set it in environment to use API driver.",
        durationMs: Date.now() - start,
        attempts: request.attempts + 1,
      };
    }

    try {
      const env = loadUgcEnv();
      const response = await this.client.images.generate({
        model: env.OPENAI_IMAGE_MODEL,
        prompt: request.prompt,
        n: 1,
        size: "1024x1792",
      });

      const url = response.data?.[0]?.url;
      if (!url) {
        return {
          requestId: request.id,
          success: false,
          errorMessage: "No image URL returned from API",
          durationMs: Date.now() - start,
          attempts: request.attempts + 1,
        };
      }

      return {
        requestId: request.id,
        success: true,
        outputPath: url,
        durationMs: Date.now() - start,
        attempts: request.attempts + 1,
      };
    } catch (err) {
      return {
        requestId: request.id,
        success: false,
        errorMessage: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
        attempts: request.attempts + 1,
      };
    }
  }

  async generateVideo(request: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();
    if (!this.client) {
      return {
        requestId: request.id,
        success: false,
        errorMessage: "OPENAI_API_KEY not configured. Set it in environment to use API driver.",
        durationMs: Date.now() - start,
        attempts: request.attempts + 1,
      };
    }

    return {
      requestId: request.id,
      success: false,
      errorMessage:
        "Sora video generation via API is not yet implemented in this driver. " +
        "Use FallbackDriver for image-to-video motion or BrowserDriver for manual Sora generation.",
      durationMs: Date.now() - start,
      attempts: request.attempts + 1,
    };
  }

  async isAvailable(): Promise<boolean> {
    return this.client !== null;
  }
}
