import type { Metadata } from "next";
import { MyOrdersView } from "@/components/orders/MyOrdersView";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "My demo orders",
  description: "Demo orders saved in this browser only.",
  robots: { index: false },
};

export default function MyOrdersPage() {
  return (
    <Container className="py-6 md:py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My demo orders" }]} className="mb-5" />
      <MyOrdersView />
    </Container>
  );
}
