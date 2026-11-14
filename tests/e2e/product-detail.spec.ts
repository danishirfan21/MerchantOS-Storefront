import { expect, test } from "@playwright/test";
import { catalogProducts } from "../../src/lib/fixtures/products";
import { productSlug } from "../../src/lib/products";

test.describe("Product Detail", () => {
  test("every catalogue product has a working detail page", async ({ request }) => {
    for (const product of catalogProducts) {
      const response = await request.get(`/products/${productSlug(product)}`);
      expect(response.status(), product.name).toBe(200);
      expect(await response.text(), product.name).toContain(product.name);
    }
  });

  test("unknown products return a real 404", async ({ page, request }) => {
    const response = await request.get("/products/does-not-exist");
    expect(response.status()).toBe(404);
    await page.goto("/products/does-not-exist");
    await expect(page.getByText(/could not be found|not found/i).first()).toBeVisible();
  });

  test("homepage featured products link to their detail pages", async ({ page }) => {
    await page.goto("/");
    const first = catalogProducts[0];
    await page.getByRole("link", { name: first.name }).first().click();
    await expect(page).toHaveURL(new RegExp(`/products/${productSlug(first)}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(first.name);
  });

  test("quantity respects known stock and out-of-stock disables controls", async ({ page }) => {
    const lowStock = catalogProducts.find((p) => p.id === "p19")!; // 2 left
    await page.goto(`/products/${productSlug(lowStock)}`);
    const plus = page.getByRole("button", { name: "Increase quantity" });
    await plus.click();
    await expect(page.getByLabel("Selected quantity")).toHaveText("2");
    await expect(plus).toBeDisabled();

    const soldOut = catalogProducts.find((p) => p.stock === "out-of-stock")!;
    await page.goto(`/products/${productSlug(soldOut)}`);
    await expect(page.getByRole("button", { name: "Out of stock" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });

  test("variant and gallery controls work", async ({ page }) => {
    const phone = catalogProducts.find((p) => p.id === "p1")!;
    await page.goto(`/products/${productSlug(phone)}`);
    await page.getByText("Black Titanium", { exact: true }).click();
    await expect(page.getByRole("radio", { name: "Black Titanium" })).toBeChecked();
    await page.getByRole("button", { name: "Show image 3 of 4" }).click();
    await expect(page.getByRole("button", { name: "Show image 3 of 4" })).toHaveAttribute("aria-pressed", "true");
  });

  test("a product without variants shows no variant selector", async ({ page }) => {
    await page.goto(`/products/${productSlug(catalogProducts.find((p) => p.id === "p3")!)}`);
    await expect(page.getByRole("group", { name: /finish|colour/i })).toHaveCount(0);
  });

  test("has no horizontal overflow", async ({ page }) => {
    await page.goto(`/products/${productSlug(catalogProducts[0])}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
