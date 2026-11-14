import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CartView } from "@/components/cart/CartView";
import { ProductPurchasePanel } from "@/components/product-detail/ProductPurchasePanel";
import { ProductCardActions } from "@/components/shopping/ProductCardActions";
import { HeaderCartLink } from "@/components/shopping/HeaderShoppingLinks";
import { WishlistButton } from "@/components/shopping/WishlistButton";
import { AddToCartButton } from "@/components/shopping/AddToCartButton";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { getProductById } from "@/lib/products";
import { CART_STORAGE_KEY, WISHLIST_STORAGE_KEY } from "@/lib/shopping";
import { resetShoppingStoreForTests } from "@/lib/shopping-store";

const product = (id: string) => getProductById(id)!;

function seed(cart?: unknown, wishlist?: unknown) {
  window.localStorage.clear();
  if (cart !== undefined) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  if (wishlist !== undefined) window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  resetShoppingStoreForTests();
}

beforeEach(() => seed());

describe("Product Detail add to cart", () => {
  it("adds the selected variant and quantity, persists it and confirms accessibly", async () => {
    render(
      <>
        <HeaderCartLink />
        <ProductPurchasePanel product={product("p1")} />
      </>,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Black Titanium" }));
    await userEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(screen.getByText(/Added 2 units of Flagship smartphone 256GB/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cart, 2 items" })).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!);
    expect(stored.lines).toEqual([{ productId: "p1", variants: { finish: "black-titanium" }, quantity: 2 }]);
    expect(JSON.stringify(stored)).not.toMatch(/price/i);
  });

  it("reports the limit instead of a success when nothing can be added", async () => {
    seed({ version: 1, lines: [{ productId: "p3", variants: {}, quantity: 4 }] });
    render(<ProductPurchasePanel product={product("p3")} />);
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/limit of 4/);
    expect(screen.queryByText(/^Added/)).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines[0].quantity).toBe(4);
  });

  it("ignores a rapid double click", async () => {
    render(<ProductPurchasePanel product={product("p4")} />);
    const button = screen.getByRole("button", { name: "Add to cart" });
    await userEvent.dblClick(button);
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines[0].quantity).toBe(1);
  });

  it("offers no add action for out-of-stock products", () => {
    render(<ProductPurchasePanel product={product("p8")} />);
    expect(screen.getByRole("button", { name: "Out of stock" })).toBeDisabled();
  });
});

