import { type GenerationDriver, type GenerationResult } from "./driver.js";
import { type GenerationRequest } from "../schemas/index.js";

export class BrowserDriver implements GenerationDriver {
  readonly name = "browser";

  async generateImage(request: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();
    return {
      requestId: request.id,
      success: false,
      errorMessage:
        "BrowserDriver.generateImage requires human-in-the-loop login to ChatGPT web. " +
        "Use the manual browser helper script or switch to API/Fallback driver.",
      durationMs: Date.now() - start,
      attempts: 1,
    };
  }

  async generateVideo(request: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();
    return {
      requestId: request.id,
      success: false,
      errorMessage:
        "BrowserDriver.generateVideo requires human-in-the-loop login to Sora web. " +
        "Use the manual browser helper script or switch to API/Fallback driver.",
      durationMs: Date.now() - start,
      attempts: 1,
    };
  }

  async isAvailable(): Promise<boolean> {
    return false;
  }
}
