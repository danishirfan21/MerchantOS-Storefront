import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you saved on this browser.",
};

export default function WishlistPage() {
  return (
    <Container className="py-6 md:py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} className="mb-5" />
      <WishlistView />
    </Container>
  );
}
