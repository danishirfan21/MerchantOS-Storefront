/**
 * Pure helpers for the My Orders list: ordering, search and status presentation.
 * They never mutate the stored snapshots and never consult the live catalogue for amounts.
 */
import type { DemoOrder, DemoOrderStatus } from "@/lib/demo-orders";

export const STATUS_LABELS: Record<DemoOrderStatus, string> = {
  "demo-created": "Demo order created",
};

export function orderStatusLabel(status: DemoOrderStatus): string {
  return STATUS_LABELS[status];
}

/** Newest first. Equal timestamps (or unreadable ones) fall back to the reference, so order is deterministic. */
export function sortOrdersNewestFirst(orders: readonly DemoOrder[]): DemoOrder[] {
  const time = (order: DemoOrder) => {
    const value = Date.parse(order.createdAt);
    return Number.isNaN(value) ? 0 : value;
  };
  return [...orders].sort((a, b) => time(b) - time(a) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Case-insensitive match on the demo reference or any purchased product name. Blank query keeps everything. */
export function searchOrders(orders: readonly DemoOrder[], query: string): DemoOrder[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...orders];
  return orders.filter(
    (order) => order.id.toLowerCase().includes(needle) || order.lines.some((line) => line.name.toLowerCase().includes(needle)),
  );
}

export function findOrderById(orders: readonly DemoOrder[], id: string): DemoOrder | undefined {
  return orders.find((order) => order.id === id);
}

/** Stages shown in the tracking timeline. Only "created" is ever real in this demo. */
export const TRACKING_STAGES = [
  { id: "created", label: "Demo order created" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "out-for-delivery", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
] as const;

export type TrackingStage = {
  id: (typeof TRACKING_STAGES)[number]["id"];
  label: string;
  /** Only the creation stage can be reached; later ones are illustrative. */
  reached: boolean;
};

export function trackingStages(status: DemoOrderStatus): TrackingStage[] {
  return TRACKING_STAGES.map((stage) => ({ ...stage, reached: stage.id === "created" && status === "demo-created" }));
}
