import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { MyOrdersView } from "@/components/orders/MyOrdersView";
import { OrderDetailsView } from "@/components/orders/OrderDetailsView";
import { OrderConfirmationView } from "@/components/orders/OrderConfirmationView";
import { createDemoOrder, DEMO_ORDERS_STORAGE_KEY, serializeDemoOrders, type DemoOrder } from "@/lib/demo-orders";
import { resetDemoOrderStoreForTests } from "@/lib/demo-order-store";
import { resolveCart } from "@/lib/shopping";

function make(id: string, createdAt: string, productId: string, quantity = 1): DemoOrder {
  return createDemoOrder({
    id,
    submissionId: `sub-${id}-0000`,
    resolved: resolveCart([{ productId, variants: productId === "p1" ? { finish: "black-titanium" } : {}, quantity }]),
    paymentMethodId: "demo-cod",
    deliveryMethodId: "standard",
    now: new Date(createdAt),
  });
}

const older = make("DEMO-AAAAAAAA", "2026-01-01T10:00:00Z", "p1", 2);
const newer = make("DEMO-BBBBBBBB", "2026-01-02T10:00:00Z", "p4", 1);

function store(...orders: DemoOrder[]) {
  window.localStorage.clear();
  if (orders.length) window.localStorage.setItem(DEMO_ORDERS_STORAGE_KEY, serializeDemoOrders(orders));
  resetDemoOrderStoreForTests();
}

beforeEach(() => store());

