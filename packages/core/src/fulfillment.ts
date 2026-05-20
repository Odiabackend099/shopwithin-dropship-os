import type { RiskLevel, SupplierProductLink, TargetMarket } from "./types.js";
import { normalizeUsd } from "./currency.js";

export type SupplierLinkVerification = {
  status: "verified" | "blocked";
  blockers: string[];
  warnings: string[];
  marginEstimatePercent: number;
};

export type FulfillmentPreflightInput = {
  link?: SupplierProductLink | null;
  targetMarket: TargetMarket;
  orderRiskLevel: RiskLevel;
  paymentStatus: "pending" | "paid" | "refunded" | "voided" | "failed";
  supplierAutoPayEnabled: boolean;
};

export type FulfillmentPreflightResult = {
  ready: boolean;
  approvalRequired: boolean;
  blockers: string[];
  warnings: string[];
};

export function calculateSupplierMarginPercent(retailPriceUsd: number, productCostUsd: number, shippingCostUsd: number): number {
  if (retailPriceUsd <= 0) return 0;
  return normalizeUsd(((retailPriceUsd - productCostUsd - shippingCostUsd) / retailPriceUsd) * 100);
}

export function verifySupplierProductLink(link: SupplierProductLink): SupplierLinkVerification {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const marginEstimatePercent = calculateSupplierMarginPercent(link.retailPriceUsd, link.productCostUsd, link.shippingCostUsd);

  if (link.supplier === "zendrop" && !/^https:\/\/app\.zendrop\.com\/product\/\d+/.test(link.supplierProductUrl)) {
    blockers.push("zendrop_product_url_must_be_dashboard_product_link");
  }
  if (!link.shopifySku || !link.supplierSku) blockers.push("sku_mapping_required");
  if (link.inventoryState === "out_of_stock") blockers.push("supplier_variant_out_of_stock");
  if (link.inventoryState === "unknown") blockers.push("supplier_inventory_not_verified");
  if (!link.trackingSyncSupported) blockers.push("supplier_tracking_sync_not_verified");
  if (link.estimatedDeliveryMaxDays > 15) warnings.push("delivery_window_exceeds_15_days");
  if (link.estimatedDeliveryMaxDays > 21) blockers.push("delivery_window_too_slow_for_launch");
  if (marginEstimatePercent < 55) warnings.push("estimated_margin_below_55_percent_target");
  if (!link.shipsTo.includes("US")) warnings.push("us_shipping_not_verified");

  return {
    status: blockers.length === 0 ? "verified" : "blocked",
    blockers,
    warnings,
    marginEstimatePercent
  };
}

export function evaluateFulfillmentPreflight(input: FulfillmentPreflightInput): FulfillmentPreflightResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input.link) {
    blockers.push("supplier_product_link_missing");
    return { ready: false, approvalRequired: true, blockers, warnings };
  }

  const verification = verifySupplierProductLink(input.link);
  blockers.push(...verification.blockers);
  warnings.push(...verification.warnings);

  if (input.link.verificationStatus !== "verified") blockers.push("supplier_product_link_not_verified");
  if (input.link.expiresAt && Date.parse(input.link.expiresAt) < Date.now()) blockers.push("supplier_verification_expired");
  if (!input.link.shipsTo.includes(input.targetMarket)) blockers.push("supplier_does_not_ship_to_order_market");
  if (input.paymentStatus !== "paid") blockers.push("order_payment_not_confirmed");
  if (input.orderRiskLevel === "high" || input.orderRiskLevel === "blocked") blockers.push("order_risk_requires_manual_review");
  if (input.supplierAutoPayEnabled) warnings.push("supplier_auto_pay_enabled_review_required");

  return {
    ready: blockers.length === 0,
    approvalRequired: true,
    blockers,
    warnings
  };
}
