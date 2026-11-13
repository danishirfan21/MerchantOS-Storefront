import { Flame, Tv } from "lucide-react";
import { ProductPrice } from "@/components/products/ProductPrice";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { deal } from "@/lib/fixtures/home";
import { PENDING_HINT } from "@/lib/navigation";

/** Deal banner. No countdown or stock progress: there is no real deal data behind it. */
export function DealOfTheDay() {
  return (
    <section aria-labelledby="deal-title" className="pb-12 md:pb-16">
      <Container>
        <div className="grid items-center gap-6 overflow-hidden rounded-2xl border border-line/20 bg-card p-5 sm:p-8 lg:grid-cols-2 lg:gap-10 lg:p-10">
          <div>
            <Badge tone="danger" className="uppercase">
              <Flame size={12} strokeWidth={2.5} aria-hidden="true" /> Deal of the day
            </Badge>
            <h2 id="deal-title" className="mt-3 font-heading text-headline-xl text-ink">
              {deal.title}
            </h2>
            <p className="mt-3 max-w-lg text-body-md text-ink-slate sm:text-body-lg">{deal.description}</p>
            <ProductPrice price={deal.price} compareAtPrice={deal.compareAtPrice} size="lg" className="mt-5" />
            <p className="mt-1 text-label-md font-normal text-ink-slate">{deal.note}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button disabled title={PENDING_HINT}>
                View deal
              </Button>
              <Button variant="tonal" disabled title={PENDING_HINT}>
                View specifications
              </Button>
            </div>
          </div>
          <div className="h-52 overflow-hidden rounded-xl sm:h-64 lg:h-72">
            <ImagePlaceholder label="65-inch television in a living room" icon={<Tv size={56} strokeWidth={1.25} />} showLabel />
          </div>
        </div>
      </Container>
    </section>
  );
}
