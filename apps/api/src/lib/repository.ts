import { Prisma, PrismaClient } from "@prisma/client";
import {
  calculateCac,
  calculateProfitSnapshot,
  calculateRate,
  calculateRoas,
  type AnalyticsDashboard,
  type AnalyticsEvent,
  type ContentPost,
  type DailyAnalyticsSnapshot,
  type FulfillmentApproval,
  type FulfillmentAttempt,
  type FulfillmentLifecycleEvent,
  type GeneratedContentAsset,
  type Order,
  type ProfitSnapshot,
  type RetentionEvent,
  type SupplierOffer,
  type SupplierOrder,
  type SupplierProductLink,
  type SupplierSyncAudit,
  type TrackingEvent
} from "@dropship-os/core";

export type StoredWebhookEvent = {
  provider: string;
  eventId: string;
  topic: string;
  signatureOk: boolean;
  rawPayload: unknown;
};

export interface Repository {
  recordWebhookEvent(event: StoredWebhookEvent): Promise<{ duplicate: boolean }>;
  markWebhookProcessed(provider: string, eventId: string): Promise<void>;
  upsertOrder(order: Order, rawPayload: unknown): Promise<void>;
  getOrder(shopifyOrderId: string): Promise<Order | null>;
  createRoutingJob(job: { id: string; shopifyOrderId: string; selectedSupplier: string; status: string }): Promise<void>;
  updateRoutingJob(jobId: string, status: string, lastError?: string): Promise<void>;
  upsertSupplierOffer(candidateExternalId: string, offer: SupplierOffer): Promise<void>;
  upsertSupplierProductLink(link: SupplierProductLink): Promise<SupplierProductLink>;
  getSupplierProductLink(input: { supplier: string; productHandle: string; shopifySku: string }): Promise<SupplierProductLink | null>;
  listSupplierProductLinks(productHandle?: string): Promise<SupplierProductLink[]>;
  recordSupplierSyncAudit(audit: SupplierSyncAudit): Promise<void>;
  recordFulfillmentAttempt(attempt: FulfillmentAttempt): Promise<void>;
  upsertFulfillmentApproval(approval: FulfillmentApproval): Promise<FulfillmentApproval>;
  recordFulfillmentLifecycleEvent(event: FulfillmentLifecycleEvent): Promise<void>;
  recordTrackingEvent(event: TrackingEvent): Promise<void>;
  upsertProfitSnapshot(snapshot: Omit<ProfitSnapshot, "netProfitUsd" | "marginPercent">): Promise<ProfitSnapshot>;
  upsertSupplierOrder(order: SupplierOrder): Promise<SupplierOrder>;
  recordAnalyticsEvent(event: AnalyticsEvent): Promise<{ duplicate: boolean }>;
  upsertDailyAnalyticsSnapshot(snapshot: DailyAnalyticsSnapshot): Promise<DailyAnalyticsSnapshot>;
  recordRetentionEvent(event: RetentionEvent): Promise<{ duplicate: boolean }>;
  recordGeneratedContentAssets(assets: GeneratedContentAsset[]): Promise<number>;
  scheduleContentPosts(posts: ContentPost[]): Promise<number>;
  getAnalyticsDashboard(): Promise<AnalyticsDashboard>;
  getFulfillmentOpsDashboard(): Promise<FulfillmentOpsDashboard>;
  close(): Promise<void>;
}

export type FulfillmentOpsDashboard = {
  productLinks: SupplierProductLink[];
  supplierOrders: SupplierOrder[];
  approvals: FulfillmentApproval[];
  lifecycle: FulfillmentLifecycleEvent[];
  audits: SupplierSyncAudit[];
  trackingEvents: TrackingEvent[];
  summary: {
    linkedProducts: number;
    verifiedLinks: number;
    pendingApprovals: number;
    supplierFailures: number;
    trackingEvents: number;
  };
};

export class InMemoryRepository implements Repository {
  private readonly webhookEvents = new Set<string>();
  readonly orders = new Map<string, Order>();
  readonly jobs = new Map<string, { id: string; shopifyOrderId: string; selectedSupplier: string; status: string; lastError?: string }>();
  readonly supplierOffers = new Map<string, SupplierOffer & { candidateExternalId: string }>();
  readonly supplierProductLinks = new Map<string, SupplierProductLink>();
  readonly supplierSyncAudits: SupplierSyncAudit[] = [];
  readonly fulfillmentAttempts: FulfillmentAttempt[] = [];
  readonly fulfillmentApprovals = new Map<string, FulfillmentApproval>();
  readonly fulfillmentLifecycleEvents: FulfillmentLifecycleEvent[] = [];
  readonly trackingEvents: TrackingEvent[] = [];
  readonly profitSnapshots = new Map<string, ProfitSnapshot>();
  readonly supplierOrders = new Map<string, SupplierOrder>();
  readonly analyticsEvents = new Map<string, AnalyticsEvent>();
  readonly dailySnapshots = new Map<string, DailyAnalyticsSnapshot>();
  readonly retentionEvents = new Map<string, RetentionEvent>();
  readonly generatedContentAssets: GeneratedContentAsset[] = [];
  readonly contentPosts: ContentPost[] = [];

