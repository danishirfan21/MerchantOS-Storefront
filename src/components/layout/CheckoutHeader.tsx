import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { HOME_HREF } from "@/lib/navigation";

type CheckoutHeaderProps = {
  /** Where the back link goes. Defaults to the storefront home. */
  backHref?: string;
  backLabel?: string;
  /** Short page label shown beside the logo, e.g. "Checkout". */
  title?: string;
};

/**
 * Simplified header for checkout and order confirmation: branding and one way
 * back. No category navigation, search, account or cart, to keep focus on the task.
 */
export function CheckoutHeader({ backHref = HOME_HREF, backLabel = "Back to store", title = "Checkout" }: CheckoutHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/95 shadow-[0_1px_8px_rgb(11_28_48/0.05)] backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Logo />
          <span aria-hidden="true" className="hidden h-6 w-px bg-line/50 sm:block" />
          <p className="hidden font-heading text-headline-sm text-ink sm:block">{title}</p>
        </div>
        <Link
          href={backHref}
          className="inline-flex h-(--touch-min) items-center gap-2 rounded-lg px-3 text-label-lg text-ink-muted transition-colors hover:bg-surface-1 hover:text-ink"
        >
          <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" className="rtl:rotate-180" />
          {backLabel}
        </Link>
      </Container>
    </header>
  );
}
