-- CreateTable
CREATE TABLE "GeneratedContentAsset" (
    "id" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "platform" TEXT,
    "content" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedContentAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPost" (
    "id" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "hook" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "assetUrl" TEXT,
    "metrics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierOrder" (
    "id" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "supplierProductId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "providerOrderId" TEXT,
    "lastError" TEXT,
    "rawPayload" JSONB NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPolledAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "productHandle" TEXT,
    "shopifyOrderId" TEXT,
    "valueUsd" DECIMAL(10,2),
    "metadata" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMetricSnapshot" (
    "date" TIMESTAMP(3) NOT NULL,
    "revenueUsd" DECIMAL(10,2) NOT NULL,
    "netProfitUsd" DECIMAL(10,2) NOT NULL,
    "adSpendUsd" DECIMAL(10,2) NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,
    "addToCarts" INTEGER NOT NULL,
    "checkoutStarts" INTEGER NOT NULL,
    "purchases" INTEGER NOT NULL,
    "refunds" INTEGER NOT NULL,
    "paymentFailures" INTEGER NOT NULL,
    "webhookFailures" INTEGER NOT NULL,
    "supplierFailures" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMetricSnapshot_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "RetentionEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetentionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneratedContentAsset_productHandle_type_idx" ON "GeneratedContentAsset"("productHandle", "type");

-- CreateIndex
CREATE INDEX "GeneratedContentAsset_platform_idx" ON "GeneratedContentAsset"("platform");

-- CreateIndex
CREATE INDEX "ContentPost_productHandle_platform_idx" ON "ContentPost"("productHandle", "platform");

-- CreateIndex
CREATE INDEX "ContentPost_status_scheduledFor_idx" ON "ContentPost"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "SupplierOrder_status_idx" ON "SupplierOrder"("status");

-- CreateIndex
CREATE INDEX "SupplierOrder_providerOrderId_idx" ON "SupplierOrder"("providerOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierOrder_supplier_shopifyOrderId_supplierProductId_key" ON "SupplierOrder"("supplier", "shopifyOrderId", "supplierProductId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsEvent_eventId_key" ON "AnalyticsEvent"("eventId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_source_type_idx" ON "AnalyticsEvent"("source", "type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productHandle_idx" ON "AnalyticsEvent"("productHandle");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_occurredAt_idx" ON "AnalyticsEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "RetentionEvent_customerEmail_idx" ON "RetentionEvent"("customerEmail");

-- CreateIndex
CREATE INDEX "RetentionEvent_eventName_status_idx" ON "RetentionEvent"("eventName", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RetentionEvent_provider_eventId_key" ON "RetentionEvent"("provider", "eventId");

-- AddForeignKey
ALTER TABLE "SupplierOrder" ADD CONSTRAINT "SupplierOrder_shopifyOrderId_fkey" FOREIGN KEY ("shopifyOrderId") REFERENCES "Order"("shopifyOrderId") ON DELETE CASCADE ON UPDATE CASCADE;
