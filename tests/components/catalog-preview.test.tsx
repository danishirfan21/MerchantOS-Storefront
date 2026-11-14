import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PreviewDetail, PreviewList } from "@/components/catalog-preview/PreviewViews";
import { ApiProductCard, PreviewNotice } from "@/components/catalog-preview/PreviewParts";

const products = [
  { slug: "iphone-15-pro", name: "Phone One", category: { slug: "smartphones", label: "Smartphones" }, priceHalalas: 429900, currency: "SAR", vatTreatment: "excluded", availability: "in-stock" },
  { slug: "earbuds", name: "Earbuds", category: { slug: "audio", label: "Audio" }, priceHalalas: 94950, currency: "SAR", vatTreatment: "excluded", availability: "low-stock" },
  { slug: "watch", name: "Watch", category: { slug: "wearables", label: "Wearables" }, priceHalalas: 319900, currency: "SAR", vatTreatment: "excluded", availability: "out-of-stock" },
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

const search = (value: Record<string, string> = {}) => Promise.resolve(value);

beforeEach(() => {
  vi.stubEnv("MERCHANTOS_CATALOG_SOURCE", "api");
  vi.stubEnv("MERCHANTOS_CATALOG_API_URL", "http://localhost:5080");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("live catalogue list", () => {
  it("renders backend names, prices, availability and detail links, with a source banner", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ items: products, page: 1, pageSize: 12, total: 3 })));
    render(await PreviewList({ searchParams: search() }));

    expect(screen.getByTestId("catalog-source-banner")).toHaveTextContent("Live POS catalogue preview (read-only)");
    expect(screen.getByTestId("catalog-source-banner")).toHaveTextContent("exclude VAT");
    const cards = screen.getAllByTestId("api-product-card");
    expect(cards).toHaveLength(3);
    expect(within(cards[0]).getByRole("link", { name: "Phone One" })).toHaveAttribute("href", "/catalog-preview/iphone-15-pro");
    expect(within(cards[0]).getByTestId("api-price")).toHaveTextContent("4,299 SAR");
    expect(within(cards[0]).getByTestId("api-price")).toHaveAttribute("data-halalas", "429900");
    expect(within(cards[1]).getByTestId("api-price")).toHaveTextContent("949.50 SAR");
    expect(within(cards[1]).getByTestId("availability")).toHaveTextContent("Low stock");
    expect(within(cards[2]).getByTestId("availability")).toHaveTextContent("Out of stock");
    expect(screen.getAllByText("Excludes VAT").length).toBe(3);
  });

  it("is read-only: no cart, wishlist or checkout controls", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ items: products, page: 1, pageSize: 12, total: 3 })));
    const { container } = render(await PreviewList({ searchParams: search() }));
    expect(screen.queryByRole("button", { name: /cart|wishlist|buy|checkout/i })).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="/cart"], a[href^="/checkout"], a[href^="/wishlist"]')).toBeNull();
  });

  it("passes the search term and page to the server request", async () => {
    const fetchMock = vi.fn(async () => json({ items: [], page: 2, pageSize: 12, total: 0 }));
    vi.stubGlobal("fetch", fetchMock);
    render(await PreviewList({ searchParams: search({ search: "watch", page: "2" }) }));
    expect((fetchMock.mock.calls[0] as unknown[])[0]).toBe("http://localhost:5080/api/storefront/products?search=watch&page=2&pageSize=12");
    expect(screen.getByTestId("preview-notice")).toHaveAttribute("data-kind", "empty");
  });

  it.each([
    [503, "unavailable", "The live catalogue is unavailable"],
    [429, "rate-limited", "Too many requests"],
    [400, "invalid-request", "That request isn't valid"],
  ])("shows an honest %i state and never shows demo products as live", async (status, kind, title) => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ code: "x", message: "SQL error at db.internal" }, status)));
    const { container } = render(await PreviewList({ searchParams: search() }));
    expect(screen.getByTestId("preview-notice")).toHaveAttribute("data-kind", kind);
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.queryAllByTestId("api-product-card")).toHaveLength(0);
    expect(container.textContent).not.toMatch(/db\.internal|SQL|Nova|Aurora|Helix/);
  });

  it("shows an unavailable state when the network fails, without internal details", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("connect ECONNREFUSED 10.1.2.3:5080"); }));
    const { container } = render(await PreviewList({ searchParams: search() }));
    expect(screen.getByRole("heading", { name: "The live catalogue is unavailable" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/catalog-preview");
    expect(container.textContent).not.toMatch(/ECONNREFUSED|10\.1\.2\.3/);
  });

  it("shows an invalid-response state for malformed data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ items: [{ slug: "x" }], page: 1, pageSize: 12, total: 1 })));
    render(await PreviewList({ searchParams: search() }));
    expect(screen.getByTestId("preview-notice")).toHaveAttribute("data-kind", "invalid-response");
  });

  it("reports an off preview in fixture mode without calling the network", async () => {
    vi.stubEnv("MERCHANTOS_CATALOG_SOURCE", "fixture");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(await PreviewList({ searchParams: search() }));
    expect(screen.getByTestId("preview-notice")).toHaveAttribute("data-kind", "disabled");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a configuration problem without echoing values", async () => {
    vi.stubEnv("MERCHANTOS_CATALOG_API_URL", "https://user:hunter2@pos.example.com");
    const { container } = render(await PreviewList({ searchParams: search() }));
    expect(screen.getByTestId("preview-notice")).toHaveAttribute("data-kind", "misconfigured");
    expect(container.textContent).not.toMatch(/hunter2|pos\.example\.com/);
  });

  it("links to a next page only when more results exist", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ items: products.slice(0, 1), page: 1, pageSize: 1, total: 3 })));
    render(await PreviewList({ searchParams: search() }));
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute("href", "/catalog-preview?page=2");
  });
});

