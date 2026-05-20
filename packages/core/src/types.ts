export type CurrencyCode = "USD" | "GBP" | "CAD" | "EUR" | "AUD" | "NGN";

export type SupplierName = "zendrop" | "spocket" | "cj" | "autods" | "dsers" | "manual";

export type TargetMarket = "US" | "UK" | "CA" | "EU" | "AU";

export type RiskLevel = "low" | "medium" | "high" | "blocked";

export type ProductCandidate = {
  externalId: string;
  title: string;
  niche: string;
  sourceUrl: string;
  imageUrls: string[];
  observedAt: string;
  targetMarkets: TargetMarket[];
};

export type MarketSignal = {
  candidateExternalId: string;
  source: "tiktok" | "meta_ads_library" | "amazon_movers" | "google_trends" | "aliexpress" | "shopify_spy";
  demandVelocity: number;
  competition: number;
  adSaturation: number;
  trendLongevity: number;
  evidenceUrl: string;
  capturedAt: string;
};

export type SupplierOffer = {
  supplier: SupplierName;
  supplierProductId: string;
  productCostUsd: number;
  shippingCostUsd: number;
  estimatedDeliveryDays: number;
  inventoryVerified: boolean;
  supportsTrackingSync: boolean;
  shipsFrom: string;
  shipsTo: TargetMarket[];
  sourceUrl: string;
};

export type SupplierInventoryState = "in_stock" | "low_stock" | "out_of_stock" | "unknown";

export type SupplierVerificationStatus = "pending" | "verified" | "failed" | "expired";

export type FulfillmentLifecycleStatus =
  | "pending"
  | "linked"
  | "approved"
  | "processing"
  | "fulfilled"
  | "shipped"
  | "delivered"
  | "failed"
  | "refunded";

export type SupplierProductLink = {
  productHandle: string;
  shopifyProductId?: string | undefined;
  shopifyVariantId?: string | undefined;
  shopifySku: string;
  supplier: SupplierName;
  supplierProductId: string;
  supplierVariantId?: string | undefined;
  supplierSku: string;
  supplierProductUrl: string;
  productCostUsd: number;
  shippingCostUsd: number;
  retailPriceUsd: number;
  estimatedDeliveryMinDays: number;
  estimatedDeliveryMaxDays: number;
  shipsFrom: string;
  shipsTo: TargetMarket[];
  inventoryState: SupplierInventoryState;
  inventoryQuantity?: number | undefined;
  trackingSyncSupported: boolean;
  shippingProfile: string;
  verificationStatus: SupplierVerificationStatus;
  verificationSource: "zendrop_dashboard" | "shopify_connected_store" | "test_order_visibility";
  verifiedAt?: string | undefined;
  expiresAt?: string | undefined;
  marginEstimatePercent: number;
  rawPayload: Record<string, unknown>;
};

export type SupplierSyncAudit = {
  supplier: SupplierName;
  action:
    | "product_link_recorded"
    | "product_link_verified"
    | "order_visibility_checked"
    | "fulfillment_preflight"
    | "approval_recorded"
    | "supplier_order_polled"
    | "tracking_synced"
    | "sync_failed";
  entityType: "product_link" | "order" | "tracking" | "approval";
  entityId: string;
  status: "passed" | "blocked" | "failed" | "info";
  message: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
};

export type FulfillmentApproval = {
  shopifyOrderId: string;
  supplier: SupplierName;
  supplierProductId: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewer: string;
  reason: string;
  preflight: Record<string, unknown>;
  approvedAt?: string | undefined;
};

export type FulfillmentLifecycleEvent = {
  shopifyOrderId: string;
  supplier: SupplierName;
  status: FulfillmentLifecycleStatus;
  message: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
};

export type ProductScoreInput = {
  demandVelocity: number;
  margin: number;
  shippingSpeed: number;
  wowFactor: number;
  creativeEase: number;
  trendLongevity: number;
  competition: number;
  adSaturation: number;
  riskPenalties: number;
};

export type ProductScore = ProductScoreInput & {
  total: number;
  decision: "reject" | "watch" | "draft" | "publish_ready";
  reasons: string[];
};

export type ShopifyProductDraft = {
  title: string;
  handle: string;
  bodyHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  priceUsd: number;
  compareAtPriceUsd?: number;
  seoTitle: string;
  seoDescription: string;
  faqs: Array<{ question: string; answer: string }>;
  trustBadges: string[];
  ugcVideoUrls: string[];
};

export type CreativeAsset = {
  productHandle: string;
  platform: "tiktok" | "instagram_reels" | "pinterest" | "meta";
  hook: string;
  script: string;
  shotList: string[];
  thumbnailText: string;
  cta: string;
};

