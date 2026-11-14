import { beforeEach, describe, expect, it } from "vitest";
import {
  cartSignature,
  checkCartLines,
  EMPTY_FORM,
  firstInvalidField,
  isEmail,
  isPostalCode,
  isSaudiMobile,
  validateCheckoutForm,
  type CheckoutForm,
} from "@/lib/checkout";
import { submitDemoOrder } from "@/lib/checkout-submit";
import {
  createDemoOrder,
  DEMO_ORDERS_STORAGE_KEY,
  generateOrderId,
  isOrderId,
  sanitizeDemoOrder,
  sanitizeDemoOrders,
  serializeDemoOrders,
  MAX_DEMO_ORDERS,
} from "@/lib/demo-orders";
import { findDemoOrder, getSnapshot, resetDemoOrderStoreForTests, saveDemoOrder } from "@/lib/demo-order-store";
import { CART_STORAGE_KEY, resolveCart, subtractLines, toHalalas, type CartLine } from "@/lib/shopping";
import { resetShoppingStoreForTests } from "@/lib/shopping-store";

const valid: CheckoutForm = {
  fullName: "Sample Shopper",
  email: "sample@example.test",
  phone: "050 123 4567",
  recipientName: "",
  country: "SA",
  city: "Riyadh",
  address: "Sample District, Example Street",
  building: "Building 1",
  postalCode: "12345",
  deliveryMethod: "standard",
  paymentMethod: "demo-cod",
};

const cartOf = (...lines: unknown[]) => JSON.stringify({ version: 1, lines });

function seedCart(...lines: unknown[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, cartOf(...lines));
  resetShoppingStoreForTests();
}

beforeEach(() => {
  window.localStorage.clear();
  resetShoppingStoreForTests();
  resetDemoOrderStoreForTests();
});

describe("field validators", () => {
  it.each(["0501234567", "501234567", "+966501234567", "00966501234567", "05 0123-4567"])("accepts Saudi mobile %s", (v) =>
    expect(isSaudiMobile(v)).toBe(true),
  );
  it.each(["", "12345", "0401234567", "+971501234567", "05012345678", "abc"])("rejects phone %s", (v) =>
    expect(isSaudiMobile(v)).toBe(false),
  );
  it("validates email and postal code", () => {
    expect(isEmail("a@b.co")).toBe(true);
    expect(isEmail("a@b")).toBe(false);
    expect(isEmail("a b@c.com")).toBe(false);
    expect(isEmail(`${"a".repeat(250)}@b.com`)).toBe(false);
    expect(isPostalCode("12345")).toBe(true);
    expect(isPostalCode("1234")).toBe(false);
    expect(isPostalCode("12a45")).toBe(false);
  });
});

describe("validateCheckoutForm", () => {
  it("accepts a complete form", () => {
    expect(validateCheckoutForm(valid)).toEqual({});
  });

  it("requires every mandatory field", () => {
    const errors = validateCheckoutForm(EMPTY_FORM);
    expect(Object.keys(errors).sort()).toEqual(
      ["address", "building", "city", "deliveryMethod", "email", "fullName", "paymentMethod", "phone", "postalCode"].sort(),
    );
    expect(firstInvalidField(errors)).toBe("fullName");
  });

  it("reports format and length errors", () => {
    const errors = validateCheckoutForm({
      ...valid,
      email: "nope",
      phone: "123",
      postalCode: "1",
      fullName: "x".repeat(81),
      address: "x".repeat(121),
      recipientName: "y".repeat(81),
    });
    expect(Object.keys(errors).sort()).toEqual(["address", "email", "fullName", "phone", "postalCode", "recipientName"]);
  });

  it("rejects invalid selections", () => {
    const errors = validateCheckoutForm({ ...valid, country: "XX", city: "Atlantis", deliveryMethod: "drone", paymentMethod: "bitcoin" });
    expect(Object.keys(errors).sort()).toEqual(["city", "country", "deliveryMethod", "paymentMethod"]);
  });

  it("focuses the first invalid field in visual order", () => {
    expect(firstInvalidField(validateCheckoutForm({ ...valid, postalCode: "", email: "bad" }))).toBe("email");
    expect(firstInvalidField({})).toBeUndefined();
  });
});

