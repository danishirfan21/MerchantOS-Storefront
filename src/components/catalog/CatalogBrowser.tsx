"use client";

import { SlidersHorizontal } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ActiveFilterChips } from "@/components/catalog/ActiveFilterChips";
import { EmptyResults } from "@/components/catalog/EmptyResults";
import { FilterDrawer } from "@/components/catalog/FilterDrawer";
import { FiltersPanel } from "@/components/catalog/FiltersPanel";
import { SortSelect } from "@/components/catalog/SortSelect";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import {
  EMPTY_FILTERS,
  activeFilterList,
  categoryName,
  filterProducts,
  parseCatalogParams,
  sortProducts,
  toSearchString,
  type CatalogFilters,
  type SortKey,
} from "@/lib/catalog";
import { catalogProducts } from "@/lib/fixtures/products";
import { productPath } from "@/lib/products";

/**
 * Catalog page body. Filter, sort and search state lives in the URL (shareable,
 * back-button friendly); the desktop sidebar and the mobile drawer edit the same state.
 */
export function CatalogBrowser() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Local state is what the UI renders (instant, never stale); the URL mirrors it.
  const [{ filters, sort }, setState] = useState(() => parseCatalogParams(searchParams));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Adopt URL changes made elsewhere (header search, back/forward, a category link):
  // when the URL's params change, re-derive the state during render.
  const urlKey = searchParams.toString();
  const [seenUrlKey, setSeenUrlKey] = useState(urlKey);
  if (urlKey !== seenUrlKey) {
    setSeenUrlKey(urlKey);
    setState(parseCatalogParams(searchParams));
  }

  const results = useMemo(() => sortProducts(filterProducts(catalogProducts, filters), sort), [filters, sort]);
  const activeCount = activeFilterList({ ...filters, q: "" }).length;

  function commit(next: CatalogFilters, nextSort: SortKey = sort) {
    setState({ filters: next, sort: nextSort });
    // Native history API: Next.js syncs it with useSearchParams, with no server round trip per click.
    window.history.replaceState(null, "", `${pathname}${toSearchString(next, nextSort)}`);
  }
  const clearAll = () => commit(EMPTY_FILTERS);

  const title = categoryName(filters.category) ?? (filters.q ? "Search results" : "All products");
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: filters.category ? "/products" : undefined },
    ...(filters.category ? [{ label: categoryName(filters.category) ?? "" }] : []),
  ];

  return (
    <Container className="pt-4 pb-12 md:pt-6 md:pb-16">
      <Breadcrumb items={crumbs} />

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h1 className="font-heading text-headline-xl text-ink">{title}</h1>
          <p className="mt-1 max-w-2xl text-body-sm text-ink-slate sm:text-body-md">
            Browse electronics by category, brand, price and availability. Sample products for previewing the catalogue; not live
            inventory.
          </p>
        </div>
        <p role="status" aria-live="polite" className="rounded-full bg-card px-4 py-2 text-label-lg text-ink shadow-card">
          {results.length} of {catalogProducts.length} products
        </p>
      </div>

      <div className="mt-5 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside aria-label="Filters" className="max-lg:hidden">
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading text-headline-sm text-ink">
                <SlidersHorizontal size={18} strokeWidth={2} aria-hidden="true" className="text-brand" />
                Filters
              </h2>
              <button
                type="button"
                onClick={clearAll}
                disabled={activeFilterList(filters).length === 0}
                className="text-label-md text-brand hover:underline disabled:text-ink-subtle disabled:no-underline"
              >
                Reset
              </button>
            </div>
            <FiltersPanel filters={filters} onChange={commit} idPrefix="side" />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-3 lg:flex lg:items-center lg:justify-between lg:rounded-2xl lg:bg-card lg:p-3 lg:shadow-card">
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              className="inline-flex h-(--control-md) items-center justify-center gap-2 rounded-lg bg-card text-label-lg text-ink shadow-card transition-colors hover:bg-surface-1 lg:hidden"
            >
              <SlidersHorizontal size={18} strokeWidth={2} aria-hidden="true" />
              Filters
              {activeCount > 0 ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-brand text-label-sm text-brand-on">
                  {activeCount}
                </span>
              ) : null}
            </button>
            <SortSelect id="catalog-sort" value={sort} onChange={(value) => commit(filters, value)} />
            <p className="max-lg:hidden text-label-md font-normal text-ink-slate">Showing {results.length} products</p>
          </div>

          <div className="mt-4">
            <ActiveFilterChips filters={filters} onChange={commit} onClear={clearAll} />
          </div>

          <div className="mt-5">
            {results.length > 0 ? (
              <ProductGrid
                products={results}
                columnsClassName="grid-cols-2 xl:grid-cols-3"
                hrefFor={(product) => productPath(product, toSearchString(filters, sort))}
              />
            ) : (
              <EmptyResults query={filters.q} onClear={clearAll} />
            )}
          </div>
        </div>
      </div>

      {drawerOpen ? (
        <FilterDrawer
          initial={filters}
          onApply={(next) => commit(next)}
          onClose={() => {
            setDrawerOpen(false);
            filterButtonRef.current?.focus();
          }}
        />
      ) : null}
    </Container>
  );
}
