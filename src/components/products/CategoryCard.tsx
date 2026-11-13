import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { PENDING_HINT } from "@/lib/navigation";

export type Category = {
  slug: string;
  name: string;
  /** Short descriptor under the name. */
  description: string;
  icon: LucideIcon;
  /** Set when the category page exists; otherwise the card renders disabled. */
  href?: string;
};

const card =
  "group flex h-full flex-col items-center rounded-xl bg-card p-4 text-center shadow-card transition-shadow";
const tile =
  "mb-3 flex size-14 items-center justify-center rounded-xl bg-surface-1 text-brand transition-colors";

function Content({ category }: { category: Category }) {
  const Icon = category.icon;
  return (
    <>
      <span className={cn(tile, "group-hover:bg-brand group-hover:text-brand-on")}>
        <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="font-heading text-label-lg text-ink">{category.name}</span>
      <span className="mt-0.5 text-label-sm font-normal normal-case tracking-normal text-ink-slate">{category.description}</span>
    </>
  );
}

/** Department tile. Renders as a link once `href` is set, a disabled tile before that. */
export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  if (category.href) {
    return (
      <Link href={category.href} className={cn(card, "hover:shadow-raised", className)}>
        <Content category={category} />
      </Link>
    );
  }
  return (
    <div role="link" aria-disabled="true" title={PENDING_HINT} className={cn(card, "cursor-not-allowed opacity-70", className)}>
      <Content category={category} />
    </div>
  );
}
