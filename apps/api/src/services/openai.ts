import OpenAI from "openai";
import { aiCreativeLibrarySchema, aiProductPageSchema, type GeneratedContentAsset } from "@dropship-os/core";
import type { AppEnv } from "../env.js";

export type CreativeLibrary = {
  hooks: string[];
  shortFormConcepts: Array<{
    platform: "tiktok" | "instagram_reels" | "youtube_shorts" | "pinterest";
    hook: string;
    script: string;
    caption: string;
    shotList: string[];
    thumbnailText: string;
  }>;
  adVariants: Array<{
    platform: "meta" | "tiktok";
    primaryText: string;
    headline: string;
    cta: string;
    angle: string;
  }>;
  ctaVariants: string[];
  headlineVariants: string[];
};

export class ProductAiService {
  private readonly client: OpenAI | null;
  private readonly modelName: string;

  constructor(private readonly env: AppEnv) {
    if (env.GROQ_API_KEY) {
      this.client = new OpenAI({
        apiKey: env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1"
      });
      this.modelName = env.GROQ_MODEL || "llama-3.3-70b-versatile";
    } else if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      this.modelName = env.OPENAI_MODEL;
    } else {
      this.client = null;
      this.modelName = "";
    }
  }

  async generateProductPageBrief(input: {
    title: string;
    niche: string;
    targetMarkets: string[];
    evidence: string[];
  }): Promise<unknown> {
    if (!this.client) {
      return {
        title: input.title,
        headline: `A practical ${input.niche} upgrade for daily use`,
        descriptionHtml: `<p>${input.title} is positioned for fast-moving global shoppers with clear benefits, trust messaging, and mobile-first copy.</p>`,
        faqs: [
          { question: "How long does delivery take?", answer: "Target delivery is 4-10 business days for supported fast-shipping markets." },
          { question: "Is tracking included?", answer: "Yes. Tracking is synced to Shopify when the supplier provides a carrier update." },
          { question: "Can I return it?", answer: "Returns follow the published store policy and supplier eligibility for the product." }
        ],
        hooks: [
          "This solves the small daily problem nobody talks about.",
          "I did not expect this to make such a difference.",
          "Three reasons this product is everywhere right now.",
          "Stop buying the version that breaks in a week.",
          "Here is the faster way to fix this at home.",
          "I tested the viral version so you do not have to.",
          "This is the travel upgrade I wish I bought earlier.",
          "The before and after is why this keeps selling.",
          "If you hate clutter, watch this.",
          "A tiny upgrade that makes the routine easier."
        ],
        trustBadges: ["Secure USD checkout", "Tracked shipping", "30-day support window"],
        seoTitle: `${input.title} | Fast Global Shipping`,
        seoDescription: `Shop ${input.title} with USD checkout, tracked shipping, and mobile-first product details.`
      };
    }

    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: "system",
          content: "Generate concise, compliant ecommerce product-page content as JSON. Avoid fake claims, fake scarcity, fake reviews, health promises, and unsupported guarantees. Schema: { title, headline, descriptionHtml, faqs: [{question, answer}], hooks: string[], trustBadges: string[], seoTitle, seoDescription }"
        },
        { role: "user", content: JSON.stringify(input) }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return JSON.parse(response.choices[0]?.message?.content || "{}");
  }

  async generateCreativeLibrary(input: {
    productHandle: string;
    title: string;
    positioning: string;
    priceUsd: number;
    audience: string[];
    proofPoints: string[];
    generationMode?: "openai" | "deterministic";
  }): Promise<CreativeLibrary> {
    if (input.generationMode === "deterministic" || !this.client) return fallbackCreativeLibrary(input);

    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: "system",
          content: "Generate compliant short-form ecommerce creative assets as JSON. Avoid fake reviews, unverifiable claims, fake urgency, medical claims, copyrighted characters, and guarantees. Make each hook visual, specific, and native to social video."
        },
        { role: "user", content: JSON.stringify(input) }
      ],
      temperature: 0.8,
      max_tokens: 4000
    });

    return JSON.parse(response.choices[0]?.message?.content || "{}") as CreativeLibrary;
  }
}

