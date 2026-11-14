"use client";

import { ShoppingBag } from "lucide-react";
import { useId, useState } from "react";
import { ProductVariantSelector } from "@/components/product-detail/ProductVariantSelector";
import { QuantitySelector } from "@/components/product-detail/QuantitySelector";
import { Button } from "@/components/ui/Button";
import {
  clampQuantity,
  defaultVariantSelection,
  isPurchasable,
  maxQuantity,
  selectVariantOption,
  selectedVariantLabels,
} from "@/lib/products";
import type { Product } from "@/types/product";

/**
 * Client-side purchase controls: variants and quantity. There is no cart yet, so the
 * purchase action stays disabled and says why.
 */
export function ProductPurchasePanel({ product }: { product: Product }) {
  const [selection, setSelection] = useState(() => defaultVariantSelection(product.variants));
  const max = maxQuantity(product);
  const [quantity, setQuantity] = useState(() => clampQuantity(1, max));
  const noteId = useId();
  const purchasable = isPurchasable(product);
  const chosen = selectedVariantLabels(product.variants, selection);

  return (
    <div className="flex flex-col gap-5">
      {product.variants?.map((group) => (
        <ProductVariantSelector
          key={group.id}
          group={group}
          selectedId={selection[group.id]}
          onSelect={(optionId) =>
            setSelection((current) => selectVariantOption(product.variants, current, group.id, optionId))
          }
        />
      ))}

      <div>
        <p className="mb-2 text-label-lg text-ink">Quantity</p>
        <QuantitySelector value={quantity} max={max} disabled={!purchasable} onChange={setQuantity} />
        {purchasable && product.stock === "low-stock" ? (
          <p className="mt-2 text-label-md text-ink-slate">Up to {max} available on this sample record.</p>
        ) : null}
      </div>

      <div>
        <Button
          fullWidth
          size="lg"
          disabled
          aria-describedby={noteId}
          leadingIcon={<ShoppingBag size={20} strokeWidth={2} aria-hidden="true" />}
        >
          {purchasable ? "Add to cart" : "Out of stock"}
        </Button>
        <p id={noteId} className="mt-2 text-label-md text-ink-slate">
          {purchasable
            ? `The cart is not available yet, so nothing can be added. ${
                chosen.length ? `Selected: ${chosen.join(", ")}, quantity ${quantity}.` : `Selected quantity: ${quantity}.`
              }`
            : "This product is currently unavailable."}
        </p>
      </div>
    </div>
  );
}