describe("live catalogue detail", () => {
  it("renders the product by public slug with price, availability and a read-only note", async () => {
    const fetchMock = vi.fn(async () => json(products[0]));
    vi.stubGlobal("fetch", fetchMock);
    render(await PreviewDetail({ params: Promise.resolve({ slug: "iphone-15-pro" }) }));
    expect((fetchMock.mock.calls[0] as unknown[])[0]).toBe("http://localhost:5080/api/storefront/products/iphone-15-pro");
    expect(screen.getByRole("heading", { level: 1, name: "Phone One" })).toBeInTheDocument();
    expect(screen.getByTestId("api-price")).toHaveTextContent("4,299 SAR");
    expect(screen.getByTestId("availability")).toHaveTextContent("In stock");
    expect(screen.getByTestId("read-only-note")).toHaveTextContent("not available to add to the cart");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows product-not-found for unknown slugs and never contacts the backend for malformed ones", async () => {
    const fetchMock = vi.fn(async () => json({ code: "not_found" }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const { unmount } = render(await PreviewDetail({ params: Promise.resolve({ slug: "nothing-here" }) }));
    expect(screen.getByRole("heading", { name: "Product not found" })).toBeInTheDocument();
    unmount();
    fetchMock.mockClear();
    render(await PreviewDetail({ params: Promise.resolve({ slug: "..%2Fadmin" }) }));
    expect(screen.getByRole("heading", { name: "Product not found" })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows an unavailable state when the backend is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({}, 503)));
    render(await PreviewDetail({ params: Promise.resolve({ slug: "iphone-15-pro" }) }));
    expect(screen.getByRole("heading", { name: "The live catalogue is unavailable" })).toBeInTheDocument();
  });
});

describe("preview parts", () => {
  it("renders a card with no purchase controls", () => {
    render(<ul><ApiProductCard product={products[0] as never} /></ul>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("offers a way back to the demo catalogue in every notice", () => {
    render(<PreviewNotice kind="unavailable" retryHref="/catalog-preview" />);
    expect(screen.getByRole("link", { name: "Browse the demo catalogue" })).toHaveAttribute("href", "/products");
  });
});
