"use client";

import { Heart } from "lucide-react";
import { useShopping } from "@/components/shopping/useShopping";
import { announce } from "@/lib/announcer";
import { cn } from "@/lib/cn";
import { toggleWishlistItem } from "@/lib/shopping-store";
import type { Product } from "@/types/product";

/** Heart toggle with a 44px target. Exposes its state with aria-pressed. */
export function WishlistButton({ product, className }: { product: Product; className?: string }) {
  const { wishlist } = useShopping();
  const saved = wishlist.includes(product.id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`Save ${product.name} to wishlist`}
      onClick={() => {
        const nowSaved = toggleWishlistItem(product.id);
        announce(nowSaved ? `${product.name} saved to your wishlist.` : `${product.name} removed from your wishlist.`);
      }}
      className={cn(
        "flex size-(--touch-min) items-center justify-center rounded-full bg-card/90 text-ink-muted shadow-card backdrop-blur transition-colors hover:text-ink aria-pressed:text-danger",
        className,
      )}
    >
      <Heart size={20} strokeWidth={2} aria-hidden="true" className={saved ? "fill-current" : undefined} />
    </button>
  );
}
