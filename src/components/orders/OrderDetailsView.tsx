"use client";

import { ArrowLeft } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  formatOrderDate,
  MissingOrder,
  OrderItemList,
  OrderMoneySummary,
  OrderStatusBadge,
  OrderTrackingTimeline,
  orderCard as card,
} from "@/components/orders/OrderParts";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { isOrderId, type DemoOrder } from "@/lib/demo-orders";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/demo-order-store";

function Details({ order }: { order: DemoOrder }) {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "My demo orders", href: "/account/orders" },
          { label: order.id },
        ]}
        className="mb-5"
      />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-headline-xl text-ink">Order details &amp; tracking</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-md text-ink-slate">
            <span className="font-semibold break-all text-ink" data-testid="order-reference">
              {order.id}
            </span>
            <span>Created {formatOrderDate(order.createdAt)}</span>
            <OrderStatusBadge order={order} />
          </p>
        </div>
        <ButtonLink href="/account/orders" variant="outline" leadingIcon={<ArrowLeft size={16} aria-hidden="true" />}>
          Back to my orders
        </ButtonLink>
      </header>

      <section aria-labelledby="progress-heading" className={`${card} mt-6`}>
        <h2 id="progress-heading" className="font-heading text-headline-md text-ink">
          Order progress
        </h2>
        <div className="mt-5">
          <OrderTrackingTimeline order={order} />
        </div>
        <p className="mt-6 rounded-xl bg-surface-1 p-4 text-body-md text-ink-slate" data-testid="tracking-note">
          This demo order was created in your browser. No payment, stock reservation, shipping or delivery has occurred.
          The later stages are shown only to illustrate the tracking layout and will not change.
        </p>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="items-heading" className={card}>
          <h2 id="items-heading" className="font-heading text-headline-md text-ink">
            Items in this order ({order.itemCount})
          </h2>
          <OrderItemList order={order} linkProducts />
          <OrderMoneySummary order={order} />
          <p className="mt-2 text-label-md font-normal text-ink-slate">
            Prices are the ones saved when this demo order was created.
          </p>
        </section>

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
            Contact and delivery details are never saved with a demo order.
          </p>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/products" variant="outline" size="lg">
          Continue shopping
        </ButtonLink>
      </div>
    </>
  );
}

export function OrderDetailsView({ orderId }: { orderId: string }) {
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
  return <Details order={order} />;
}