  async recordWebhookEvent(event: StoredWebhookEvent): Promise<{ duplicate: boolean }> {
    const key = `${event.provider}:${event.eventId}`;
    if (this.webhookEvents.has(key)) return { duplicate: true };
    this.webhookEvents.add(key);
    return { duplicate: false };
  }

  async markWebhookProcessed(): Promise<void> {
    return;
  }

  async upsertOrder(order: Order): Promise<void> {
    this.orders.set(order.shopifyOrderId, order);
  }

  async getOrder(shopifyOrderId: string): Promise<Order | null> {
    return this.orders.get(shopifyOrderId) ?? null;
  }

  async createRoutingJob(job: { id: string; shopifyOrderId: string; selectedSupplier: string; status: string }): Promise<void> {
    this.jobs.set(job.id, job);
  }

  async updateRoutingJob(jobId: string, status: string, lastError?: string): Promise<void> {
    const existing = this.jobs.get(jobId);
    if (!existing) return;
    this.jobs.set(jobId, { ...existing, status, ...(lastError ? { lastError } : {}) });
  }

  async upsertSupplierOffer(candidateExternalId: string, offer: SupplierOffer): Promise<void> {
    this.supplierOffers.set(`${offer.supplier}:${offer.supplierProductId}`, { ...offer, candidateExternalId });
  }

  async upsertSupplierProductLink(link: SupplierProductLink): Promise<SupplierProductLink> {
    this.supplierProductLinks.set(supplierProductLinkKey(link.supplier, link.productHandle, link.shopifySku), link);
    return link;
  }

  async getSupplierProductLink(input: { supplier: string; productHandle: string; shopifySku: string }): Promise<SupplierProductLink | null> {
    return this.supplierProductLinks.get(supplierProductLinkKey(input.supplier, input.productHandle, input.shopifySku)) ?? null;
  }

  async listSupplierProductLinks(productHandle?: string): Promise<SupplierProductLink[]> {
    const links = [...this.supplierProductLinks.values()];
    return productHandle ? links.filter((link) => link.productHandle === productHandle) : links;
  }

  async recordSupplierSyncAudit(audit: SupplierSyncAudit): Promise<void> {
    this.supplierSyncAudits.push(audit);
  }

  async recordFulfillmentAttempt(attempt: FulfillmentAttempt): Promise<void> {
    this.fulfillmentAttempts.push(attempt);
  }

  async upsertFulfillmentApproval(approval: FulfillmentApproval): Promise<FulfillmentApproval> {
    this.fulfillmentApprovals.set(`${approval.shopifyOrderId}:${approval.supplier}:${approval.supplierProductId}`, approval);
    return approval;
  }

  async recordFulfillmentLifecycleEvent(event: FulfillmentLifecycleEvent): Promise<void> {
    this.fulfillmentLifecycleEvents.push(event);
  }

  async recordTrackingEvent(event: TrackingEvent): Promise<void> {
    this.trackingEvents.push(event);
  }

  async upsertProfitSnapshot(snapshot: Omit<ProfitSnapshot, "netProfitUsd" | "marginPercent">): Promise<ProfitSnapshot> {
    const calculated = calculateProfitSnapshot(snapshot);
    this.profitSnapshots.set(snapshot.orderId, calculated);
    return calculated;
  }

  async upsertSupplierOrder(order: SupplierOrder): Promise<SupplierOrder> {
    this.supplierOrders.set(`${order.supplier}:${order.shopifyOrderId}:${order.supplierProductId}`, order);
    return order;
  }

  async recordAnalyticsEvent(event: AnalyticsEvent): Promise<{ duplicate: boolean }> {
    if (this.analyticsEvents.has(event.eventId)) return { duplicate: true };
    this.analyticsEvents.set(event.eventId, event);
    return { duplicate: false };
  }

  async upsertDailyAnalyticsSnapshot(snapshot: DailyAnalyticsSnapshot): Promise<DailyAnalyticsSnapshot> {
    this.dailySnapshots.set(snapshot.date, snapshot);
    return snapshot;
  }

  async recordRetentionEvent(event: RetentionEvent): Promise<{ duplicate: boolean }> {
    const key = `${event.provider}:${event.eventId}`;
    if (this.retentionEvents.has(key)) return { duplicate: true };
    this.retentionEvents.set(key, event);
    return { duplicate: false };
  }

  async recordGeneratedContentAssets(assets: GeneratedContentAsset[]): Promise<number> {
    this.generatedContentAssets.push(...assets);
    return assets.length;
  }

  async scheduleContentPosts(posts: ContentPost[]): Promise<number> {
    this.contentPosts.push(...posts);
    return posts.length;
  }

