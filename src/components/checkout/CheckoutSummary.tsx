import type { ReactNode } from "react";
import { ProductThumb } from "@/components/products/ProductThumb";
import { formatAmount } from "@/lib/format";
import { fromHalalas, summarizeCart, type ResolvedLine } from "@/lib/shopping";

export function Money({ halalas, className }: { halalas: number; className?: string }) {
  return (
    <span className={className}>
      {formatAmount(fromHalalas(halalas))} <span className="text-label-md font-normal text-ink-slate">SAR</span>
    </span>
  );
}

/**
 * Read-only review of the cart being ordered, using the same integer-halala maths as the
 * cart. The total is an estimate: shipping and tax are not part of this demo.
 */
export function CheckoutSummary({ resolved, action }: { resolved: ResolvedLine[]; action: ReactNode }) {
  const summary = summarizeCart(resolved);
  const row = "flex items-baseline justify-between gap-4 text-body-md";

  return (
    <aside aria-labelledby="checkout-summary-heading" className="rounded-2xl bg-card p-5 shadow-card sm:p-6 lg:sticky lg:top-24">
      <h2 id="checkout-summary-heading" className="font-heading text-headline-md text-ink">
        Order review
      </h2>
      <ul className="mt-4 divide-y divide-line/30 border-t border-line/30">
        {resolved.map((item) => (
          <li key={item.key} className="flex gap-3 py-4">
            <span className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface-1">
              <ProductThumb product={item.product} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-md font-semibold text-ink">{item.product.name}</p>
              {item.variantLabels.length > 0 ? (
                <p className="text-label-md font-normal text-ink-slate">{item.variantLabels.join(" · ")}</p>
              ) : null}
              <p className="text-label-md font-normal text-ink-slate">
                Qty {item.line.quantity} × <Money halalas={item.unitHalalas} />
              </p>
            </div>
            <p className="shrink-0 font-heading text-body-md font-semibold text-ink tabular-nums">
              <span className="sr-only">Line total </span>
              <Money halalas={item.totalHalalas} />
            </p>
          </li>
        ))}
      </ul>

      <dl className="space-y-3 border-t border-line/30 pt-4">
        <div className={row}>
          <dt className="text-ink-muted">Items</dt>
          <dd className="tabular-nums text-ink" data-testid="checkout-items">
            {summary.itemCount}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-ink-muted">Subtotal</dt>
          <dd className="tabular-nums text-ink" data-testid="checkout-subtotal">
            <Money halalas={summary.subtotalHalalas} />
          </dd>
        </div>
        {summary.savingsHalalas > 0 ? (
          <div className={row}>
            <dt className="text-brand">Savings included</dt>
            <dd className="tabular-nums text-brand" data-testid="checkout-savings">
              <Money halalas={summary.savingsHalalas} />
            </dd>
          </div>
        ) : null}
        <div className={row}>
          <dt className="text-ink-muted">Shipping and tax</dt>
          <dd className="text-right text-ink-slate">Not included</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-line/30 pt-4">
          <dt className="font-heading text-body-lg font-semibold text-ink">Estimated total</dt>
          <dd className="font-heading text-price-lg text-brand tabular-nums" data-testid="checkout-total">
            <Money halalas={summary.estimatedTotalHalalas} />
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-label-md font-normal text-ink-slate">
        An estimate of the sample prices above, not a final payable amount. No payment is taken in this demo.
      </p>
      <div className="mt-5">{action}</div>
    </aside>
  );
}