describe("MyOrdersView", () => {
  it("explains that orders are browser-only and shows an empty state with a working CTA", () => {
    render(<MyOrdersView />);
    expect(screen.getByRole("heading", { level: 1, name: "My Demo Orders" })).toBeInTheDocument();
    expect(screen.getByText(/saved in this browser only/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No demo orders yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse products" })).toHaveAttribute("href", "/products");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("does not claim there are no orders when storage cannot be read", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    try {
      resetDemoOrderStoreForTests();
      render(<MyOrdersView />);
      expect(screen.getByRole("heading", { name: "Demo orders can't be read" })).toBeInTheDocument();
      expect(screen.queryByText("No demo orders yet")).not.toBeInTheDocument();
    } finally {
      Storage.prototype.getItem = original;
    }
  });

  it("lists saved orders newest first using their snapshots, with detail links", () => {
    store(older, newer);
    render(<MyOrdersView />);
    const cards = screen.getAllByTestId("order-card");
    expect(cards.map((c) => within(c).getByTestId("card-reference").textContent)).toEqual(["DEMO-BBBBBBBB", "DEMO-AAAAAAAA"]);
    expect(within(cards[1]).getByText(/Qty 2/)).toBeInTheDocument();
    expect(within(cards[1]).getByText(/2 items/)).toBeInTheDocument();
    expect(within(cards[1]).getByRole("link", { name: "View details for DEMO-AAAAAAAA" })).toHaveAttribute(
      "href",
      "/account/orders/DEMO-AAAAAAAA",
    );
    expect(screen.getByTestId("orders-count")).toHaveTextContent("2 demo orders");
    expect(screen.getAllByText("Demo order")).toHaveLength(2);
  });

  it("searches by reference and by product name, and recovers from no match", async () => {
    store(older, newer);
    const user = userEvent.setup();
    render(<MyOrdersView />);
    const box = screen.getByRole("searchbox", { name: "Search orders" });

    await user.type(box, "aaaaaaaa");
    expect(screen.getAllByTestId("order-card")).toHaveLength(1);
    expect(screen.getByTestId("card-reference")).toHaveTextContent("DEMO-AAAAAAAA");

    await user.clear(box);
    await user.type(box, newer.lines[0].name.slice(0, 8));
    expect(screen.getByTestId("card-reference")).toHaveTextContent("DEMO-BBBBBBBB");

    await user.clear(box);
    await user.type(box, "zzz-nothing");
    expect(screen.getByTestId("orders-no-match")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getAllByTestId("order-card")).toHaveLength(2);
  });

  it("ignores corrupted stored data safely", () => {
    window.localStorage.setItem(DEMO_ORDERS_STORAGE_KEY, "{not json");
    resetDemoOrderStoreForTests();
    render(<MyOrdersView />);
    expect(screen.getByRole("heading", { name: "No demo orders yet" })).toBeInTheDocument();
  });
});

describe("OrderDetailsView", () => {
  it("shows the exact stored order with saved prices, options and navigation", () => {
    store(older, newer);
    render(<OrderDetailsView orderId="DEMO-AAAAAAAA" />);
    expect(screen.getByRole("heading", { level: 1, name: /Order details/ })).toBeInTheDocument();
    expect(screen.getByTestId("order-reference")).toHaveTextContent("DEMO-AAAAAAAA");
    expect(screen.getByTestId("order-status")).toHaveTextContent("Demo order");
    expect(screen.getByText("Finish: Black Titanium")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Items in this order (2)" })).toBeInTheDocument();
    expect(screen.getByTestId("order-total")).toHaveTextContent(/[\d,]+/);
    expect(screen.getByText("Demo cash on delivery")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to my orders" })).toHaveAttribute("href", "/account/orders");
    expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: older.lines[0].name })).toHaveAttribute("href", expect.stringMatching(/^\/products\//));
  });

  it("prefers the saved amounts over the current catalogue", () => {
    const repriced: DemoOrder = {
      ...older,
      lines: older.lines.map((l) => ({ ...l, unitHalalas: 100, lineTotalHalalas: 200 })),
      subtotalHalalas: 200,
      savingsHalalas: 0,
      estimatedTotalHalalas: 200,
    };
    // Written directly so the page logic itself is what is exercised (validation is covered elsewhere).
    store(repriced);
    render(<OrderDetailsView orderId="DEMO-AAAAAAAA" />);
    const total = screen.getByTestId("order-total").textContent ?? "";
    expect(total).toContain("2");
    expect(total).not.toBe(older.estimatedTotalHalalas.toString());
    expect(total.length).toBeLessThan(12);
  });

  it("keeps a product name without a link when the product is no longer in the catalogue", () => {
    const gone: DemoOrder = { ...older, lines: [{ ...older.lines[0], productId: "gone-product", name: "Retired gadget" }] };
    window.localStorage.setItem(DEMO_ORDERS_STORAGE_KEY, JSON.stringify({ version: 1, orders: [gone] }));
    resetDemoOrderStoreForTests();
    render(<OrderDetailsView orderId="DEMO-AAAAAAAA" />);
    expect(screen.getByText("Retired gadget")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Retired gadget" })).not.toBeInTheDocument();
  });

  it("shows a missing-order state for unknown or malformed ids", () => {
    store(older);
    const { unmount } = render(<OrderDetailsView orderId="DEMO-ZZZZZZZZ" />);
    expect(screen.getByRole("heading", { name: "Demo order not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My demo orders" })).toHaveAttribute("href", "/account/orders");
    unmount();
    render(<OrderDetailsView orderId="../etc" />);
    expect(screen.getByRole("heading", { name: "Demo order not found" })).toBeInTheDocument();
  });

  it("presents an honest timeline: only creation reached, nothing shipped or delivered", () => {
    store(older);
    render(<OrderDetailsView orderId="DEMO-AAAAAAAA" />);
    const items = within(screen.getByTestId("order-timeline")).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(items.map((i) => i.getAttribute("data-state"))).toEqual([
      "reached",
      "unavailable",
      "unavailable",
      "unavailable",
      "unavailable",
    ]);
    expect(within(items[0]).getByText("Demo order created")).toBeInTheDocument();
    for (const item of items.slice(1)) expect(within(item).getByText("Not available in this demo")).toBeInTheDocument();
    expect(screen.getByTestId("tracking-note")).toHaveTextContent(
      "This demo order was created in your browser. No payment, stock reservation, shipping or delivery has occurred.",
    );
    expect(screen.queryByText(/tracking number|courier|estimated arrival/i)).not.toBeInTheDocument();
  });
});

describe("OrderConfirmationView links", () => {
  it("links to the stored order details and to My orders", () => {
    store(older);
    render(<OrderConfirmationView orderId="DEMO-AAAAAAAA" />);
    expect(screen.getByRole("link", { name: "View order details" })).toHaveAttribute("href", "/account/orders/DEMO-AAAAAAAA");
    expect(screen.getByRole("link", { name: "View my demo orders" })).toHaveAttribute("href", "/account/orders");
  });
});