  async getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
    const orders = [...this.orders.values()];
    const revenueUsd = orders.reduce((sum, order) => sum + order.subtotalUsd + order.shippingUsd + order.taxUsd, 0);
    const profits = [...this.profitSnapshots.values()];
    const netProfitUsd = profits.reduce((sum, snapshot) => sum + snapshot.netProfitUsd, 0);
    const refundCostUsd = profits.reduce((sum, snapshot) => sum + snapshot.refundCostUsd, 0);
    const heldRoutingJobs = [...this.jobs.values()].filter((job) => job.status === "held").length;
    const failedRoutingJobs = [...this.jobs.values()].filter((job) => job.status === "failed" || job.status === "dead_letter").length;
    const events = [...this.analyticsEvents.values()];
    const adSpendUsd = events.filter((event) => event.type === "ad_spend").reduce((sum, event) => sum + (event.valueUsd ?? 0), 0);
    const sessions = events.filter((event) => event.type === "page_view").length;
    const addToCarts = events.filter((event) => event.type === "add_to_cart").length;
    const checkoutStarts = events.filter((event) => event.type === "checkout_started").length;
    const paymentFailureCount = events.filter((event) => event.type === "payment_failed").length;
    const webhookFailureCount = events.filter((event) => event.type === "webhook_failed").length;
    return {
      revenueUsd,
      netProfitUsd,
      orderCount: orders.length,
      heldRoutingJobs,
      failedRoutingJobs,
      averageOrderValueUsd: orders.length === 0 ? 0 : revenueUsd / orders.length,
      refundCostUsd,
      delayedShipmentCount: this.trackingEvents.filter((event) => event.status === "failed").length,
      adSpendUsd,
      cacUsd: calculateCac(adSpendUsd, orders.length),
      roas: calculateRoas(revenueUsd, adSpendUsd),
      addToCartRate: calculateRate(addToCarts, sessions),
      checkoutConversionRate: calculateRate(orders.length, checkoutStarts),
      abandonedCartRate: calculateRate(Math.max(checkoutStarts - orders.length, 0), checkoutStarts),
      supplierLatencyHours: 0,
      webhookFailureCount,
      paymentFailureCount
    };
  }

  async getFulfillmentOpsDashboard(): Promise<FulfillmentOpsDashboard> {
    const productLinks = [...this.supplierProductLinks.values()];
    const supplierOrders = [...this.supplierOrders.values()];
    const approvals = [...this.fulfillmentApprovals.values()];
    const lifecycle = [...this.fulfillmentLifecycleEvents].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
    const audits = [...this.supplierSyncAudits].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
    return {
      productLinks,
      supplierOrders,
      approvals,
      lifecycle,
      audits,
      trackingEvents: [...this.trackingEvents],
      summary: {
        linkedProducts: productLinks.length,
        verifiedLinks: productLinks.filter((link) => link.verificationStatus === "verified").length,
        pendingApprovals: approvals.filter((approval) => approval.status === "pending").length,
        supplierFailures:
          supplierOrders.filter((order) => order.status === "failed").length +
          countActiveFailedAudits(audits) +
          countActiveFailedLifecycleEvents(lifecycle),
        trackingEvents: this.trackingEvents.length
      }
    };
  }

  async close(): Promise<void> {
    return;
  }
}

export class PrismaRepository implements Repository {
  constructor(private readonly prisma = new PrismaClient()) {}

