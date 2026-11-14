"use client";

import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useRef } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AddToCartButton } from "@/components/shopping/AddToCartButton";
import { useShopping } from "@/components/shopping/useShopping";
import { WishlistButton } from "@/components/shopping/WishlistButton";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { announce } from "@/lib/announcer";
import { defaultVariantSelection, getProductById, isPurchasable } from "@/lib/products";
import { addProductToCart, removeFromWishlistItem } from "@/lib/shopping-store";
import type { Product } from "@/types/product";

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-14 text-center shadow-card">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Heart size={30} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-heading text-headline-md text-ink">Your wishlist is empty</h2>
      <p className="mt-2 max-w-sm text-body-md text-ink-slate">
        Tap the heart on any product to save it here. Saved items stay in this browser.
      </p>
      <ButtonLink href="/products" size="lg" className="mt-6">
        Explore the catalog
      </ButtonLink>
    </div>
  );
}

export function WishlistView() {
  const { ready, wishlist } = useShopping();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const products = useMemo(
    () => wishlist.flatMap((id) => getProductById(id) ?? []),
    [wishlist],
  );
  const eligible = products.filter(isPurchasable);

  function addAllEligible() {
    let added = 0;
    for (const product of eligible) {
      const result = addProductToCart(product, defaultVariantSelection(product.variants), 1);
      if (result.status === "added") added += 1;
    }
    announce(
      added > 0
        ? `Added ${added} in-stock ${added === 1 ? "product" : "products"} to your cart.`
        : "Nothing was added: every in-stock item is already at its limit.",
    );
  }

  function remove(product: Product) {
    removeFromWishlistItem(product.id);
    announce(`${product.name} removed from your wishlist.`);
    headingRef.current?.focus();
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 ref={headingRef} tabIndex={-1} className="font-heading text-headline-xl text-ink outline-none">
              My wishlist
            </h1>
            {ready && products.length > 0 ? (
              <Badge tone="brand" data-testid="wishlist-count-pill">
                {products.length} {products.length === 1 ? "item" : "items"} saved
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-body-md text-ink-slate">Products you saved on this browser.</p>
        </div>
        {ready && products.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/products" variant="outline">
              Explore more
            </ButtonLink>
            <Button
              variant="tonal"
              disabled={eligible.length === 0}
              onClick={addAllEligible}
              leadingIcon={<ShoppingBag size={18} aria-hidden="true" />}
            >
              Add all in-stock to cart
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {!ready ? (
          <p role="status" className="rounded-2xl bg-card p-8 text-center text-body-md text-ink-slate shadow-card">
            Loading your wishlist…
          </p>
        ) : products.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <ProductGrid
            products={products}
            columnsClassName="grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            renderMediaAction={(product) => <WishlistButton product={product} />}
            renderActions={(product) => (
              <div className="flex flex-col gap-2">
                <AddToCartButton product={product} />
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  aria-label={`Remove ${product.name} from wishlist`}
                  onClick={() => remove(product)}
                  leadingIcon={<Trash2 size={16} aria-hidden="true" />}
                >
                  Remove
                </Button>
              </div>
            )}
          />
        )}
      </div>
    </>
  );
}
