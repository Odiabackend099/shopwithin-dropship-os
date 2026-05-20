import { Activity, AlertTriangle, ClipboardCheck, DollarSign, Link2, MousePointerClick, PackageCheck, PauseCircle, Truck, Video } from "lucide-react";
import { capColdTestSpend, evaluateCreativeValidation, formatMoney, leanNgnBudget } from "@dropship-os/core";
import { MetricCard } from "../components/metric-card";
import { StatusPill } from "../components/status-pill";

export const dynamic = "force-dynamic";

type DashboardPayload = {
  ok: boolean;
  dashboard: {
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
};

type FulfillmentPayload = {
  ok: boolean;
  fulfillment: {
    productLinks: Array<{
      productHandle: string;
      shopifySku: string;
      supplier: string;
      supplierProductId: string;
      supplierSku: string;
      inventoryState: string;
      inventoryQuantity?: number;
      verificationStatus: string;
      estimatedDeliveryMinDays: number;
      estimatedDeliveryMaxDays: number;
      shipsFrom: string;
      shipsTo: string[];
      marginEstimatePercent: number;
    }>;
    supplierOrders: Array<{
      shopifyOrderId: string;
      supplier: string;
      supplierProductId: string;
      mode: string;
      status: string;
      lastError?: string;
    }>;
    approvals: Array<{
      shopifyOrderId: string;
      supplier: string;
      supplierProductId: string;
      status: string;
      reviewer: string;
      reason: string;
    }>;
    lifecycle: Array<{
      shopifyOrderId: string;
      supplier: string;
      status: string;
      message: string;
      occurredAt: string;
    }>;
    audits: Array<{
      supplier: string;
      action: string;
      status: string;
      message: string;
      occurredAt: string;
    }>;
    trackingEvents: Array<{
      shopifyOrderId: string;
      supplier: string;
      trackingNumber: string;
      status: string;
    }>;
    summary: {
      linkedProducts: number;
      verifiedLinks: number;
      pendingApprovals: number;
      supplierFailures: number;
      trackingEvents: number;
    };
  };
};

const products = [
  { title: "FurLift Reusable Pet Hair Detailer", score: 79, margin: 68, supplier: "Manual sample", status: "Supplier gate" },
  { title: "Mini Car Detailing Brush Set", score: 0, margin: 0, supplier: "Backup research", status: "Watch" },
  { title: "Sink Gap Cleaning Brush", score: 0, margin: 0, supplier: "Backup research", status: "Watch" }
];

const creativeDecision = evaluateCreativeValidation({
  organicPostsPublished: 0,
  creativesProduced: 30,
  bestOrganicViewCount: 0,
  bestOrganicClickThroughRate: 0,
  landingPageSessions: 0,
  addToCarts: 0
});

const requestedColdTestBudgetNgn = 8000;
const approvedColdTestBudgetNgn = creativeDecision.paidTestAllowed ? capColdTestSpend(requestedColdTestBudgetNgn) : 0;

const reasonLabels: Record<string, string> = {
  add_to_cart_below_3_percent_after_100_sessions: "Add-to-cart below 3% after 100 sessions",
  ctr_below_0_8_after_min_spend: "CTR below 0.8% after minimum spend",
  landing_page_not_converting_clicks: "Landing page is not converting clicks",
  no_click_or_view_signal_yet: "No click or view signal yet",
  produce_20_to_30_creatives_first: "Produce 20-30 creatives first",
  publish_more_organic_posts_before_paid: "Publish more organic posts before paid"
};

function formatReason(reason: string): string {
  return reasonLabels[reason] ?? reason.replaceAll("_", " ");
}

async function loadDashboard(): Promise<DashboardPayload["dashboard"]> {
  const apiBaseUrl = process.env.API_PUBLIC_URL ?? "http://localhost:4000";
  try {
    const response = await fetch(`${apiBaseUrl}/internal/analytics/dashboard`, { cache: "no-store" });
    if (!response.ok) throw new Error(`dashboard_api_${response.status}`);
    const payload = (await response.json()) as DashboardPayload;
    return payload.dashboard;
  } catch {
    return {
      revenueUsd: 0,
      netProfitUsd: 0,
      orderCount: 0,
      heldRoutingJobs: 0,
      failedRoutingJobs: 0,
      averageOrderValueUsd: 0,
      refundCostUsd: 0,
      delayedShipmentCount: 0,
      adSpendUsd: 0,
      cacUsd: 0,
      roas: 0,
      addToCartRate: 0,
      checkoutConversionRate: 0,
      abandonedCartRate: 0,
      supplierLatencyHours: 0,
      webhookFailureCount: 0,
      paymentFailureCount: 0
    };
  }
}

async function loadFulfillment(): Promise<FulfillmentPayload["fulfillment"]> {
  const apiBaseUrl = process.env.API_PUBLIC_URL ?? "http://localhost:4000";
  try {
    const response = await fetch(`${apiBaseUrl}/internal/fulfillment/ops`, { cache: "no-store" });
    if (!response.ok) throw new Error(`fulfillment_api_${response.status}`);
    const payload = (await response.json()) as FulfillmentPayload;
    return payload.fulfillment;
  } catch {
    return {
      productLinks: [],
      supplierOrders: [],
      approvals: [],
      lifecycle: [],
      audits: [],
      trackingEvents: [],
      summary: {
        linkedProducts: 0,
        verifiedLinks: 0,
        pendingApprovals: 0,
        supplierFailures: 0,
        trackingEvents: 0
      }
    };
  }
}

function pillTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (["verified", "approved", "linked", "fulfilled", "shipped", "delivered", "passed"].includes(status)) return "success";
  if (["failed", "blocked", "out_of_stock", "rejected"].includes(status)) return "danger";
  if (["pending", "held", "low_stock", "draft"].includes(status)) return "warning";
  return "neutral";
}