describe("checkCartLines", () => {
  it("reports an empty cart", () => {
    expect(checkCartLines([])[0].code).toBe("empty");
  });
  it("accepts valid lines", () => {
    expect(checkCartLines([{ productId: "p1", variants: { finish: "black-titanium" }, quantity: 2 }])).toEqual([]);
  });
  it("reports unknown, out-of-stock, invalid variant and over-limit lines without repairing", () => {
    const codes = checkCartLines([
      { productId: "ghost", variants: {}, quantity: 1 },
      { productId: "p8", variants: {}, quantity: 1 },
      { productId: "p1", variants: { finish: "gold" }, quantity: 1 },
      { productId: "p3", variants: {}, quantity: 5 },
      { productId: "p4", variants: {}, quantity: 1.5 },
    ]).map((issue) => issue.code);
    expect(codes).toEqual(["unknown-product", "unavailable", "invalid-variant", "quantity", "quantity"]);
  });
});

describe("demo order snapshot", () => {
  const resolved = resolveCart([
    { productId: "p1", variants: { finish: "black-titanium" }, quantity: 2 },
    { productId: "p4", variants: {}, quantity: 1 },
  ]);
  const make = () =>
    createDemoOrder({
      id: "DEMO-ABCD2345",
      submissionId: "abcdef0123456789",
      resolved,
      paymentMethodId: "demo-cod",
      deliveryMethodId: "standard",
      now: new Date("2026-01-02T03:04:05Z"),
    });

  it("captures integer halala totals and non-sensitive data only", () => {
    const order = make();
    expect(order.itemCount).toBe(3);
    expect(order.subtotalHalalas).toBe(toHalalas(5199 * 2 + 3299));
    expect(order.savingsHalalas).toBe(toHalalas(600 + 200));
    expect(order.estimatedTotalHalalas).toBe(order.subtotalHalalas);
    expect(order.lines[0]).toMatchObject({ productId: "p1", variants: { finish: "black-titanium" }, quantity: 2, unitHalalas: 519900, lineTotalHalalas: 1039800 });
    expect(order.status).toBe("demo-created");
    const keys = JSON.stringify(order, (k, v) => v).match(/"[A-Za-z]+":/g)!.join("").toLowerCase();
    for (const forbidden of ["email", "phone", "address", "fullname", "card", "cvv"]) expect(keys).not.toContain(forbidden);
  });

  it("is a snapshot: later edits to the source lines do not change it", () => {
    const order = make();
    resolved[0].line.variants.finish = "white-titanium";
    expect(order.lines[0].variants.finish).toBe("black-titanium");
    resolved[0].line.variants.finish = "black-titanium";
  });

  it("refuses an empty cart or unknown options", () => {
    expect(() => createDemoOrder({ id: "DEMO-ABCD2345", submissionId: "abcdef0123456789", resolved: [], paymentMethodId: "demo-cod", deliveryMethodId: "standard" })).toThrow();
    expect(() => createDemoOrder({ id: "DEMO-ABCD2345", submissionId: "abcdef0123456789", resolved, paymentMethodId: "card", deliveryMethodId: "standard" })).toThrow();
  });

  it("round-trips through validation and rejects tampering", () => {
    const order = make();
    expect(sanitizeDemoOrder(JSON.parse(JSON.stringify(order)))).toEqual(order);
    const tamper = (patch: (o: Record<string, unknown>) => void) => {
      const copy = JSON.parse(JSON.stringify(order));
      patch(copy);
      return sanitizeDemoOrder(copy);
    };
    expect(tamper((o) => (o.estimatedTotalHalalas = 1))).toBeNull();
    expect(tamper((o) => (o.schemaVersion = 2))).toBeNull();
    expect(tamper((o) => (o.id = "bad id"))).toBeNull();
    expect(tamper((o) => ((o.lines as { quantity: number }[])[0].quantity = 99))).toBeNull();
    expect(tamper((o) => ((o.lines as { lineTotalHalalas: number }[])[0].lineTotalHalalas = 5))).toBeNull();
    expect(tamper((o) => (o.paymentMethod = { id: "unknown", label: "x" }))).toBeNull();
    expect(tamper((o) => (o.lines = []))).toBeNull();
  });

  it("takes labels from the app, not from storage", () => {
    const copy = JSON.parse(JSON.stringify(make()));
    copy.paymentMethod.label = "Injected";
    expect(sanitizeDemoOrder(copy)?.paymentMethod.label).toBe("Demo cash on delivery");
  });
});

