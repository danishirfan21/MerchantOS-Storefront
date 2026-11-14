import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Demo checkout: review your cart and create a simulated order in this browser.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <Container className="py-6 md:py-10">
      <CheckoutView />
    </Container>
  );
}
