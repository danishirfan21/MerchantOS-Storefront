import { categoryName } from "@/lib/catalog";
import { catalogProducts } from "@/lib/fixtures/products";
import type { Product, SpecGroup, VariantGroup } from "@/types/product";

/** Largest quantity one order line may request when stock is "in-stock" without a known count. */
export const MAX_ORDER_QUANTITY = 10;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Stable, human-readable URL segment derived from the product name. */
export function productSlug(product: Pick<Product, "name">): string {
  return slugify(product.name);
}

export function productPath(product: Pick<Product, "name">, catalogSearch = ""): string {
  const base = `/products/${productSlug(product)}`;
  return catalogSearch ? `${base}?from=${encodeURIComponent(catalogSearch)}` : base;
}

export function getProductBySlug(slug: string): Product | undefined {
  return catalogProducts.find((product) => productSlug(product) === slug);
}

export function getProductById(id: string): Product | undefined {
  return catalogProducts.find((product) => product.id === id);
}

export function allProductSlugs(): string[] {
  return catalogProducts.map(productSlug);
}

/** Same-category products first, then same-brand, never the product itself. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const others = catalogProducts.filter((candidate) => candidate.id !== product.id);
  const sameCategory = others.filter((candidate) => candidate.category === product.category);
  const sameBrand = others.filter(
    (candidate) => candidate.brand === product.brand && candidate.category !== product.category,
  );
  const rest = others.filter((candidate) => !sameCategory.includes(candidate) && !sameBrand.includes(candidate));
  return [...sameCategory, ...sameBrand, ...rest].slice(0, limit);
}

/** Highlights taken from the " · "-separated spec line. */
export function productHighlights(product: Product): string[] {
  return product.spec ? product.spec.split("·").map((part) => part.trim()).filter(Boolean) : [];
}

export function productDescription(product: Product): string {
  if (product.description) return product.description;
  const highlights = productHighlights(product);
  const lead = `${product.name} from ${product.brand}.`;
  return highlights.length ? `${lead} Key features: ${highlights.join(", ")}.` : lead;
}

/** Explicit spec groups when the record has them, otherwise a table derived from its fields. */
export function productSpecGroups(product: Product): SpecGroup[] {
  if (product.specGroups?.length) return product.specGroups;
  const overview = [
    { label: "Brand", value: product.brand },
    { label: "Category", value: categoryName(product.category) ?? product.category },
    ...(product.storage ? [{ label: "Storage", value: product.storage }] : []),
  ];
  const highlights = productHighlights(product).map((value, index) => ({ label: `Feature ${index + 1}`, value }));
  return [
    { title: "Overview", rows: overview },
    ...(highlights.length ? [{ title: "Key features", rows: highlights }] : []),
  ];
}

export function isPurchasable(product: Pick<Product, "stock">): boolean {
  return product.stock !== "out-of-stock";
}

/** Highest quantity allowed: the known fixture stock, otherwise the per-order limit. */
export function maxQuantity(product: Pick<Product, "stock" | "stockCount">): number {
  if (product.stock === "out-of-stock") return 0;
  if (product.stock === "low-stock" && product.stockCount) return Math.min(product.stockCount, MAX_ORDER_QUANTITY);
  return MAX_ORDER_QUANTITY;
}

export function clampQuantity(value: number, max: number): number {
  if (max < 1) return 0;
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.trunc(value), 1), max);
}

export type VariantSelection = Record<string, string>;

/** First option of every group. */
export function defaultVariantSelection(groups: VariantGroup[] | undefined): VariantSelection {
  return Object.fromEntries((groups ?? []).filter((g) => g.options.length).map((g) => [g.id, g.options[0].id]));
}

/** Returns a new selection; ignores unknown groups or options. */
export function selectVariantOption(
  groups: VariantGroup[] | undefined,
  selection: VariantSelection,
  groupId: string,
  optionId: string,
): VariantSelection {
  const group = groups?.find((g) => g.id === groupId);
  if (!group?.options.some((o) => o.id === optionId)) return selection;
  return { ...selection, [groupId]: optionId };
}

export function selectedVariantLabels(groups: VariantGroup[] | undefined, selection: VariantSelection): string[] {
  return (groups ?? []).flatMap((g) => {
    const option = g.options.find((o) => o.id === selection[g.id]);
    return option ? [`${g.label}: ${option.label}`] : [];
  });
}
