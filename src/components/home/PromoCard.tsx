import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ProductPrice } from "@/components/products/ProductPrice";
import { cn } from "@/lib/cn";
import { PENDING_HINT } from "@/lib/navigation";
import type { PromoItem } from "@/lib/fixtures/home";

/** Secondary promotional card: image beside text on mobile, stacked from md. */
export function PromoCard({ promo }: { promo: PromoItem }) {
  const Icon = promo.icon;
  return (
    <article className="group flex h-full gap-4 rounded-2xl border border-line/20 bg-card p-4 transition-shadow hover:shadow-raised md:flex-col md:p-5">
      <div className="order-last w-24 shrink-0 self-center overflow-hidden rounded-xl sm:w-32 md:order-none md:h-32 md:w-full md:self-auto">
        <ImagePlaceholder label={promo.imageLabel} icon={<Icon size={32} strokeWidth={1.5} />} className="aspect-square md:aspect-auto" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col md:order-first">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-label-sm">
          <span className={cn("font-bold", promo.eyebrowTone === "danger" ? "text-danger" : "text-brand")}>{promo.eyebrow}</span>
          <span className="font-normal text-ink-slate">{promo.meta}</span>
        </div>
        <h3 className="font-heading text-headline-sm text-ink">{promo.title}</h3>
        <p className="mt-1 text-body-sm text-ink-slate">{promo.description}</p>
        <ProductPrice price={promo.price} compareAtPrice={promo.compareAtPrice} className="mt-2" />
        <span
          role="link"
          aria-disabled="true"
          title={PENDING_HINT}
          className="mt-auto inline-flex cursor-not-allowed items-center gap-1 pt-3 text-label-md text-brand opacity-60"
        >
          {promo.linkLabel} · soon
        </span>
      </div>
    </article>
  );
}
