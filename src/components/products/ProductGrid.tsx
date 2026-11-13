import type { ReactNode } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

type ProductGridProps = {
  products: Product[];
  /** Per-product action area. */
  renderActions?: (product: Product) => ReactNode;
  className?: string;
};

/** Responsive grid: 2 columns on mobile, 3 from md, 4 from xl. */
export function ProductGrid({ products, renderActions, className }: ProductGridProps) {
  return (
    <ul className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 xl:gap-6", className)}>
      {products.map((product) => (
        <li key={product.id} className="relative min-w-0">
          <ProductCard product={product} actions={renderActions?.(product)} />
        </li>
      ))}
    </ul>
  );
}
