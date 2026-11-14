"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useRef } from "react";
import { QuantitySelector } from "@/components/product-detail/QuantitySelector";
import { ProductAvailability } from "@/components/product-detail/ProductAvailability";
import { ProductThumb } from "@/components/products/ProductThumb";
import { useShopping } from "@/components/shopping/useShopping";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { announce } from "@/lib/announcer";
import { formatAmount } from "@/lib/format";
import { productPath } from "@/lib/products";
import { fromHalalas, resolveCart, summarizeCart, type ResolvedLine } from "@/lib/shopping";
import { removeCartLine, setCartQuantity } from "@/lib/shopping-store";

function Money({ halalas, className }: { halalas: number; className?: string }) {
  return (
    <span className={className}>
      {formatAmount(fromHalalas(halalas))} <span className="text-label-md font-normal text-ink-slate">SAR</span>
    </span>
  );
}

function CartLineItem({ item, onRemove }: { item: ResolvedLine; onRemove: () => void }) {
  const { product, line, key } = item;
  const atLimit = line.quantity >= item.max;

  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[auto_1fr_auto] sm:gap-x-5">
      <Link
        href={productPath(product)}
        tabIndex={-1}
        aria-hidden="true"
        className="size-20 overflow-hidden rounded-xl bg-surface-1 sm:size-28"
      >
        <ProductThumb product={product} />
      </Link>

      <div className="min-w-0 space-y-1">
        <p className="text-label-sm font-semibold uppercase text-ink-slate">{product.brand}</p>
        <h3 className="font-heading text-body-lg font-semibold text-ink">
          <Link href={productPath(product)} className="hover:text-brand">
            {product.name}
          </Link>
        </h3>
        {item.variantLabels.length > 0 ? (
          <p className="text-body-sm text-ink-slate">{item.variantLabels.join(" · ")}</p>
        ) : null}
        <ProductAvailability product={product} className="text-label-md" />
        <p className="text-label-md font-normal text-ink-slate">
          <Money halalas={item.unitHalalas} /> / unit
        </p>
        {atLimit ? <p className="text-label-md text-ink-slate">Limit of {item.max} per order reached.</p> : null}
      </div>

      <div className="col-span-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:col-span-1 sm:flex-col-reverse sm:items-end sm:justify-between">
        <div className="flex items-center gap-1">
          <QuantitySelector
            value={line.quantity}
            max={item.max}
            subject={product.name}
            onChange={(next) => {
              setCartQuantity(key, next);
              announce(`Quantity of ${product.name} is now ${next}.`);
            }}
          />
          <IconButton label={`Remove ${product.name} from cart`} onClick={onRemove}>
            <Trash2 size={20} strokeWidth={2} />
          </IconButton>
        </div>
        <p className="font-heading text-price-md text-ink tabular-nums">
          <span className="sr-only">Line total </span>
          <Money halalas={item.totalHalalas} />
        </p>
      </div>
    </li>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-14 text-center shadow-card">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
        <ShoppingBag size={30} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-heading text-headline-md text-ink">Your cart is empty</h2>
      <p className="mt-2 max-w-sm text-body-md text-ink-slate">
        Products you add will appear here and stay in this browser until you remove them.
      </p>
      <ButtonLink href="/products" size="lg" className="mt-6" trailingIcon={<ArrowRight size={18} aria-hidden="true" />}>
        Browse products
      </ButtonLink>
    </div>
  );
}

function OrderSummary({ resolved }: { resolved: ResolvedLine[] }) {
  const summary = useMemo(() => summarizeCart(resolved), [resolved]);
  const row = "flex items-baseline justify-between gap-4 text-body-md";

  return (
    <aside aria-labelledby="summary-heading" className="rounded-2xl bg-card p-5 shadow-card sm:p-6 lg:sticky lg:top-40">
      <h2 id="summary-heading" className="font-heading text-headline-md text-ink">
        Order summary
      </h2>
      <dl className="mt-4 space-y-3 border-t border-line/30 pt-4">
        <div className={row}>
          <dt className="text-ink-muted">Items</dt>
          <dd className="tabular-nums text-ink" data-testid="summary-items">
            {summary.itemCount}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-ink-muted">Subtotal</dt>
          <dd className="tabular-nums text-ink" data-testid="summary-subtotal">
            <Money halalas={summary.subtotalHalalas} />
          </dd>
        </div>
        {summary.savingsHalalas > 0 ? (
          <div className={row}>
            <dt className="text-brand">Savings included</dt>
            <dd className="tabular-nums text-brand" data-testid="summary-savings">
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
          <dd className="font-heading text-price-lg text-brand tabular-nums" data-testid="summary-total">
            <Money halalas={summary.estimatedTotalHalalas} />
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-label-md font-normal text-ink-slate">
        This is the sum of the sample prices above, not a final payable amount. Shipping and tax would be calculated at
        checkout.
      </p>

      <ButtonLink
        href="/checkout"
        fullWidth
        size="lg"
        className="mt-5"
        aria-describedby="checkout-note"
        trailingIcon={<ArrowRight size={18} aria-hidden="true" />}
      >
        Proceed to checkout
      </ButtonLink>
      <p id="checkout-note" className="mt-2 text-center text-label-md font-normal text-ink-slate">
        Demo checkout: no payment is taken and no order is shipped.
      </p>
      <ButtonLink href="/products" variant="ghost" fullWidth className="mt-3">
        Continue shopping
      </ButtonLink>
    </aside>
  );
}

export function CartView() {
  const { ready, cart, cartCount } = useShopping();
  const resolved = useMemo(() => resolveCart(cart), [cart]);
  const headingRef = useRef<HTMLHeadingElement>(null);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 ref={headingRef} tabIndex={-1} className="font-heading text-headline-xl text-ink outline-none">
          Your shopping cart
        </h1>
        {ready && cartCount > 0 ? (
          <Badge tone="brand" data-testid="cart-count-pill">
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </Badge>
        ) : null}
      </div>
      <p className="mt-2 text-body-md text-ink-slate">
        Review your selection. Your cart is saved in this browser only.
      </p>

      <div className="mt-6">
        {!ready ? (
          <p role="status" className="rounded-2xl bg-card p-8 text-center text-body-md text-ink-slate shadow-card">
            Loading your cart…
          </p>
        ) : resolved.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
            <section aria-labelledby="cart-items-heading" className="rounded-2xl bg-card p-4 shadow-card sm:p-6">
              <h2 id="cart-items-heading" className="sr-only">
                Cart items
              </h2>
              <ul className="divide-y divide-line/30">
                {resolved.map((item) => (
                  <CartLineItem
                    key={item.key}
                    item={item}
                    onRemove={() => {
                      removeCartLine(item.key);
                      announce(`${item.product.name} removed from your cart.`);
                      headingRef.current?.focus();
                    }}
                  />
                ))}
              </ul>
            </section>
            <OrderSummary resolved={resolved} />
          </div>
        )}
      </div>
    </>
  );
}
