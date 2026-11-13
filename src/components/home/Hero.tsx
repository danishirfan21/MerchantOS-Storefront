import { ArrowRight, MapPin, Smartphone, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ProductPrice } from "@/components/products/ProductPrice";
import { PENDING_HINT } from "@/lib/navigation";

/** Flagship hero. Primary CTA scrolls to the featured products; comparison does not exist yet. */
export function Hero() {
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line/20 bg-card p-5 sm:p-8 lg:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -end-24 size-72 rounded-full bg-brand-soft/30 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand" className="uppercase">Flagship spotlight</Badge>
          <span className="text-label-sm font-normal text-ink-slate">Titanium edition</span>
        </div>
        <h1 className="mt-3 max-w-xl font-heading text-display text-ink">Flagship Era Unleashed.</h1>
        <p className="mt-3 max-w-lg text-body-md text-ink-slate sm:text-body-lg">
          Titanium craftsmanship, satellite connectivity and next-generation intelligence, in one flagship.
        </p>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-label-sm uppercase text-ink-slate">Starting from</span>
          <ProductPrice price={4899} size="lg" />
        </div>
      </div>

      <div className="relative my-5 h-44 overflow-hidden rounded-xl sm:h-56 lg:my-6 lg:h-64">
        <ImagePlaceholder
          label="flagship smartphone, front and back"
          icon={<Smartphone size={56} strokeWidth={1.25} />}
          showLabel
        />
      </div>

      <div className="relative mt-auto flex flex-wrap items-center gap-3">
        <ButtonLink href="#featured" size="md" trailingIcon={<ArrowRight size={18} strokeWidth={2} className="rtl:rotate-180" />}>
          Explore flagships
        </ButtonLink>
        <Button variant="tonal" disabled title={PENDING_HINT} leadingIcon={<SlidersHorizontal size={18} strokeWidth={2} />}>
          Compare specs
        </Button>
        <span className="hidden items-center gap-1.5 text-label-md font-normal text-ink-slate sm:ms-auto sm:inline-flex">
          <MapPin size={14} strokeWidth={2} aria-hidden="true" className="text-brand" />
          Sample stock note
        </span>
      </div>
    </article>
  );
}