describe("product card actions", () => {
  it("adds simple products with one click, and out-of-stock ones are disabled", async () => {
    render(
      <>
        <ProductCardActions product={product("p4")} href="/products/x" />
        <ProductCardActions product={product("p8")} href="/products/y" />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Add Rugged smartwatch 49mm to cart" }));
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Everyday smartphone 128GB is out of stock/ })).toBeDisabled();
  });

  it("sends variant products to their page instead of guessing a configuration", () => {
    render(<ProductCardActions product={product("p1")} href="/products/flagship" />);
    expect(screen.getByRole("link", { name: /Choose options for/ })).toHaveAttribute("href", "/products/flagship");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("wishlist controls", () => {
  it("toggles pressed state and persists without duplicates", async () => {
    render(<WishlistButton product={product("p2")} />);
    const heart = screen.getByRole("button", { name: /Save Wireless noise-cancelling headphones to wishlist/ });
    expect(heart).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(heart);
    expect(heart).toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(window.localStorage.getItem(WISHLIST_STORAGE_KEY)!).ids).toEqual(["p2"]);
    await userEvent.click(heart);
    expect(heart).toHaveAttribute("aria-pressed", "false");
    expect(JSON.parse(window.localStorage.getItem(WISHLIST_STORAGE_KEY)!).ids).toEqual([]);
  });
});

describe("CartView", () => {
  it("shows the empty state with a catalog link", () => {
    render(<CartView />);
    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse products/ })).toHaveAttribute("href", "/products");
  });

  it("restores lines from storage and shows line totals and the summary", () => {
    seed({
      version: 1,
      lines: [
        { productId: "p1", variants: { finish: "black-titanium" }, quantity: 2 },
        { productId: "p3", variants: {}, quantity: 1 },
      ],
    });
    render(<CartView />);
    expect(screen.getByText("Finish: Black Titanium")).toBeInTheDocument();
    expect(screen.getByTestId("summary-items")).toHaveTextContent("3");
    expect(screen.getByTestId("summary-subtotal")).toHaveTextContent("18,897");
    expect(screen.getByTestId("summary-savings")).toHaveTextContent("600");
    expect(screen.getByTestId("summary-total")).toHaveTextContent("18,897");
    expect(screen.getByText(/not a final payable amount/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proceed to checkout" })).toBeDisabled();
  });

  it("updates quantity within limits, then removes the last line to reach the empty state", async () => {
    seed({ version: 1, lines: [{ productId: "p3", variants: {}, quantity: 3 }] });
    render(<CartView />);
    const plus = screen.getByRole("button", { name: /Increase quantity for Performance laptop/ });
    await userEvent.click(plus);
    expect(screen.getByLabelText(/Selected quantity for Performance laptop/)).toHaveTextContent("4");
    expect(plus).toBeDisabled();
    expect(screen.getByText(/Limit of 4 per order reached/)).toBeInTheDocument();
    expect(screen.getByTestId("summary-subtotal")).toHaveTextContent("33,996");

    await userEvent.click(screen.getByRole("button", { name: /Decrease quantity for Performance laptop/ }));
    expect(screen.getByTestId("summary-items")).toHaveTextContent("3");

    await userEvent.click(screen.getByRole("button", { name: /Remove Performance laptop 16-inch OLED from cart/ }));
    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines).toEqual([]);
  });

  it("tolerates corrupt storage and drops unknown products", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, "{not json");
    resetShoppingStoreForTests();
    const { unmount } = render(<CartView />);
    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
    unmount();
    seed({ version: 1, lines: [{ productId: "ghost", variants: {}, quantity: 2 }] });
    render(<CartView />);
    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
  });
});

describe("WishlistView", () => {
  it("shows the empty state", () => {
    render(<WishlistView />);
    expect(screen.getByRole("heading", { name: "Your wishlist is empty" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore the catalog" })).toHaveAttribute("href", "/products");
  });

  it("lists saved products, adds eligible ones to the cart and keeps them saved", async () => {
    seed(undefined, { version: 1, ids: ["p4", "p8"] });
    render(
      <>
        <HeaderCartLink />
        <WishlistView />
      </>,
    );
    expect(screen.getByTestId("wishlist-count-pill")).toHaveTextContent("2 items saved");
    expect(screen.getByRole("button", { name: /Everyday smartphone 128GB is out of stock/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Add Rugged smartwatch 49mm to cart" }));
    expect(screen.getByRole("link", { name: "Cart, 1 item" })).toBeInTheDocument();
    expect(screen.getByTestId("wishlist-count-pill")).toHaveTextContent("2 items saved");
  });

  it("adds every in-stock saved product with default variants, never the out-of-stock one", async () => {
    seed(undefined, { version: 1, ids: ["p1", "p4", "p8"] });
    render(<WishlistView />);
    await userEvent.click(screen.getByRole("button", { name: "Add all in-stock to cart" }));
    const lines = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines;
    expect(lines).toEqual([
      { productId: "p1", variants: { finish: "natural-titanium" }, quantity: 1 },
      { productId: "p4", variants: {}, quantity: 1 },
    ]);
  });

  it("removes a saved product", async () => {
    seed(undefined, { version: 1, ids: ["p4"] });
    render(<WishlistView />);
    const card = screen.getByRole("article", { name: /Rugged smartwatch 49mm/ });
    await userEvent.click(within(card).getByRole("button", { name: /Remove Rugged smartwatch 49mm from wishlist/ }));
    expect(screen.getByRole("heading", { name: "Your wishlist is empty" })).toBeInTheDocument();
  });
});

describe("AddToCartButton", () => {
  it("does not claim success for an out-of-stock product", () => {
    render(<AddToCartButton product={product("p16")} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
