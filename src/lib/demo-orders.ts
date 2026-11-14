/**
 * Demo order records: the type, snapshot creation and validation of stored data.
 *
 * This module is pure and isolated so it can later be replaced by a backend API.
 * A record is a snapshot taken at submission, so later cart edits or catalogue changes
 * never alter it. It holds NO personal or payment data: no name, email, phone, street
 * address or card details. Only the non-sensitive delivery and payment option labels.
 *
 * Demo orders are not real orders: nothing is charged, reserved, shipped or emailed.
 */
import { deliveryMethodLabel, paymentMethodLabel } from "@/lib/checkout";
import { MAX_ORDER_QUANTITY } from "@/lib/products";
import { summarizeCart, type ResolvedLine } from "@/lib/shopping";

export const DEMO_ORDER_SCHEMA_VERSION = 1;
export const DEMO_ORDERS_STORAGE_KEY = "merchantos.storefront.demo-orders.v1";
/** Oldest records are dropped beyond this many. */
export const MAX_DEMO_ORDERS = 25;
/** Serialized store size ceiling (characters). Oldest records are dropped to fit. */
export const MAX_STORE_CHARS = 200_000;

export type DemoOrderStatus = "demo-created";

export type DemoOrderLine = {
  productId: string;
  /** Product name at the time of submission. */
  name: string;
  /** Selected option id per variant group. */
  variants: Record<string, string>;
  variantLabels: string[];
  quantity: number;
  unitHalalas: number;
  lineTotalHalalas: number;
};

export type DemoOrder = {
  schemaVersion: typeof DEMO_ORDER_SCHEMA_VERSION;
  /** Public demo reference, e.g. DEMO-7K2M9QXA. Also the confirmation page id. */
  id: string;
  /** Random per-checkout identity used for idempotency. Not personal data. */
  submissionId: string;
  createdAt: string;
  status: DemoOrderStatus;
  paymentMethod: { id: string; label: string };
  deliveryMethod: { id: string; label: string };
  lines: DemoOrderLine[];
  itemCount: number;
  subtotalHalalas: number;
  savingsHalalas: number;
  /** Subtotal only. Shipping and tax are not part of this demo. */
  estimatedTotalHalalas: number;
};

/* ------------------------------- ids ---------------------------------- */

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ORDER_ID_PATTERN = /^DEMO-[A-HJ-NP-Z2-9]{8}$/;
const SUBMISSION_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

export function isOrderId(value: string): boolean {
  return ORDER_ID_PATTERN.test(value);
}

export function isSubmissionId(value: string): boolean {
  return SUBMISSION_ID_PATTERN.test(value);
}

function randomValues(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return bytes;
}

/** A readable demo reference. Uniqueness is checked against stored orders by the store. */
export function generateOrderId(): string {
  const chars = Array.from(randomValues(8), (byte) => ID_ALPHABET[byte % ID_ALPHABET.length]);
  return `DEMO-${chars.join("")}`;
}

export function generateSubmissionId(): string {
  return Array.from(randomValues(16), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/* ----------------------------- snapshot ------------------------------- */

export type CreateOrderInput = {
  id: string;
  submissionId: string;
  resolved: ResolvedLine[];
  paymentMethodId: string;
  deliveryMethodId: string;
  now?: Date;
};

/** Builds the snapshot from resolved cart lines. Throws if the input cannot make a valid order. */
export function createDemoOrder(input: CreateOrderInput): DemoOrder {
  const payment = paymentMethodLabel(input.paymentMethodId);
  const delivery = deliveryMethodLabel(input.deliveryMethodId);
  if (!payment || !delivery) throw new Error("Unknown payment or delivery option.");
  if (input.resolved.length === 0) throw new Error("Cannot create an order from an empty cart.");

  const summary = summarizeCart(input.resolved);
  return {
    schemaVersion: DEMO_ORDER_SCHEMA_VERSION,
    id: input.id,
    submissionId: input.submissionId,
    createdAt: (input.now ?? new Date()).toISOString(),
    status: "demo-created",
    paymentMethod: { id: input.paymentMethodId, label: payment },
    deliveryMethod: { id: input.deliveryMethodId, label: delivery },
    lines: input.resolved.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      variants: { ...item.line.variants },
      variantLabels: [...item.variantLabels],
      quantity: item.line.quantity,
      unitHalalas: item.unitHalalas,
      lineTotalHalalas: item.totalHalalas,
    })),
    itemCount: summary.itemCount,
    subtotalHalalas: summary.subtotalHalalas,
    savingsHalalas: summary.savingsHalalas,
    estimatedTotalHalalas: summary.estimatedTotalHalalas,
  };
}

