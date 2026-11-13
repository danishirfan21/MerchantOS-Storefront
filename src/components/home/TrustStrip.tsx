import { Container } from "@/components/ui/Container";
import { trustItems } from "@/lib/fixtures/home";

/** Four short service notes under the header (2 x 2 on mobile, one row from md). */
export function TrustStrip() {
  return (
    <section aria-label="Service highlights" className="pt-4 pb-6">
      <Container>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-2 rounded-xl border border-line/20 bg-card p-2.5 md:gap-3 md:p-4">
              <span className="flex size-9 shrink-0 md:size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-label-lg leading-tight text-ink">{title}</span>
                <span className="mt-0.5 block max-md:hidden text-label-sm font-normal normal-case tracking-normal text-ink-slate">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