export default async function DashboardPage() {
  const dashboard = await loadDashboard();
  const fulfillment = await loadFulfillment();
  const activeLink = fulfillment.productLinks[0];
  const activeOrder = fulfillment.supplierOrders[0];
  const activeLifecycle = fulfillment.lifecycle.slice(0, 5);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">Dropship OS</div>
        <nav aria-label="Primary">
          <a className="active" href="#pipeline">Pipeline</a>
          <a href="#orders">Orders</a>
          <a href="#traffic">Traffic</a>
          <a href="#support">Support</a>
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Global storefront</p>
            <h1>Operating dashboard</h1>
          </div>
          <div className="statusStack">
            <StatusPill label="USD checkout" tone="success" />
            <StatusPill label="Lean NGN mode" tone="warning" />
          </div>
        </header>

        <section className="metrics" aria-label="Business metrics">
          <MetricCard icon={<DollarSign size={18} />} label="Revenue" value={formatMoney(dashboard.revenueUsd, "USD")} sublabel={`${dashboard.orderCount} paid order${dashboard.orderCount === 1 ? "" : "s"}`} />
          <MetricCard icon={<Activity size={18} />} label="Net profit" value={formatMoney(dashboard.netProfitUsd, "USD")} sublabel={`${formatMoney(dashboard.averageOrderValueUsd, "USD")} AOV`} />
          <MetricCard icon={<PackageCheck size={18} />} label="Held routing" value={String(dashboard.heldRoutingJobs)} sublabel="Auto-pay remains blocked" />
          <MetricCard icon={<Truck size={18} />} label="Shipment alerts" value={String(dashboard.delayedShipmentCount)} sublabel={`${dashboard.webhookFailureCount} webhook failures`} />
        </section>

        <section className="metrics" aria-label="Launch controls">
          <MetricCard icon={<DollarSign size={18} />} label="Launch budget" value={formatMoney(leanNgnBudget.totalNgn, "NGN", "en-NG")} sublabel="Do not spend at once" />
          <MetricCard icon={<Video size={18} />} label="Creative scripts" value="30" sublabel="Record/assemble videos next" />
          <MetricCard icon={<MousePointerClick size={18} />} label="ATC rate" value={`${dashboard.addToCartRate}%`} sublabel={`${dashboard.abandonedCartRate}% abandoned checkout`} />
          <MetricCard icon={<PackageCheck size={18} />} label="Active test product" value="1" sublabel="One-product focus" />
        </section>

        <section className="metrics" aria-label="Fulfillment metrics">
          <MetricCard icon={<Link2 size={18} />} label="Supplier links" value={`${fulfillment.summary.verifiedLinks}/${fulfillment.summary.linkedProducts}`} sublabel="Verified Zendrop mappings" />
          <MetricCard icon={<ClipboardCheck size={18} />} label="Approval queue" value={String(fulfillment.summary.pendingApprovals)} sublabel="Manual gate before spending" />
          <MetricCard icon={<Truck size={18} />} label="Tracking events" value={String(fulfillment.summary.trackingEvents)} sublabel="Supplier to Shopify sync state" />
          <MetricCard icon={<AlertTriangle size={18} />} label="Supplier failures" value={String(fulfillment.summary.supplierFailures)} sublabel="Sync and fulfillment failures" />
        </section>

        <section className="split">
          <article className="panel">
            <div className="panelHeader">
              <h2>Lean budget control</h2>
              <StatusPill label={creativeDecision.paidTestAllowed ? "Boost allowed" : "Organic first"} tone={creativeDecision.paidTestAllowed ? "success" : "warning"} />
            </div>
            <div className="budgetGrid" aria-label="NGN launch budget allocation">
              <span>Domain + tools</span><strong>{formatMoney(leanNgnBudget.domainAndToolsNgn, "NGN", "en-NG")}</strong>
              <span>AI creative generation</span><strong>{formatMoney(leanNgnBudget.aiCreativeNgn, "NGN", "en-NG")}</strong>
              <span>TikTok test wallet</span><strong>{formatMoney(leanNgnBudget.tiktokTestingNgn, "NGN", "en-NG")}</strong>
              <span>Retargeting + backup</span><strong>{formatMoney(leanNgnBudget.retargetingBackupNgn, "NGN", "en-NG")}</strong>
            </div>
          </article>

          <article className="panel">
            <div className="panelHeader">
              <h2>Paid test gate</h2>
              <StatusPill label={approvedColdTestBudgetNgn > 0 ? "Capped" : "Blocked"} tone={approvedColdTestBudgetNgn > 0 ? "success" : "danger"} />
            </div>
            <p className="bodyText">
              Requested cold test budget: {formatMoney(requestedColdTestBudgetNgn, "NGN", "en-NG")}. Approved today: {formatMoney(approvedColdTestBudgetNgn, "NGN", "en-NG")}. The system blocks boosts until content volume and click signal are present.
            </p>
            <ul className="checks">
              {creativeDecision.reasons.map((reason) => (
                <li key={reason}><PauseCircle size={16} />{formatReason(reason)}</li>
              ))}
            </ul>
          </article>
        </section>

        <section id="pipeline" className="panel">
          <div className="panelHeader">
            <h2>Product validation</h2>
            <StatusPill label="Auto-fulfillment gated" tone="warning" />
          </div>
          <div className="table">
            <div className="row head">
              <span>Product</span>
              <span>Score</span>
              <span>Margin</span>
              <span>Supplier</span>
              <span>Status</span>
            </div>
            {products.map((product) => (
              <div className="row" key={product.title}>
                <strong>{product.title}</strong>
                <span>{product.score}</span>
                <span>{product.margin}%</span>
                <span>{product.supplier}</span>
              <StatusPill label={product.status} tone={product.status === "Supplier gate" ? "warning" : product.status === "Ready" ? "success" : "neutral"} />
              </div>
            ))}
          </div>
        </section>

        <section className="split">
          <article className="panel">
            <div className="panelHeader">
              <h2>Zendrop product link</h2>
              <StatusPill label={activeLink?.verificationStatus ?? "Not linked"} tone={pillTone(activeLink?.verificationStatus ?? "pending")} />
            </div>
            {activeLink ? (
              <div className="opsGrid">
                <span>Shopify SKU</span><strong>{activeLink.shopifySku}</strong>
                <span>Zendrop SKU</span><strong>{activeLink.supplierSku}</strong>
                <span>Supplier product</span><strong>{activeLink.supplierProductId}</strong>
                <span>Inventory</span><strong>{activeLink.inventoryState}{activeLink.inventoryQuantity === undefined ? "" : ` (${activeLink.inventoryQuantity})`}</strong>
                <span>Shipping</span><strong>{activeLink.shipsFrom} to {activeLink.shipsTo.join(", ")} in {activeLink.estimatedDeliveryMinDays}-{activeLink.estimatedDeliveryMaxDays} days</strong>
                <span>Estimated margin</span><strong>{activeLink.marginEstimatePercent}%</strong>
              </div>
            ) : (
              <p className="bodyText">No verified Zendrop product link has been recorded yet. Fulfillment approval remains blocked until the FurLift Shopify SKU is linked to a Zendrop product and variant.</p>
            )}
          </article>

          <article className="panel">
            <div className="panelHeader">
              <h2>Fulfillment readiness</h2>
              <StatusPill label={activeOrder?.status ?? "Held"} tone={pillTone(activeOrder?.status ?? "held")} />
            </div>
            <ul className="checks">
              <li><PackageCheck size={16} />Auto-pay remains blocked; approvals only record operator intent</li>
              <li><Truck size={16} />Zendrop connected-store order visibility must be verified before fulfillment</li>
              <li><Activity size={16} />Tracking callbacks are persisted before Shopify sync is attempted</li>
              {activeOrder?.lastError ? <li><AlertTriangle size={16} />{activeOrder.lastError}</li> : null}
            </ul>
          </article>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Fulfillment timeline</h2>
            <StatusPill label={`${activeLifecycle.length} recent`} tone="neutral" />
          </div>
          <div className="timeline">
            {activeLifecycle.length === 0 ? (
              <p className="bodyText">No lifecycle events yet.</p>
            ) : (
              activeLifecycle.map((event) => (
                <div className="timelineItem" key={`${event.shopifyOrderId}-${event.status}-${event.occurredAt}`}>
                  <StatusPill label={event.status} tone={pillTone(event.status)} />
                  <div>
                    <strong>{event.shopifyOrderId}</strong>
                    <p>{event.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section id="traffic" className="split">
          <article className="panel">
            <div className="panelHeader">
              <h2>Kill-switch monitor</h2>
              <StatusPill label="Paid locked" tone="warning" />
            </div>
            <p className="bodyText">
              No cold paid campaign is active. The system keeps paid tests blocked until FurLift has organic posts, site clicks, and add-to-cart signal.
            </p>
            <ul className="checks">
              <li><PauseCircle size={16} />PAID_ADS_ENABLED remains false</li>
              <li><MousePointerClick size={16} />Organic validation is still the next traffic step</li>
            </ul>
          </article>

          <article id="orders" className="panel">
            <div className="panelHeader">
              <h2>Order ops</h2>
              <AlertTriangle size={20} />
            </div>
            <ul className="checks">
              <li><Truck size={16} />1 tracking update pending supplier callback</li>
              <li><Activity size={16} />Webhook failure rate below alert threshold</li>
              <li><PackageCheck size={16} />4 approved products required before TikTok Smart+ Catalog launch</li>
            </ul>
          </article>
        </section>

        <section id="support" className="panel">
          <div className="panelHeader">
            <h2>Support queue</h2>
            <StatusPill label="AI draft only" tone="neutral" />
          </div>
          <ul className="checks">
            <li><Activity size={16} />Shipping and tracking replies drafted for human review</li>
            <li><Truck size={16} />Refunds, address changes, and chargebacks require manual approval</li>
            <li><PackageCheck size={16} />Klaviyo events reserved for abandoned checkout and tracking updates</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
