import { describe, expect, it, vi } from "vitest";
import { CatalogConfigError, readCatalogConfig } from "@/lib/catalog-api/config";
import { formatHalalas } from "@/lib/catalog-api/money";
import { parseApiProduct, parseApiProductList } from "@/lib/catalog-api/parse";
import { listQueryString, loadApiProduct, loadApiProducts } from "@/lib/catalog-api/client";
import { checkCartLines } from "@/lib/checkout";
import { getProductById, getProductBySlug } from "@/lib/products";

const good = {
  slug: "iphone-15-pro",
  name: "iPhone 15 Pro",
  category: { slug: "smartphones", label: "Smartphones" },
  priceHalalas: 429900,
  currency: "SAR",
  vatTreatment: "excluded",
  availability: "low-stock",
};

const apiEnv = { MERCHANTOS_CATALOG_SOURCE: "api", MERCHANTOS_CATALOG_API_URL: "http://localhost:5080" };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("catalog configuration", () => {
  it("defaults to fixture mode", () => {
    expect(readCatalogConfig({})).toEqual({ source: "fixture" });
    expect(readCatalogConfig({ MERCHANTOS_CATALOG_SOURCE: "  " })).toEqual({ source: "fixture" });
    expect(readCatalogConfig({ MERCHANTOS_CATALOG_SOURCE: "fixture" })).toEqual({ source: "fixture" });
  });

  it("accepts a valid api configuration and normalises the origin", () => {
    expect(readCatalogConfig({ ...apiEnv, MERCHANTOS_CATALOG_API_URL: "https://pos.internal:8443/" })).toEqual({
      source: "api",
      baseUrl: "https://pos.internal:8443",
      timeoutMs: 4000,
    });
    expect(readCatalogConfig({ ...apiEnv, MERCHANTOS_CATALOG_API_TIMEOUT_MS: "1500" })).toMatchObject({ timeoutMs: 1500 });
  });

  it.each([
    [{ MERCHANTOS_CATALOG_SOURCE: "live" }, "must be"],
    [{ MERCHANTOS_CATALOG_SOURCE: "API" }, "must be"],
    [{ MERCHANTOS_CATALOG_SOURCE: "api" }, "required"],
    [{ ...apiEnv, MERCHANTOS_CATALOG_API_URL: "not a url" }, "absolute"],
    [{ ...apiEnv, MERCHANTOS_CATALOG_API_URL: "ftp://pos.internal" }, "http or https"],
    [{ ...apiEnv, MERCHANTOS_CATALOG_API_URL: "http://pos.example.com" }, "plain http"],
    [{ ...apiEnv, MERCHANTOS_CATALOG_API_URL: "https://user:secret@pos.example.com" }, "credentials"],
    [{ ...apiEnv, MERCHANTOS_CATALOG_API_URL: "https://pos.example.com/api?x=1" }, "origin only"],
    [{ ...apiEnv, MERCHANTOS_CATALOG_API_TIMEOUT_MS: "5" }, "whole number"],
    [{ ...apiEnv, MERCHANTOS_CATALOG_API_TIMEOUT_MS: "abc" }, "whole number"],
  ])("rejects invalid configuration %#", (env, fragment) => {
    expect(() => readCatalogConfig(env)).toThrow(CatalogConfigError);
    expect(() => readCatalogConfig(env)).toThrow(fragment);
  });

  it("never echoes configured values in errors", () => {
    try {
      readCatalogConfig({ ...apiEnv, MERCHANTOS_CATALOG_API_URL: "https://user:topsecret@pos.example.com" });
    } catch (error) {
      expect(String((error as Error).message)).not.toContain("topsecret");
      expect(String((error as Error).message)).not.toContain("pos.example.com");
    }
  });
});

describe("API response parsing", () => {
  it("accepts a valid product", () => {
    expect(parseApiProduct(good)).toEqual(good);
  });

  it("drops unexpected and sensitive extra fields instead of passing them on", () => {
    const parsed = parseApiProduct({ ...good, sku: "PH-AP-15P", stock: 7, id: "p01", quantityOnHand: 8 });
    expect(parsed).toEqual(good);
    expect(JSON.stringify(parsed)).not.toMatch(/PH-AP|"stock"|quantity|"id"|"sku"/);
  });

  it.each([
    ["non-object", "x"],
    ["bad slug", { ...good, slug: "Bad Slug" }],
    ["empty name", { ...good, name: " " }],
    ["fractional price", { ...good, priceHalalas: 10.5 }],
    ["negative price", { ...good, priceHalalas: -1 }],
    ["string price", { ...good, priceHalalas: "429900" }],
    ["unsafe integer", { ...good, priceHalalas: 2 ** 60 }],
    ["wrong currency", { ...good, currency: "USD" }],
    ["vat included claim", { ...good, vatTreatment: "included" }],
    ["unknown availability", { ...good, availability: "plenty" }],
    ["missing category", { ...good, category: null }],
  ])("rejects %s", (_label, value) => {
    expect(parseApiProduct(value)).toBeNull();
  });

  it("parses lists and rejects any malformed item", () => {
    expect(parseApiProductList({ items: [good], page: 1, pageSize: 12, total: 1 })).toEqual({ items: [good], page: 1, pageSize: 12, total: 1 });
    expect(parseApiProductList({ items: [good, { ...good, slug: "" }], page: 1, pageSize: 12, total: 2 })).toBeNull();
    expect(parseApiProductList({ items: "no", page: 1, pageSize: 12, total: 0 })).toBeNull();
    expect(parseApiProductList({ items: [], page: 0, pageSize: 12, total: 0 })).toBeNull();
    expect(parseApiProductList(null)).toBeNull();
  });
});

