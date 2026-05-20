import { loadUgcEnv } from "../config/env.js";
import { type GenerationDriver } from "./driver.js";
import { BrowserDriver } from "./browser-driver.js";
import { ApiDriver } from "./api-driver.js";
import { FallbackDriver } from "./fallback.js";
import { MockDriver } from "./mock-driver.js";

export { type GenerationDriver, type GenerationResult } from "./driver.js";
export { BrowserDriver } from "./browser-driver.js";
export { ApiDriver } from "./api-driver.js";
export { FallbackDriver } from "./fallback.js";
export { MockDriver } from "./mock-driver.js";

export function createDriver(): GenerationDriver {
  const env = loadUgcEnv();
  switch (env.UGC_DRIVER) {
    case "browser":
      return new BrowserDriver();
    case "api":
      return new ApiDriver();
    case "mock":
      return new MockDriver();
    case "fallback":
    default:
      return new FallbackDriver();
  }
}
