import { Logo } from "@/components/layout/Logo";
import { NavLink } from "@/components/layout/NavLink";
import { Container } from "@/components/ui/Container";
import { footerGroups, legalNav } from "@/lib/navigation";

const linkClass = "inline-flex min-h-(--touch-min) items-center rounded-sm text-body-md md:min-h-8 text-ink-muted transition-colors hover:text-brand";

/** Shared footer: brand blurb + link groups (4 columns at lg, stacked below), then a legal row. */
export function StorefrontFooter() {
  return (
    <footer className="mt-16 border-t border-line/30 bg-card">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-xs sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 text-body-md text-ink-muted">
            A genuine-electronics storefront from MerchantOS. Shop experience in progress.
          </p>
        </div>
        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-heading text-label-lg text-ink">{group.title}</h2>
            <ul className="mt-3 flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.label}>
                  <NavLink item={item} className={linkClass} />
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-line/30">
        <Container className="flex flex-col gap-3 py-5 text-label-md font-normal text-ink-slate sm:flex-row sm:items-center sm:justify-between">
          <p>© MerchantOS. All rights reserved.</p>
          <ul className="flex items-center gap-4">
            {legalNav.map((item) => (
              <li key={item.label}>
                <NavLink item={item} className="inline-flex min-h-(--touch-min) items-center hover:text-brand md:min-h-8" />
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
