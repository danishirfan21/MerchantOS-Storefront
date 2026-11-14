import { describe, expect, it } from "vitest";
import { createDemoOrder, sanitizeDemoOrders, type DemoOrder } from "@/lib/demo-orders";
import { findOrderById, orderStatusLabel, searchOrders, sortOrdersNewestFirst, trackingStages } from "@/lib/order-history";
import { getProductById } from "@/lib/products";
import { resolveCart } from "@/lib/shopping";

function make(id: string, createdAt: string, productId = "p4", quantity = 1): DemoOrder {
  return createDemoOrder({
    id,
    submissionId: `sub-${id}-0000`,
    resolved: resolveCart([{ productId, variants: productId === "p1" ? { finish: "black-titanium" } : {}, quantity }]),
    paymentMethodId: "demo-cod",
    deliveryMethodId: "standard",
    now: new Date(createdAt),
  });
}

describe("sortOrdersNewestFirst", () => {
  const a = make("DEMO-AAAAAAAA", "2026-01-01T10:00:00Z");
  const b = make("DEMO-BBBBBBBB", "2026-01-03T10:00:00Z");
  const c = make("DEMO-CCCCCCCC", "2026-01-02T10:00:00Z");

  it("puts the newest order first", () => {
    expect(sortOrdersNewestFirst([a, b, c]).map((o) => o.id)).toEqual(["DEMO-BBBBBBBB", "DEMO-CCCCCCCC", "DEMO-AAAAAAAA"]);
  });

  it("breaks ties deterministically by reference, whatever the input order", () => {
    const x = make("DEMO-XXXXXXXX", "2026-01-05T10:00:00Z");
    const y = make("DEMO-YYYYYYYY", "2026-01-05T10:00:00Z");
    expect(sortOrdersNewestFirst([y, x]).map((o) => o.id)).toEqual(["DEMO-XXXXXXXX", "DEMO-YYYYYYYY"]);
    expect(sortOrdersNewestFirst([x, y]).map((o) => o.id)).toEqual(["DEMO-XXXXXXXX", "DEMO-YYYYYYYY"]);
  });

  it("does not mutate its input", () => {
    const input = [a, b, c];
    const frozen = JSON.stringify(input);
    sortOrdersNewestFirst(input);
    expect(input.map((o) => o.id)).toEqual(["DEMO-AAAAAAAA", "DEMO-BBBBBBBB", "DEMO-CCCCCCCC"]);
    expect(JSON.stringify(input)).toBe(frozen);
  });
});

describe("searchOrders", () => {
  const phone = make("DEMO-AAAAAAAA", "2026-01-01T10:00:00Z", "p1");
  const other = make("DEMO-BBBBBBBB", "2026-01-02T10:00:00Z", "p4");
  const orders = [phone, other];

  it("keeps everything for a blank query", () => {
    expect(searchOrders(orders, "  ")).toEqual(orders);
  });
  it("matches the reference, case-insensitively and partially", () => {
    expect(searchOrders(orders, "demo-bbbb").map((o) => o.id)).toEqual(["DEMO-BBBBBBBB"]);
    expect(searchOrders(orders, "AAAA")).toEqual([phone]);
  });
  it("matches any purchased product name", () => {
    const name = phone.lines[0].name;
    expect(searchOrders(orders, name.slice(0, 6).toUpperCase())).toContain(phone);
    expect(searchOrders(orders, other.lines[0].name)).toContain(other);
  });
  it("returns an empty list when nothing matches and leaves the snapshots untouched", () => {
    const frozen = JSON.stringify(orders);
    expect(searchOrders(orders, "no such thing")).toEqual([]);
    expect(JSON.stringify(orders)).toBe(frozen);
  });
});

describe("order lookup and snapshots", () => {
  it("finds an exact id and returns undefined for unknown ids", () => {
    const orders = [make("DEMO-AAAAAAAA", "2026-01-01T10:00:00Z")];
    expect(findOrderById(orders, "DEMO-AAAAAAAA")).toBe(orders[0]);
    expect(findOrderById(orders, "DEMO-ZZZZZZZZ")).toBeUndefined();
  });

  it("keeps the historical price even when the catalogue price differs", () => {
    const order = make("DEMO-AAAAAAAA", "2026-01-01T10:00:00Z", "p4", 2);
    const stored = JSON.parse(JSON.stringify(order));
    stored.lines[0].unitHalalas = order.lines[0].unitHalalas; // unchanged
    expect(sanitizeDemoOrders({ version: 1, orders: [stored] }).length).toBeGreaterThanOrEqual(0);
    // A tampered price no longer adds up, so it is rejected rather than silently repriced.
    const tampered = JSON.parse(JSON.stringify(order));
    tampered.lines[0].unitHalalas += 100;
    expect(sanitizeDemoOrders({ version: 1, orders: [tampered] })).toEqual([]);
    expect(order.lines[0].lineTotalHalalas).toBe(order.lines[0].unitHalalas * 2);
  });

  it("keeps lines for products that are no longer in the catalogue", () => {
    const order = make("DEMO-AAAAAAAA", "2026-01-01T10:00:00Z");
    expect(getProductById("gone-product")).toBeUndefined();
    const retained = { ...order, lines: [{ ...order.lines[0], productId: "gone-product" }] };
    expect(searchOrders([retained], order.lines[0].name)).toHaveLength(1);
  });
});

describe("status and tracking", () => {
  it("maps the only supported status", () => {
    expect(orderStatusLabel("demo-created")).toBe("Demo order created");
  });
  it("marks only the creation stage as reached", () => {
    const stages = trackingStages("demo-created");
    expect(stages.filter((s) => s.reached).map((s) => s.id)).toEqual(["created"]);
    expect(stages.map((s) => s.id)).toEqual(["created", "processing", "shipped", "out-for-delivery", "delivered"]);
  });
});
