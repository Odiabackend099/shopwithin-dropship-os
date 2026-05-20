import { describe, it, expect } from "vitest";
import { getTemplate, listTemplates, renderTemplate } from "../prompts/templates.js";
import { getProduct } from "../config/products.js";

describe("prompt templates", () => {
  it("lists image and video templates", () => {
    const images = listTemplates("image");
    expect(images.length).toBeGreaterThan(0);
    expect(images.every((t) => t.type === "image")).toBe(true);

    const videos = listTemplates("video");
    expect(videos.length).toBeGreaterThan(0);
    expect(videos.every((t) => t.type === "video")).toBe(true);
  });

  it("gets a template by id", () => {
    const t = getTemplate("img-ugc-lifestyle");
    expect(t.type).toBe("image");
    expect(t.variables.length).toBeGreaterThan(0);
  });

  it("renders a template with product context", () => {
    const product = getProduct("furlift");
    const rendered = renderTemplate("img-ugc-lifestyle", {
      product,
      character: undefined,
      scene: undefined,
      hook: product.emotionalHooks[0],
      cta: product.ctaVariants[0],
    });
    expect(rendered).toContain("bright blue ergonomic handle");
    expect(rendered).not.toContain("{{");
  });

  it("throws on unknown template id", () => {
    expect(() => getTemplate("nonexistent")).toThrow("Unknown template id");
  });
});
