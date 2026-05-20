import { z } from "zod";

export const scoreInputSchema = z.object({
  demandVelocity: z.number().min(0).max(100),
  margin: z.number().min(0).max(100),
  shippingSpeed: z.number().min(0).max(100),
  wowFactor: z.number().min(0).max(100),
  creativeEase: z.number().min(0).max(100),
  trendLongevity: z.number().min(0).max(100),
  competition: z.number().min(0).max(100),
  adSaturation: z.number().min(0).max(100),
  riskPenalties: z.number().min(0).max(100)
});

export const supplierOfferSchema = z.object({
  supplier: z.enum(["zendrop", "spocket", "cj", "autods", "dsers", "manual"]),
  supplierProductId: z.string().min(1),
  productCostUsd: z.number().min(0),
  shippingCostUsd: z.number().min(0),
  estimatedDeliveryDays: z.number().int().min(1).max(90),
  inventoryVerified: z.boolean(),
  supportsTrackingSync: z.boolean(),
  shipsFrom: z.string().min(2),
  shipsTo: z.array(z.enum(["US", "UK", "CA", "EU", "AU"])).min(1),
  sourceUrl: z.string().url()
});

export const targetMarketSchema = z.enum(["US", "UK", "CA", "EU", "AU"]);

export const supplierNameSchema = z.enum(["zendrop", "spocket", "cj", "autods", "dsers", "manual"]);

export const supplierProductLinkSchema = z.object({
  productHandle: z.string().min(1),
  shopifyProductId: z.string().min(1).optional(),
  shopifyVariantId: z.string().min(1).optional(),
  shopifySku: z.string().min(1),
  supplier: supplierNameSchema,
  supplierProductId: z.string().min(1),
  supplierVariantId: z.string().min(1).optional(),
  supplierSku: z.string().min(1),
  supplierProductUrl: z.string().url(),
  productCostUsd: z.number().min(0),
  shippingCostUsd: z.number().min(0),
  retailPriceUsd: z.number().positive(),
  estimatedDeliveryMinDays: z.number().int().min(1).max(90),
  estimatedDeliveryMaxDays: z.number().int().min(1).max(90),
  shipsFrom: z.string().min(2),
  shipsTo: z.array(targetMarketSchema).min(1),
  inventoryState: z.enum(["in_stock", "low_stock", "out_of_stock", "unknown"]),
  inventoryQuantity: z.number().int().min(0).optional(),
  trackingSyncSupported: z.boolean(),
  shippingProfile: z.string().min(1),
  verificationStatus: z.enum(["pending", "verified", "failed", "expired"]).default("pending"),
  verificationSource: z.enum(["zendrop_dashboard", "shopify_connected_store", "test_order_visibility"]),
  verifiedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  marginEstimatePercent: z.number().min(-100).max(100).default(0),
  rawPayload: z.record(z.unknown()).default({})
}).superRefine((value, ctx) => {
  if (value.estimatedDeliveryMinDays > value.estimatedDeliveryMaxDays) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["estimatedDeliveryMinDays"], message: "min delivery cannot exceed max delivery" });
  }
  if (value.supplier === "zendrop" && !/^https:\/\/app\.zendrop\.com\/product\/\d+/.test(value.supplierProductUrl)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["supplierProductUrl"], message: "zendrop product links must use https://app.zendrop.com/product/<numeric-id>" });
  }
});

export const supplierSyncAuditSchema = z.object({
  supplier: supplierNameSchema,
  action: z.enum([
    "product_link_recorded",
    "product_link_verified",
    "order_visibility_checked",
    "fulfillment_preflight",
    "approval_recorded",
    "supplier_order_polled",
    "tracking_synced",
    "sync_failed"
  ]),
  entityType: z.enum(["product_link", "order", "tracking", "approval"]),
  entityId: z.string().min(1),
  status: z.enum(["passed", "blocked", "failed", "info"]),
  message: z.string().min(1),
  metadata: z.record(z.unknown()).default({}),
  occurredAt: z.string().datetime()
});

export const fulfillmentApprovalSchema = z.object({
  shopifyOrderId: z.string().min(1),
  supplier: supplierNameSchema,
  supplierProductId: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]),
  reviewer: z.string().min(1),
  reason: z.string().min(1),
  preflight: z.record(z.unknown()).default({}),
  approvedAt: z.string().datetime().optional()
});

export const fulfillmentLifecycleEventSchema = z.object({
  shopifyOrderId: z.string().min(1),
  supplier: supplierNameSchema,
  status: z.enum(["pending", "linked", "approved", "processing", "fulfilled", "shipped", "delivered", "failed", "refunded"]),
  message: z.string().min(1),
  metadata: z.record(z.unknown()).default({}),
  occurredAt: z.string().datetime()
});