/* ---------------------------- validation ------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHalalas(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isShortString(value: unknown, max = 200): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

function sanitizeLine(raw: unknown): DemoOrderLine | null {
  if (!isRecord(raw)) return null;
  const { productId, name, variants, variantLabels, quantity, unitHalalas, lineTotalHalalas } = raw;
  if (!isShortString(productId, 64) || !isShortString(name)) return null;
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ORDER_QUANTITY) return null;
  if (!isHalalas(unitHalalas) || !isHalalas(lineTotalHalalas) || unitHalalas * quantity !== lineTotalHalalas) return null;
  if (!isRecord(variants) || !Array.isArray(variantLabels)) return null;
  const cleanVariants: Record<string, string> = {};
  for (const [group, option] of Object.entries(variants)) {
    if (!isShortString(group, 64) || !isShortString(option, 64)) return null;
    cleanVariants[group] = option;
  }
  if (variantLabels.length > 10 || !variantLabels.every((label) => isShortString(label))) return null;
  return {
    productId,
    name,
    variants: cleanVariants,
    variantLabels: variantLabels as string[],
    quantity,
    unitHalalas,
    lineTotalHalalas,
  };
}

/**
 * Validates one stored record. Anything malformed, from another schema version, or
 * internally inconsistent (totals that do not add up) is rejected, never repaired, so a
 * tampered or corrupt record cannot display wrong amounts. Labels come from the app's own
 * option lists rather than from storage.
 */
export function sanitizeDemoOrder(raw: unknown): DemoOrder | null {
  if (!isRecord(raw) || raw.schemaVersion !== DEMO_ORDER_SCHEMA_VERSION) return null;
  if (typeof raw.id !== "string" || !isOrderId(raw.id)) return null;
  if (typeof raw.submissionId !== "string" || !isSubmissionId(raw.submissionId)) return null;
  if (typeof raw.createdAt !== "string" || Number.isNaN(Date.parse(raw.createdAt))) return null;
  if (raw.status !== "demo-created") return null;
  if (!isRecord(raw.paymentMethod) || !isRecord(raw.deliveryMethod)) return null;
  const paymentId = raw.paymentMethod.id;
  const deliveryId = raw.deliveryMethod.id;
  if (typeof paymentId !== "string" || typeof deliveryId !== "string") return null;
  const paymentLabel = paymentMethodLabel(paymentId);
  const deliveryLabel = deliveryMethodLabel(deliveryId);
  if (!paymentLabel || !deliveryLabel) return null;
  if (!Array.isArray(raw.lines) || raw.lines.length === 0 || raw.lines.length > 50) return null;

  const lines: DemoOrderLine[] = [];
  for (const entry of raw.lines) {
    const line = sanitizeLine(entry);
    if (!line) return null;
    lines.push(line);
  }

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotalHalalas, 0);
  if (raw.itemCount !== itemCount || raw.subtotalHalalas !== subtotal) return null;
  if (!isHalalas(raw.savingsHalalas) || raw.estimatedTotalHalalas !== subtotal) return null;

  return {
    schemaVersion: DEMO_ORDER_SCHEMA_VERSION,
    id: raw.id,
    submissionId: raw.submissionId,
    createdAt: raw.createdAt,
    status: "demo-created",
    paymentMethod: { id: paymentId, label: paymentLabel },
    deliveryMethod: { id: deliveryId, label: deliveryLabel },
    lines,
    itemCount,
    subtotalHalalas: subtotal,
    savingsHalalas: raw.savingsHalalas,
    estimatedTotalHalalas: subtotal,
  };
}

/** Valid orders from untrusted stored data. Invalid records are skipped; a bad store yields none. */
export function sanitizeDemoOrders(raw: unknown): DemoOrder[] {
  if (!isRecord(raw) || raw.version !== DEMO_ORDER_SCHEMA_VERSION || !Array.isArray(raw.orders)) return [];
  const seen = new Set<string>();
  const orders: DemoOrder[] = [];
  for (const entry of raw.orders.slice(0, MAX_DEMO_ORDERS)) {
    const order = sanitizeDemoOrder(entry);
    if (order && !seen.has(order.id)) {
      seen.add(order.id);
      orders.push(order);
    }
  }
  return orders;
}

/** Newest first, capped by count and by serialized size. */
export function serializeDemoOrders(orders: DemoOrder[]): string {
  let kept = orders.slice(0, MAX_DEMO_ORDERS);
  let text = JSON.stringify({ version: DEMO_ORDER_SCHEMA_VERSION, orders: kept });
  while (text.length > MAX_STORE_CHARS && kept.length > 1) {
    kept = kept.slice(0, -1);
    text = JSON.stringify({ version: DEMO_ORDER_SCHEMA_VERSION, orders: kept });
  }
  return text;
}