describe("demo order ids and store serialization", () => {
  it("generates well-formed ids", () => {
    for (let i = 0; i < 20; i++) expect(isOrderId(generateOrderId())).toBe(true);
    expect(isOrderId("demo-abcd2345")).toBe(false);
    expect(isOrderId("DEMO-0OIL1111")).toBe(false);
  });

  it("caps the number of stored orders and skips invalid or duplicate records", () => {
    const base = createDemoOrder({
      id: "DEMO-AAAAAAAA",
      submissionId: "abcdef0123456789",
      resolved: resolveCart([{ productId: "p4", variants: {}, quantity: 1 }]),
      paymentMethodId: "demo-card",
      deliveryMethodId: "scheduled",
    });
    const many = Array.from({ length: 40 }, (_, i) => ({ ...base, id: `DEMO-${"ABCDEFGH"[i % 8]}${"23456789"[Math.floor(i / 8)]}AAAAAA` }));
    const parsed = sanitizeDemoOrders(JSON.parse(serializeDemoOrders(many)));
    expect(parsed).toHaveLength(MAX_DEMO_ORDERS);
    expect(sanitizeDemoOrders({ version: 1, orders: [base, base, { junk: true }, null] })).toHaveLength(1);
    expect(sanitizeDemoOrders("garbage")).toEqual([]);
    expect(sanitizeDemoOrders({ version: 9, orders: [base] })).toEqual([]);
  });
});

describe("demo order store", () => {
  it("handles corrupt storage as an empty list and recovers on the next save", () => {
    window.localStorage.setItem(DEMO_ORDERS_STORAGE_KEY, "{broken");
    resetDemoOrderStoreForTests();
    expect(getSnapshot().orders).toEqual([]);
    expect(getSnapshot().available).toBe(true);
    seedCart({ productId: "p4", variants: {}, quantity: 1 });
    expect(submitDemoOrder(input()).ok).toBe(true);
    expect(getSnapshot().orders).toHaveLength(1);
  });

  it("reports storage as unavailable and refuses to save", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    try {
      resetDemoOrderStoreForTests();
      expect(getSnapshot().available).toBe(false);
      const order = createDemoOrder({
        id: "DEMO-AAAAAAAA",
        submissionId: "abcdef0123456789",
        resolved: resolveCart([{ productId: "p4", variants: {}, quantity: 1 }]),
        paymentMethodId: "demo-cod",
        deliveryMethodId: "standard",
      });
      expect(saveDemoOrder(order)).toEqual({ ok: false });
    } finally {
      Storage.prototype.getItem = original;
    }
  });

  it("looks orders up by exact id", () => {
    seedCart({ productId: "p4", variants: {}, quantity: 1 });
    const result = submitDemoOrder(input());
    if (!result.ok) throw new Error("expected success");
    expect(findDemoOrder(result.order.id)?.id).toBe(result.order.id);
    expect(findDemoOrder(result.order.id.toLowerCase())).toBeUndefined();
    expect(findDemoOrder("DEMO-ZZZZZZZZ")).toBeUndefined();
  });
});

function input(overrides: Partial<Parameters<typeof submitDemoOrder>[0]> = {}) {
  const lines = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "null")?.lines ?? [];
  return {
    shownSignature: cartSignature(resolveCart(lines)),
    submissionId: "0123456789abcdef",
    paymentMethodId: "demo-cod",
    deliveryMethodId: "standard",
    ...overrides,
  };
}

