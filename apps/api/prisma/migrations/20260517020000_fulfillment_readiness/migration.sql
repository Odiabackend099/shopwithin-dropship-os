CREATE TABLE "SupplierProductLink" (
    "id" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "shopifyProductId" TEXT,
    "shopifyVariantId" TEXT,
    "shopifySku" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "supplierProductId" TEXT NOT NULL,
    "supplierVariantId" TEXT,
    "supplierSku" TEXT NOT NULL,
    "supplierProductUrl" TEXT NOT NULL,
    "productCostUsd" DECIMAL(10,2) NOT NULL,
    "shippingCostUsd" DECIMAL(10,2) NOT NULL,
    "retailPriceUsd" DECIMAL(10,2) NOT NULL,
    "estimatedDeliveryMinDays" INTEGER NOT NULL,
    "estimatedDeliveryMaxDays" INTEGER NOT NULL,
    "shipsFrom" TEXT NOT NULL,
    "shipsTo" TEXT[],
    "inventoryState" TEXT NOT NULL,
    "inventoryQuantity" INTEGER,
    "trackingSyncSupported" BOOLEAN NOT NULL,
    "shippingProfile" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL,
    "verificationSource" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "marginEstimatePercent" DECIMAL(10,2) NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierProductLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupplierSyncAudit" (
    "id" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierSyncAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FulfillmentApproval" (
    "id" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "supplierProductId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reviewer" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "preflight" JSONB NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FulfillmentApproval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FulfillmentLifecycleEvent" (
    "id" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FulfillmentLifecycleEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SupplierProductLink_supplier_productHandle_shopifySku_key" ON "SupplierProductLink"("supplier", "productHandle", "shopifySku");
CREATE INDEX "SupplierProductLink_supplier_supplierProductId_idx" ON "SupplierProductLink"("supplier", "supplierProductId");
CREATE INDEX "SupplierProductLink_verificationStatus_idx" ON "SupplierProductLink"("verificationStatus");
CREATE INDEX "SupplierSyncAudit_supplier_action_idx" ON "SupplierSyncAudit"("supplier", "action");
CREATE INDEX "SupplierSyncAudit_entityType_entityId_idx" ON "SupplierSyncAudit"("entityType", "entityId");
CREATE INDEX "SupplierSyncAudit_occurredAt_idx" ON "SupplierSyncAudit"("occurredAt");
CREATE UNIQUE INDEX "FulfillmentApproval_shopifyOrderId_supplier_supplierProductId_key" ON "FulfillmentApproval"("shopifyOrderId", "supplier", "supplierProductId");
CREATE INDEX "FulfillmentApproval_status_idx" ON "FulfillmentApproval"("status");
CREATE INDEX "FulfillmentLifecycleEvent_shopifyOrderId_occurredAt_idx" ON "FulfillmentLifecycleEvent"("shopifyOrderId", "occurredAt");
CREATE INDEX "FulfillmentLifecycleEvent_supplier_status_idx" ON "FulfillmentLifecycleEvent"("supplier", "status");

ALTER TABLE "FulfillmentApproval" ADD CONSTRAINT "FulfillmentApproval_shopifyOrderId_fkey" FOREIGN KEY ("shopifyOrderId") REFERENCES "Order"("shopifyOrderId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FulfillmentLifecycleEvent" ADD CONSTRAINT "FulfillmentLifecycleEvent_shopifyOrderId_fkey" FOREIGN KEY ("shopifyOrderId") REFERENCES "Order"("shopifyOrderId") ON DELETE CASCADE ON UPDATE CASCADE;
