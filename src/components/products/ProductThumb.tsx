import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { Product } from "@/types/product";

/** Small square product image, or the shared placeholder while no authorized image exists. */
export function ProductThumb({ product }: { product: Pick<Product, "name" | "imageUrl"> }) {
  return product.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- remote image config arrives with real assets
    <img src={product.imageUrl} alt="" className="size-full object-contain p-2" />
  ) : (
    <ImagePlaceholder label={product.name} />
  );
}
