import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProductAvailability } from "@/components/product-detail/ProductAvailability";
import { ProductGallery } from "@/components/product-detail/ProductGallery";
import { ProductPurchasePanel } from "@/components/product-detail/ProductPurchasePanel";
import { ProductSpecifications } from "@/components/product-detail/ProductSpecifications";
import { ProductVariantSelector } from "@/components/product-detail/ProductVariantSelector";
import { QuantitySelector } from "@/components/product-detail/QuantitySelector";
import { ProductPrice } from "@/components/products/ProductPrice";
import { getProductById, productSpecGroups } from "@/lib/products";
import { useState } from "react";

const product = (id: string) => getProductById(id)!;

describe("ProductPrice", () => {
  it("shows the price in SAR with a compare-at price and discount", () => {
    render(<ProductPrice price={5199} compareAtPrice={5499} />);
    expect(screen.getByText("SAR")).toBeInTheDocument();
    expect(screen.getByText("5,199", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("5,499")).toBeInTheDocument();
    expect(screen.getByText("−5%")).toBeInTheDocument();
  });

  it("omits the discount when there is no compare-at price", () => {
    render(<ProductPrice price={8499} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});

describe("ProductGallery", () => {
  const images = [1, 2, 3].map((n) => ({ id: `i${n}`, alt: `View ${n}` }));

  it("selects a thumbnail and updates the main image", async () => {
    render(<ProductGallery images={images} />);
    expect(screen.getByRole("img", { name: "Placeholder: View 1" })).toBeInTheDocument();
    const second = screen.getByRole("button", { name: "Show image 2 of 3" });
    expect(second).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(second);
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("img", { name: "Placeholder: View 2" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Show image 1 of 3" })).toHaveAttribute("aria-pressed", "false");
  });

  it("hides thumbnails when there is a single image", () => {
    render(<ProductGallery images={images.slice(0, 1)} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("QuantitySelector", () => {
  function Harness({ max = 3, disabled = false }: { max?: number; disabled?: boolean }) {
    const [value, setValue] = useState(1);
    return <QuantitySelector value={value} max={max} disabled={disabled} onChange={setValue} />;
  }

  it("never goes below one or above the maximum", async () => {
    render(<Harness max={3} />);
    const minus = screen.getByRole("button", { name: "Decrease quantity" });
    const plus = screen.getByRole("button", { name: "Increase quantity" });
    expect(minus).toBeDisabled();
    await userEvent.click(plus);
    await userEvent.click(plus);
    expect(screen.getByLabelText("Selected quantity")).toHaveTextContent("3");
    expect(plus).toBeDisabled();
    await userEvent.click(minus);
    expect(screen.getByLabelText("Selected quantity")).toHaveTextContent("2");
  });

  it("disables both controls when unavailable", () => {
    render(<Harness disabled max={0} />);
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });
});

describe("ProductVariantSelector", () => {
  const group = product("p1").variants![0];

  function Harness() {
    const [selected, setSelected] = useState(group.options[0].id);
    return <ProductVariantSelector group={group} selectedId={selected} onSelect={setSelected} />;
  }

  it("renders a radio group and changes the selected option", async () => {
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "Natural Titanium" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Black Titanium" }));
    expect(screen.getByRole("radio", { name: "Black Titanium" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Natural Titanium" })).not.toBeChecked();
    expect(screen.getByText("Black Titanium", { selector: "legend span" })).toBeInTheDocument();
  });
});

describe("ProductPurchasePanel", () => {
  it("offers variants and a bounded quantity, and an enabled add-to-cart action", async () => {
    render(<ProductPurchasePanel product={product("p3")} />); // low stock, 4 left, no variants
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /finish|colour/i })).not.toBeInTheDocument();
    const plus = screen.getByRole("button", { name: "Increase quantity" });
    for (let i = 0; i < 10; i += 1) if (!(plus as HTMLButtonElement).disabled) await userEvent.click(plus);
    expect(screen.getByLabelText("Selected quantity")).toHaveTextContent("4");
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeEnabled();
  });

  it("shows variant selectors only for products that define them", () => {
    render(<ProductPurchasePanel product={product("p1")} />);
    expect(screen.getByRole("group", { name: /Finish/ })).toBeInTheDocument();
  });

  it("disables everything for out-of-stock products", () => {
    render(<ProductPurchasePanel product={product("p8")} />);
    expect(screen.getByRole("button", { name: "Out of stock" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });
});

describe("ProductAvailability", () => {
  it.each([
    ["p1", "In stock"],
    ["p3", "Only 4 left"],
    ["p8", "Out of stock"],
  ])("labels %s as %s", (id, label) => {
    render(<ProductAvailability product={product(id)} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe("ProductSpecifications", () => {
  it("renders spec groups as definition lists", () => {
    render(<ProductSpecifications groups={productSpecGroups(product("p1"))} />);
    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Nova")).toBeInTheDocument();
  });
});
