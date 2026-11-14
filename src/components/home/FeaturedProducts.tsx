import { ProductGrid } from "@/components/products/ProductGrid";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredProducts } from "@/lib/fixtures/products";

/** Featured products grid with the shared cart and wishlist controls. */
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
        <ProductGrid products={featuredProducts} className="mt-6" />
      </Container>
    </section>
  );
}
