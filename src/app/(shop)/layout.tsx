import { StorefrontFooter } from "@/components/layout/StorefrontFooter";
import { StorefrontHeader } from "@/components/layout/StorefrontHeader";

/** Shell for browsing pages: header, main landmark, footer. Checkout gets its own group later. */
export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-label-lg text-brand-on focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        Skip to content
      </a>
      <StorefrontHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <StorefrontFooter />
    </>
  );
}
