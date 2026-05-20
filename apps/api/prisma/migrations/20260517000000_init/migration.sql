-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "ProductCandidate" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "targetMarkets" TEXT[],
    "observedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSignal" (
    "id" TEXT NOT NULL,
    "candidateExternalId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "demandVelocity" DOUBLE PRECISION NOT NULL,
    "competition" DOUBLE PRECISION NOT NULL,
    "adSaturation" DOUBLE PRECISION NOT NULL,
    "trendLongevity" DOUBLE PRECISION NOT NULL,
    "evidenceUrl" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierOffer" (
    "id" TEXT NOT NULL,
    "candidateExternalId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "supplierProductId" TEXT NOT NULL,
    "productCostUsd" DECIMAL(10,2) NOT NULL,
    "shippingCostUsd" DECIMAL(10,2) NOT NULL,
    "estimatedDeliveryDays" INTEGER NOT NULL,
    "inventoryVerified" BOOLEAN NOT NULL,
    "supportsTrackingSync" BOOLEAN NOT NULL,
    "shipsFrom" TEXT NOT NULL,
    "shipsTo" TEXT[],
    "sourceUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductScore" (
    "id" TEXT NOT NULL,
    "candidateExternalId" TEXT NOT NULL,
    "demandVelocity" DOUBLE PRECISION NOT NULL,
    "margin" DOUBLE PRECISION NOT NULL,
    "shippingSpeed" DOUBLE PRECISION NOT NULL,
    "wowFactor" DOUBLE PRECISION NOT NULL,
    "creativeEase" DOUBLE PRECISION NOT NULL,
    "trendLongevity" DOUBLE PRECISION NOT NULL,
    "competition" DOUBLE PRECISION NOT NULL,
    "adSaturation" DOUBLE PRECISION NOT NULL,
    "riskPenalties" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "decision" TEXT NOT NULL,
    "reasons" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyProduct" (
    "id" TEXT NOT NULL,
    "candidateExternalId" TEXT NOT NULL,
    "shopifyProductId" TEXT,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priceUsd" DECIMAL(10,2) NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifyProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeAsset" (
    "id" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "shotList" TEXT[],
    "thumbnailText" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreativeAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdExperiment" (
    "id" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "spendUsd" DECIMAL(10,2) NOT NULL,
    "impressions" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "productPageSessions" INTEGER NOT NULL,
    "addToCarts" INTEGER NOT NULL,
    "checkoutStarts" INTEGER NOT NULL,
    "purchases" INTEGER NOT NULL,
    "revenueUsd" DECIMAL(10,2) NOT NULL,
    "contributionMarginUsd" DECIMAL(10,2) NOT NULL,
    "consecutiveNegativeMarginDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdExperiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "orderName" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "subtotalUsd" DECIMAL(10,2) NOT NULL,
    "shippingUsd" DECIMAL(10,2) NOT NULL,
    "taxUsd" DECIMAL(10,2) NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderRoutingJob" (
    "id" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "selectedSupplier" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderRoutingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfillmentAttempt" (
    "id" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "supplierOrderId" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FulfillmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingEvent" (
    "id" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "trackingUrl" TEXT,
    "carrier" TEXT,
    "status" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfitSnapshot" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "revenueUsd" DECIMAL(10,2) NOT NULL,
    "paymentFeesUsd" DECIMAL(10,2) NOT NULL,
    "productCostUsd" DECIMAL(10,2) NOT NULL,
    "shippingCostUsd" DECIMAL(10,2) NOT NULL,
    "adSpendUsd" DECIMAL(10,2) NOT NULL,
    "refundCostUsd" DECIMAL(10,2) NOT NULL,
    "netProfitUsd" DECIMAL(10,2) NOT NULL,
    "marginPercent" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfitSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerTicket" (
    "id" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "aiEligible" BOOLEAN NOT NULL,
    "latestMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "signatureOk" BOOLEAN NOT NULL,
    "processedAt" TIMESTAMP(3),
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCandidate_externalId_key" ON "ProductCandidate"("externalId");

-- CreateIndex
CREATE INDEX "MarketSignal_source_idx" ON "MarketSignal"("source");

-- CreateIndex
CREATE INDEX "MarketSignal_candidateExternalId_idx" ON "MarketSignal"("candidateExternalId");

-- CreateIndex
CREATE INDEX "SupplierOffer_candidateExternalId_idx" ON "SupplierOffer"("candidateExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierOffer_supplier_supplierProductId_key" ON "SupplierOffer"("supplier", "supplierProductId");

-- CreateIndex
CREATE INDEX "ProductScore_candidateExternalId_idx" ON "ProductScore"("candidateExternalId");

-- CreateIndex
CREATE INDEX "ProductScore_decision_idx" ON "ProductScore"("decision");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyProduct_shopifyProductId_key" ON "ShopifyProduct"("shopifyProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyProduct_handle_key" ON "ShopifyProduct"("handle");

-- CreateIndex
CREATE INDEX "CreativeAsset_productHandle_platform_idx" ON "CreativeAsset"("productHandle", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "Order_shopifyOrderId_key" ON "Order"("shopifyOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfitSnapshot_orderId_key" ON "ProfitSnapshot"("orderId");

-- CreateIndex
CREATE INDEX "WebhookEvent_provider_topic_idx" ON "WebhookEvent"("provider", "topic");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_provider_eventId_key" ON "WebhookEvent"("provider", "eventId");

-- AddForeignKey
ALTER TABLE "MarketSignal" ADD CONSTRAINT "MarketSignal_candidateExternalId_fkey" FOREIGN KEY ("candidateExternalId") REFERENCES "ProductCandidate"("externalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductScore" ADD CONSTRAINT "ProductScore_candidateExternalId_fkey" FOREIGN KEY ("candidateExternalId") REFERENCES "ProductCandidate"("externalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyProduct" ADD CONSTRAINT "ShopifyProduct_candidateExternalId_fkey" FOREIGN KEY ("candidateExternalId") REFERENCES "ProductCandidate"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderRoutingJob" ADD CONSTRAINT "OrderRoutingJob_shopifyOrderId_fkey" FOREIGN KEY ("shopifyOrderId") REFERENCES "Order"("shopifyOrderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfitSnapshot" ADD CONSTRAINT "ProfitSnapshot_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("shopifyOrderId") ON DELETE CASCADE ON UPDATE CASCADE;