describe("price formatting", () => {
  it.each([
    [429900, "4,299"],
    [94900, "949"],
    [0, "0"],
    [99, "0.99"],
    [100050, "1,000.50"],
    [100005, "1,000.05"],
  ])("formats %i halalas as %s", (halalas, expected) => {
    expect(formatHalalas(halalas)).toBe(expected);
  });

  it("rejects non-integer or negative amounts", () => {
    expect(() => formatHalalas(1.5)).toThrow(RangeError);
    expect(() => formatHalalas(-1)).toThrow(RangeError);
  });
});

describe("catalog client", () => {
  it("builds a bounded query string", () => {
    expect(listQueryString({})).toBe("");
    expect(listQueryString({ search: "a b", page: 2, pageSize: 12 })).toBe("?search=a+b&page=2&pageSize=12");
  });

  it("returns disabled in fixture mode without calling the network", async () => {
    const fetchImpl = vi.fn();
    expect(await loadApiProducts({}, { env: {}, fetchImpl })).toEqual({ status: "disabled" });
    expect(await loadApiProduct("iphone-15-pro", { env: {}, fetchImpl })).toEqual({ status: "disabled" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns misconfigured instead of throwing", async () => {
    const fetchImpl = vi.fn();
    expect(await loadApiProducts({}, { env: { MERCHANTOS_CATALOG_SOURCE: "api" }, fetchImpl })).toEqual({ status: "misconfigured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fetches server-side with safe request options and parses the product", async () => {
    const fetchImpl = vi.fn(async () => json(good));
    const result = await loadApiProduct("iphone-15-pro", { env: apiEnv, fetchImpl });
    expect(result).toEqual({ status: "ok", data: good });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://localhost:5080/api/storefront/products/iphone-15-pro");
    expect(init).toMatchObject({ method: "GET", cache: "no-store", redirect: "error", credentials: "omit" });
    expect(JSON.stringify(init.headers)).not.toMatch(/cookie|authorization/i);
  });

  it("does not send an invalid slug to the backend", async () => {
    const fetchImpl = vi.fn();
    expect(await loadApiProduct("../admin", { env: apiEnv, fetchImpl })).toEqual({ status: "not-found" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([
    [404, "not-found"],
    [400, "invalid-request"],
    [429, "rate-limited"],
    [500, "unavailable"],
    [503, "unavailable"],
    [401, "unavailable"],
  ])("maps HTTP %i to %s", async (status, expected) => {
    const result = await loadApiProducts({}, { env: apiEnv, fetchImpl: async () => json({ code: "x" }, status) });
    expect(result.status).toBe(expected);
  });

  it("treats network errors and timeouts as unavailable", async () => {
    const failing = async () => {
      throw new TypeError("fetch failed: connect ECONNREFUSED 10.0.0.5:5080");
    };
    const result = await loadApiProducts({}, { env: apiEnv, fetchImpl: failing });
    expect(result).toEqual({ status: "unavailable" });
    expect(JSON.stringify(result)).not.toContain("10.0.0.5");
  });

  it("treats malformed JSON and unexpected shapes as invalid-response", async () => {
    expect((await loadApiProducts({}, { env: apiEnv, fetchImpl: async () => new Response("<html>", { status: 200 }) })).status).toBe("invalid-response");
    expect((await loadApiProducts({}, { env: apiEnv, fetchImpl: async () => json({ items: [{ nope: 1 }], page: 1, pageSize: 12, total: 1 }) })).status).toBe("invalid-response");
    expect((await loadApiProduct("iphone-15-pro", { env: apiEnv, fetchImpl: async () => json({ ...good, priceHalalas: "free" }) })).status).toBe("invalid-response");
  });

  it("does not return fixture data when the backend fails", async () => {
    const result = await loadApiProducts({}, { env: apiEnv, fetchImpl: async () => json({}, 503) });
    expect(result).toEqual({ status: "unavailable" });
  });
});

describe("fixture and API catalogues stay separate", () => {
  it("API slugs are not fixture products and cannot enter checkout", () => {
    expect(getProductBySlug(good.slug)).toBeUndefined();
    expect(getProductById(good.slug)).toBeUndefined();
    const issues = checkCartLines([{ productId: good.slug, variants: {}, quantity: 1 }]);
    expect(issues.map((issue) => issue.code)).toContain("unknown-product");
  });
});
