"use client";

import { Check, PackageSearch, TriangleAlert } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Money } from "@/components/checkout/CheckoutSummary";
import { ProductThumb } from "@/components/products/ProductThumb";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { isOrderId, type DemoOrder } from "@/lib/demo-orders";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/demo-order-store";
import { getProductById } from "@/lib/products";

const card = "rounded-2xl bg-card p-5 shadow-card sm:p-6";

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function MissingOrder({ unavailable }: { unavailable: boolean }) {
  const Icon = unavailable ? TriangleAlert : PackageSearch;
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-card px-6 py-14 text-center shadow-card">
      <span className="flex size-16 items-center justify-center rounded-full bg-surface-2 text-ink-slate">
        <Icon size={30} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-heading text-headline-lg text-ink">
        {unavailable ? "Demo orders can't be read" : "Demo order not found"}
      </h1>
      <p className="mt-2 text-body-md text-ink-slate">
        {unavailable
          ? "This browser is blocking storage, so saved demo orders can't be shown."
          : "We couldn't find a demo order with this reference in this browser. Demo orders are stored in the browser that created them only, and are lost if site data is cleared."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/products" size="lg">
          Continue shopping
        </ButtonLink>
        <ButtonLink href="/cart" variant="outline" size="lg">
          View cart
        </ButtonLink>
      </div>
    </div>
  );
}

function OrderLines({ order }: { order: DemoOrder }) {
  return (
    <ul className="mt-4 divide-y divide-line/30 border-t border-line/30">
      {order.lines.map((line) => {
        const product = getProductById(line.productId);
        return (
          <li key={`${line.productId}|${JSON.stringify(line.variants)}`} className="flex gap-4 py-4">
            <span className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface-1 sm:size-20">
              {product ? <ProductThumb product={{ ...product, name: line.name }} /> : null}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-md font-semibold text-ink">{line.name}</p>
              {line.variantLabels.length > 0 ? (
                <p className="text-label-md font-normal text-ink-slate">{line.variantLabels.join(" · ")}</p>
              ) : null}
              <p className="text-label-md font-normal text-ink-slate">
                Qty {line.quantity} × <Money halalas={line.unitHalalas} />
              </p>
            </div>
            <p className="shrink-0 font-heading text-body-md font-semibold text-ink tabular-nums">
              <span className="sr-only">Line total </span>
              <Money halalas={line.lineTotalHalalas} />
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function ConfirmedOrder({ order }: { order: DemoOrder }) {
  const row = "flex items-baseline justify-between gap-4 text-body-md";
  return (
    <>
      <div className="flex flex-col items-center text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-brand-soft/60">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand text-brand-on">
            <Check size={26} strokeWidth={3} aria-hidden="true" />
          </span>
        </span>
        <h1 tabIndex={-1} className="mt-5 font-heading text-headline-xl text-ink outline-none">
          Demo order created
        </h1>
        <p className="mt-2 max-w-xl text-body-md text-ink-slate">
          This is a simulated order saved in this browser. No payment was taken, no stock was reserved, nothing will be
          delivered and no confirmation email was sent.
        </p>
      </div>

      <section aria-label="Order reference" className={`${card} mt-8 grid gap-4 sm:grid-cols-3`}>
        <div>
          <p className="text-label-md text-ink-muted">Demo reference</p>
          <p className="mt-1 font-heading text-headline-sm text-ink" data-testid="order-reference">
            {order.id}
          </p>
        </div>
        <div>
          <p className="text-label-md text-ink-muted">Created</p>
          <p className="mt-1 text-body-md text-ink">{formatCreatedAt(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-label-md text-ink-muted">Status</p>
          <p className="mt-1">
            <Badge tone="brand" data-testid="order-status">
              Demo order
            </Badge>
          </p>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="ordered-items-heading" className={card}>
          <h2 id="ordered-items-heading" className="font-heading text-headline-md text-ink">
            Ordered items ({order.itemCount})
          </h2>
          <OrderLines order={order} />
          <dl className="space-y-3 border-t border-line/30 pt-4">
            <div className={row}>
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="tabular-nums text-ink">
                <Money halalas={order.subtotalHalalas} />
              </dd>
            </div>
            {order.savingsHalalas > 0 ? (
              <div className={row}>
                <dt className="text-brand">Savings included</dt>
                <dd className="tabular-nums text-brand">
                  <Money halalas={order.savingsHalalas} />
                </dd>
              </div>
            ) : null}
            <div className={row}>
              <dt className="text-ink-muted">Shipping and tax</dt>
              <dd className="text-ink-slate">Not included</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-line/30 pt-4">
              <dt className="font-heading text-body-lg font-semibold text-ink">Estimated total</dt>
              <dd className="font-heading text-price-lg text-brand tabular-nums" data-testid="order-total">
                <Money halalas={order.estimatedTotalHalalas} />
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-label-md font-normal text-ink-slate">
            An estimate of the sample prices, not a final payable amount.
          </p>
        </section>

        <div className="space-y-6">
          <section aria-labelledby="options-heading" className={card}>
            <h2 id="options-heading" className="font-heading text-headline-md text-ink">
              Simulated options
            </h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-label-md text-ink-muted">Delivery method</dt>
                <dd className="mt-1 text-body-md text-ink">{order.deliveryMethod.label}</dd>
              </div>
              <div>
                <dt className="text-label-md text-ink-muted">Payment option</dt>
                <dd className="mt-1 text-body-md text-ink">{order.paymentMethod.label}</dd>
              </div>
            </dl>
            <p className="mt-4 text-label-md font-normal text-ink-slate">
              Your contact and delivery details were not saved with this demo order.
            </p>
          </section>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/products" size="lg">
          Continue shopping
        </ButtonLink>
      </div>
    </>
  );
}

export function OrderConfirmationView({ orderId }: { orderId: string }) {
  const { ready, available, orders } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!ready) {
    return (
      <p role="status" className="rounded-2xl bg-card p-8 text-center text-body-md text-ink-slate shadow-card">
        Loading your demo order…
      </p>
    );
  }

  const order = isOrderId(orderId) ? orders.find((entry) => entry.id === orderId) : undefined;
  if (!order) return <MissingOrder unavailable={!available} />;
  return <ConfirmedOrder order={order} />;
}
