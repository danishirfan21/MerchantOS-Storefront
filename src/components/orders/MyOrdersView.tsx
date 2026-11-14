"use client";

import { ArrowRight, PackageOpen, Search, TriangleAlert } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Money } from "@/components/checkout/CheckoutSummary";
import { formatOrderDate, OrderStatusBadge, orderCard } from "@/components/orders/OrderParts";
import { ProductThumb } from "@/components/products/ProductThumb";
import { ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { DemoOrder } from "@/lib/demo-orders";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/demo-order-store";
import { searchOrders, sortOrdersNewestFirst } from "@/lib/order-history";
import { getProductById } from "@/lib/products";

const PREVIEW_LINES = 3;

function OrderCard({ order }: { order: DemoOrder }) {
  const headingId = `order-${order.id}`;
  const preview = order.lines.slice(0, PREVIEW_LINES);
  const more = order.lines.length - preview.length;
  return (
    <li>
      <article aria-labelledby={headingId} data-testid="order-card" className={`${orderCard} space-y-5`}>
        <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="text-label-md text-ink-muted">Demo reference</p>
            <h2 id={headingId} className="font-heading text-headline-sm break-all text-ink" data-testid="card-reference">
              {order.id}
            </h2>
            <p className="mt-1 text-label-md font-normal text-ink-slate">Created {formatOrderDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge order={order} />
        </header>

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <ul aria-label={`Items in ${order.id}`} className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
            {preview.map((line) => {
              const product = getProductById(line.productId);
              return (
                <li
                  key={`${line.productId}|${JSON.stringify(line.variants)}`}
                  className="flex min-w-0 items-center gap-3 rounded-xl bg-surface-1 p-2 pe-4 sm:max-w-64"
                >
                  <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-card">
                    {product ? <ProductThumb product={{ ...product, name: line.name }} /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-label-lg text-ink">{line.name}</span>
                    <span className="block text-label-md font-normal text-ink-slate">Qty {line.quantity}</span>
                  </span>
                </li>
              );
            })}
            {more > 0 ? (
              <li className="flex items-center px-2 text-label-md text-ink-slate">
                +{more} more {more === 1 ? "product" : "products"}
              </li>
            ) : null}
          </ul>

          <div className="flex items-end justify-between gap-4 md:shrink-0 md:flex-col md:items-end">
            <div className="md:text-end">
              <p className="text-label-md text-ink-muted">
                Estimated total · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
              </p>
              <p className="font-heading text-price-lg text-brand tabular-nums">
                <Money halalas={order.estimatedTotalHalalas} />
              </p>
            </div>
            <ButtonLink
              href={`/account/orders/${order.id}`}
              variant="outline"
              trailingIcon={<ArrowRight size={16} aria-hidden="true" />}
              aria-label={`View details for ${order.id}`}
            >
              View details
            </ButtonLink>
          </div>
        </div>
      </article>
    </li>
  );
}

function Notice({
  icon: Icon,
  title,
  children,
  testId,
}: {
  icon: typeof PackageOpen;
  title: string;
  children: string;
  testId: string;
}) {
  return (
    <div
      data-testid={testId}
      className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-card px-6 py-14 text-center shadow-card"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-surface-2 text-ink-slate">
        <Icon size={30} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-heading text-headline-lg text-ink">{title}</h2>
      <p className="mt-2 text-body-md text-ink-slate">{children}</p>
      <div className="mt-6">
        <ButtonLink href="/products" size="lg">
          Browse products
        </ButtonLink>
      </div>
    </div>
  );
}

export function MyOrdersView() {
  const { ready, available, orders } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [query, setQuery] = useState("");
  const sorted = useMemo(() => sortOrdersNewestFirst(orders), [orders]);
  const results = useMemo(() => searchOrders(sorted, query), [sorted, query]);
  const searching = query.trim().length > 0;

  return (
    <>
      <header>
        <h1 className="font-heading text-headline-xl text-ink">My Demo Orders</h1>
        <p className="mt-2 max-w-2xl text-body-md text-ink-slate">
          These demo orders are saved in this browser only. There is no customer login and nothing is synced to other
          devices. No payment was taken and nothing will be shipped.
        </p>
      </header>

      <div className="mt-8" aria-live="polite">
        {!ready ? (
          <p role="status" className="rounded-2xl bg-card p-8 text-center text-body-md text-ink-slate shadow-card">
            Loading your demo orders…
          </p>
        ) : !available ? (
          <Notice icon={TriangleAlert} title="Demo orders can't be read" testId="orders-unavailable">
            This browser is blocking storage, so we can&apos;t tell whether you have saved demo orders. Allow site storage and
            reload to see them.
          </Notice>
        ) : orders.length === 0 ? (
          <Notice icon={PackageOpen} title="No demo orders yet" testId="orders-empty">
            Complete the simulated checkout and your demo order will appear here, in this browser.
          </Notice>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <Input
                type="search"
                label="Search orders"
                hideLabel
                placeholder="Search by reference or product"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                leadingIcon={<Search size={18} />}
                wrapperClassName="w-full sm:max-w-sm"
              />
              <p role="status" className="text-label-md text-ink-slate" data-testid="orders-count">
                {searching
                  ? `${results.length} of ${orders.length} demo ${orders.length === 1 ? "order" : "orders"}`
                  : `${orders.length} demo ${orders.length === 1 ? "order" : "orders"}`}
              </p>
            </div>
            {results.length === 0 ? (
              <div data-testid="orders-no-match" className="rounded-2xl bg-card p-8 text-center shadow-card">
                <h2 className="font-heading text-headline-md text-ink">No matching demo orders</h2>
                <p className="mt-2 text-body-md text-ink-slate">
                  Nothing in this browser matches that reference or product name.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-4 rounded-lg px-3 py-2 text-label-lg text-brand underline hover:bg-surface-1"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <ul aria-label="Demo orders, newest first" className="space-y-4">
                {results.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  );
}
