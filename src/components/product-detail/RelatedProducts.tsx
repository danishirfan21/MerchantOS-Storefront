import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/types/product";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-10 md:mt-14">
      <h2 id="related-heading" className="mb-4 font-heading text-headline-md text-ink">
        Related products
      </h2>
      <ProductGrid products={products} columnsClassName="grid-cols-2 lg:grid-cols-4" />
    </section>
  );
}
