import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmationView } from "@/components/orders/OrderConfirmationView";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Order confirmation",
  description: "Your simulated demo order, stored in this browser only.",
  robots: { index: false },
};

async function Confirmation({ params }: { params: PageProps<"/order-confirmation/[id]">["params"] }) {
  const { id } = await params;
  return <OrderConfirmationView orderId={id} />;
}

export default function OrderConfirmationPage({ params }: PageProps<"/order-confirmation/[id]">) {
  return (
    <Container className="py-6 md:py-10">
      <Suspense
        fallback={
          <p role="status" className="rounded-2xl bg-card p-8 text-center text-body-md text-ink-slate shadow-card">
            Loading your demo order…
          </p>
        }
      >
        <Confirmation params={params} />
      </Suspense>
    </Container>
  );
}