export function creativeLibraryToAssets(productHandle: string, library: CreativeLibrary): GeneratedContentAsset[] {
  const assets: GeneratedContentAsset[] = [];
  assets.push(
    ...library.hooks.map((content, index) => ({
      productHandle,
      type: "hook" as const,
      platform: "tiktok" as const,
      content,
      score: scoreContent(content),
      metadata: { index }
    }))
  );
  assets.push(
    ...library.shortFormConcepts.flatMap((concept, index) => [
      {
        productHandle,
        type: "ugc_script" as const,
        platform: concept.platform,
        content: concept.script,
        score: scoreContent(concept.hook),
        metadata: { index, hook: concept.hook, caption: concept.caption, shotList: concept.shotList, thumbnailText: concept.thumbnailText }
      },
      {
        productHandle,
        type: "caption" as const,
        platform: concept.platform,
        content: concept.caption,
        score: scoreContent(concept.caption),
        metadata: { index, hook: concept.hook }
      }
    ])
  );
  assets.push(
    ...library.adVariants.map((ad, index) => ({
      productHandle,
      type: "ad_variant" as const,
      platform: ad.platform,
      content: ad.primaryText,
      score: scoreContent(`${ad.angle} ${ad.headline}`),
      metadata: { index, headline: ad.headline, cta: ad.cta, angle: ad.angle }
    }))
  );
  assets.push(
    ...library.ctaVariants.map((content, index) => ({
      productHandle,
      type: "cta" as const,
      content,
      score: scoreContent(content),
      metadata: { index }
    }))
  );
  assets.push(
    ...library.headlineVariants.map((content, index) => ({
      productHandle,
      type: "headline" as const,
      content,
      score: scoreContent(content),
      metadata: { index }
    }))
  );
  return assets;
}

function fallbackCreativeLibrary(input: { title: string; positioning: string; audience: string[]; proofPoints: string[] }): CreativeLibrary {
  const audiences = input.audience.length > 0 ? input.audience : ["busy shoppers"];
  const proof = input.proofPoints.length > 0 ? input.proofPoints : [input.positioning];
  const hooks = Array.from({ length: 100 }, (_, index) => {
    const audience = audiences[index % audiences.length];
    const point = proof[index % proof.length] ?? input.positioning;
    return `${index + 1}. ${audience}, this ${input.title} demo shows ${point.toLowerCase()} in seconds.`;
  });
  const platforms = ["tiktok", "instagram_reels", "youtube_shorts", "pinterest"] as const;
  const shortFormConcepts = Array.from({ length: 50 }, (_, index) => {
    const platform = platforms[index % platforms.length] ?? "tiktok";
    const hook = hooks[index] ?? `Watch this ${input.title} demo.`;
    return {
      platform,
      hook,
      script: `${hook} Open with the messy before shot, show one clear product pass, cut to the clean after, then end with a close-up of the result.`,
      caption: `${input.title} for ${audiences[index % audiences.length]}.`,
      shotList: ["Before close-up", "One-pass product demo", "After reveal", "Product-in-hand CTA"],
      thumbnailText: "Before vs after"
    };
  });
  const adVariants = Array.from({ length: 30 }, (_, index) => ({
    platform: (index % 2 === 0 ? "tiktok" : "meta") as "tiktok" | "meta",
    primaryText: `${input.title} turns a visible daily problem into a fast before-and-after demo.`,
    headline: `${input.title} Demo`,
    cta: "Shop now",
    angle: proof[index % proof.length] ?? input.positioning
  }));
  return {
    hooks,
    shortFormConcepts,
    adVariants,
    ctaVariants: Array.from({ length: 30 }, (_, index) => `Try the ${input.title} reset ${index + 1}`),
    headlineVariants: Array.from({ length: 20 }, (_, index) => `${input.title}: ${proof[index % proof.length] ?? "Simple daily fix"}`)
  };
}

function scoreContent(content: string): number {
  const startsFast = content.length <= 120 ? 20 : 10;
  const visual = /before|after|demo|watch|shows|close-up|seconds/i.test(content) ? 30 : 15;
  const specific = content.split(/\s+/).length >= 6 ? 25 : 10;
  const compliant = /guarantee|miracle|cure|fake|limited time/i.test(content) ? 0 : 25;
  return Math.min(100, startsFast + visual + specific + compliant);
}