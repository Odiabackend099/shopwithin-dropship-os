import {
  chooseSupplierOffer,
  evaluateFulfillmentPreflight,
  verifySupplierProductLink,
  type FulfillmentAttempt,
  type Order,
  type SupplierName,
  type SupplierOffer,
  type SupplierOrder,
  type SupplierProductLink,
  type TargetMarket
} from "@dropship-os/core";
import type { AppEnv } from "../env.js";

export type SupplierRoutingResult =
  | { status: "selected"; offer: SupplierOffer }
  | { status: "held"; reason: string };

export type SupplierOrderInput = {
  shopifyOrderId: string;
  supplier: SupplierName;
  supplierProductId: string;
  quantity: number;
  shipToCountry: TargetMarket;
  dryRun?: boolean;
  simulate?: boolean;
};

export type SupplierOrderResult = {
  attempt: FulfillmentAttempt;
  supplierOrder: SupplierOrder;
  operatorAction?: string;
};

export type SupplierProductVerificationResult = {
  link: SupplierProductLink;
  status: "verified" | "blocked";
  blockers: string[];
  warnings: string[];
  operatorAction: string;
};

export type FulfillmentPreflightResult = {
  ready: boolean;
  approvalRequired: boolean;
  blockers: string[];
  warnings: string[];
  operatorAction: string;
};

type SupplierProvider = {
  readonly name: SupplierName;
  createOrder(input: SupplierOrderInput): Promise<SupplierOrderResult>;
  pollOrder(order: SupplierOrder): Promise<SupplierOrder>;
};

export function routeSupplierOffer(offers: SupplierOffer[], market: TargetMarket): SupplierRoutingResult {
  const offer = chooseSupplierOffer(offers, market);
  if (!offer) return { status: "held", reason: "no_verified_supplier_offer_for_market" };
  if (offer.estimatedDeliveryDays > 10) return { status: "held", reason: "delivery_target_exceeds_10_days" };
  if (!offer.supportsTrackingSync) return { status: "held", reason: "supplier_missing_tracking_sync" };
  return { status: "selected", offer };
}

export class SupplierClient {
  private readonly providers: Map<SupplierName, SupplierProvider>;

  constructor(private readonly env: AppEnv) {
    this.providers = new Map<SupplierName, SupplierProvider>([
      ["zendrop", new ZendropConnectedStoreProvider(this.env)],
      ["cj", new CjProvider(this.env)],
      ["manual", new ManualSupplierProvider(this.env)],
      ["spocket", new ManualSupplierProvider(this.env, "spocket")],
      ["autods", new ManualSupplierProvider(this.env, "autods")],
      ["dsers", new ManualSupplierProvider(this.env, "dsers")]
    ]);
  }

  async createOrder(input: SupplierOrderInput): Promise<SupplierOrderResult> {
    if (input.quantity < 1) throw new Error("quantity must be at least 1");
    const provider = this.providerFor(input.supplier);
    return provider.createOrder(input);
  }

  async testOrder(input: SupplierOrderInput): Promise<FulfillmentAttempt> {
    return (await this.createOrder({ ...input, dryRun: true })).attempt;
  }

  async pollOrder(order: SupplierOrder): Promise<SupplierOrder> {
    return this.providerFor(order.supplier).pollOrder(order);
  }

  verifyProductLink(link: SupplierProductLink): SupplierProductVerificationResult {
    const verification = verifySupplierProductLink(link);
    const verifiedLink: SupplierProductLink = {
      ...link,
      marginEstimatePercent: verification.marginEstimatePercent,
      verificationStatus: verification.status === "verified" ? "verified" : "failed",
      verifiedAt: verification.status === "verified" ? new Date().toISOString() : link.verifiedAt,
      expiresAt: verification.status === "verified" ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : link.expiresAt,
      rawPayload: {
        ...link.rawPayload,
        verification: {
          blockers: verification.blockers,
          warnings: verification.warnings,
          verifiedUsing: link.verificationSource
        }
      }
    };
    return {
      link: verifiedLink,
      status: verification.status,
      blockers: verification.blockers,
      warnings: verification.warnings,
      operatorAction:
        verification.status === "verified"
          ? "Confirm the same Shopify SKU and Zendrop variant remain linked inside Zendrop before approving the first paid order."
          : "Fix the Zendrop product link, SKU mapping, inventory state, shipping support, or tracking support before order approval."
    };
  }

