import type { ApiAvailability, ApiProduct, ApiProductList } from "@/lib/catalog-api/types";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const AVAILABILITY: readonly ApiAvailability[] = ["in-stock", "low-stock", "out-of-stock"];
const MAX_ITEMS = 100;

export function isPublicSlug(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 64 && SLUG.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max ? value : null;
}

/**
 * Builds a product only from the fields the contract lists. Unknown extra fields (for example a
 * `sku` or `stock` that should never be there) are dropped, never copied through to the UI.
 * Returns null for anything malformed so callers show an "invalid response" state.
 */
export function parseApiProduct(raw: unknown): ApiProduct | null {
  if (!isRecord(raw)) return null;
  const { slug, name, category, priceHalalas, currency, vatTreatment, availability } = raw;
  if (!isPublicSlug(slug)) return null;
  const productName = text(name, 200);
  if (!productName) return null;
  if (!isRecord(category)) return null;
  const categorySlug = category.slug;
  const categoryLabel = text(category.label, 80);
  if (!isPublicSlug(categorySlug) || !categoryLabel) return null;
  if (typeof priceHalalas !== "number" || !Number.isSafeInteger(priceHalalas) || priceHalalas < 0) return null;
  if (currency !== "SAR") return null;
  if (vatTreatment !== "excluded") return null;
  if (typeof availability !== "string" || !AVAILABILITY.includes(availability as ApiAvailability)) return null;
  return {
    slug,
    name: productName,
    category: { slug: categorySlug, label: categoryLabel },
    priceHalalas,
    currency: "SAR",
    vatTreatment: "excluded",
    availability: availability as ApiAvailability,
  };
}

function wholeNumber(value: unknown, min: number): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= min ? value : null;
}

export function parseApiProductList(raw: unknown): ApiProductList | null {
  if (!isRecord(raw) || !Array.isArray(raw.items) || raw.items.length > MAX_ITEMS) return null;
  const page = wholeNumber(raw.page, 1);
  const pageSize = wholeNumber(raw.pageSize, 1);
  const total = wholeNumber(raw.total, 0);
  if (page === null || pageSize === null || total === null) return null;
  const items: ApiProduct[] = [];
  for (const entry of raw.items) {
    const product = parseApiProduct(entry);
    if (!product) return null;
    items.push(product);
  }
  return { items, page, pageSize, total };
}
