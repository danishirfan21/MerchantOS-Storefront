"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductVariantSelector } from "@/components/product-detail/ProductVariantSelector";
import { QuantitySelector } from "@/components/product-detail/QuantitySelector";
import { AddToCartButton } from "@/components/shopping/AddToCartButton";
import { WishlistButton } from "@/components/shopping/WishlistButton";
import {
  clampQuantity,
  defaultVariantSelection,
  isPurchasable,
  maxQuantity,
  selectVariantOption,
} from "@/lib/products";
import type { Product } from "@/types/product";

/**
 * Client-side purchase controls: variants, quantity and the real add-to-cart action.
 * The cart is local demo state saved in this browser.
 */
export function ProductPurchasePanel({ product }: { product: Product }) {
  const [selection, setSelection] = useState(() => defaultVariantSelection(product.variants));
  const max = maxQuantity(product);
  const [quantity, setQuantity] = useState(() => clampQuantity(1, max));
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const purchasable = isPurchasable(product);

  return (
    <div className="flex flex-col gap-5">
      {product.variants?.map((group) => (
        <ProductVariantSelector
          key={group.id}
          group={group}
          selectedId={selection[group.id]}
          onSelect={(optionId) => {
            setSelection((current) => selectVariantOption(product.variants, current, group.id, optionId));
            setMessage(null);
          }}
        />
      ))}

      <div>
        <p className="mb-2 text-label-lg text-ink">Quantity</p>
        <QuantitySelector
          value={quantity}
          max={max}
          disabled={!purchasable}
          onChange={(next) => {
            setQuantity(next);
            setMessage(null);
          }}
        />
        {purchasable && product.stock === "low-stock" ? (
          <p className="mt-2 text-label-md text-ink-slate">Up to {max} available on this sample record.</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <AddToCartButton
              product={product}
              variants={selection}
              quantity={quantity}
              size="lg"
              plainName
              onResult={(_, next) => setMessage(next)}
            />
          </div>
          <WishlistButton product={product} className="border border-line/60 bg-card shadow-none" />
        </div>
        {!purchasable ? <p className="text-label-md text-ink-slate">This product is currently unavailable.</p> : null}
        {message ? (
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={message.tone === "error" ? "text-label-md text-danger-ink" : "text-label-md text-brand"}
          >
            {message.text}{" "}
            {message.tone === "success" ? (
              <Link href="/cart" className="font-semibold underline underline-offset-2">
                View cart
              </Link>
            ) : null}
          </p>
        ) : null}
        <p className="text-label-md font-normal text-ink-slate">
          Your cart is saved in this browser only. Sample prices; checkout is not available yet.
        </p>
      </div>
    </div>
  );
}
