import { expect, test, type Page } from "@playwright/test";
import { CART_STORAGE_KEY, WISHLIST_STORAGE_KEY } from "../../src/lib/shopping";
import { DEMO_ORDERS_STORAGE_KEY } from "../../src/lib/demo-orders";

const headphones = "Wireless noise-cancelling headphones";

async function stored(page: Page, key: string) {
  return page.evaluate((k) => window.localStorage.getItem(k), key);
}

async function allStorage(page: Page) {
  return page.evaluate(() => JSON.stringify({ ...window.localStorage }) + JSON.stringify({ ...window.sessionStorage }));
}

async function seedCart(page: Page) {
  await page.addInitScript(
    ([cartKey, wishKey]) => {
      if (window.localStorage.getItem(cartKey) === null && !window.sessionStorage.getItem("seeded")) {
        window.sessionStorage.setItem("seeded", "1");
        window.localStorage.setItem(
          cartKey,
          JSON.stringify({
            version: 1,
            lines: [
              { productId: "p1", variants: { finish: "black-titanium" }, quantity: 1 },
              { productId: "p4", variants: {}, quantity: 2 },
            ],
          }),
        );
        window.localStorage.setItem(wishKey, JSON.stringify({ version: 1, ids: ["p2"] }));
      }
    },
    [CART_STORAGE_KEY, WISHLIST_STORAGE_KEY],
  );
}

async function fillForm(page: Page) {
  await page.getByLabel(/Full name/).fill("Sample Shopper");
  await page.getByLabel(/Email address/).fill("sample@example.test");
  await page.getByLabel(/Mobile number/).fill("0501234567");
  await page.getByLabel(/^City/).selectOption("Riyadh");
  await page.getByLabel(/District and street/).fill("Sample District, Example Street");
  await page.getByLabel(/Building, villa or apartment/).fill("Building 1");
  await page.getByLabel(/Postal code/).fill("12345");
  await page.getByRole("radio", { name: /Standard delivery/ }).check();
  await page.getByRole("radio", { name: /Demo cash on delivery/ }).check();
}

test.describe("checkout journey", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "Desktop journey; mobile layout is covered below.");

  test("a shopper can check out and see a persistent demo confirmation", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    // 1-3. Homepage, catalog, product detail
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "All products" }).click();
    await expect(page).toHaveURL(/\/products$/); // let the navigation finish before clicking a card
    await page.getByRole("link", { name: headphones, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(headphones);

    // 4-5. Variant, quantity, add
    await page.getByText("Silver", { exact: true }).click();
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.locator("header").getByRole("link", { name: "Cart, 2 items" })).toBeVisible();

    // 6-7. Cart, then checkout through the real link
    await page.locator("header").getByRole("link", { name: "Cart, 2 items" }).click();
    await page.getByRole("link", { name: "Proceed to checkout" }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
    // Simplified checkout shell: no category navigation or storefront footer.
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
    await expect(page.getByTestId("checkout-total")).toContainText("2,298");
    await expect(page.getByTestId("checkout-savings")).toContainText("500");
    await expect(page.locator("p:visible", { hasText: "Colour: Silver" })).toBeVisible();

    // 8-9. Invalid submit shows errors and focuses the first invalid field
    await page.getByRole("button", { name: "Place demo order" }).click();
    await expect(page.getByLabel(/Full name/)).toBeFocused();
    await expect(page.getByText("Enter your full name.")).toBeVisible();
    await expect(page.getByText("Choose a payment option.")).toBeVisible();
    expect(await stored(page, DEMO_ORDERS_STORAGE_KEY)).toBeNull();

    // 10-12. Fictional data, payment option, submit
    await fillForm(page);
    await page.getByRole("button", { name: "Place demo order" }).click();

    // 13. Confirmation
    await expect(page).toHaveURL(/\/order-confirmation\/DEMO-[A-Z2-9]{8}$/);
    await expect(page.getByRole("heading", { level: 1, name: "Demo order created" })).toBeVisible();
    await expect(page.getByTestId("order-status")).toHaveText("Demo order");
    await expect(page.getByTestId("order-total")).toContainText("2,298");
    await expect(page.locator("p:visible", { hasText: "Colour: Silver" })).toBeVisible();
    await expect(page.getByText("Demo cash on delivery")).toBeVisible();
    const reference = (await page.getByTestId("order-reference").textContent())!;
    const url = page.url();

    // 14. Cart cleared, wishlist untouched
    expect(JSON.parse((await stored(page, CART_STORAGE_KEY))!).lines).toEqual([]);
    expect(JSON.parse((await stored(page, WISHLIST_STORAGE_KEY)) ?? "{}").ids ?? []).toEqual([]);

    // 15-16. Reload keeps the same summary, without a duplicate order
    await page.reload();
    await expect(page.getByTestId("order-reference")).toHaveText(reference);
    await expect(page.getByTestId("order-total")).toContainText("2,298");
    expect(JSON.parse((await stored(page, DEMO_ORDERS_STORAGE_KEY))!).orders).toHaveLength(1);
    await page.goto(url);
    expect(JSON.parse((await stored(page, DEMO_ORDERS_STORAGE_KEY))!).orders).toHaveLength(1);

    // 17. No personal or payment data in any browser storage
    const everything = await allStorage(page);
    for (const secret of ["Sample Shopper", "sample@example.test", "0501234567", "Example Street", "Building 1", "12345"]) {
      expect(everything).not.toContain(secret);
    }
    expect(page.url()).not.toMatch(/Sample|example|0501234567/);

    // 18. Unknown id gives a missing-order state
    await page.goto("/order-confirmation/DEMO-ZZZZZZZZ");
    await expect(page.getByRole("heading", { name: "Demo order not found" })).toBeVisible();
    await page.goto("/order-confirmation/not-an-id");
    await expect(page.getByRole("heading", { name: "Demo order not found" })).toBeVisible();

    // Checkout now has nothing to order
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});

