import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { discountPercent, formatAmount } from "@/lib/format";

type ProductPriceProps = {
  price: number;
  compareAtPrice?: number;
  size?: "md" | "lg";
  currency?: string;
  className?: string;
};

/** Price stack: current price, optional strike-through and discount pill. */
export function ProductPrice({ price, compareAtPrice, size = "md", currency = "SAR", className }: ProductPriceProps) {
  const discounted = compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <p className={cn("font-heading text-brand tabular-nums", size === "lg" ? "text-price-lg" : "text-price-md")}>
        {formatAmount(price)} <span className="text-label-md text-ink-slate">{currency}</span>
      </p>
      {discounted ? (
        <>
          <p className="text-body-sm text-ink-subtle tabular-nums line-through">
            <span className="sr-only">Was </span>
            {formatAmount(compareAtPrice)}
          </p>
          <Badge tone="danger">−{discountPercent(price, compareAtPrice)}%</Badge>
        </>
      ) : null}
    </div>
  );
}