export const generatedContentAssetSchema = z.object({
  productHandle: z.string().min(1),
  type: z.enum(["hook", "caption", "ugc_script", "ad_variant", "cta", "headline"]),
  platform: z.enum(["tiktok", "instagram_reels", "youtube_shorts", "pinterest", "meta"]).optional(),
  content: z.string().min(1),
  score: z.number().min(0).max(100),
  metadata: z.record(z.unknown()).default({})
});

export const contentPostSchema = z.object({
  id: z.string().optional(),
  productHandle: z.string().min(1),
  platform: z.enum(["tiktok", "instagram_reels", "youtube_shorts", "pinterest"]),
  status: z.enum(["queued", "scheduled", "published", "failed"]).default("queued"),
  scheduledFor: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
  hook: z.string().min(1),
  caption: z.string().min(1),
  assetUrl: z.string().url().optional(),
  metrics: z.record(z.unknown()).default({})
});

export const analyticsEventSchema = z.object({
  eventId: z.string().min(1),
  source: z.enum(["shopify", "flutterwave", "klaviyo", "meta", "tiktok", "organic", "supplier", "system"]),
  type: z.enum([
    "page_view",
    "add_to_cart",
    "checkout_started",
    "purchase",
    "refund",
    "ad_spend",
    "payment_failed",
    "webhook_failed",
    "supplier_submitted",
    "supplier_fulfilled",
    "content_published"
  ]),
  productHandle: z.string().min(1).optional(),
  shopifyOrderId: z.string().min(1).optional(),
  valueUsd: z.number().min(0).optional(),
  metadata: z.record(z.unknown()).default({}),
  occurredAt: z.string().datetime()
});

export const productPublishRequestSchema = z.object({
  candidateExternalId: z.string().min(1),
  shopifyProduct: z.object({
    title: z.string().min(4),
    handle: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    bodyHtml: z.string().min(100),
    vendor: z.string().min(1),
    productType: z.string().min(1),
    tags: z.array(z.string()).default([]),
    priceUsd: z.number().positive(),
    compareAtPriceUsd: z.number().positive().optional(),
    seoTitle: z.string().min(10).max(70),
    seoDescription: z.string().min(40).max(160),
    faqs: z.array(z.object({ question: z.string().min(5), answer: z.string().min(10) })).min(3),
    trustBadges: z.array(z.string().min(2)).min(3),
    ugcVideoUrls: z.array(z.string().url()).default([])
  }),
  score: scoreInputSchema,
  supplierOffers: z.array(supplierOfferSchema).min(1)
});

export const aiProductPageSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "headline", "descriptionHtml", "faqs", "hooks", "trustBadges", "seoTitle", "seoDescription"],
  properties: {
    title: { type: "string" },
    headline: { type: "string" },
    descriptionHtml: { type: "string" },
    faqs: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "answer"],
        properties: {
          question: { type: "string" },
          answer: { type: "string" }
        }
      }
    },
    hooks: { type: "array", minItems: 10, items: { type: "string" } },
    trustBadges: { type: "array", minItems: 3, items: { type: "string" } },
    seoTitle: { type: "string" },
    seoDescription: { type: "string" }
  }
} as const;

export const aiCreativeLibrarySchema = {
  type: "object",
  additionalProperties: false,
  required: ["hooks", "shortFormConcepts", "adVariants", "ctaVariants", "headlineVariants"],
  properties: {
    hooks: { type: "array", minItems: 100, items: { type: "string" } },
    shortFormConcepts: {
      type: "array",
      minItems: 50,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["platform", "hook", "script", "caption", "shotList", "thumbnailText"],
        properties: {
          platform: { type: "string", enum: ["tiktok", "instagram_reels", "youtube_shorts", "pinterest"] },
          hook: { type: "string" },
          script: { type: "string" },
          caption: { type: "string" },
          shotList: { type: "array", minItems: 3, items: { type: "string" } },
          thumbnailText: { type: "string" }
        }
      }
    },
    adVariants: {
      type: "array",
      minItems: 30,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["platform", "primaryText", "headline", "cta", "angle"],
        properties: {
          platform: { type: "string", enum: ["meta", "tiktok"] },
          primaryText: { type: "string" },
          headline: { type: "string" },
          cta: { type: "string" },
          angle: { type: "string" }
        }
      }
    },
    ctaVariants: { type: "array", minItems: 30, items: { type: "string" } },
    headlineVariants: { type: "array", minItems: 20, items: { type: "string" } }
  }
} as const;
