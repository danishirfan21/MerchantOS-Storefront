/**
 * Browser-side shopping store backed by localStorage, consumed with useSyncExternalStore.
 *
 * - The server snapshot is empty and `ready: false`, so server HTML and the first client
 *   render agree; the stored state is read afterwards without a hydration mismatch.
 * - Nothing is written until the shopper changes something, so the initial empty state can
 *   never overwrite stored data.
 * - Corrupt or unavailable storage degrades to an in-memory store for the session.
 * - Other tabs are followed through the `storage` event.
 *
 * Local demo state only: not an account, an order or authoritative inventory.
 */
import {
  addToCart,
  addToWishlist,
  CART_STORAGE_KEY,
  removeFromWishlist,
  removeLine,
  sanitizeCart,
  sanitizeWishlist,
  serializeCart,
  serializeWishlist,
  toggleWishlist,
  updateQuantity,
  WISHLIST_STORAGE_KEY,
  type AddResult,
  type CartLine,
} from "@/lib/shopping";
import type { VariantSelection } from "@/lib/products";
import type { Product } from "@/types/product";

export type ShoppingSnapshot = {
  /** False on the server and until the browser state has been read. */
  ready: boolean;
  cart: CartLine[];
  wishlist: string[];
};

const SERVER_SNAPSHOT: ShoppingSnapshot = { ready: false, cart: [], wishlist: [] };

let snapshot: ShoppingSnapshot | null = null;
const listeners = new Set<() => void>();
let storageListening = false;

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage is full, blocked or unavailable: keep the in-memory state for this session.
  }
}

function load(): ShoppingSnapshot {
  return {
    ready: true,
    cart: sanitizeCart(readJson(CART_STORAGE_KEY)),
    wishlist: sanitizeWishlist(readJson(WISHLIST_STORAGE_KEY)),
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== CART_STORAGE_KEY && event.key !== WISHLIST_STORAGE_KEY) return;
  snapshot = load();
  emit();
}

export function getSnapshot(): ShoppingSnapshot {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  snapshot ??= load();
  return snapshot;
}

export function getServerSnapshot(): ShoppingSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!storageListening && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
    storageListening = true;
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && storageListening) {
      window.removeEventListener("storage", onStorage);
      storageListening = false;
    }
  };
}

function commitCart(cart: CartLine[]) {
  snapshot = { ...getSnapshot(), cart };
  write(CART_STORAGE_KEY, serializeCart(cart));
  emit();
}

function commitWishlist(wishlist: string[]) {
  snapshot = { ...getSnapshot(), wishlist };
  write(WISHLIST_STORAGE_KEY, serializeWishlist(wishlist));
  emit();
}

/* ------------------------------ actions ------------------------------ */

export function addProductToCart(product: Product, variants?: VariantSelection, quantity = 1): AddResult {
  const result = addToCart(getSnapshot().cart, product, variants, quantity);
  if (result.status === "added") commitCart(result.lines);
  return result;
}

export function setCartQuantity(key: string, quantity: number) {
  commitCart(updateQuantity(getSnapshot().cart, key, quantity));
}

export function removeCartLine(key: string) {
  commitCart(removeLine(getSnapshot().cart, key));
}

export function toggleWishlistItem(productId: string): boolean {
  const next = toggleWishlist(getSnapshot().wishlist, productId);
  commitWishlist(next);
  return next.includes(productId);
}

export function saveToWishlist(productId: string) {
  commitWishlist(addToWishlist(getSnapshot().wishlist, productId));
}

export function removeFromWishlistItem(productId: string) {
  commitWishlist(removeFromWishlist(getSnapshot().wishlist, productId));
}

/** Test helper: forget the in-memory snapshot so the next read reloads from storage. */
export function resetShoppingStoreForTests() {
  snapshot = null;
  emit();
}
