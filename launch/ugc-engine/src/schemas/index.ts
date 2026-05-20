import { z } from "zod";

export const aspectRatioSchema = z.enum(["9:16", "16:9", "1:1", "4:5"]);
export type AspectRatio = z.infer<typeof aspectRatioSchema>;

export const platformSchema = z.enum(["tiktok", "reels", "shorts", "spark"]);
export type Platform = z.infer<typeof platformSchema>;

export const assetTypeSchema = z.enum(["image", "video", "audio", "subtitle", "thumbnail", "overlay"]);
export type AssetType = z.infer<typeof assetTypeSchema>;

export const generationStatusSchema = z.enum(["pending", "generating", "success", "failed", "retrying"]);
export type GenerationStatus = z.infer<typeof generationStatusSchema>;

export const characterManifestSchema = z.object({
  id: z.string().min(1),
  version: z.string().default("1.0.0"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  identity: z.object({
    name: z.string().min(1),
    age: z.number().int().min(18).max(80).optional(),
    gender: z.enum(["female", "male", "nonbinary"]).optional(),
    ethnicity: z.string().optional(),
    faceDescriptor: z.string().min(1),
    vibe: z.string().min(1),
    outfitStyle: z.string().min(1),
    roomAesthetic: z.string().min(1),
    petDescriptor: z.string().optional(),
    accessories: z.array(z.string()).default([]),
    voiceTone: z.string().optional(),
  }),
  referenceImages: z.array(z.object({
    filename: z.string(),
    description: z.string(),
    hash: z.string().optional(),
  })).default([]),
  consistencyNotes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type CharacterManifest = z.infer<typeof characterManifestSchema>;

export const sceneTypeSchema = z.enum([
  "couch-cleaning",
  "car-seat-cleaning",
  "pet-interaction",
  "testimonial",
  "selfie",
  "unboxing",
  "before-after",
]);

export type SceneType = z.infer<typeof sceneTypeSchema>;

export const sceneConfigSchema = z.object({
  id: z.string().min(1),
  type: sceneTypeSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  promptContext: z.string().min(1),
  shotAngles: z.array(z.string()).default([]),
  lighting: z.string().optional(),
  props: z.array(z.string()).default([]),
  mood: z.string().optional(),
  durationEstimateSec: z.number().int().positive().default(5),
  recommendedAudio: z.string().optional(),
});

export type SceneConfig = z.infer<typeof sceneConfigSchema>;

export const promptTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["image", "video"]),
  template: z.string().min(1),
  variables: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export type PromptTemplate = z.infer<typeof promptTemplateSchema>;

export const generationRequestSchema = z.object({
  id: z.string().min(1),
  runId: z.string().min(1),
  type: assetTypeSchema,
  prompt: z.string().min(1),
  characterId: z.string().optional(),
  sceneId: z.string().optional(),
  productSlug: z.string().min(1),
  platform: platformSchema,
  aspectRatio: aspectRatioSchema.default("9:16"),
  driver: z.enum(["browser", "api", "fallback", "mock"]).default("fallback"),
  status: generationStatusSchema.default("pending"),
  attempts: z.number().int().nonnegative().default(0),
  maxAttempts: z.number().int().positive().default(5),
  outputPath: z.string().optional(),
  costEstimateUsd: z.number().nonnegative().optional(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  errorMessage: z.string().optional(),
});

export type GenerationRequest = z.infer<typeof generationRequestSchema>;

export const exportConfigSchema = z.object({
  id: z.string().min(1),
  runId: z.string().min(1),
  platform: platformSchema,
  sourceAssetPath: z.string().min(1),
  outputPath: z.string().min(1),
  dimensions: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  durationSec: z.number().positive().optional(),
  hasSubtitles: z.boolean().default(false),
  hasCtaOverlay: z.boolean().default(false),
  hasThumbnail: z.boolean().default(false),
  subtitlePath: z.string().optional(),
  ctaText: z.string().optional(),
  processedAt: z.string().datetime(),
});

export type ExportConfig = z.infer<typeof exportConfigSchema>;

export const metadataEntrySchema = z.object({
  runId: z.string().min(1),
  timestamp: z.string().datetime(),
  productSlug: z.string().min(1),
  characterId: z.string().optional(),
  sceneIds: z.array(z.string()).default([]),
  promptsUsed: z.array(z.object({
    templateId: z.string(),
    renderedPrompt: z.string(),
  })).default([]),
  generations: z.array(generationRequestSchema).default([]),
  exports: z.array(exportConfigSchema).default([]),
  totalCostEstimateUsd: z.number().nonnegative().default(0),
  driverUsed: z.enum(["browser", "api", "fallback", "mock"]),
  status: z.enum(["running", "completed", "failed", "partial"]).default("running"),
});

export type MetadataEntry = z.infer<typeof metadataEntrySchema>;

export const qaReportSchema = z.object({
  runId: z.string().min(1),
  timestamp: z.string().datetime(),
  checks: z.array(z.object({
    assetPath: z.string(),
    check: z.string(),
    passed: z.boolean(),
    detail: z.string().optional(),
  })).default([]),
  passedCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  overall: z.enum(["pass", "fail", "partial"]),
});

export type QaReport = z.infer<typeof qaReportSchema>;

export const usageLogEntrySchema = z.object({
  timestamp: z.string().datetime(),
  type: z.enum(["image", "video", "ffmpeg", "retry"]),
  driver: z.enum(["browser", "api", "fallback", "mock"]),
  promptLength: z.number().int().nonnegative(),
  success: z.boolean(),
  costEstimateUsd: z.number().nonnegative(),
  retryCount: z.number().int().nonnegative().default(0),
  runId: z.string().min(1),
});

export type UsageLogEntry = z.infer<typeof usageLogEntrySchema>;

export const workflowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  productSlug: z.string().min(1),
  characterId: z.string().optional(),
  scenes: z.array(z.object({
    sceneId: z.string(),
    hookVariant: z.number().int().nonnegative().default(0),
    ctaVariant: z.number().int().nonnegative().default(0),
  })).default([]),
  platforms: z.array(platformSchema).default(["tiktok"]),
  outputVariants: z.number().int().positive().default(1),
});

export type Workflow = z.infer<typeof workflowSchema>;
