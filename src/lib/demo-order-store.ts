/**
 * Browser-local storage for demo orders, consumed with useSyncExternalStore.
 *
 * Orders live in this browser only (localStorage, versioned key). There is no server,
 * account or sync. Unlike the cart, there is no in-memory fallback: if storage cannot be
 * written and read back, saving fails so checkout never reports a success it cannot keep.
 */
import {
  DEMO_ORDERS_STORAGE_KEY,
  sanitizeDemoOrders,
  serializeDemoOrders,
  type DemoOrder,
} from "@/lib/demo-orders";

export type DemoOrdersSnapshot = {
  /** False on the server and until the browser state has been read. */
  ready: boolean;
  /** False when storage cannot be read at all (blocked or unavailable). */
  available: boolean;
  orders: DemoOrder[];
};

const SERVER_SNAPSHOT: DemoOrdersSnapshot = { ready: false, available: true, orders: [] };

let cachedRaw: string | null | undefined;
let cached: DemoOrdersSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
let storageListening = false;

function readRaw(): { raw: string | null; available: boolean } {
  try {
    return { raw: window.localStorage.getItem(DEMO_ORDERS_STORAGE_KEY), available: true };
  } catch {
    return { raw: null, available: false };
  }
}

function parse(raw: string | null): DemoOrder[] {
  if (!raw) return [];
  try {
    return sanitizeDemoOrders(JSON.parse(raw));
  } catch {
    return [];
  }
}

/** Stable between calls while the stored text is unchanged, as useSyncExternalStore requires. */
export function getSnapshot(): DemoOrdersSnapshot {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  const { raw, available } = readRaw();
  if (!available) {
    if (cached.ready && !cached.available) return cached;
    cachedRaw = undefined;
    cached = { ready: true, available: false, orders: [] };
    return cached;
  }
  if (cachedRaw === raw && cached.ready && cached.available) return cached;
  cachedRaw = raw;
  cached = { ready: true, available: true, orders: parse(raw) };
  return cached;
}

export function getServerSnapshot(): DemoOrdersSnapshot {
  return SERVER_SNAPSHOT;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== DEMO_ORDERS_STORAGE_KEY) return;
  emit();
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

/** Orders as currently stored. Empty when storage is unavailable or corrupt. */
export function listDemoOrders(): DemoOrder[] {
  return getSnapshot().orders;
}

/** Exact lookup by the stored order id. */
export function findDemoOrder(id: string): DemoOrder | undefined {
  return listDemoOrders().find((order) => order.id === id);
}

/** The order created by a given checkout submission, if one exists. */
export function findDemoOrderBySubmission(submissionId: string): DemoOrder | undefined {
  return listDemoOrders().find((order) => order.submissionId === submissionId);
}

export type SaveResult = { ok: true } | { ok: false };

/**
 * Stores a new order (newest first) and confirms it by reading it back. Returns
 * `{ ok: false }` when storage is unavailable, full or blocked, leaving nothing half-saved.
 */
export function saveDemoOrder(order: DemoOrder): SaveResult {
  const { raw, available } = readRaw();
  if (!available) return { ok: false };
  const existing = parse(raw).filter((entry) => entry.id !== order.id);
  const text = serializeDemoOrders([order, ...existing]);
  try {
    window.localStorage.setItem(DEMO_ORDERS_STORAGE_KEY, text);
    if (window.localStorage.getItem(DEMO_ORDERS_STORAGE_KEY) !== text) return { ok: false };
  } catch {
    return { ok: false };
  }
  if (!parse(text).some((entry) => entry.id === order.id)) return { ok: false };
  emit();
  return { ok: true };
}

/** Test helper: forget the cached snapshot so the next read reloads from storage. */
export function resetDemoOrderStoreForTests() {
  cachedRaw = undefined;
  cached = SERVER_SNAPSHOT;
  emit();
}