  async recordWebhookEvent(event: StoredWebhookEvent): Promise<{ duplicate: boolean }> {
    try {
      await this.prisma.webhookEvent.create({
        data: {
          provider: event.provider,
          eventId: event.eventId,
          topic: event.topic,
          signatureOk: event.signatureOk,
          rawPayload: event.rawPayload as object
        }
      });
      return { duplicate: false };
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        return { duplicate: true };
      }
      throw error;
    }
  }

  async markWebhookProcessed(provider: string, eventId: string): Promise<void> {
    await this.prisma.webhookEvent.update({
      where: { provider_eventId: { provider, eventId } },
      data: { processedAt: new Date() }
    });
  }

  async upsertOrder(order: Order, rawPayload: unknown): Promise<void> {
    await this.prisma.order.upsert({
      where: { shopifyOrderId: order.shopifyOrderId },
      update: {
        paymentStatus: order.paymentStatus,
        riskLevel: order.riskLevel,
        rawPayload: rawPayload as object
      },
      create: {
        shopifyOrderId: order.shopifyOrderId,
        orderName: order.orderName,
        paymentStatus: order.paymentStatus,
        riskLevel: order.riskLevel,
        currency: order.currency,
        subtotalUsd: order.subtotalUsd,
        shippingUsd: order.shippingUsd,
        taxUsd: order.taxUsd,
        customerEmail: order.customerEmail,
        rawPayload: rawPayload as object
      }
    });
  }

  async getOrder(shopifyOrderId: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({ where: { shopifyOrderId } });
    if (!order) return null;
    return {
      shopifyOrderId: order.shopifyOrderId,
      orderName: order.orderName,
      paymentStatus: order.paymentStatus as Order["paymentStatus"],
      riskLevel: order.riskLevel as Order["riskLevel"],
      currency: order.currency as Order["currency"],
      subtotalUsd: Number(order.subtotalUsd),
      shippingUsd: Number(order.shippingUsd),
      taxUsd: Number(order.taxUsd),
      customerEmail: order.customerEmail,
      createdAt: order.createdAt.toISOString()
    };
  }

  async createRoutingJob(job: { id: string; shopifyOrderId: string; selectedSupplier: string; status: string }): Promise<void> {
    await this.prisma.orderRoutingJob.upsert({
      where: { id: job.id },
      update: { status: job.status, selectedSupplier: job.selectedSupplier },
      create: {
        id: job.id,
        shopifyOrderId: job.shopifyOrderId,
        selectedSupplier: job.selectedSupplier,
        status: job.status
      }
    });
  }

  async updateRoutingJob(jobId: string, status: string, lastError?: string): Promise<void> {
    await this.prisma.orderRoutingJob.update({
      where: { id: jobId },
      data: { status, ...(lastError ? { lastError } : {}) }
    });
  }

  async upsertSupplierOffer(candidateExternalId: string, offer: SupplierOffer): Promise<void> {
    await this.prisma.supplierOffer.upsert({
      where: { supplier_supplierProductId: { supplier: offer.supplier, supplierProductId: offer.supplierProductId } },
      update: {
        candidateExternalId,
        productCostUsd: offer.productCostUsd,
        shippingCostUsd: offer.shippingCostUsd,
        estimatedDeliveryDays: offer.estimatedDeliveryDays,
        inventoryVerified: offer.inventoryVerified,
        supportsTrackingSync: offer.supportsTrackingSync,
        shipsFrom: offer.shipsFrom,
        shipsTo: offer.shipsTo,
        sourceUrl: offer.sourceUrl
      },
      create: {
        candidateExternalId,
        supplier: offer.supplier,
        supplierProductId: offer.supplierProductId,
        productCostUsd: offer.productCostUsd,
        shippingCostUsd: offer.shippingCostUsd,
        estimatedDeliveryDays: offer.estimatedDeliveryDays,
        inventoryVerified: offer.inventoryVerified,
        supportsTrackingSync: offer.supportsTrackingSync,
        shipsFrom: offer.shipsFrom,
        shipsTo: offer.shipsTo,
        sourceUrl: offer.sourceUrl
      }
    });
  }

  async upsertSupplierProductLink(link: SupplierProductLink): Promise<SupplierProductLink> {
    await this.prisma.supplierProductLink.upsert({
      where: {
        supplier_productHandle_shopifySku: {
          supplier: link.supplier,
          productHandle: link.productHandle,
          shopifySku: link.shopifySku
        }
      },
      update: supplierProductLinkData(link),
      create: supplierProductLinkData(link)
    });
    return link;
  }

  async getSupplierProductLink(input: { supplier: string; productHandle: string; shopifySku: string }): Promise<SupplierProductLink | null> {
    const link = await this.prisma.supplierProductLink.findUnique({
      where: {
        supplier_productHandle_shopifySku: {
          supplier: input.supplier,
          productHandle: input.productHandle,
          shopifySku: input.shopifySku
        }
      }
    });
    return link ? mapSupplierProductLink(link) : null;
  }

  async listSupplierProductLinks(productHandle?: string): Promise<SupplierProductLink[]> {
    const links = await this.prisma.supplierProductLink.findMany({
      ...(productHandle ? { where: { productHandle } } : {}),
      orderBy: [{ verificationStatus: "asc" }, { updatedAt: "desc" }]
    });
    return links.map(mapSupplierProductLink);
  }

  async recordSupplierSyncAudit(audit: SupplierSyncAudit): Promise<void> {
    await this.prisma.supplierSyncAudit.create({
      data: {
        supplier: audit.supplier,
        action: audit.action,
        entityType: audit.entityType,
        entityId: audit.entityId,
        status: audit.status,
        message: audit.message,
        metadata: audit.metadata as Prisma.InputJsonValue,
        occurredAt: new Date(audit.occurredAt)
      }
    });
  }

  async recordFulfillmentAttempt(attempt: FulfillmentAttempt): Promise<void> {
    await this.prisma.fulfillmentAttempt.create({
      data: {
        shopifyOrderId: attempt.shopifyOrderId,
        supplier: attempt.supplier,
        supplierOrderId: attempt.supplierOrderId ?? null,
        status: attempt.status,
        error: attempt.error ?? null
      }
    });
  }

  async upsertFulfillmentApproval(approval: FulfillmentApproval): Promise<FulfillmentApproval> {
    await this.prisma.fulfillmentApproval.upsert({
      where: {
        shopifyOrderId_supplier_supplierProductId: {
          shopifyOrderId: approval.shopifyOrderId,
          supplier: approval.supplier,
          supplierProductId: approval.supplierProductId
        }
      },
      update: {
        status: approval.status,
        reviewer: approval.reviewer,
        reason: approval.reason,
        preflight: approval.preflight as Prisma.InputJsonValue,
        approvedAt: approval.approvedAt ? new Date(approval.approvedAt) : null
      },
      create: {
        shopifyOrderId: approval.shopifyOrderId,
        supplier: approval.supplier,
        supplierProductId: approval.supplierProductId,
        status: approval.status,
        reviewer: approval.reviewer,
        reason: approval.reason,
        preflight: approval.preflight as Prisma.InputJsonValue,
        approvedAt: approval.approvedAt ? new Date(approval.approvedAt) : null
      }
    });
    return approval;
  }

  async recordFulfillmentLifecycleEvent(event: FulfillmentLifecycleEvent): Promise<void> {
    await this.prisma.fulfillmentLifecycleEvent.create({
      data: {
        shopifyOrderId: event.shopifyOrderId,
        supplier: event.supplier,
        status: event.status,
        message: event.message,
        metadata: event.metadata as Prisma.InputJsonValue,
        occurredAt: new Date(event.occurredAt)
      }
    });
  }

  async recordTrackingEvent(event: TrackingEvent): Promise<void> {
    await this.prisma.trackingEvent.create({
      data: {
        shopifyOrderId: event.shopifyOrderId,
        supplier: event.supplier,
        trackingNumber: event.trackingNumber,
        trackingUrl: event.trackingUrl ?? null,
        carrier: event.carrier ?? null,
        status: event.status,
        rawPayload: event.rawPayload as object
      }
    });
  }

  async upsertProfitSnapshot(snapshot: Omit<ProfitSnapshot, "netProfitUsd" | "marginPercent">): Promise<ProfitSnapshot> {
    const order = await this.prisma.order.findFirst({
      where: { OR: [{ shopifyOrderId: snapshot.orderId }, { orderName: snapshot.orderId }] },
      select: { shopifyOrderId: true }
    });
    const calculated = calculateProfitSnapshot({ ...snapshot, orderId: order?.shopifyOrderId ?? snapshot.orderId });
    await this.prisma.profitSnapshot.upsert({
      where: { orderId: calculated.orderId },
      update: {
        revenueUsd: calculated.revenueUsd,
        paymentFeesUsd: calculated.paymentFeesUsd,
        productCostUsd: calculated.productCostUsd,
        shippingCostUsd: calculated.shippingCostUsd,
        adSpendUsd: calculated.adSpendUsd,
        refundCostUsd: calculated.refundCostUsd,
        netProfitUsd: calculated.netProfitUsd,
        marginPercent: calculated.marginPercent
      },
      create: {
        orderId: calculated.orderId,
        revenueUsd: calculated.revenueUsd,
        paymentFeesUsd: calculated.paymentFeesUsd,
        productCostUsd: calculated.productCostUsd,
        shippingCostUsd: calculated.shippingCostUsd,
        adSpendUsd: calculated.adSpendUsd,
        refundCostUsd: calculated.refundCostUsd,
        netProfitUsd: calculated.netProfitUsd,
        marginPercent: calculated.marginPercent
      }
    });
    return calculated;
  }

  async upsertSupplierOrder(order: SupplierOrder): Promise<SupplierOrder> {
    await this.prisma.supplierOrder.upsert({
      where: {
        supplier_shopifyOrderId_supplierProductId: {
          supplier: order.supplier,
          shopifyOrderId: order.shopifyOrderId,
          supplierProductId: order.supplierProductId
        }
      },
      update: {
        quantity: order.quantity,
        mode: order.mode,
        status: order.status,
        providerOrderId: order.providerOrderId ?? null,
        lastError: order.lastError ?? null,
        rawPayload: order.rawPayload as Prisma.InputJsonValue,
        lastPolledAt: new Date()
      },
      create: {
        shopifyOrderId: order.shopifyOrderId,
        supplier: order.supplier,
        supplierProductId: order.supplierProductId,
        quantity: order.quantity,
        mode: order.mode,
        status: order.status,
        providerOrderId: order.providerOrderId ?? null,
        lastError: order.lastError ?? null,
        rawPayload: order.rawPayload as Prisma.InputJsonValue
      }
    });
    return order;
  }

  async recordAnalyticsEvent(event: AnalyticsEvent): Promise<{ duplicate: boolean }> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          eventId: event.eventId,
          source: event.source,
          type: event.type,
          productHandle: event.productHandle ?? null,
          shopifyOrderId: event.shopifyOrderId ?? null,
          valueUsd: event.valueUsd ?? null,
          metadata: event.metadata as Prisma.InputJsonValue,
          occurredAt: new Date(event.occurredAt)
        }
      });
      return { duplicate: false };
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        return { duplicate: true };
      }
      throw error;
    }
  }

  async upsertDailyAnalyticsSnapshot(snapshot: DailyAnalyticsSnapshot): Promise<DailyAnalyticsSnapshot> {
    await this.prisma.dailyMetricSnapshot.upsert({
      where: { date: new Date(snapshot.date) },
      update: {
        revenueUsd: snapshot.revenueUsd,
        netProfitUsd: snapshot.netProfitUsd,
        adSpendUsd: snapshot.adSpendUsd,
        orderCount: snapshot.orderCount,
        sessions: snapshot.sessions,
        addToCarts: snapshot.addToCarts,
        checkoutStarts: snapshot.checkoutStarts,
        purchases: snapshot.purchases,
        refunds: snapshot.refunds,
        paymentFailures: snapshot.paymentFailures,
        webhookFailures: snapshot.webhookFailures,
        supplierFailures: snapshot.supplierFailures
      },
      create: {
        date: new Date(snapshot.date),
        revenueUsd: snapshot.revenueUsd,
        netProfitUsd: snapshot.netProfitUsd,
        adSpendUsd: snapshot.adSpendUsd,
        orderCount: snapshot.orderCount,
        sessions: snapshot.sessions,
        addToCarts: snapshot.addToCarts,
        checkoutStarts: snapshot.checkoutStarts,
        purchases: snapshot.purchases,
        refunds: snapshot.refunds,
        paymentFailures: snapshot.paymentFailures,
        webhookFailures: snapshot.webhookFailures,
        supplierFailures: snapshot.supplierFailures
      }
    });
    return snapshot;
  }

  async recordRetentionEvent(event: RetentionEvent): Promise<{ duplicate: boolean }> {
    try {
      await this.prisma.retentionEvent.create({
        data: {
          provider: event.provider,
          eventId: event.eventId,
          customerEmail: event.customerEmail,
          eventName: event.eventName,
          status: event.status,
          payload: event.payload as Prisma.InputJsonValue
        }
      });
      return { duplicate: false };
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        return { duplicate: true };
      }
      throw error;
    }
  }

  async recordGeneratedContentAssets(assets: GeneratedContentAsset[]): Promise<number> {
    if (assets.length === 0) return 0;
    await this.prisma.generatedContentAsset.createMany({
      data: assets.map((asset) => ({
        productHandle: asset.productHandle,
        type: asset.type,
        platform: asset.platform ?? null,
        content: asset.content,
        score: asset.score,
        metadata: asset.metadata as Prisma.InputJsonValue
      }))
    });
    return assets.length;
  }

  async scheduleContentPosts(posts: ContentPost[]): Promise<number> {
    if (posts.length === 0) return 0;
    await this.prisma.contentPost.createMany({
      data: posts.map((post) => ({
        productHandle: post.productHandle,
        platform: post.platform,
        status: post.status,
        scheduledFor: new Date(post.scheduledFor),
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        hook: post.hook,
        caption: post.caption,
        assetUrl: post.assetUrl ?? null,
        metrics: post.metrics as Prisma.InputJsonValue
      }))
    });
    return posts.length;
  }

  async getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
    const [orders, heldRoutingJobs, failedRoutingJobs, profits, delayedShipmentCount, analyticsEvents, supplierOrders] = await Promise.all([
      this.prisma.order.findMany({ select: { subtotalUsd: true, shippingUsd: true, taxUsd: true } }),
      this.prisma.orderRoutingJob.count({ where: { status: "held" } }),
      this.prisma.orderRoutingJob.count({ where: { status: { in: ["failed", "dead_letter"] } } }),
      this.prisma.profitSnapshot.findMany({ select: { netProfitUsd: true, refundCostUsd: true } }),
      this.prisma.trackingEvent.count({ where: { status: "failed" } }),
      this.prisma.analyticsEvent.findMany({ select: { type: true, valueUsd: true } }),
      this.prisma.supplierOrder.findMany({ select: { requestedAt: true, lastPolledAt: true, status: true } })
    ]);
    const revenueUsd = orders.reduce((sum, order) => sum + Number(order.subtotalUsd) + Number(order.shippingUsd) + Number(order.taxUsd), 0);
    const netProfitUsd = profits.reduce((sum, snapshot) => sum + Number(snapshot.netProfitUsd), 0);
    const refundCostUsd = profits.reduce((sum, snapshot) => sum + Number(snapshot.refundCostUsd), 0);
    const adSpendUsd = analyticsEvents.filter((event) => event.type === "ad_spend").reduce((sum, event) => sum + Number(event.valueUsd ?? 0), 0);
    const sessions = analyticsEvents.filter((event) => event.type === "page_view").length;
    const addToCarts = analyticsEvents.filter((event) => event.type === "add_to_cart").length;
    const checkoutStarts = analyticsEvents.filter((event) => event.type === "checkout_started").length;
    const webhookFailureCount = analyticsEvents.filter((event) => event.type === "webhook_failed").length;
    const paymentFailureCount = analyticsEvents.filter((event) => event.type === "payment_failed").length;
    const fulfilledSupplierOrders = supplierOrders.filter((order) => order.lastPolledAt && order.status === "fulfilled");
    const supplierLatencyHours =
      fulfilledSupplierOrders.length === 0
        ? 0
        : fulfilledSupplierOrders.reduce((sum, order) => sum + (Number(order.lastPolledAt) - Number(order.requestedAt)) / 36e5, 0) / fulfilledSupplierOrders.length;
    return {
      revenueUsd,
      netProfitUsd,
      orderCount: orders.length,
      heldRoutingJobs,
      failedRoutingJobs,
      averageOrderValueUsd: orders.length === 0 ? 0 : revenueUsd / orders.length,
      refundCostUsd,
      delayedShipmentCount,
      adSpendUsd,
      cacUsd: calculateCac(adSpendUsd, orders.length),
      roas: calculateRoas(revenueUsd, adSpendUsd),
      addToCartRate: calculateRate(addToCarts, sessions),
      checkoutConversionRate: calculateRate(orders.length, checkoutStarts),
      abandonedCartRate: calculateRate(Math.max(checkoutStarts - orders.length, 0), checkoutStarts),
      supplierLatencyHours,
      webhookFailureCount,
      paymentFailureCount
    };
  }

  async getFulfillmentOpsDashboard(): Promise<FulfillmentOpsDashboard> {
    const [productLinks, supplierOrders, approvals, lifecycle, audits, trackingEvents] = await Promise.all([
      this.prisma.supplierProductLink.findMany({ orderBy: { updatedAt: "desc" }, take: 25 }),
      this.prisma.supplierOrder.findMany({ orderBy: { updatedAt: "desc" }, take: 25 }),
      this.prisma.fulfillmentApproval.findMany({ orderBy: { updatedAt: "desc" }, take: 25 }),
      this.prisma.fulfillmentLifecycleEvent.findMany({ orderBy: { occurredAt: "desc" }, take: 50 }),
      this.prisma.supplierSyncAudit.findMany({ orderBy: { occurredAt: "desc" }, take: 50 }),
      this.prisma.trackingEvent.findMany({ orderBy: { createdAt: "desc" }, take: 25 })
    ]);

    const mappedLinks = productLinks.map(mapSupplierProductLink);
    const mappedOrders = supplierOrders.map(mapSupplierOrder);
    const mappedApprovals = approvals.map(mapFulfillmentApproval);
    const mappedLifecycle = lifecycle.map(mapFulfillmentLifecycleEvent);
    const mappedAudits = audits.map(mapSupplierSyncAudit);
    const mappedTracking = trackingEvents.map((event) => ({
      shopifyOrderId: event.shopifyOrderId,
      supplier: event.supplier as TrackingEvent["supplier"],
      trackingNumber: event.trackingNumber,
      ...(event.trackingUrl ? { trackingUrl: event.trackingUrl } : {}),
      ...(event.carrier ? { carrier: event.carrier } : {}),
      status: event.status as TrackingEvent["status"],
      rawPayload: event.rawPayload
    }));

    return {
      productLinks: mappedLinks,
      supplierOrders: mappedOrders,
      approvals: mappedApprovals,
      lifecycle: mappedLifecycle,
      audits: mappedAudits,
      trackingEvents: mappedTracking,
      summary: {
        linkedProducts: mappedLinks.length,
        verifiedLinks: mappedLinks.filter((link) => link.verificationStatus === "verified").length,
        pendingApprovals: mappedApprovals.filter((approval) => approval.status === "pending").length,
        supplierFailures:
          mappedOrders.filter((order) => order.status === "failed").length +
          countActiveFailedAudits(mappedAudits) +
          countActiveFailedLifecycleEvents(mappedLifecycle),
        trackingEvents: mappedTracking.length
      }
    };
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

function supplierProductLinkKey(supplier: string, productHandle: string, shopifySku: string): string {
  return `${supplier}:${productHandle}:${shopifySku}`;
}

function countActiveFailedLifecycleEvents(events: FulfillmentLifecycleEvent[]): number {
  const latestByOrder = new Map<string, FulfillmentLifecycleEvent>();
  for (const event of events) {
    const key = `${event.shopifyOrderId}:${event.supplier}`;
    const existing = latestByOrder.get(key);
    if (!existing || Date.parse(event.occurredAt) > Date.parse(existing.occurredAt)) {
      latestByOrder.set(key, event);
    }
  }
  return [...latestByOrder.values()].filter((event) => event.status === "failed").length;
}

function countActiveFailedAudits(audits: SupplierSyncAudit[]): number {
  const latestByEntity = new Map<string, SupplierSyncAudit>();
  for (const audit of audits) {
    const key = `${audit.supplier}:${audit.entityType}:${audit.entityId}`;
    const existing = latestByEntity.get(key);
    if (!existing || Date.parse(audit.occurredAt) > Date.parse(existing.occurredAt)) {
      latestByEntity.set(key, audit);
    }
  }
  return [...latestByEntity.values()].filter((audit) => audit.status === "failed").length;
}

function supplierProductLinkData(link: SupplierProductLink) {
  return {
    productHandle: link.productHandle,
    shopifyProductId: link.shopifyProductId ?? null,
    shopifyVariantId: link.shopifyVariantId ?? null,
    shopifySku: link.shopifySku,
    supplier: link.supplier,
    supplierProductId: link.supplierProductId,
    supplierVariantId: link.supplierVariantId ?? null,
    supplierSku: link.supplierSku,
    supplierProductUrl: link.supplierProductUrl,
    productCostUsd: link.productCostUsd,
    shippingCostUsd: link.shippingCostUsd,
    retailPriceUsd: link.retailPriceUsd,
    estimatedDeliveryMinDays: link.estimatedDeliveryMinDays,
    estimatedDeliveryMaxDays: link.estimatedDeliveryMaxDays,
    shipsFrom: link.shipsFrom,
    shipsTo: link.shipsTo,
    inventoryState: link.inventoryState,
    inventoryQuantity: link.inventoryQuantity ?? null,
    trackingSyncSupported: link.trackingSyncSupported,
    shippingProfile: link.shippingProfile,
    verificationStatus: link.verificationStatus,
    verificationSource: link.verificationSource,
    verifiedAt: link.verifiedAt ? new Date(link.verifiedAt) : null,
    expiresAt: link.expiresAt ? new Date(link.expiresAt) : null,
    marginEstimatePercent: link.marginEstimatePercent,
    rawPayload: link.rawPayload as Prisma.InputJsonValue
  };
}

function mapSupplierProductLink(link: {
  productHandle: string;
  shopifyProductId: string | null;
  shopifyVariantId: string | null;
  shopifySku: string;
  supplier: string;
  supplierProductId: string;
  supplierVariantId: string | null;
  supplierSku: string;
  supplierProductUrl: string;
  productCostUsd: unknown;
  shippingCostUsd: unknown;
  retailPriceUsd: unknown;
  estimatedDeliveryMinDays: number;
  estimatedDeliveryMaxDays: number;
  shipsFrom: string;
  shipsTo: string[];
  inventoryState: string;
  inventoryQuantity: number | null;
  trackingSyncSupported: boolean;
  shippingProfile: string;
  verificationStatus: string;
  verificationSource: string;
  verifiedAt: Date | null;
  expiresAt: Date | null;
  marginEstimatePercent: unknown;
  rawPayload: unknown;
}): SupplierProductLink {
  return {
    productHandle: link.productHandle,
    ...(link.shopifyProductId ? { shopifyProductId: link.shopifyProductId } : {}),
    ...(link.shopifyVariantId ? { shopifyVariantId: link.shopifyVariantId } : {}),
    shopifySku: link.shopifySku,
    supplier: link.supplier as SupplierProductLink["supplier"],
    supplierProductId: link.supplierProductId,
    ...(link.supplierVariantId ? { supplierVariantId: link.supplierVariantId } : {}),
    supplierSku: link.supplierSku,
    supplierProductUrl: link.supplierProductUrl,
    productCostUsd: Number(link.productCostUsd),
    shippingCostUsd: Number(link.shippingCostUsd),
    retailPriceUsd: Number(link.retailPriceUsd),
    estimatedDeliveryMinDays: link.estimatedDeliveryMinDays,
    estimatedDeliveryMaxDays: link.estimatedDeliveryMaxDays,
    shipsFrom: link.shipsFrom,
    shipsTo: link.shipsTo as SupplierProductLink["shipsTo"],
    inventoryState: link.inventoryState as SupplierProductLink["inventoryState"],
    ...(link.inventoryQuantity === null ? {} : { inventoryQuantity: link.inventoryQuantity }),
    trackingSyncSupported: link.trackingSyncSupported,
    shippingProfile: link.shippingProfile,
    verificationStatus: link.verificationStatus as SupplierProductLink["verificationStatus"],
    verificationSource: link.verificationSource as SupplierProductLink["verificationSource"],
    ...(link.verifiedAt ? { verifiedAt: link.verifiedAt.toISOString() } : {}),
    ...(link.expiresAt ? { expiresAt: link.expiresAt.toISOString() } : {}),
    marginEstimatePercent: Number(link.marginEstimatePercent),
    rawPayload: asRecord(link.rawPayload)
  };
}

function mapSupplierOrder(order: {
  shopifyOrderId: string;
  supplier: string;
  supplierProductId: string;
  quantity: number;
  mode: string;
  status: string;
  providerOrderId: string | null;
  lastError: string | null;
  rawPayload: unknown;
}): SupplierOrder {
  return {
    shopifyOrderId: order.shopifyOrderId,
    supplier: order.supplier as SupplierOrder["supplier"],
    supplierProductId: order.supplierProductId,
    quantity: order.quantity,
    mode: order.mode as SupplierOrder["mode"],
    status: order.status as SupplierOrder["status"],
    ...(order.providerOrderId ? { providerOrderId: order.providerOrderId } : {}),
    ...(order.lastError ? { lastError: order.lastError } : {}),
    rawPayload: order.rawPayload
  };
}

function mapFulfillmentApproval(approval: {
  shopifyOrderId: string;
  supplier: string;
  supplierProductId: string;
  status: string;
  reviewer: string;
  reason: string;
  preflight: unknown;
  approvedAt: Date | null;
}): FulfillmentApproval {
  return {
    shopifyOrderId: approval.shopifyOrderId,
    supplier: approval.supplier as FulfillmentApproval["supplier"],
    supplierProductId: approval.supplierProductId,
    status: approval.status as FulfillmentApproval["status"],
    reviewer: approval.reviewer,
    reason: approval.reason,
    preflight: asRecord(approval.preflight),
    ...(approval.approvedAt ? { approvedAt: approval.approvedAt.toISOString() } : {})
  };
}

function mapFulfillmentLifecycleEvent(event: {
  shopifyOrderId: string;
  supplier: string;
  status: string;
  message: string;
  metadata: unknown;
  occurredAt: Date;
}): FulfillmentLifecycleEvent {
  return {
    shopifyOrderId: event.shopifyOrderId,
    supplier: event.supplier as FulfillmentLifecycleEvent["supplier"],
    status: event.status as FulfillmentLifecycleEvent["status"],
    message: event.message,
    metadata: asRecord(event.metadata),
    occurredAt: event.occurredAt.toISOString()
  };
}

function mapSupplierSyncAudit(audit: {
  supplier: string;
  action: string;
  entityType: string;
  entityId: string;
  status: string;
  message: string;
  metadata: unknown;
  occurredAt: Date;
}): SupplierSyncAudit {
  return {
    supplier: audit.supplier as SupplierSyncAudit["supplier"],
    action: audit.action as SupplierSyncAudit["action"],
    entityType: audit.entityType as SupplierSyncAudit["entityType"],
    entityId: audit.entityId,
    status: audit.status as SupplierSyncAudit["status"],
    message: audit.message,
    metadata: asRecord(audit.metadata),
    occurredAt: audit.occurredAt.toISOString()
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
