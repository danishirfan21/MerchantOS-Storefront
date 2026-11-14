import { Suspense } from "react";
import { CheckoutHeader } from "@/components/layout/CheckoutHeader";
import { CheckoutShellHeader } from "@/components/layout/CheckoutShellHeader";
import { Announcer } from "@/components/shopping/Announcer";

/**
 * Focused shell for checkout and order confirmation: the simplified header only, with no
 * category navigation, search or footer links competing with the task.
 */
export default function CheckoutLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-label-lg text-brand-on focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        Skip to content
      </a>
      <Announcer />
      <Suspense fallback={<CheckoutHeader backHref="/cart" backLabel="Return to cart" />}>
        <CheckoutShellHeader />
      </Suspense>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="py-6 text-center text-label-md font-normal text-ink-subtle">
        MerchantOS Storefront demo. No real payments, orders or deliveries.
      </footer>
    </>
  );
}
