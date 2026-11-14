import { PackageSearch, Truck } from "lucide-react";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavLink } from "@/components/layout/NavLink";
import { HeaderCartLink, HeaderWishlistLink } from "@/components/shopping/HeaderShoppingLinks";
import { Container } from "@/components/ui/Container";
import { IconLink } from "@/components/ui/IconButton";
import { categoryNav } from "@/lib/navigation";

/**
 * Shared storefront header. One DOM, adapted with CSS:
 *  - < md: logo + search / cart / menu buttons (disclosure panel in MobileNav)
 *  - md:   logo + search + actions, category row below
 *  - lg:   adds the utility bar above and widens the search with a button
 * Wishlist and cart are links with live counts (small client components); the orders link opens browser-local demo orders (there is no sign-in).
 */
export function StorefrontHeader() {
  return (
    <header className="sticky top-0 z-40 bg-card/95 shadow-[0_1px_8px_rgb(11_28_48/0.05)] backdrop-blur-xl">
      <div className="hidden border-b border-line/30 bg-surface-1 lg:block">
        <Container className="flex h-9 items-center justify-between text-label-sm text-ink-slate">
          <p className="flex items-center gap-2">
            <Truck size={15} strokeWidth={2} aria-hidden="true" className="text-brand" />
            Express delivery across the Kingdom
          </p>
          <span className="font-normal">English</span>
        </Container>
      </div>

      <Container className="flex h-16 items-center gap-3 md:h-20 md:gap-5 lg:gap-8">
        <Logo />

        <HeaderSearch withButton className="hidden min-w-0 flex-1 md:block lg:max-w-2xl" />

        <div className="ms-auto flex items-center sm:gap-1 md:ms-0">
          <HeaderWishlistLink className="max-md:hidden" />
          <HeaderCartLink className="order-2" />
          <IconLink href="/account/orders" label="My demo orders" variant="brand" className="rounded-full max-md:hidden">
            <PackageSearch size={20} strokeWidth={2} />
          </IconLink>
          <MobileNav />
        </div>
      </Container>

      <nav aria-label="Primary" className="hidden border-t border-line/20 md:block">
        <Container className="flex h-12 items-center">
          <ul className="no-scrollbar -mx-2 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {categoryNav.map((item) => (
              <li key={item.label} className="shrink-0">
                <NavLink
                  item={item}
                  className="flex h-9 items-center rounded-lg px-3 text-label-lg text-ink-muted transition-colors hover:bg-surface-1 hover:text-ink"
                />
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </header>
  );
}
