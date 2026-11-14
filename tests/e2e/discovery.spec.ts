import { expect, test } from "@playwright/test";
import { catalogProducts } from "../../src/lib/fixtures/products";
import { productSlug } from "../../src/lib/products";

const headphones = catalogProducts.find((p) => p.id === "p2")!;

test.describe("Homepage to Catalog to Product Detail", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "Header search is in the mobile menu below lg; covered by the product-detail spec.");

  test("a shopper can find a product and use its detail page", async ({ page }) => {
    // 1. Homepage
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 2. Catalog via the main navigation
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "All products" }).click();
    await expect(page).toHaveURL(/\/products$/);
    const count = page.locator("p[aria-live=polite]");
    await expect(count).toHaveText(`${catalogProducts.length} of ${catalogProducts.length} products`);

    // 3. Search from the shared header
    await page.getByRole("searchbox").first().fill("headphones");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/\/products\?q=headphones/);
    await expect(count).toHaveText(`1 of ${catalogProducts.length} products`);

    // 4. Open the product
    await page.getByRole("link", { name: headphones.name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/products/${productSlug(headphones)}`));

    // 5. Title and price match the source record
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(headphones.name);
    await expect(page.getByText("1,149").first()).toBeVisible();
    await expect(page.getByText("SAR").first()).toBeVisible();
    await expect(page.getByText("In stock").first()).toBeVisible();

    // 6. Gallery selection
    const thumb2 = page.getByRole("button", { name: "Show image 2 of 4" });
    await expect(thumb2).toHaveAttribute("aria-pressed", "false");
    await thumb2.click();
    await expect(thumb2).toHaveAttribute("aria-pressed", "true");

    // 7. Variant selection (headphones have colour options)
    await expect(page.getByRole("radio", { name: "Midnight" })).toBeChecked();
    await page.getByText("Silver", { exact: true }).click();
    await expect(page.getByRole("radio", { name: "Silver" })).toBeChecked();

    // 8. Quantity
    const quantity = page.getByLabel("Selected quantity");
    await expect(quantity).toHaveText("1");
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(quantity).toHaveText("3");
    await page.getByRole("button", { name: "Decrease quantity" }).click();
    await expect(quantity).toHaveText("2");

    // Purchase action is available (the cart itself is covered by shopping.spec.ts)
    await expect(page.getByRole("button", { name: "Add to cart" })).toBeEnabled();

    // 9. Back to the catalog keeps the search
    await page.getByRole("link", { name: "Back to catalog" }).click();
    await expect(page).toHaveURL(/\/products\?q=headphones/);
    await expect(count).toHaveText(`1 of ${catalogProducts.length} products`);
  });

  test("filters survive a round trip to a product", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("radio", { name: /Smartphones/ }).check();
    await page.getByRole("checkbox", { name: /Nova/ }).check();
    await expect(page).toHaveURL(/category=smartphones/);
    await expect(page).toHaveURL(/brand=Nova/);
    await page.getByRole("link", { name: "Flagship smartphone 256GB", exact: true }).click();
    await page.getByRole("link", { name: "Back to catalog" }).click();
    await expect(page).toHaveURL(/category=smartphones/);
    await expect(page).toHaveURL(/brand=Nova/);
  });
});
