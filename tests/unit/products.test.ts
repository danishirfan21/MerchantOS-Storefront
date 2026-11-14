import { describe, expect, it } from "vitest";
import { catalogProducts } from "@/lib/fixtures/products";
import {
  MAX_ORDER_QUANTITY,
  allProductSlugs,
  clampQuantity,
  defaultVariantSelection,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  isPurchasable,
  maxQuantity,
  productPath,
  productSlug,
  productSpecGroups,
  selectVariantOption,
  selectedVariantLabels,
  slugify,
} from "@/lib/products";

const byId = (id: string) => getProductById(id)!;

describe("slug generation", () => {
  it("makes readable, URL-safe slugs", () => {
    expect(slugify("Flagship smartphone 256GB")).toBe("flagship-smartphone-256gb");
    expect(slugify("  Wireless noise-cancelling headphones ")).toBe("wireless-noise-cancelling-headphones");
    expect(slugify("Dolby & Co. 5.1!")).toBe("dolby-and-co-5-1");
  });

  it("is stable for a record", () => {
    expect(productSlug(byId("p1"))).toBe(productSlug(byId("p1")));
  });

  it("gives every catalogue product a unique, non-empty slug", () => {
    const slugs = allProductSlugs();
    expect(slugs).toHaveLength(catalogProducts.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  it("builds product paths, optionally carrying catalogue filters", () => {
    expect(productPath(byId("p1"))).toBe("/products/flagship-smartphone-256gb");
    expect(productPath(byId("p1"), "?brand=Nova&sort=price-asc")).toBe(
      "/products/flagship-smartphone-256gb?from=%3Fbrand%3DNova%26sort%3Dprice-asc",
    );
  });
});

describe("product lookup", () => {
  it("resolves every slug back to its own record", () => {
    catalogProducts.forEach((product) => expect(getProductBySlug(productSlug(product))).toBe(product));
  });

  it("returns undefined for unknown slugs and ids", () => {
    expect(getProductBySlug("does-not-exist")).toBeUndefined();
    expect(getProductBySlug("")).toBeUndefined();
    expect(getProductBySlug("Flagship-Smartphone-256GB")).toBeUndefined();
    expect(getProductById("p999")).toBeUndefined();
  });

  it("returns related products without the product itself", () => {
    const related = getRelatedProducts(byId("p1"), 4);
    expect(related).toHaveLength(4);
    expect(related.map((p) => p.id)).not.toContain("p1");
    expect(related[0].category).toBe("smartphones");
  });
});

describe("specifications", () => {
  it("derives a table from record fields when no explicit groups exist", () => {
    const groups = productSpecGroups(byId("p1"));
    expect(groups[0].title).toBe("Overview");
    expect(groups[0].rows).toContainEqual({ label: "Brand", value: "Nova" });
    expect(groups[0].rows).toContainEqual({ label: "Storage", value: "256GB" });
  });

  it("prefers explicit spec groups", () => {
    const explicit = [{ title: "Custom", rows: [{ label: "A", value: "B" }] }];
    expect(productSpecGroups({ ...byId("p1"), specGroups: explicit })).toBe(explicit);
  });
});

describe("variant selection", () => {
  const groups = byId("p1").variants;

  it("selects the first option of each group by default", () => {
    expect(defaultVariantSelection(groups)).toEqual({ finish: "natural-titanium" });
  });

  it("has no selection for products without variants", () => {
    expect(byId("p3").variants).toBeUndefined();
    expect(defaultVariantSelection(undefined)).toEqual({});
  });

  it("updates the chosen option without mutating the old selection", () => {
    const initial = defaultVariantSelection(groups);
    const next = selectVariantOption(groups, initial, "finish", "black-titanium");
    expect(next).toEqual({ finish: "black-titanium" });
    expect(initial).toEqual({ finish: "natural-titanium" });
  });

  it("ignores unknown groups and options", () => {
    const initial = defaultVariantSelection(groups);
    expect(selectVariantOption(groups, initial, "finish", "gold")).toBe(initial);
    expect(selectVariantOption(groups, initial, "size", "xl")).toBe(initial);
  });

  it("describes the selection", () => {
    expect(selectedVariantLabels(groups, { finish: "black-titanium" })).toEqual(["Finish: Black Titanium"]);
  });
});

describe("quantity and availability", () => {
  it("limits quantity by known stock", () => {
    expect(maxQuantity(byId("p3"))).toBe(4); // low stock, 4 left
    expect(maxQuantity(byId("p19"))).toBe(2);
    expect(maxQuantity(byId("p1"))).toBe(MAX_ORDER_QUANTITY);
    expect(maxQuantity({ stock: "low-stock", stockCount: 50 })).toBe(MAX_ORDER_QUANTITY);
    expect(maxQuantity(byId("p8"))).toBe(0);
  });

  it("clamps quantity to 1..max", () => {
    expect(clampQuantity(0, 5)).toBe(1);
    expect(clampQuantity(-3, 5)).toBe(1);
    expect(clampQuantity(99, 5)).toBe(5);
    expect(clampQuantity(2.9, 5)).toBe(2);
    expect(clampQuantity(Number.NaN, 5)).toBe(1);
    expect(clampQuantity(3, 0)).toBe(0);
  });

  it("only treats unavailable products as not purchasable", () => {
    expect(isPurchasable(byId("p8"))).toBe(false);
    expect(isPurchasable(byId("p3"))).toBe(true);
    expect(isPurchasable(byId("p1"))).toBe(true);
  });
});
