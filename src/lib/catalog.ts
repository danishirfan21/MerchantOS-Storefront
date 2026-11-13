import { departments } from "@/lib/fixtures/home";
import { catalogProducts } from "@/lib/fixtures/products";
import type { CategorySlug, Product } from "@/types/product";

/** Pure catalogue logic: URL state <-> filters, filtering, sorting, facet counts. No React here. */

export type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

export const PRICE_RANGES = [
  { id: "0-1000", label: "Under 1,000 SAR", min: 0, max: 1000 },
  { id: "1000-3000", label: "1,000 – 3,000 SAR", min: 1000, max: 3000 },
  { id: "3000-6000", label: "3,000 – 6,000 SAR", min: 3000, max: 6000 },
  { id: "6000-", label: "Over 6,000 SAR", min: 6000, max: Infinity },
] as const;

export type CatalogFilters = {
  q: string;
  category?: CategorySlug;
  brands: string[];
  /** One of PRICE_RANGES ids. */
  price?: string;
  inStockOnly: boolean;
  storage: string[];
};

export const EMPTY_FILTERS: CatalogFilters = { q: "", brands: [], inStockOnly: false, storage: [] };

export const CATEGORIES = departments.map(({ slug, name }) => ({ slug: slug as CategorySlug, name }));
export const BRANDS = [...new Set(catalogProducts.map((p) => p.brand))].sort();
const STORAGE_ORDER = ["128GB", "256GB", "512GB", "1TB"];
export const STORAGE_OPTIONS = [...new Set(catalogProducts.flatMap((p) => (p.storage ? [p.storage] : [])))].sort(
  (a, b) => STORAGE_ORDER.indexOf(a) - STORAGE_ORDER.indexOf(b),
);

export function categoryName(slug?: CategorySlug) {
  return CATEGORIES.find((c) => c.slug === slug)?.name;
}

type ParamsLike = { get(name: string): string | null; getAll(name: string): string[] };

/** Reads and validates URL params; unknown values are dropped. */
export function parseCatalogParams(params: ParamsLike): { filters: CatalogFilters; sort: SortKey } {
  const category = CATEGORIES.find((c) => c.slug === params.get("category"))?.slug;
  const price = PRICE_RANGES.find((r) => r.id === params.get("price"))?.id;
  const sortParam = params.get("sort");
  return {
    filters: {
      q: (params.get("q") ?? "").trim(),
      category,
      brands: params.getAll("brand").filter((b) => BRANDS.includes(b)),
      price,
      inStockOnly: params.get("stock") === "in",
      storage: params.getAll("storage").filter((s) => STORAGE_OPTIONS.includes(s)),
    },
    sort: SORT_OPTIONS.some((o) => o.value === sortParam) ? (sortParam as SortKey) : "featured",
  };
}

export function toSearchString(filters: CatalogFilters, sort: SortKey): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  filters.brands.forEach((b) => params.append("brand", b));
  if (filters.price) params.set("price", filters.price);
  if (filters.inStockOnly) params.set("stock", "in");
  filters.storage.forEach((s) => params.append("storage", s));
  if (sort !== "featured") params.set("sort", sort);
  const text = params.toString();
  return text ? `?${text}` : "";
}

function matchesSearch(product: Product, q: string) {
  if (!q) return true;
  const haystack = [product.name, product.brand, product.spec, product.storage, categoryName(product.category)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((token) => haystack.includes(token));
}

type Facet = "category" | "brands" | "price" | "inStockOnly" | "storage";

/** Filters products; `skip` leaves one facet out (used for per-option counts). */
export function filterProducts(products: Product[], f: CatalogFilters, skip?: Facet): Product[] {
  const range = PRICE_RANGES.find((r) => r.id === f.price);
  return products.filter((p) => {
    if (!matchesSearch(p, f.q)) return false;
    if (skip !== "category" && f.category && p.category !== f.category) return false;
    if (skip !== "brands" && f.brands.length && !f.brands.includes(p.brand)) return false;
    if (skip !== "price" && range && !(p.price >= range.min && p.price < range.max)) return false;
    if (skip !== "inStockOnly" && f.inStockOnly && p.stock === "out-of-stock") return false;
    if (skip !== "storage" && f.storage.length && !(p.storage && f.storage.includes(p.storage))) return false;
    return true;
  });
}

/** Stable, deterministic sort: ties keep fixture (featured) order. */
export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const order = new Map(catalogProducts.map((p, index) => [p.id, index]));
  const byOrder = (a: Product, b: Product) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0);
  const compare: Record<SortKey, (a: Product, b: Product) => number> = {
    featured: byOrder,
    "price-asc": (a, b) => a.price - b.price || byOrder(a, b),
    "price-desc": (a, b) => b.price - a.price || byOrder(a, b),
    "name-asc": (a, b) => a.name.localeCompare(b.name, "en") || byOrder(a, b),
  };
  return [...products].sort(compare[sort]);
}

/** Products that would match if this facet were not applied, narrowed by `match`: the option's count. */
export function countFor(facet: Facet, filters: CatalogFilters, match: (p: Product) => boolean): number {
  return filterProducts(catalogProducts, filters, facet).filter(match).length;
}

export type ActiveFilter = { key: string; label: string; remove: (f: CatalogFilters) => CatalogFilters };

export function activeFilterList(f: CatalogFilters): ActiveFilter[] {
  const list: ActiveFilter[] = [];
  if (f.q) list.push({ key: "q", label: `Search: ${f.q}`, remove: (s) => ({ ...s, q: "" }) });
  if (f.category)
    list.push({ key: "category", label: categoryName(f.category) ?? f.category, remove: (s) => ({ ...s, category: undefined }) });
  f.brands.forEach((b) =>
    list.push({ key: `brand-${b}`, label: `Brand: ${b}`, remove: (s) => ({ ...s, brands: s.brands.filter((x) => x !== b) }) }),
  );
  const range = PRICE_RANGES.find((r) => r.id === f.price);
  if (range) list.push({ key: "price", label: range.label, remove: (s) => ({ ...s, price: undefined }) });
  if (f.inStockOnly) list.push({ key: "stock", label: "In stock only", remove: (s) => ({ ...s, inStockOnly: false }) });
  f.storage.forEach((v) =>
    list.push({ key: `storage-${v}`, label: `Storage: ${v}`, remove: (s) => ({ ...s, storage: s.storage.filter((x) => x !== v) }) }),
  );
  return list;
}
