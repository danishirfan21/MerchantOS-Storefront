import { ShoppingBag } from "lucide-react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredProducts } from "@/lib/fixtures/products";
import { PENDING_HINT } from "@/lib/navigation";

/** Featured products grid. Cart is not implemented, so the action is disabled. */
export function FeaturedProducts() {
  return (
    <section id="featured" aria-labelledby="featured-title" className="scroll-mt-28 pb-12 md:pb-16">
      <Container>
        <SectionHeading
          id="featured-title"
          eyebrow="Featured"
          title="Curated flagships & new arrivals"
          description="Sample products shown to preview the layout. Not live inventory."
        />
        <ProductGrid
          products={featuredProducts}
          className="mt-6"
          renderActions={(product) => (
            <Button
              fullWidth
              size="sm"
              disabled
              title={PENDING_HINT}
              aria-label={`Add ${product.name} to cart (available later)`}
              leadingIcon={<ShoppingBag size={16} strokeWidth={2} />}
            >
              Add to cart
            </Button>
          )}
        />
      </Container>
    </section>
  );
}
