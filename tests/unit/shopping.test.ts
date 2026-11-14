import { describe, expect, it } from "vitest";
import { getProductById, maxQuantity } from "@/lib/products";
import {
  addToCart,
  addToWishlist,
  cartItemCount,
  lineKey,
  normalizeVariants,
  removeFromWishlist,
  removeLine,
  resolveCart,
  sanitizeCart,
  sanitizeWishlist,
  serializeCart,
  summarizeCart,
  toHalalas,
  toggleWishlist,
  updateQuantity,
  type CartLine,
} from "@/lib/shopping";

const p = (id: string) => getProductById(id)!;
const phone = p("p1"); // variants: finish, 5199 (compare-at 5499), in stock
const laptop = p("p3"); // low stock, 4 left, no variants
const soldOut = p("p8");
const headphones = p("p2"); // 1149 (compare-at 1399)

describe("lineKey", () => {
  it("ignores variant key order and distinguishes configurations", () => {
    expect(lineKey("x", { a: "1", b: "2" })).toBe(lineKey("x", { b: "2", a: "1" }));
    expect(lineKey("x", { a: "1" })).not.toBe(lineKey("x", { a: "2" }));
    expect(lineKey("x", {})).toBe("x");
  });
});

describe("normalizeVariants", () => {
  it("repairs missing or unknown choices and drops unknown groups", () => {
    expect(normalizeVariants(phone, undefined)).toEqual({ finish: "natural-titanium" });
    expect(normalizeVariants(phone, { finish: "nope", bogus: "x" })).toEqual({ finish: "natural-titanium" });
    expect(normalizeVariants(phone, { finish: "black-titanium" })).toEqual({ finish: "black-titanium" });
    expect(normalizeVariants(laptop, { finish: "x" })).toEqual({});
  });
});

describe("addToCart", () => {
  it("adds a new line with the selected variants", () => {
    const result = addToCart([], phone, { finish: "black-titanium" }, 2);
    expect(result.status).toBe("added");
    expect(result.lines).toEqual([{ productId: "p1", variants: { finish: "black-titanium" }, quantity: 2 }]);
  });

  it("merges the same configuration and keeps different variants separate", () => {
    let lines: CartLine[] = addToCart([], phone, { finish: "black-titanium" }, 1).lines;
    lines = addToCart(lines, phone, { finish: "black-titanium" }, 2).lines;
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
    lines = addToCart(lines, phone, { finish: "white-titanium" }, 1).lines;
    expect(lines).toHaveLength(2);
    expect(cartItemCount(lines)).toBe(4);
  });

  it("caps at the per-order limit and reports it", () => {
    const first = addToCart([], phone, undefined, 8);
    const second = addToCart(first.lines, phone, undefined, 5);
    expect(second.status).toBe("added");
    expect(second.capped).toBe(true);
    expect(second.quantity).toBe(10);
    const third = addToCart(second.lines, phone, undefined, 1);
    expect(third.status).toBe("limit");
    expect(third.lines).toBe(second.lines);
  });

  it("uses the known stock count for low-stock products", () => {
    expect(maxQuantity(laptop)).toBe(4);
    const result = addToCart([], laptop, undefined, 9);
    expect(result.quantity).toBe(4);
    expect(result.capped).toBe(true);
  });

  it("never adds out-of-stock products or invalid quantities", () => {
    expect(addToCart([], soldOut, undefined, 1).status).toBe("unavailable");
    expect(addToCart([], phone, undefined, 0).status).toBe("invalid");
    expect(addToCart([], phone, undefined, Number.NaN).status).toBe("invalid");
    expect(addToCart([], phone, undefined, -3).lines).toEqual([]);
  });
});

describe("updateQuantity and removeLine", () => {
  const lines = addToCart(addToCart([], phone, undefined, 2).lines, laptop, undefined, 1).lines;
  const phoneKey = lineKey("p1", { finish: "natural-titanium" });

  it("clamps to 1..limit", () => {
    expect(updateQuantity(lines, phoneKey, 0)[0].quantity).toBe(1);
    expect(updateQuantity(lines, phoneKey, 99)[0].quantity).toBe(10);
    expect(updateQuantity(lines, lineKey("p3", {}), 99)[1].quantity).toBe(4);
    expect(updateQuantity(lines, phoneKey, Number.NaN)[0].quantity).toBe(1);
  });

  it("leaves other lines alone and ignores unknown keys", () => {
    expect(updateQuantity(lines, "missing", 5)).toEqual(lines);
  });

  it("removes a line, and the last removal gives an empty cart", () => {
    const rest = removeLine(lines, phoneKey);
    expect(rest).toHaveLength(1);
    expect(removeLine(rest, lineKey("p3", {}))).toEqual([]);
  });
});

