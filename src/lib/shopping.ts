/**
 * Pure shopping logic: cart lines, wishlist ids, totals and validation of persisted data.
 *
 * Everything here is deterministic and free of React and browser APIs so it can be unit
 * tested directly. Prices are never stored: a cart line keeps a product id, the chosen
 * variant option ids and a quantity, and everything else is derived from the catalogue.
 * Money is calculated in halalas (1 SAR = 100 halalas) as integers to avoid floating-point drift.
 *
 * This is local demo state. It is not an account, an order or authoritative inventory.
 */
import {
  clampQuantity,
  defaultVariantSelection,
  getProductById,
  isPurchasable,
  maxQuantity,
  selectedVariantLabels,
  type VariantSelection,
} from "@/lib/products";
import type { Product } from "@/types/product";

export const CART_STORAGE_KEY = "merchantos.storefront.cart.v1";
export const WISHLIST_STORAGE_KEY = "merchantos.storefront.wishlist.v1";
export const STORAGE_VERSION = 1;

export type CartLine = {
  productId: string;
  /** Selected option id per variant group id. Empty for products without variants. */
  variants: VariantSelection;
  quantity: number;
};

/* ----------------------------- money ----------------------------- */

export function toHalalas(sar: number): number {
  return Math.round(sar * 100);
}

export function fromHalalas(halalas: number): number {
  return halalas / 100;
}

/* ------------------------- line identity ------------------------- */

/** Stable identity: product id plus the variant selection, independent of key order. */
export function lineKey(productId: string, variants: VariantSelection): string {
  const pairs = Object.entries(variants)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([group, option]) => `${group}=${option}`);
  return [productId, ...pairs].join("|");
}

/**
 * A complete, valid selection for the product: one known option per variant group.
 * Missing or unknown choices fall back to the group's first option; unknown groups are dropped.
 */
export function normalizeVariants(product: Product, selection: VariantSelection | undefined): VariantSelection {
  const defaults = defaultVariantSelection(product.variants);
  const result: VariantSelection = {};
  for (const group of product.variants ?? []) {
    const chosen = selection?.[group.id];
    result[group.id] = group.options.some((option) => option.id === chosen) ? (chosen as string) : defaults[group.id];
  }
  return result;
}

/* ----------------------------- cart ------------------------------ */

export type AddStatus = "added" | "limit" | "unavailable" | "invalid";

export type AddResult = {
  lines: CartLine[];
  status: AddStatus;
  /** Units actually added (0 unless status is "added"). */
  added: number;
  /** Quantity of this configuration in the cart afterwards. */
  quantity: number;
  /** True when fewer units than requested were added because of the limit. */
  capped: boolean;
  max: number;
};

/** Adds a configuration, merging with an existing identical line and respecting the limit. */
export function addToCart(
  lines: CartLine[],
  product: Product,
  selection: VariantSelection | undefined,
  quantity = 1,
): AddResult {
  const max = maxQuantity(product);
  const requested = Math.trunc(quantity);
  const existing = lines.find(
    (line) => line.productId === product.id && lineKey(line.productId, line.variants) === lineKey(product.id, normalizeVariants(product, selection)),
  );
  const current = existing?.quantity ?? 0;

  if (!isPurchasable(product) || max < 1) {
    return { lines, status: "unavailable", added: 0, quantity: current, capped: false, max };
  }
  if (!Number.isFinite(requested) || requested < 1) {
    return { lines, status: "invalid", added: 0, quantity: current, capped: false, max };
  }

  const variants = normalizeVariants(product, selection);
  const next = Math.min(max, current + requested);
  if (next === current) {
    return { lines, status: "limit", added: 0, quantity: current, capped: true, max };
  }

  const updated = existing
    ? lines.map((line) => (line === existing ? { ...line, quantity: next } : line))
    : [...lines, { productId: product.id, variants, quantity: next }];
  return { lines: updated, status: "added", added: next - current, quantity: next, capped: next < current + requested, max };
}

/** Sets a line's quantity, clamped to 1..limit. Lines whose product is gone are dropped. */
export function updateQuantity(lines: CartLine[], key: string, quantity: number): CartLine[] {
  return lines.flatMap((line) => {
    if (lineKey(line.productId, line.variants) !== key) return [line];
    const product = getProductById(line.productId);
    if (!product) return [];
    const next = clampQuantity(quantity, maxQuantity(product));
    return next < 1 ? [] : [{ ...line, quantity: next }];
  });
}

export function removeLine(lines: CartLine[], key: string): CartLine[] {
  return lines.filter((line) => lineKey(line.productId, line.variants) !== key);
}

/** Removes the given quantities from the cart; lines that reach zero are dropped. */
export function subtractLines(lines: CartLine[], purchased: CartLine[]): CartLine[] {
  const remaining = new Map<string, number>();
  for (const line of purchased) {
    const key = lineKey(line.productId, line.variants);
    remaining.set(key, (remaining.get(key) ?? 0) + line.quantity);
  }
  return lines.flatMap((line) => {
    const key = lineKey(line.productId, line.variants);
    const take = Math.min(line.quantity, remaining.get(key) ?? 0);
    remaining.set(key, (remaining.get(key) ?? 0) - take);
    const left = line.quantity - take;
    return left > 0 ? [{ ...line, quantity: left }] : [];
  });
}

export type ResolvedLine = {
  key: string;
  line: CartLine;
  product: Product;
  variantLabels: string[];
  unitHalalas: number;
  compareAtHalalas?: number;
  totalHalalas: number;
  max: number;
};