test.describe("checkout resilience", () => {
  test("an empty cart shows the empty state with a way back", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to cart" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Place demo order" })).toHaveCount(0);
  });

  test("a failed save keeps the cart and shows a recoverable error", async ({ page }) => {
    await seedCart(page);
    await page.addInitScript((key) => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k: string, v: string) {
        if (k === key) throw new Error("quota");
        return original.call(this, k, v);
      };
    }, DEMO_ORDERS_STORAGE_KEY);
    await page.goto("/checkout");
    await fillForm(page);
    await page.getByRole("button", { name: "Place demo order" }).click();
    await expect(page.locator("#checkout-form").getByText(/could not be saved in this browser/)).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
    expect(JSON.parse((await stored(page, CART_STORAGE_KEY))!).lines).toHaveLength(2);
    await expect(page.getByRole("button", { name: "Place demo order" })).toBeEnabled();
  });

  test("items added in another tab survive and a cart changed in another tab is shown before it is submitted", async ({ page, context }) => {
    await seedCart(page);
    await page.goto("/checkout");
    await fillForm(page);
    const other = await context.newPage();
    await other.goto("/robots.txt");
    await other.evaluate((key) => {
      const cart = JSON.parse(window.localStorage.getItem(key)!);
      cart.lines.push({ productId: "p2", variants: { colour: "silver" }, quantity: 1 });
      window.localStorage.setItem(key, JSON.stringify(cart));
    }, CART_STORAGE_KEY);
    // The form follows the storage event, so what is submitted is what is shown.
    await expect(page.getByTestId("checkout-items")).toHaveText("4");
    await page.getByRole("button", { name: "Place demo order" }).click();
    await expect(page).toHaveURL(/\/order-confirmation\//);
    expect(JSON.parse((await stored(page, CART_STORAGE_KEY))!).lines).toEqual([]);
  });
});

test.describe("checkout responsive layout", () => {
  test("checkout and confirmation do not overflow horizontally", async ({ page }) => {
    await seedCart(page);
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);

    await page.getByRole("button", { name: "Place demo order" }).click();
    await expect(page.getByLabel(/Full name/)).toBeFocused();
    expect(await overflow()).toBeLessThanOrEqual(0);

    await fillForm(page);
    await page.getByRole("button", { name: "Place demo order" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Demo order created" })).toBeVisible();
    expect(await overflow()).toBeLessThanOrEqual(0);
  });
});