  preflightFulfillment(input: { order: Order; link: SupplierProductLink | null; targetMarket: TargetMarket }): FulfillmentPreflightResult {
    const result = evaluateFulfillmentPreflight({
      link: input.link,
      targetMarket: input.targetMarket,
      orderRiskLevel: input.order.riskLevel,
      paymentStatus: input.order.paymentStatus,
      supplierAutoPayEnabled: this.env.flags.supplierAutoPayEnabled
    });
    return {
      ...result,
      operatorAction: result.ready
        ? "Approve manually only after the order is visible in Zendrop and the linked variant is correct. Fulfill from Zendrop dashboard; do not enable auto-pay for the first live order."
        : "Do not fulfill this order. Resolve blockers and rerun preflight before approving."
    };
  }

  private providerFor(supplier: SupplierName): SupplierProvider {
    const provider = this.providers.get(supplier);
    if (!provider) throw new Error(`supplier_provider_missing:${supplier}`);
    return provider;
  }
}

abstract class BaseProvider implements SupplierProvider {
  abstract readonly name: SupplierName;
  constructor(protected readonly env: AppEnv) {}

  abstract createOrder(input: SupplierOrderInput): Promise<SupplierOrderResult>;

  async pollOrder(order: SupplierOrder): Promise<SupplierOrder> {
    return { ...order, status: order.status === "submitted" ? "processing" : order.status, rawPayload: { ...asObject(order.rawPayload), polledAt: new Date().toISOString() } };
  }

  protected dryRun(input: SupplierOrderInput, providerOrderPrefix = "dry-run"): SupplierOrderResult {
    const providerOrderId = `${providerOrderPrefix}-${input.supplier}-${input.shopifyOrderId}`;
    const supplierOrder: SupplierOrder = {
      shopifyOrderId: input.shopifyOrderId,
      supplier: input.supplier,
      supplierProductId: input.supplierProductId,
      quantity: input.quantity,
      mode: "dry_run",
      status: "draft",
      providerOrderId,
      rawPayload: { input, safety: "no_supplier_payment_attempted" }
    };
    return {
      supplierOrder,
      attempt: {
        shopifyOrderId: input.shopifyOrderId,
        supplier: input.supplier,
        supplierOrderId: providerOrderId,
        status: "dry_run"
      }
    };
  }

  protected held(input: SupplierOrderInput, error: string, mode: SupplierOrder["mode"] = "manual", operatorAction?: string): SupplierOrderResult {
    const supplierOrder: SupplierOrder = {
      shopifyOrderId: input.shopifyOrderId,
      supplier: input.supplier,
      supplierProductId: input.supplierProductId,
      quantity: input.quantity,
      mode,
      status: "held",
      lastError: error,
      rawPayload: { input, error, operatorAction }
    };
    return {
      supplierOrder,
      ...(operatorAction ? { operatorAction } : {}),
      attempt: {
        shopifyOrderId: input.shopifyOrderId,
        supplier: input.supplier,
        status: "held",
        error
      }
    };
  }
}

class ZendropConnectedStoreProvider extends BaseProvider {
  readonly name = "zendrop" as const;

  async createOrder(input: SupplierOrderInput): Promise<SupplierOrderResult> {
    if (input.dryRun || !this.env.flags.supplierAutoPayEnabled) {
      return this.dryRun(input, "zendrop-connected-store");
    }

    return this.held(
      input,
      "zendrop_public_order_api_unavailable_use_connected_shopify_fulfillment",
      "connected_store",
      "Confirm the Shopify order is linked to the Zendrop product in Zendrop, then fulfill from Zendrop dashboard or Zendrop Auto-Fulfillment."
    );
  }
}

class CjProvider extends BaseProvider {
  readonly name = "cj" as const;

  async createOrder(input: SupplierOrderInput): Promise<SupplierOrderResult> {
    if (input.dryRun || input.simulate || !this.env.flags.supplierAutoPayEnabled) {
      return this.dryRun(input, "cj");
    }
    if (!this.env.CJ_API_KEY) {
      return this.held(input, "cj_api_key_missing");
    }
    return this.held(input, "cj_live_ordering_disabled_until_provider_endpoint_contract_verified");
  }
}

class ManualSupplierProvider extends BaseProvider {
  readonly name: SupplierName;

  constructor(env: AppEnv, name: SupplierName = "manual") {
    super(env);
    this.name = name;
  }

  async createOrder(input: SupplierOrderInput): Promise<SupplierOrderResult> {
    if (input.dryRun || input.simulate) return this.dryRun(input, "manual");
    return this.held(input, `${this.name}_manual_fulfillment_required`, "manual", "Create the supplier order manually and paste tracking into the supplier tracking webhook.");
  }
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
