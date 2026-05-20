import type { SupplierOffer, TargetMarket } from "./types.js";

const supplierPriority = ["zendrop", "spocket", "cj", "autods", "dsers", "manual"] as const;

export function chooseSupplierOffer(offers: SupplierOffer[], market: TargetMarket): SupplierOffer | null {
  const eligible = offers.filter((offer) => offer.shipsTo.includes(market) && offer.inventoryVerified);
  if (eligible.length === 0) return null;
  return eligible.sort((a, b) => {
    const speedDelta = a.estimatedDeliveryDays - b.estimatedDeliveryDays;
    if (speedDelta !== 0) return speedDelta;
    const costDelta = a.productCostUsd + a.shippingCostUsd - (b.productCostUsd + b.shippingCostUsd);
    if (costDelta !== 0) return costDelta;
    return supplierPriority.indexOf(a.supplier) - supplierPriority.indexOf(b.supplier);
  })[0] ?? null;
}