describe("submitDemoOrder", () => {
  it("creates an order and removes only the submitted lines", () => {
    seedCart({ productId: "p1", variants: { finish: "black-titanium" }, quantity: 2 }, { productId: "p4", variants: {}, quantity: 1 });
    const result = submitDemoOrder(input());
    expect(result.ok && result.reused).toBe(false);
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines).toEqual([]);
    expect(getSnapshot().orders).toHaveLength(1);
  });

  it("blocks an empty cart without creating anything", () => {
    const result = submitDemoOrder(input({ shownSignature: "" }));
    expect(result).toMatchObject({ ok: false, reason: "empty" });
    expect(getSnapshot().orders).toHaveLength(0);
  });

  it("blocks when the cart changed since it was shown, and leaves the cart alone", () => {
    seedCart({ productId: "p4", variants: {}, quantity: 1 });
    const shown = input();
    seedCart({ productId: "p4", variants: {}, quantity: 3 });
    const result = submitDemoOrder(shown);
    expect(result).toMatchObject({ ok: false, reason: "changed" });
    expect(getSnapshot().orders).toHaveLength(0);
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines[0].quantity).toBe(3);
  });

  it("blocks when a shown product became unavailable or unknown", () => {
    seedCart({ productId: "p4", variants: {}, quantity: 1 }, { productId: "p8", variants: {}, quantity: 1 });
    const shown = cartSignature(resolveCart([{ productId: "p4", variants: {}, quantity: 1 }, { productId: "p8", variants: {}, quantity: 1 }]));
    expect(submitDemoOrder(input({ shownSignature: shown }))).toMatchObject({ ok: false, reason: "changed" });
  });

  it("does not create a second order for the same submission", () => {
    seedCart({ productId: "p4", variants: {}, quantity: 1 });
    const first = submitDemoOrder(input());
    seedCart({ productId: "p4", variants: {}, quantity: 2 });
    const second = submitDemoOrder(input());
    expect(first.ok && second.ok && second.reused && second.order.id === first.order.id).toBe(true);
    expect(getSnapshot().orders).toHaveLength(1);
    // The second cart is untouched by the repeat submission.
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines[0].quantity).toBe(2);
  });

  it("rejects invalid options and malformed submission ids", () => {
    seedCart({ productId: "p4", variants: {}, quantity: 1 });
    expect(submitDemoOrder(input({ paymentMethodId: "card" }))).toMatchObject({ ok: false, reason: "invalid" });
    expect(submitDemoOrder(input({ submissionId: "x" }))).toMatchObject({ ok: false, reason: "invalid" });
  });

  it("does not clear the cart when the order cannot be persisted", () => {
    seedCart({ productId: "p4", variants: {}, quantity: 1 });
    const shown = input();
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === DEMO_ORDERS_STORAGE_KEY) throw new Error("quota");
      return original.call(this, key, value);
    };
    try {
      expect(submitDemoOrder(shown)).toMatchObject({ ok: false, reason: "storage" });
    } finally {
      Storage.prototype.setItem = original;
    }
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines).toHaveLength(1);
  });

  it("keeps items added elsewhere after the order is created", () => {
    seedCart({ productId: "p4", variants: {}, quantity: 2 });
    const shown = input();
    // Simulates removing only what was purchased from a cart that gained another item meanwhile.
    const merged = subtractLines(
      [
        { productId: "p4", variants: {}, quantity: 2 },
        { productId: "p2", variants: { colour: "silver" }, quantity: 1 },
      ],
      [{ productId: "p4", variants: {}, quantity: 2 }],
    );
    expect(merged).toEqual([{ productId: "p2", variants: { colour: "silver" }, quantity: 1 }]);
    expect(submitDemoOrder(shown).ok).toBe(true);
  });
});

describe("subtractLines", () => {
  it("subtracts quantities, keeps remainders and ignores unmatched lines", () => {
    const lines: CartLine[] = [
      { productId: "p4", variants: {}, quantity: 5 },
      { productId: "p1", variants: { finish: "black-titanium" }, quantity: 1 },
    ];
    expect(subtractLines(lines, [{ productId: "p4", variants: {}, quantity: 2 }])).toEqual([
      { productId: "p4", variants: {}, quantity: 3 },
      lines[1],
    ]);
    expect(subtractLines(lines, [{ productId: "p9", variants: {}, quantity: 1 }])).toEqual(lines);
  });
});
