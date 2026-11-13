import { Headset } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PENDING_HINT } from "@/lib/navigation";

/** Closing support band. Contact channels are not live, so the actions are disabled. */
export function SupportBand() {
  return (
    <section aria-labelledby="support-title">
      <Container>
        <div className="flex flex-col gap-5 rounded-2xl bg-surface-1 p-5 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-on shadow-brand">
              <Headset size={24} strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <h2 id="support-title" className="font-heading text-headline-sm text-ink">
                Need help choosing?
              </h2>
              <p className="mt-1 max-w-xl text-body-md text-ink-slate">
                Talk to a product advisor about devices, bulk orders or financing. Support channels open with the
                customer-care release.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" disabled title={PENDING_HINT}>
              Call support
            </Button>
            <Button disabled title={PENDING_HINT}>
              Message an advisor
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
