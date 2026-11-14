"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useShopping } from "@/components/shopping/useShopping";
import { IconLink } from "@/components/ui/IconButton";

function badge(count: number) {
  return count > 0 ? (count > 99 ? "99+" : count) : undefined;
}

export function HeaderCartLink({ className }: { className?: string }) {
  const { cartCount } = useShopping();
  return (
    <IconLink
      href="/cart"
      label={cartCount > 0 ? `Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}` : "Cart"}
      badge={badge(cartCount)}
      className={className}
    >
      <ShoppingBag size={22} strokeWidth={2} />
    </IconLink>
  );
}

export function HeaderWishlistLink({ className }: { className?: string }) {
  const { wishlist } = useShopping();
  const count = wishlist.length;
  return (
    <IconLink
      href="/wishlist"
      label={count > 0 ? `Wishlist, ${count} ${count === 1 ? "item" : "items"}` : "Wishlist"}
      badge={badge(count)}
      className={className}
    >
      <Heart size={22} strokeWidth={2} />
    </IconLink>
  );
}

/** Small count pill for menu rows. */
export function CountPill({ kind }: { kind: "cart" | "wishlist" }) {
  const { cartCount, wishlist } = useShopping();
  const count = kind === "cart" ? cartCount : wishlist.length;
  if (count < 1) return null;
  return (
    <span className="ms-auto rounded-full bg-brand-soft px-2 py-0.5 text-label-sm text-brand">
      {count > 99 ? "99+" : count}
    </span>
  );
}
