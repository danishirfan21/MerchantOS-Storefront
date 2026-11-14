"use client";

import { Heart, Menu, PackageSearch, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { NavLink } from "@/components/layout/NavLink";
import { CountPill } from "@/components/shopping/HeaderShoppingLinks";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { categoryNav, type NavItem } from "@/lib/navigation";

const accountItems: Array<NavItem & { icon: typeof Heart; count?: "cart" | "wishlist" }> = [
  { label: "Cart", href: "/cart", icon: ShoppingBag, count: "cart" },
  { label: "Wishlist", href: "/wishlist", icon: Heart, count: "wishlist" },
  { label: "My orders", href: "/account/orders", icon: PackageSearch },
];

/**
 * Mobile-only controls: a search trigger, a menu trigger and the disclosure
 * panel they open. Rendered as a fragment so the header can order the buttons.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function openSearch() {
    setOpen(true);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLInputElement>("input[type=search]")?.focus());
  }

  return (
    <>
      <IconButton label="Search" className="order-1 md:hidden" onClick={openSearch} aria-controls={panelId}>
        <Search size={22} strokeWidth={2} />
      </IconButton>
      <IconButton
        ref={menuButtonRef}
        label={open ? "Close menu" : "Open menu"}
        className="order-3 md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
      </IconButton>

      <div
        id={panelId}
        ref={panelRef}
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line/30 bg-card px-(--page-gutter) pt-4 pb-6 shadow-overlay md:hidden"
      >
        <HeaderSearch onSearched={() => setOpen(false)} />
        <nav aria-label="Categories" className="mt-5">
          <p className="mb-2 text-label-sm font-semibold uppercase text-ink-slate">Categories</p>
          <ul className="flex flex-col">
            {categoryNav.map((item) => (
              <li key={item.label}>
                <NavLink
                  item={item}
                  className="flex min-h-(--touch-min) items-center justify-between rounded-lg px-2 text-label-lg text-ink hover:bg-surface-1"
                >
                  {item.label}
                  {!item.href ? <Badge>Soon</Badge> : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account" className="mt-4 border-t border-line/30 pt-4">
          <ul className="flex flex-col">
            {accountItems.map(({ icon: Icon, count, ...item }) => (
              <li key={item.label}>
                <NavLink
                  item={item}
                  className="flex min-h-(--touch-min) items-center gap-3 rounded-lg px-2 text-label-lg text-ink hover:bg-surface-1"
                >
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                  {item.label}
                  {count ? <CountPill kind={count} /> : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
