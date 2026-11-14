import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/checkout" }));

import { CheckoutView } from "@/components/checkout/CheckoutView";
import { OrderConfirmationView } from "@/components/orders/OrderConfirmationView";
import { DEMO_ORDERS_STORAGE_KEY } from "@/lib/demo-orders";
import { resetDemoOrderStoreForTests } from "@/lib/demo-order-store";
import { CART_STORAGE_KEY } from "@/lib/shopping";
import { resetShoppingStoreForTests } from "@/lib/shopping-store";

function seedCart(lines?: unknown[]) {
  window.localStorage.clear();
  if (lines) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, lines }));
  resetShoppingStoreForTests();
  resetDemoOrderStoreForTests();
}

const cartLines = [
  { productId: "p1", variants: { finish: "black-titanium" }, quantity: 2 },
  { productId: "p4", variants: {}, quantity: 1 },
];

beforeEach(() => {
  push.mockReset();
  seedCart();
});

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Full name/), "Sample Shopper");
  await user.type(screen.getByLabelText(/Email address/), "sample@example.test");
  await user.type(screen.getByLabelText(/Mobile number/), "0501234567");
  await user.selectOptions(screen.getByLabelText(/^City/), "Riyadh");
  await user.type(screen.getByLabelText(/District and street/), "Sample District, Example Street");
  await user.type(screen.getByLabelText(/Building, villa or apartment/), "Building 1");
  await user.type(screen.getByLabelText(/Postal code/), "12345");
  await user.click(screen.getByRole("radio", { name: /Standard delivery/ }));
  await user.click(screen.getByRole("radio", { name: /Demo cash on delivery/ }));
}

describe("CheckoutView", () => {
  it("shows an empty state with a way back when the cart is empty", () => {
    render(<CheckoutView />);
    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to cart" })).toHaveAttribute("href", "/cart");
    expect(screen.getByRole("link", { name: /Browse products/ })).toHaveAttribute("href", "/products");
    expect(screen.queryByRole("button", { name: /Place demo order/ })).not.toBeInTheDocument();
  });

  it("renders the form, the demo disclosure and a read-only review with estimated totals", () => {
    seedCart(cartLines);
    render(<CheckoutView />);
    expect(screen.getByRole("heading", { level: 1, name: "Checkout" })).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent(/demo checkout/i);
    const form = screen.getByRole("form", { name: "Demo checkout details" });
    expect(within(form).getByLabelText(/Full name/)).toHaveAttribute("autocomplete", "name");
    expect(within(form).getByLabelText(/Email address/)).toHaveAttribute("type", "email");
    expect(within(form).getByLabelText(/Mobile number/)).toHaveAttribute("type", "tel");
    expect(within(form).getByLabelText(/Postal code/)).toHaveAttribute("autocomplete", "postal-code");

    expect(screen.getByTestId("checkout-items")).toHaveTextContent("3");
    expect(screen.getByTestId("checkout-subtotal")).toHaveTextContent("13,697");
    expect(screen.getByTestId("checkout-savings")).toHaveTextContent("800");
    expect(screen.getByTestId("checkout-total")).toHaveTextContent("13,697");
    expect(screen.getByText("Finish: Black Titanium")).toBeInTheDocument();
    expect(screen.getByText(/not a final payable amount/i)).toBeInTheDocument();
  });

  it("asks for no card, bank or security details", () => {
    seedCart(cartLines);
    render(<CheckoutView />);
    expect(screen.queryByLabelText(/card number|cvv|cvc|expir|iban|security code/i)).not.toBeInTheDocument();
    expect(screen.getByText(/No card number, expiry, security code or bank details are asked for/)).toBeInTheDocument();
  });

  it("shows accessible errors on an empty submit and focuses the first invalid field", async () => {
    seedCart(cartLines);
    const user = userEvent.setup();
    render(<CheckoutView />);
    await user.click(screen.getByRole("button", { name: "Place demo order" }));

    const name = screen.getByLabelText(/Full name/);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Enter your full name.");
    expect(name).toHaveFocus();
    expect(screen.getByRole("alert")).toHaveTextContent(/9 fields need attention/);
    expect(screen.getByText("Choose a delivery method.")).toBeInTheDocument();
    expect(screen.getByText("Choose a payment option.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(DEMO_ORDERS_STORAGE_KEY)).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines).toHaveLength(2);
  });

  it("flags format errors and clears an error once the field is edited", async () => {
    seedCart(cartLines);
    const user = userEvent.setup();
    render(<CheckoutView />);
    await user.type(screen.getByLabelText(/Email address/), "nope");
    await user.type(screen.getByLabelText(/Mobile number/), "123");
    await user.click(screen.getByRole("button", { name: "Place demo order" }));
    expect(screen.getByText(/Enter a valid email address/)).toBeInTheDocument();
    expect(screen.getByText(/Enter a Saudi mobile number/)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Email address/), "@example.test");
    expect(screen.queryByText(/Enter a valid email address/)).not.toBeInTheDocument();
  });

  it("lets delivery and payment be chosen with a radio group", async () => {
    seedCart(cartLines);
    const user = userEvent.setup();
    render(<CheckoutView />);
    const cod = screen.getByRole("radio", { name: /Demo cash on delivery/ });
    const card = screen.getByRole("radio", { name: /Simulated card payment/ });
    await user.click(cod);
    expect(cod).toBeChecked();
    await user.click(card);
    expect(card).toBeChecked();
    expect(cod).not.toBeChecked();
  });

  it("creates the order, clears the cart, stores no personal data and navigates once", async () => {
    seedCart(cartLines);
    const user = userEvent.setup();
    render(<CheckoutView />);
    await fillValid(user);
    const submit = screen.getByRole("button", { name: "Place demo order" });
    await user.dblClick(submit);

    expect(screen.getByRole("button", { name: /Creating demo order/ })).toBeDisabled();
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push.mock.calls[0][0]).toMatch(/^\/order-confirmation\/DEMO-[A-Z2-9]{8}$/);

    const stored = window.localStorage.getItem(DEMO_ORDERS_STORAGE_KEY)!;
    expect(JSON.parse(stored).orders).toHaveLength(1);
    for (const secret of ["Sample Shopper", "sample@example.test", "0501234567", "Example Street", "Building 1", "12345"]) {
      expect(stored).not.toContain(secret);
      expect(JSON.stringify({ ...window.localStorage })).not.toContain(secret);
    }
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines).toEqual([]);
    expect(screen.queryByRole("heading", { name: "Your cart is empty" })).not.toBeInTheDocument();
  });

  it("blocks submission and explains when the demo order cannot be saved", async () => {
    seedCart(cartLines);
    const user = userEvent.setup();
    render(<CheckoutView />);
    await fillValid(user);
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === DEMO_ORDERS_STORAGE_KEY) throw new Error("quota");
      return original.call(this, key, value);
    };
    try {
      await user.click(screen.getByRole("button", { name: "Place demo order" }));
      const alert = await screen.findByText(/could not be saved in this browser/);
      expect(alert).toBeInTheDocument();
    } finally {
      Storage.prototype.setItem = original;
    }
    expect(push).not.toHaveBeenCalled();
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).lines).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Place demo order" })).toBeEnabled();
    expect(screen.getAllByRole("link", { name: "Return to cart" }).length).toBeGreaterThan(0);
  });
});

