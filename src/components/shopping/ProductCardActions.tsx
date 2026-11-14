import { SlidersHorizontal } from "lucide-react";
import { AddToCartButton } from "@/components/shopping/AddToCartButton";
import { ButtonLink } from "@/components/ui/Button";
import { isPurchasable } from "@/lib/products";
import type { Product } from "@/types/product";

/**
 * Default card action. Products with variants send the shopper to the detail page to choose,
 * so nothing is added with a configuration they did not see.
 */
export function ProductCardActions({ product, href }: { product: Product; href: string }) {
  if (product.variants?.length && isPurchasable(product)) {
    return (
      <ButtonLink
        href={href}
        fullWidth
        size="sm"
        variant="tonal"
        aria-label={`Choose options for ${product.name}`}
        leadingIcon={<SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />}
      >
        Choose options
      </ButtonLink>
    );
  }
  return <AddToCartButton product={product} />;
}
