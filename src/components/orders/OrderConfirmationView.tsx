"use client";

import { Check } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  formatOrderDate,
  MissingOrder,
  OrderItemList,
  OrderMoneySummary,
  OrderStatusBadge,
  orderCard as card,
} from "@/components/orders/OrderParts";
import { ButtonLink } from "@/components/ui/Button";
import { isOrderId, type DemoOrder } from "@/lib/demo-orders";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/demo-order-store";

function ConfirmedOrder({ order }: { order: DemoOrder }) {
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
          <p className="mt-1 text-body-md text-ink">{formatOrderDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-label-md text-ink-muted">Status</p>
          <p className="mt-1">
            <OrderStatusBadge order={order} />
          </p>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="ordered-items-heading" className={card}>
          <h2 id="ordered-items-heading" className="font-heading text-headline-md text-ink">
            Ordered items ({order.itemCount})
          </h2>
          <OrderItemList order={order} />
          <OrderMoneySummary order={order} />
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
        <ButtonLink href={`/account/orders/${order.id}`} size="lg">
          View order details
        </ButtonLink>
        <ButtonLink href="/account/orders" variant="outline" size="lg">
          View my demo orders
        </ButtonLink>
        <ButtonLink href="/products" variant="ghost" size="lg">
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
