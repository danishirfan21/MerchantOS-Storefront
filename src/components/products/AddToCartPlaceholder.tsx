import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PENDING_HINT } from "@/lib/navigation";
import type { Product } from "@/types/product";

/** Cart does not exist yet: an honest disabled action shared by every product grid. */
export function AddToCartPlaceholder({ product }: { product: Product }) {
  return (
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
  );
}
