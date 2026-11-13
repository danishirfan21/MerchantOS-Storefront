import Link from "next/link";
import { Store } from "lucide-react";
import { cn } from "@/lib/cn";
import { HOME_HREF } from "@/lib/navigation";

/**
 * Text wordmark with an icon tile. The real logo asset has not been supplied
 * (the Stitch export's logo image is broken), so this is an interim mark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={HOME_HREF}
      aria-label="MerchantOS Storefront home"
      className={cn("flex min-h-(--touch-min) shrink-0 items-center gap-2.5 rounded-lg", className)}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-brand-on shadow-brand">
        <Store size={20} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="flex flex-col">
        <span className="font-heading text-headline-sm leading-none font-bold tracking-tight text-ink">
          Merchant<span className="text-brand">OS</span>
        </span>
        <span className="mt-0.5 text-label-sm leading-none tracking-wide text-ink-slate uppercase">Storefront</span>
      </span>
    </Link>
  );
}