/** Joins lines with the catalogue. Lines for unknown products are skipped. */
export function resolveCart(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((line) => {
    const product = getProductById(line.productId);
    if (!product) return [];
    const unitHalalas = toHalalas(product.price);
    const hasCompare = product.compareAtPrice !== undefined && product.compareAtPrice > product.price;
    return [
      {
        key: lineKey(line.productId, line.variants),
        line,
        product,
        variantLabels: selectedVariantLabels(product.variants, line.variants),
        unitHalalas,
        compareAtHalalas: hasCompare ? toHalalas(product.compareAtPrice as number) : undefined,
        totalHalalas: unitHalalas * line.quantity,
        max: maxQuantity(product),
      },
    ];
  });
}

export type CartSummary = {
  lineCount: number;
  itemCount: number;
  subtotalHalalas: number;
  /** Savings against explicit compare-at prices only; already reflected in the subtotal. */
  savingsHalalas: number;
  /** Subtotal only: shipping, tax and any discounts are not part of this demo. */
  estimatedTotalHalalas: number;
};

export function summarizeCart(resolved: ResolvedLine[]): CartSummary {
  let itemCount = 0;
  let subtotalHalalas = 0;
  let savingsHalalas = 0;
  for (const item of resolved) {
    itemCount += item.line.quantity;
    subtotalHalalas += item.totalHalalas;
    if (item.compareAtHalalas !== undefined) {
      savingsHalalas += (item.compareAtHalalas - item.unitHalalas) * item.line.quantity;
    }
  }
  return {
    lineCount: resolved.length,
    itemCount,
    subtotalHalalas,
    savingsHalalas,
    estimatedTotalHalalas: subtotalHalalas,
  };
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** User-facing outcome of an add attempt. Failures are never described as successes. */
export function describeAddResult(
  product: Pick<Product, "name">,
  result: Pick<AddResult, "status" | "added" | "quantity" | "max" | "capped">,
): { tone: "success" | "error"; text: string } {
  switch (result.status) {
    case "added":
      return {
        tone: "success",
        text: result.capped
          ? `Added ${result.added} of ${product.name} to your cart. The limit of ${result.max} per order was reached.`
          : `Added ${result.added === 1 ? "1 unit" : `${result.added} units`} of ${product.name} to your cart.`,
      };
    case "limit":
      return {
        tone: "error",
        text: `${product.name} is already at the limit of ${result.max} per order. Nothing was added.`,
      };
    case "unavailable":
      return { tone: "error", text: `${product.name} is out of stock and cannot be added.` };
    default:
      return { tone: "error", text: "Choose a valid quantity before adding to your cart." };
  }
}

/* --------------------------- wishlist ---------------------------- */

export function addToWishlist(ids: string[], productId: string): string[] {
  if (!getProductById(productId) || ids.includes(productId)) return ids;
  return [...ids, productId];
}

export function removeFromWishlist(ids: string[], productId: string): string[] {
  return ids.includes(productId) ? ids.filter((id) => id !== productId) : ids;
}

export function toggleWishlist(ids: string[], productId: string): string[] {
  return ids.includes(productId) ? removeFromWishlist(ids, productId) : addToWishlist(ids, productId);
}

/* ------------------- persistence: validate + encode -------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Turns untrusted stored data into a valid cart: unknown or out-of-stock products are dropped,
 * variants are repaired against the catalogue, quantities are clamped to 1..limit and duplicate
 * configurations are merged. Anything unrecognisable yields an empty cart.
 */
export function sanitizeCart(raw: unknown): CartLine[] {
  if (!isRecord(raw) || raw.version !== STORAGE_VERSION || !Array.isArray(raw.lines)) return [];
  let lines: CartLine[] = [];
  for (const entry of raw.lines) {
    if (!isRecord(entry) || typeof entry.productId !== "string") continue;
    const product = getProductById(entry.productId);
    if (!product || !isPurchasable(product)) continue;
    if (typeof entry.quantity !== "number" || !Number.isFinite(entry.quantity) || entry.quantity < 1) continue;
    const stored = isRecord(entry.variants)
      ? Object.fromEntries(Object.entries(entry.variants).filter(([, v]) => typeof v === "string") as [string, string][])
      : {};
    const variants = normalizeVariants(product, stored);
    const key = lineKey(product.id, variants);
    const max = maxQuantity(product);
    const existing = lines.find((line) => lineKey(line.productId, line.variants) === key);
    const quantity = clampQuantity((existing?.quantity ?? 0) + Math.trunc(entry.quantity), max);
    lines = existing
      ? lines.map((line) => (line === existing ? { ...line, quantity } : line))
      : [...lines, { productId: product.id, variants, quantity }];
  }
  return lines;
}

/** Keeps known product ids, in stored order, without duplicates. */
export function sanitizeWishlist(raw: unknown): string[] {
  if (!isRecord(raw) || raw.version !== STORAGE_VERSION || !Array.isArray(raw.ids)) return [];
  const seen = new Set<string>();
  for (const id of raw.ids) {
    if (typeof id === "string" && getProductById(id)) seen.add(id);
  }
  return [...seen];
}

export function serializeCart(lines: CartLine[]): string {
  return JSON.stringify({ version: STORAGE_VERSION, lines });
}

export function serializeWishlist(ids: string[]): string {
  return JSON.stringify({ version: STORAGE_VERSION, ids });
}
