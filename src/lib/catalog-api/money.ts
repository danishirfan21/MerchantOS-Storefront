const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/**
 * Formats integer halalas as SAR digits ("4,299" or "4,299.50") with integer arithmetic only,
 * so the displayed value is exactly what the backend sent. The currency code and the
 * "excludes VAT" wording are rendered separately by the components.
 */
export function formatHalalas(halalas: number): string {
  if (!Number.isSafeInteger(halalas) || halalas < 0) throw new RangeError("halalas must be a non-negative safe integer");
  const riyals = Math.trunc(halalas / 100);
  const fraction = halalas % 100;
  const base = whole.format(riyals);
  return fraction === 0 ? base : `${base}.${String(fraction).padStart(2, "0")}`;
}
