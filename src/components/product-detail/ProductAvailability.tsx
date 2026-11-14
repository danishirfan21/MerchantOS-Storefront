import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

/** Availability text from fixture stock data. Sample data, not live inventory. */
export function ProductAvailability({
  product,
  className,
}: {
  product: Pick<Product, "stock" | "stockCount">;
  className?: string;
}) {
  const { stock, stockCount } = product;
  const label =
    stock === "out-of-stock"
      ? "Out of stock"
      : stock === "low-stock"
        ? stockCount
          ? `Only ${stockCount} left`
          : "Low stock"
        : "In stock";
  const tone = stock === "out-of-stock" ? "bg-ink-subtle" : stock === "low-stock" ? "bg-danger" : "bg-brand";

  return (
    <p className={cn("flex items-center gap-2 text-label-lg text-ink", className)}>
      <span aria-hidden="true" className={cn("size-2.5 rounded-full", tone)} />
      {label}
    </p>
  );
}
