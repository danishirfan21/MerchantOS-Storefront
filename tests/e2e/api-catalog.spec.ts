import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../src/lib/shopping";

const FIXTURE = "http://localhost:3100";
const API = "http://localhost:3101";
const DOWN = "http://localhost:3102";
const MOCK = "http://127.0.0.1:4010";

test.describe("fixture mode stays the default", () => {
  test("the demo catalogue works and the preview route is honestly off", async ({ page }) => {
    await page.goto(`${FIXTURE}/products`);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Wireless noise-cancelling headphones", exact: true }).first()).toBeVisible();

    await page.goto(`${FIXTURE}/catalog-preview`);
    await expect(page.getByTestId("preview-notice")).toHaveAttribute("data-kind", "disabled");
    await expect(page.getByTestId("api-product-card")).toHaveCount(0);
  });

  test("the fixture purchase journey is unchanged", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${FIXTURE}/products`);
    await page.getByRole("link", { name: "Wireless noise-cancelling headphones", exact: true }).click();
    await page.getByText("Silver", { exact: true }).click();
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.locator("header").getByRole("link", { name: /^Cart/ }).click();
    await page.getByRole("link", { name: "Proceed to checkout" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
  });
});

test.describe("API mode against the controlled backend", () => {
  test("lists backend products with exact prices, availability and a visible source banner", async ({ page }) => {
    await page.goto(`${API}/catalog-preview`);
    await expect(page.getByTestId("catalog-source-banner").first()).toContainText("Live POS catalogue preview");
    const cards = page.locator('[data-testid="api-product-card"]:visible');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText("Mock Phone Pro");
    await expect(cards.nth(0).getByTestId("api-price")).toHaveAttribute("data-halalas", "429900");
    await expect(cards.nth(0).getByTestId("api-price")).toContainText("4,299 SAR");
    await expect(cards.nth(1).getByTestId("api-price")).toContainText("949.50 SAR");
    await expect(cards.nth(1).getByTestId("availability")).toHaveText("Low stock");
    await expect(cards.nth(2).getByTestId("availability")).toHaveText("Out of stock");
    await expect(page.getByText("Excludes VAT").first()).toBeVisible();
  });

  test("product detail uses the public slug, and unknown slugs are handled", async ({ page }) => {
    await page.goto(`${API}/catalog-preview`);
    await page.getByRole("link", { name: "Mock Phone Pro" }).first().click();
    await expect(page).toHaveURL(/\/catalog-preview\/iphone-15-pro$/);
    await expect(page.getByRole("heading", { level: 1, name: "Mock Phone Pro" })).toBeVisible();
    // Earlier pages stay mounted but hidden, so only look at what is visible.
    await expect(page.locator('[data-testid="api-product-detail"]:visible [data-testid="api-price"]')).toHaveAttribute("data-halalas", "429900");
    await expect(page.locator('[data-testid="api-product-detail"]:visible [data-testid="availability"]')).toHaveText("In stock");

    await page.goto(`${API}/catalog-preview/not-a-product`);
    await expect(page.getByRole("heading", { name: "Product not found" })).toBeVisible();
    await page.goto(`${API}/catalog-preview/Bad_Slug`);
    await expect(page.getByRole("heading", { name: "Product not found" })).toBeVisible();
  });

  test("search narrows results through the backend", async ({ page }) => {
    await page.goto(`${API}/catalog-preview?search=watch`);
    await expect(page.locator('[data-testid="api-product-card"]:visible')).toHaveCount(1);
    await page.goto(`${API}/catalog-preview?search=zzz`);
    await expect(page.getByTestId("preview-notice")).toHaveAttribute("data-kind", "empty");
  });

  test("API-backed products cannot be purchased through the demo cart", async ({ page }) => {
    await page.goto(`${API}/catalog-preview/iphone-15-pro`);
    await expect(page.getByTestId("read-only-note")).toBeVisible();
    await expect(page.getByRole("button", { name: /add to cart|wishlist|buy/i })).toHaveCount(0);

    // Even a forged cart line for the API slug does not become an order line.
    await page.evaluate((key) => {
      window.localStorage.setItem(key, JSON.stringify({ version: 1, lines: [{ productId: "iphone-15-pro", variants: {}, quantity: 1 }] }));
    }, CART_STORAGE_KEY);
    await page.goto(`${API}/cart`);
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
  });

  test("the public pages expose no internal SKU, stock or credentials", async ({ page, request }) => {
    for (const path of ["/catalog-preview", "/catalog-preview/iphone-15-pro"]) {
      const html = await (await request.get(`${API}${path}`)).text();
      expect(html).not.toMatch(/SECRET-SKU|"sku"|"stock"|quantity|p01\b|127\.0\.0\.1:4010|MERCHANTOS_CATALOG/);
    }
    // The backend request carried no cookies or authorization.
    const seen = await (await request.get(`${MOCK}/__headers`)).json();
    expect(seen).not.toHaveProperty("cookie");
    expect(seen).not.toHaveProperty("authorization");
  });

  test("response headers include the baseline security headers", async ({ request }) => {
    const response = await request.get(`${API}/catalog-preview`);
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["content-security-policy"]).not.toContain("*");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
  });

  test("the page hydrates under the content security policy", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (message) => {
      if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
    });
    await page.goto(`${FIXTURE}/products`);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await page.goto(`${API}/catalog-preview`);
    await expect(page.getByTestId("catalog-source-banner").first()).toBeVisible();
    expect(violations).toEqual([]);
  });
});

test.describe("API outage", () => {
  test("an unreachable backend shows an error, not demo products as live inventory", async ({ page }) => {
    await page.goto(`${DOWN}/catalog-preview`);
    await expect(page.getByTestId("preview-notice")).toHaveAttribute("data-kind", "unavailable");
    await expect(page.getByRole("heading", { name: "The live catalogue is unavailable" })).toBeVisible();
    await expect(page.getByTestId("api-product-card")).toHaveCount(0);
    await expect(page.getByText(/Nova|Aurora|Helix|Vertex|Orbit/)).toHaveCount(0);
    await expect(page.getByText(/ECONNREFUSED|127\.0\.0\.1|4019/)).toHaveCount(0);

    await page.goto(`${DOWN}/catalog-preview/iphone-15-pro`);
    await expect(page.getByTestId("preview-notice")).toHaveAttribute("data-kind", "unavailable");
  });
});
