const sar = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats an amount like "5,199" (the currency code is rendered separately). */
export function formatAmount(value: number): string {
  return sar.format(value);
}

/** Whole-percent discount between two prices. */
export function discountPercent(price: number, compareAt: number): number {
  return Math.round(((compareAt - price) / compareAt) * 100);
}
