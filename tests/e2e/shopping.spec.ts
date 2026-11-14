import { expect, test, type Page } from "@playwright/test";
import { CART_STORAGE_KEY, WISHLIST_STORAGE_KEY } from "../../src/lib/shopping";

/** Each Playwright test gets a fresh browser context, so localStorage always starts empty. */

const headphones = "Wireless noise-cancelling headphones";
const smartwatch = "Rugged smartwatch 49mm";

async function stored(page: Page, key: string) {
  return page.evaluate((k) => window.localStorage.getItem(k), key);
}

test.describe("cart and wishlist journey", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "Desktop journey; mobile layout is covered below.");

  test("a shopper can add, manage, persist and remove cart items and use the wishlist", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    // 1-3. Homepage, Catalog, Product Detail
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "All products" }).click();
    await expect(page).toHaveURL(/\/products$/);
    await page.getByRole("link", { name: headphones, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(headphones);

    // 4-5. Variant and quantity
    await page.getByText("Silver", { exact: true }).click();
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByLabel("Selected quantity")).toHaveText("2");

    // 6-7. Add, header count
    await expect(page.locator("header").getByRole("link", { name: "Cart", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByText(/Added 2 units of/).first()).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "Cart, 2 items" })).toBeVisible();

    // 8-9. Cart page and totals
    await page.locator("header").getByRole("link", { name: "Cart, 2 items" }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole("heading", { level: 1, name: "Your shopping cart" })).toBeVisible();
    await expect(page.locator("p:visible", { hasText: "Colour: Silver" })).toBeVisible();
    await expect(page.getByTestId("summary-subtotal")).toContainText("2,298");
    await expect(page.getByTestId("summary-savings")).toContainText("500");
    await expect(page.getByTestId("summary-total")).toContainText("2,298");
    await expect(page.getByRole("button", { name: "Proceed to checkout" })).toBeDisabled();

    // 10. Modify
    await page.getByRole("button", { name: `Increase quantity for ${headphones}` }).click();
    await expect(page.getByTestId("summary-subtotal")).toContainText("3,447");
    await expect(page.locator("header").getByRole("link", { name: "Cart, 3 items" })).toBeVisible();

    // 11-12. Reload keeps the state
    await page.reload();
    await expect(page.getByTestId("summary-items")).toHaveText("3");
    await expect(page.getByTestId("summary-subtotal")).toContainText("3,447");
    await expect(page.locator("p:visible", { hasText: "Colour: Silver" })).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "Cart, 3 items" })).toBeVisible();
    const saved = JSON.parse((await stored(page, CART_STORAGE_KEY))!);
    expect(saved.lines).toEqual([{ productId: "p2", variants: { colour: "silver" }, quantity: 3 }]);

    // 13-14. Remove, empty state
    await page.getByRole("button", { name: `Remove ${headphones} from cart` }).click();
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "Cart", exact: true })).toBeVisible();

    // 15. Wishlist save from the catalog
    await page.getByRole("link", { name: "Browse products" }).click();
    await page.getByRole("button", { name: `Save ${smartwatch} to wishlist` }).click();
    await expect(page.getByRole("button", { name: `Save ${smartwatch} to wishlist` })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("header").getByRole("link", { name: "Wishlist, 1 item" })).toBeVisible();

    // 16-17. Wishlist page, move to cart (stays saved)
    await page.locator("header").getByRole("link", { name: "Wishlist, 1 item" }).click();
    await expect(page).toHaveURL(/\/wishlist$/);
    await expect(page.getByTestId("wishlist-count-pill")).toHaveText("1 item saved");
    await page.getByRole("button", { name: `Add ${smartwatch} to cart` }).click();
    await expect(page.locator("header").getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await expect(page.getByTestId("wishlist-count-pill")).toHaveText("1 item saved");

    // 18. Cart shows it
    await page.locator("header").getByRole("link", { name: "Cart, 1 item" }).click();
    await expect(page.getByRole("link", { name: smartwatch })).toBeVisible();
    await expect(page.getByTestId("summary-total")).toContainText("3,299");

    expect(consoleErrors).toEqual([]);
  });
});

test.describe("resilience", () => {
  test("corrupt storage does not break the cart or wishlist pages", async ({ page }) => {
    await page.addInitScript(
      ([cartKey, wishKey]) => {
        window.localStorage.setItem(cartKey, "{broken");
        window.localStorage.setItem(wishKey, JSON.stringify({ version: 1, ids: "nope" }));
      },
      [CART_STORAGE_KEY, WISHLIST_STORAGE_KEY],
    );
    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    await page.goto("/wishlist");
    await expect(page.getByRole("heading", { name: "Your wishlist is empty" })).toBeVisible();
  });

  test("unknown products and invalid quantities in storage are dropped", async ({ page }) => {
    await page.addInitScript(
      ([cartKey, wishKey]) => {
        window.localStorage.setItem(
          cartKey,
          JSON.stringify({
            version: 1,
            lines: [
              { productId: "ghost", variants: {}, quantity: 2 },
              { productId: "p8", variants: {}, quantity: 1 },
              { productId: "p4", variants: {}, quantity: 999 },
            ],
          }),
        );
        window.localStorage.setItem(wishKey, JSON.stringify({ version: 1, ids: ["ghost", "p4", "p4"] }));
      },
      [CART_STORAGE_KEY, WISHLIST_STORAGE_KEY],
    );
    await page.goto("/cart");
    await expect(page.getByTestId("summary-items")).toHaveText("10");
    await expect(page.getByText("Out of stock")).toHaveCount(0);
    await page.goto("/wishlist");
    await expect(page.getByTestId("wishlist-count-pill")).toHaveText("1 item saved");
  });

  test("an out-of-stock product cannot be added", async ({ page }) => {
    await page.goto("/products/everyday-smartphone-128gb");
    await expect(page.getByRole("button", { name: "Out of stock" })).toBeDisabled();
    expect(await stored(page, CART_STORAGE_KEY)).toBeNull();
  });

  test("a second tab follows changes through the storage event", async ({ page, context }) => {
    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    const other = await context.newPage();
    await other.goto("/products/rugged-smartwatch-49mm");
    await other.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("link", { name: smartwatch })).toBeVisible();
  });
});

test.describe("responsive layout", () => {
  test("cart and wishlist do not overflow horizontally and header links work on mobile", async ({ page }) => {
    await page.addInitScript(
      ([cartKey, wishKey]) => {
        window.localStorage.setItem(
          cartKey,
          JSON.stringify({
            version: 1,
            lines: [
              { productId: "p1", variants: { finish: "black-titanium" }, quantity: 2 },
              { productId: "p4", variants: {}, quantity: 1 },
            ],
          }),
        );
        window.localStorage.setItem(wishKey, JSON.stringify({ version: 1, ids: ["p2", "p3", "p8"] }));
      },
      [CART_STORAGE_KEY, WISHLIST_STORAGE_KEY],
    );
    for (const path of ["/cart", "/wishlist"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    }
    await page.locator("header").getByRole("link", { name: "Cart, 3 items" }).click();
    await expect(page).toHaveURL(/\/cart$/);
  });
});
