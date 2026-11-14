import Link from "next/link";
import { Check, Circle, PackageSearch, TriangleAlert } from "lucide-react";
import { Money } from "@/components/checkout/CheckoutSummary";
import { ProductThumb } from "@/components/products/ProductThumb";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import type { DemoOrder } from "@/lib/demo-orders";
import { orderStatusLabel, trackingStages } from "@/lib/order-history";
import { getProductById, productPath } from "@/lib/products";

export const orderCard = "rounded-2xl bg-card p-5 shadow-card sm:p-6";

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function OrderStatusBadge({ order }: { order: DemoOrder }) {
  return (
    <Badge tone="brand" data-testid="order-status">
      {order.status === "demo-created" ? "Demo order" : orderStatusLabel(order.status)}
    </Badge>
  );
}

/** Saved order lines. Prices are the snapshot taken at checkout, never the live catalogue. */
export function OrderItemList({ order, linkProducts = false }: { order: DemoOrder; linkProducts?: boolean }) {
  return (
    <ul className="mt-4 divide-y divide-line/30 border-t border-line/30">
      {order.lines.map((line) => {
        const product = getProductById(line.productId);
        const thumb = (
          <span className="block size-16 overflow-hidden rounded-lg bg-surface-1 sm:size-20">
            {product ? <ProductThumb product={{ ...product, name: line.name }} /> : null}
          </span>
        );
        const href = linkProducts && product ? productPath(product) : null;
        return (
          <li key={`${line.productId}|${JSON.stringify(line.variants)}`} className="flex gap-4 py-4">
            <span className="shrink-0" aria-hidden={href ? true : undefined}>
              {href ? (
                <Link href={href} tabIndex={-1}>
                  {thumb}
                </Link>
              ) : (
                thumb
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-md font-semibold text-ink">
                {href ? (
                  <Link href={href} className="rounded-sm hover:text-brand hover:underline">
                    {line.name}
                  </Link>
                ) : (
                  line.name
                )}
              </p>
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

export function OrderMoneySummary({ order }: { order: DemoOrder }) {
  const row = "flex items-baseline justify-between gap-4 text-body-md";
  return (
    <>
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
    </>
  );
}

/**
 * Order progress. Only "Demo order created" is real; later stages are illustrative and
 * explicitly marked unavailable in text (not by colour alone). No timestamps are invented.
 */
export function OrderTrackingTimeline({ order }: { order: DemoOrder }) {
  const stages = trackingStages(order.status);
  return (
    <ol className="grid gap-0 md:grid-cols-5 md:gap-3" data-testid="order-timeline">
      {stages.map((stage, index) => (
        <li
          key={stage.id}
          data-stage={stage.id}
          data-state={stage.reached ? "reached" : "unavailable"}
          className="relative flex gap-4 pb-6 last:pb-0 md:flex-col md:items-center md:gap-2 md:pb-0 md:text-center"
        >
          {index < stages.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute start-[1.125rem] top-9 h-[calc(100%-2.25rem)] w-0.5 bg-line/60 md:start-[calc(50%+1.5rem)] md:top-[1.125rem] md:h-0.5 md:w-[calc(100%-3rem+0.75rem)]"
            />
          ) : null}
          <span
            aria-hidden="true"
            className={
              stage.reached
                ? "relative flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-brand-on"
                : "relative flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line bg-card text-ink-subtle"
            }
          >
            {stage.reached ? <Check size={18} strokeWidth={3} /> : <Circle size={10} />}
          </span>
          <div>
            <p className={stage.reached ? "text-body-md font-semibold text-ink" : "text-body-md font-semibold text-ink-slate"}>
              {stage.label}
            </p>
            <p className="text-label-md font-normal text-ink-slate">
              {stage.reached ? formatOrderDate(order.createdAt) : "Not available in this demo"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function MissingOrder({ unavailable, heading }: { unavailable: boolean; heading?: "h1" | "h2" }) {
  const Icon = unavailable ? TriangleAlert : PackageSearch;
  const Heading = heading ?? "h1";
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-card px-6 py-14 text-center shadow-card">
      <span className="flex size-16 items-center justify-center rounded-full bg-surface-2 text-ink-slate">
        <Icon size={30} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <Heading className="mt-5 font-heading text-headline-lg text-ink">
        {unavailable ? "Demo orders can't be read" : "Demo order not found"}
      </Heading>
      <p className="mt-2 text-body-md text-ink-slate">
        {unavailable
          ? "This browser is blocking storage, so saved demo orders can't be shown."
          : "We couldn't find a demo order with this reference in this browser. Demo orders are stored in the browser that created them only, and are lost if site data is cleared."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/products" size="lg">
          Continue shopping
        </ButtonLink>
        <ButtonLink href="/account/orders" variant="outline" size="lg">
          My demo orders
        </ButtonLink>
      </div>
    </div>
  );
}
