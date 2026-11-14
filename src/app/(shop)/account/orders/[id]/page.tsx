import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetailsView } from "@/components/orders/OrderDetailsView";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Order details",
  description: "A demo order saved in this browser only.",
  robots: { index: false },
};

async function Details({ params }: { params: PageProps<"/account/orders/[id]">["params"] }) {
  const { id } = await params;
  return <OrderDetailsView orderId={id} />;
}

export default function OrderDetailsPage({ params }: PageProps<"/account/orders/[id]">) {
  return (
    <Container className="py-6 md:py-10">
      <Suspense
        fallback={
          <p role="status" className="rounded-2xl bg-card p-8 text-center text-body-md text-ink-slate shadow-card">
            Loading your demo order…
          </p>
        }
      >
        <Details params={params} />
      </Suspense>
    </Container>
  );
}
