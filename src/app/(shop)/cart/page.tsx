import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Shopping cart",
  description: "Review the products saved in your cart on this browser.",
};

export default function CartPage() {
  return (
    <Container className="py-6 md:py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shopping cart" }]} className="mb-5" />
      <CartView />
    </Container>
  );
}