export type AdExperiment = {
  id: string;
  productHandle: string;
  platform: "meta" | "tiktok";
  spendUsd: number;
  impressions: number;
  clicks: number;
  productPageSessions: number;
  addToCarts: number;
  checkoutStarts: number;
  purchases: number;
  revenueUsd: number;
  contributionMarginUsd: number;
  consecutiveNegativeMarginDays: number;
};

export type Order = {
  shopifyOrderId: string;
  orderName: string;
  paymentStatus: "pending" | "paid" | "refunded" | "voided" | "failed";
  riskLevel: RiskLevel;
  currency: CurrencyCode;
  subtotalUsd: number;
  shippingUsd: number;
  taxUsd: number;
  customerEmail: string;
  createdAt: string;
};

export type OrderRoutingJob = {
  id: string;
  shopifyOrderId: string;
  selectedSupplier: SupplierName;
  status: "queued" | "held" | "processing" | "sent" | "failed" | "dead_letter";
  attempts: number;
  lastError?: string;
};

export type ProfitSnapshot = {
  orderId: string;
  revenueUsd: number;
  paymentFeesUsd: number;
  productCostUsd: number;
  shippingCostUsd: number;
  adSpendUsd: number;
  refundCostUsd: number;
  netProfitUsd: number;
  marginPercent: number;
};

export type FulfillmentAttempt = {
  shopifyOrderId: string;
  supplier: SupplierName;
  supplierOrderId?: string | undefined;
  status: "dry_run" | "held" | "sent" | "failed";
  error?: string | undefined;
};

export type TrackingEvent = {
  shopifyOrderId: string;
  supplier: SupplierName;
  trackingNumber: string;
  trackingUrl?: string;
  carrier?: string;
  status: "received" | "synced" | "failed";
  rawPayload: unknown;
};

export type AnalyticsDashboard = {
  revenueUsd: number;
  netProfitUsd: number;
  orderCount: number;
  heldRoutingJobs: number;
  failedRoutingJobs: number;
  averageOrderValueUsd: number;
  refundCostUsd: number;
  delayedShipmentCount: number;
  adSpendUsd: number;
  cacUsd: number;
  roas: number;
  addToCartRate: number;
  checkoutConversionRate: number;
  abandonedCartRate: number;
  supplierLatencyHours: number;
  webhookFailureCount: number;
  paymentFailureCount: number;
};

export type SupplierOrder = {
  shopifyOrderId: string;
  supplier: SupplierName;
  supplierProductId: string;
  quantity: number;
  mode: "dry_run" | "simulation" | "connected_store" | "manual";
  status:
    | "draft"
    | "held"
    | "submitted"
    | "pending"
    | "linked"
    | "approved"
    | "processing"
    | "fulfilled"
    | "shipped"
    | "delivered"
    | "failed"
    | "refunded"
    | "cancelled";
  providerOrderId?: string | undefined;
  lastError?: string | undefined;
  rawPayload: unknown;
};

export type AnalyticsEvent = {
  eventId: string;
  source: "shopify" | "flutterwave" | "klaviyo" | "meta" | "tiktok" | "organic" | "supplier" | "system";
  type:
    | "page_view"
    | "add_to_cart"
    | "checkout_started"
    | "purchase"
    | "refund"
    | "ad_spend"
    | "payment_failed"
    | "webhook_failed"
    | "supplier_submitted"
    | "supplier_fulfilled"
    | "content_published";
  productHandle?: string | undefined;
  shopifyOrderId?: string | undefined;
  valueUsd?: number | undefined;
  metadata: Record<string, unknown>;
  occurredAt: string;
};

export type DailyAnalyticsSnapshot = {
  date: string;
  revenueUsd: number;
  netProfitUsd: number;
  adSpendUsd: number;
  orderCount: number;
  sessions: number;
  addToCarts: number;
  checkoutStarts: number;
  purchases: number;
  refunds: number;
  paymentFailures: number;
  webhookFailures: number;
  supplierFailures: number;
};

export type RetentionEvent = {
  provider: "klaviyo" | "shopify" | "system";
  eventId: string;
  customerEmail: string;
  eventName: "Abandoned Checkout" | "Placed Order" | "Fulfillment Held" | "Tracking Updated" | "Winback Eligible";
  status: "dry_run" | "sent" | "failed";
  payload: Record<string, unknown>;
};

export type GeneratedContentAsset = {
  productHandle: string;
  type: "hook" | "caption" | "ugc_script" | "ad_variant" | "cta" | "headline";
  platform?: "tiktok" | "instagram_reels" | "youtube_shorts" | "pinterest" | "meta" | undefined;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
};

export type ContentPost = {
  id?: string | undefined;
  productHandle: string;
  platform: "tiktok" | "instagram_reels" | "youtube_shorts" | "pinterest";
  status: "queued" | "scheduled" | "published" | "failed";
  scheduledFor: string;
  publishedAt?: string | undefined;
  hook: string;
  caption: string;
  assetUrl?: string | undefined;
  metrics: Record<string, unknown>;
};