describe("OrderConfirmationView", () => {
  async function placeOrder() {
    seedCart(cartLines);
    const user = userEvent.setup();
    const { unmount } = render(<CheckoutView />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Place demo order" }));
    await waitFor(() => expect(push).toHaveBeenCalled());
    unmount();
    return (push.mock.calls[0][0] as string).split("/").pop()!;
  }

  it("shows the stored order with an explicit demo status and honest wording", async () => {
    const id = await placeOrder();
    render(<OrderConfirmationView orderId={id} />);
    expect(screen.getByRole("heading", { level: 1, name: "Demo order created" })).toBeInTheDocument();
    expect(screen.getByTestId("order-reference")).toHaveTextContent(id);
    expect(screen.getByTestId("order-status")).toHaveTextContent("Demo order");
    expect(screen.getByText("Finish: Black Titanium")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ordered items (3)" })).toBeInTheDocument();
    expect(screen.getByTestId("order-total")).toHaveTextContent("13,697");
    expect(screen.getByText("Demo cash on delivery")).toBeInTheDocument();
    expect(screen.getByText(/No payment was taken/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/products");
    expect(screen.queryByText(/Sample Shopper|example\.test/)).not.toBeInTheDocument();
  });

  it("shows the same summary after a reload (fresh store, same storage)", async () => {
    const id = await placeOrder();
    resetDemoOrderStoreForTests();
    render(<OrderConfirmationView orderId={id} />);
    expect(screen.getByTestId("order-total")).toHaveTextContent("13,697");
  });

  it("shows a missing-order state for an unknown or malformed id", async () => {
    await placeOrder();
    const { unmount } = render(<OrderConfirmationView orderId="DEMO-ZZZZZZZZ" />);
    expect(screen.getByRole("heading", { name: "Demo order not found" })).toBeInTheDocument();
    unmount();
    render(<OrderConfirmationView orderId="../../etc" />);
    expect(screen.getByRole("heading", { name: "Demo order not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue shopping" })).toBeInTheDocument();
  });

  it("explains when storage is unavailable", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    try {
      resetDemoOrderStoreForTests();
      render(<OrderConfirmationView orderId="DEMO-ABCD2345" />);
      expect(screen.getByRole("heading", { name: "Demo orders can't be read" })).toBeInTheDocument();
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
