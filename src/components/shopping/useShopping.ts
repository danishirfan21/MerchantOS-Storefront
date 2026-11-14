"use client";

import { useSyncExternalStore } from "react";
import { cartItemCount } from "@/lib/shopping";
import { getServerSnapshot, getSnapshot, subscribe, type ShoppingSnapshot } from "@/lib/shopping-store";

/** Reactive view of the browser-persisted cart and wishlist. `ready` is false until hydrated. */
export function useShopping(): ShoppingSnapshot & { cartCount: number } {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...snapshot, cartCount: cartItemCount(snapshot.cart) };
}
