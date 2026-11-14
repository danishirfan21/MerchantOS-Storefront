"use client";

import { usePathname } from "next/navigation";
import { CheckoutHeader } from "@/components/layout/CheckoutHeader";

/** Picks the right back link and title for the current checkout route. */
export function CheckoutShellHeader() {
  const pathname = usePathname();
  const confirmation = pathname.startsWith("/order-confirmation");
  return confirmation ? (
    <CheckoutHeader backHref="/" backLabel="Back to store" title="Order confirmation" />
  ) : (
    <CheckoutHeader backHref="/cart" backLabel="Return to cart" title="Checkout" />
  );
}
