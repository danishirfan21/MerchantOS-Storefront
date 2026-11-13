import type { ReactNode } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

type ProductGridProps = {
  products: Product[];
  /** Per-product action area. */
  renderActions?: (product: Product) => ReactNode;
  /** Override the column rules (e.g. beside a sidebar). Defaults: 2 / md 3 / xl 4. */
  columnsClassName?: string;
  className?: string;
};

export function ProductGrid({
  products,
  renderActions,
  columnsClassName = "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  className,
}: ProductGridProps) {
  return (
    <ul className={cn("grid gap-4 md:gap-5 xl:gap-6", columnsClassName, className)}>
      {products.map((product) => (
        <li key={product.id} className="relative min-w-0">
          <ProductCard product={product} actions={renderActions?.(product)} />
        </li>
      ))}
    </ul>
  );
}
