import Link from "next/link";
import type { ReactNode } from "react";
import { ProductPrice } from "@/components/products/ProductPrice";
import { Badge } from "@/components/ui/Badge";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  /** Action area (add to cart, wishlist...) supplied by the page that owns that state. */
  actions?: ReactNode;
  className?: string;
};

function StockLine({ product }: { product: Product }) {
  if (product.stock === "out-of-stock") {
    return <p className="text-label-md text-ink-slate">Out of stock</p>;
  }
  if (product.stock === "low-stock") {
    return (
      <p className="text-label-md text-danger">
        {product.stockCount ? `Only ${product.stockCount} left` : "Low stock"}
      </p>
    );
  }
  return <p className="text-label-md text-brand">In stock</p>;
}

/**
 * Presentational product card. Without an authorized image it shows a neutral
 * placeholder; it never loads remote Stitch images.
 */
export function ProductCard({ product, actions, className }: ProductCardProps) {
  const titleId = `product-${product.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-card transition-shadow hover:shadow-raised",
        className,
      )}
    >
      <div className="relative aspect-4/3 bg-surface-1">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote image config arrives with real assets
          <img src={product.imageUrl} alt="" className="size-full object-contain p-4" />
        ) : (
          <ImagePlaceholder label={product.name} />
        )}
        {product.badge ? (
          <Badge tone="brand" className="absolute start-3 top-3">
            {product.badge}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <p className="text-label-sm font-semibold uppercase text-ink-slate">{product.brand}</p>
        <h3 id={titleId} className="font-heading text-body-lg font-semibold sm:text-headline-sm line-clamp-2 text-ink">
          {product.href ? (
            <Link href={product.href} className="after:absolute after:inset-0 hover:text-brand">
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>
        {product.spec ? <p className="line-clamp-2 text-body-sm text-ink-slate">{product.spec}</p> : null}
        <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} className="mt-auto pt-2" />
        <StockLine product={product} />
        {actions ? <div className="relative z-10 mt-2">{actions}</div> : null}
      </div>
    </article>
  );
}
