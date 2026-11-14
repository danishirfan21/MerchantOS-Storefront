import { expect, test, type Page } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../src/lib/shopping";
import { DEMO_ORDERS_STORAGE_KEY } from "../../src/lib/demo-orders";

const headphones = "Wireless noise-cancelling headphones";

/** Hidden previous pages stay mounted, so only look at what is visible. */
const vis = (page: Page, id: string) => page.locator(`[data-testid="${id}"]:visible`);

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

async function placeSecondOrder(page: Page) {
  await page.goto("/cart");
  await page.evaluate((key) => {
    window.localStorage.setItem(
      key,
      JSON.stringify({ version: 1, lines: [{ productId: "p4", variants: {}, quantity: 2 }] }),
    );
  }, CART_STORAGE_KEY);
  await page.goto("/checkout");
  await fillForm(page);
  await page.getByRole("button", { name: "Place demo order" }).click();
  await expect(page).toHaveURL(/\/order-confirmation\/DEMO-/);
  return (await vis(page, "order-reference").textContent())!;
}

test.describe("my orders journey", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "Desktop journey; mobile layout is covered below.");

  test("orders created through checkout appear in My Orders and open as details", async ({ page }) => {
    test.setTimeout(90_000);
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    // Homepage -> catalog -> detail -> cart -> checkout
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "All products" }).click();
    await expect(page).toHaveURL(/\/products$/); // let the navigation finish before clicking a card
    await page.getByRole("link", { name: headphones, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(headphones);
    await page.getByText("Silver", { exact: true }).click();
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.locator("header").getByRole("link", { name: /^Cart/ }).click();
    await page.getByRole("link", { name: "Proceed to checkout" }).click();
    await fillForm(page);
    await page.getByRole("button", { name: "Place demo order" }).click();

    // Confirmation -> details
    await expect(page.getByRole("heading", { level: 1, name: "Demo order created" })).toBeVisible();
    const first = (await vis(page, "order-reference").textContent())!;
    const firstTotal = (await vis(page, "order-total").textContent())!;
    await page.getByRole("link", { name: "View order details" }).click();
    await expect(page).toHaveURL(new RegExp(`/account/orders/${first}$`));
    await expect(page.getByRole("heading", { level: 1, name: /Order details/ })).toBeVisible();
    await expect(vis(page, "order-reference")).toHaveText(first);
    await expect(vis(page, "order-total")).toHaveText(firstTotal);
    await expect(page.locator("p:visible", { hasText: "Colour: Silver" })).toBeVisible();

    // Honest timeline: only creation reached
    const timeline = vis(page, "order-timeline");
    await expect(timeline.locator("[data-state=reached]")).toHaveCount(1);
    await expect(timeline.locator("[data-state=unavailable]")).toHaveCount(4);
    await expect(timeline.getByText("Not available in this demo")).toHaveCount(4);
    await expect(vis(page, "tracking-note")).toContainText("No payment, stock reservation, shipping or delivery has occurred.");

    // My Orders lists it
    await page.getByRole("link", { name: "Back to my orders" }).first().click();
    await expect(page).toHaveURL(/\/account\/orders$/);
    await expect(page.getByRole("heading", { level: 1, name: "My Demo Orders" })).toBeVisible();
    await expect(vis(page, "order-card")).toHaveCount(1);
    await expect(vis(page, "card-reference")).toHaveText(first);

    // Second distinct order, newest first
    await page.waitForTimeout(1100);
    const second = await placeSecondOrder(page);
    expect(second).not.toBe(first);
    await page.goto("/account/orders");
    await expect(vis(page, "order-card")).toHaveCount(2);
    await expect(vis(page, "card-reference")).toHaveText([second, first]);

    // Search by reference and by product name
    const search = page.getByRole("searchbox", { name: "Search orders" });
    await search.fill(first.toLowerCase());
    await expect(vis(page, "card-reference")).toHaveText([first]);
    await search.fill("noise-cancelling");
    await expect(vis(page, "card-reference")).toHaveText([first]);
    await search.fill("zzz-not-there");
    await expect(vis(page, "orders-no-match")).toBeVisible();
    await search.fill("");

    // Reload keeps orders; header link reaches the page; details open from the list
    await page.reload();
    await expect(vis(page, "card-reference")).toHaveText([second, first]);
    await page.getByRole("link", { name: `View details for ${first}` }).click();
    await expect(vis(page, "order-reference")).toHaveText(first);
    await expect(vis(page, "order-total")).toHaveText(firstTotal);
    await page.locator("header").getByRole("link", { name: "My demo orders" }).click();
    await expect(page).toHaveURL(/\/account\/orders$/);

    // Unknown ids
    await page.goto("/account/orders/DEMO-ZZZZZZZZ");
    await expect(page.getByRole("heading", { name: "Demo order not found" })).toBeVisible();
    await page.goto("/account/orders/not-an-id");
    await expect(page.getByRole("heading", { name: "Demo order not found" })).toBeVisible();
    expect(JSON.parse((await page.evaluate((k) => window.localStorage.getItem(k), DEMO_ORDERS_STORAGE_KEY))!).orders).toHaveLength(2);

    expect(consoleErrors).toEqual([]);
  });
});

test.describe("my orders states", () => {
  test("a fresh browser shows the empty state with a working Browse products link", async ({ page }) => {
    await page.goto("/account/orders");
    await expect(page.getByRole("heading", { name: "No demo orders yet" })).toBeVisible();
    await page.getByRole("link", { name: "Browse products" }).click();
    await expect(page).toHaveURL(/\/products$/);
  });

  test("blocked storage is reported instead of an empty list", async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new Error("blocked");
      };
    });
    await page.goto("/account/orders");
    await expect(page.getByRole("heading", { name: "Demo orders can't be read" })).toBeVisible();
    await expect(page.getByText("No demo orders yet")).toHaveCount(0);
  });

  test("footer links to My orders", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "My orders" }).click();
    await expect(page).toHaveURL(/\/account\/orders$/);
  });

  test("orders pages do not overflow horizontally", async ({ page }) => {
    await page.goto("/cart");
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          lines: [
            { productId: "p1", variants: { finish: "black-titanium" }, quantity: 1 },
            { productId: "p4", variants: {}, quantity: 2 },
          ],
        }),
      );
    }, CART_STORAGE_KEY);
    await page.goto("/checkout");
    await fillForm(page);
    await page.getByRole("button", { name: "Place demo order" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Demo order created" })).toBeVisible();
    const reference = (await vis(page, "order-reference").textContent())!;
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

    await page.goto("/account/orders");
    await expect(vis(page, "order-card")).toHaveCount(1);
    expect(await overflow()).toBeLessThanOrEqual(0);
    await page.goto(`/account/orders/${reference}`);
    await expect(vis(page, "order-timeline")).toBeVisible();
    expect(await overflow()).toBeLessThanOrEqual(0);
  });
});
