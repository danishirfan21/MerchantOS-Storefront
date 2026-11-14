import type { ReactNode } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductCardActions } from "@/components/shopping/ProductCardActions";
import { WishlistButton } from "@/components/shopping/WishlistButton";
import { cn } from "@/lib/cn";
import { productPath } from "@/lib/products";
import type { Product } from "@/types/product";

type ProductGridProps = {
  products: Product[];
  /** Per-product action area. Defaults to add to cart, or Choose options for variant products. */
  renderActions?: (product: Product) => ReactNode;
  /** Image-corner control. Defaults to the wishlist heart. */
  renderMediaAction?: (product: Product) => ReactNode;
  /** Detail link per product (e.g. to carry catalog filters). Defaults to each product's page. */
  hrefFor?: (product: Product) => string | undefined;
  /** Override the column rules (e.g. beside a sidebar). Defaults: 2 / md 3 / xl 4. */
  columnsClassName?: string;
  className?: string;
};

export function ProductGrid({
  products,
  renderActions,
  renderMediaAction,
  hrefFor,
  columnsClassName = "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  className,
}: ProductGridProps) {
  return (
    <ul className={cn("grid gap-4 md:gap-5 xl:gap-6", columnsClassName, className)}>
      {products.map((product) => {
        const href = hrefFor?.(product) ?? productPath(product);
        return (
          <li key={product.id} className="relative min-w-0">
            <ProductCard
              product={product}
              href={href}
              actions={renderActions ? renderActions(product) : <ProductCardActions product={product} href={href} />}
              mediaAction={renderMediaAction ? renderMediaAction(product) : <WishlistButton product={product} />}
            />
          </li>
        );
      })}
    </ul>
  );
}
