import type { CurrencyCode } from "./types.js";

export function formatMoney(amount: number, currency: CurrencyCode = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

export function normalizeUsd(amount: number): number {
  return Number(amount.toFixed(2));
}

export function assertUsdCheckoutCurrency(currency: string): asserts currency is "USD" {
  if (currency !== "USD") {
    throw new Error(`USD checkout required; received ${currency}`);
  }
}
