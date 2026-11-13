import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Shared = {
  /** Required: icon-only controls need an accessible name. */
  label: string;
  children: ReactNode;
  variant?: "plain" | "surface" | "brand";
  className?: string;
  /** Small count/dot shown in the corner. */
  badge?: ReactNode;
};

const variants = {
  plain: "text-ink-muted hover:bg-surface-1 hover:text-ink",
  surface: "bg-card text-ink-muted shadow-card hover:text-ink",
  brand: "bg-brand text-brand-on hover:bg-brand-hover",
};

const base =
  "relative inline-flex size-(--touch-min) shrink-0 items-center justify-center rounded-lg transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-label-sm text-brand-on">
      {children}
    </span>
  );
}

export function IconButton({
  label,
  children,
  variant = "plain",
  badge,
  className,
  type = "button",
  ...rest
}: Shared & Omit<ComponentProps<"button">, keyof Shared>) {
  return (
    <button type={type} aria-label={label} className={cn(base, variants[variant], className)} {...rest}>
      <span aria-hidden="true" className="flex">
        {children}
      </span>
      {badge ? <Badge>{badge}</Badge> : null}
    </button>
  );
}

export function IconLink({
  label,
  children,
  variant = "plain",
  badge,
  className,
  ...rest
}: Shared & Omit<ComponentProps<typeof Link>, keyof Shared>) {
  return (
    <Link aria-label={label} className={cn(base, variants[variant], className)} {...rest}>
      <span aria-hidden="true" className="flex">
        {children}
      </span>
      {badge ? <Badge>{badge}</Badge> : null}
    </Link>
  );
}
