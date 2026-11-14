"use client";

import { ShoppingBag } from "lucide-react";
import { useRef, useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/Button";
import { announce } from "@/lib/announcer";
import { defaultVariantSelection, isPurchasable, type VariantSelection } from "@/lib/products";
import { describeAddResult, type AddResult } from "@/lib/shopping";
import { addProductToCart } from "@/lib/shopping-store";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  /** Defaults to each variant group's first option. */
  variants?: VariantSelection;
  quantity?: number;
  size?: ComponentProps<typeof Button>["size"];
  /** Visible label when purchasable. */
  label?: string;
  /** Use the visible label as the accessible name (otherwise the product name is included). */
  plainName?: boolean;
  onResult?: (result: AddResult, message: { tone: "success" | "error"; text: string }) => void;
  describedBy?: string;
};

/** Adds a product to the cart. Out-of-stock products get an honest disabled button. */
export function AddToCartButton({
  product,
  variants,
  quantity = 1,
  size = "sm",
  label = "Add to cart",
  plainName,
  onResult,
  describedBy,
}: Props) {
  const [justAdded, setJustAdded] = useState(false);
  const locked = useRef(false);

  if (!isPurchasable(product)) {
    return (
      <Button fullWidth size={size} disabled aria-label={plainName ? undefined : `${product.name} is out of stock`}>
        Out of stock
      </Button>
    );
  }

  function handleClick() {
    // Guard against double clicks adding the same units twice.
    if (locked.current) return;
    locked.current = true;
    window.setTimeout(() => {
      locked.current = false;
    }, 500);

    const result = addProductToCart(product, variants ?? defaultVariantSelection(product.variants), quantity);
    const message = describeAddResult(product, result);
    announce(message.text);
    onResult?.(result, message);
    if (result.status === "added") {
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1800);
    }
  }

  return (
    <Button
      fullWidth
      size={size}
      onClick={handleClick}
      aria-label={plainName ? undefined : `Add ${product.name} to cart`}
      aria-describedby={describedBy}
      leadingIcon={<ShoppingBag size={size === "lg" ? 20 : 16} strokeWidth={2} aria-hidden="true" />}
    >
      {justAdded ? "Added" : label}
    </Button>
  );
}