describe("totals", () => {
  it("computes subtotal, savings from compare-at prices only, and item count", () => {
    let lines = addToCart([], phone, undefined, 2).lines; // 2 x 5199, saves 2 x 300
    lines = addToCart(lines, headphones, undefined, 1).lines; // 1149, saves 250
    lines = addToCart(lines, laptop, undefined, 1).lines; // 8499, no compare-at
    const summary = summarizeCart(resolveCart(lines));
    expect(summary.itemCount).toBe(4);
    expect(summary.lineCount).toBe(3);
    expect(summary.subtotalHalalas).toBe(toHalalas(5199 * 2 + 1149 + 8499));
    expect(summary.savingsHalalas).toBe(toHalalas(600 + 250));
    expect(summary.estimatedTotalHalalas).toBe(summary.subtotalHalalas);
  });

  it("is zero for an empty cart", () => {
    expect(summarizeCart(resolveCart([]))).toEqual({
      lineCount: 0,
      itemCount: 0,
      subtotalHalalas: 0,
      savingsHalalas: 0,
      estimatedTotalHalalas: 0,
    });
  });

  it("uses integer halalas so fractional prices do not drift", () => {
    expect(toHalalas(0.1) + toHalalas(0.2)).toBe(30);
    expect(toHalalas(19.99) * 3).toBe(5997);
  });

  it("skips lines whose product is not in the catalogue", () => {
    expect(resolveCart([{ productId: "ghost", variants: {}, quantity: 1 }])).toEqual([]);
  });
});

describe("sanitizeCart", () => {
  const wrap = (lines: unknown) => ({ version: 1, lines });

  it("accepts valid data", () => {
    const saved = JSON.parse(serializeCart(addToCart([], phone, { finish: "black-titanium" }, 3).lines));
    expect(sanitizeCart(saved)).toEqual([{ productId: "p1", variants: { finish: "black-titanium" }, quantity: 3 }]);
  });

  it.each([null, undefined, "text", 42, [], {}, { version: 2, lines: [] }, { version: 1, lines: "no" }])(
    "returns an empty cart for unrecognisable data (%j)",
    (raw) => {
      expect(sanitizeCart(raw)).toEqual([]);
    },
  );

  it("drops unknown, out-of-stock and malformed lines", () => {
    const result = sanitizeCart(
      wrap([
        { productId: "ghost", variants: {}, quantity: 1 },
        { productId: "p8", variants: {}, quantity: 1 },
        { productId: "p1", variants: {}, quantity: 0 },
        { productId: "p1", variants: {}, quantity: -2 },
        { productId: "p1", variants: {}, quantity: "3" },
        { productId: 7, quantity: 1 },
        "junk",
        null,
        { productId: "p4", variants: {}, quantity: 1 },
      ]),
    );
    expect(result).toEqual([{ productId: "p4", variants: {}, quantity: 1 }]);
  });

  it("revalidates quantity and variants against the catalogue", () => {
    const result = sanitizeCart(
      wrap([
        { productId: "p1", variants: { finish: "gold" }, quantity: 500 },
        { productId: "p3", variants: { colour: "x" }, quantity: 9.7 },
      ]),
    );
    expect(result).toEqual([
      { productId: "p1", variants: { finish: "natural-titanium" }, quantity: 10 },
      { productId: "p3", variants: {}, quantity: 4 },
    ]);
  });

  it("merges duplicate configurations", () => {
    const result = sanitizeCart(
      wrap([
        { productId: "p1", variants: { finish: "black-titanium" }, quantity: 2 },
        { productId: "p1", variants: { finish: "black-titanium" }, quantity: 3 },
      ]),
    );
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(5);
  });
});

describe("wishlist", () => {
  it("toggles without duplicates", () => {
    let ids = toggleWishlist([], "p1");
    expect(ids).toEqual(["p1"]);
    expect(addToWishlist(ids, "p1")).toBe(ids);
    ids = toggleWishlist(ids, "p2");
    expect(ids).toEqual(["p1", "p2"]);
    ids = toggleWishlist(ids, "p1");
    expect(ids).toEqual(["p2"]);
    expect(removeFromWishlist(ids, "nope")).toBe(ids);
  });

  it("ignores unknown product ids", () => {
    expect(toggleWishlist([], "ghost")).toEqual([]);
  });

  it("sanitizes stored ids: unknown dropped, duplicates merged, junk tolerated", () => {
    expect(sanitizeWishlist({ version: 1, ids: ["p2", "ghost", "p2", 5, "p1"] })).toEqual(["p2", "p1"]);
    expect(sanitizeWishlist("garbage")).toEqual([]);
    expect(sanitizeWishlist({ version: 1 })).toEqual([]);
  });
});
