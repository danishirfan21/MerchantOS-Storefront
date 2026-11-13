import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "dark" | "tonal" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-heading text-label-lg whitespace-nowrap select-none transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:bg-surface-2 disabled:text-ink-subtle disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:bg-surface-2 aria-disabled:text-ink-subtle aria-disabled:shadow-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-on shadow-brand hover:bg-brand-hover",
  dark: "bg-inverse text-brand-on hover:bg-ink",
  tonal: "bg-surface-1 text-brand hover:bg-surface-2",
  outline: "border border-line/60 bg-card text-ink hover:bg-surface-1",
  ghost: "text-ink-muted hover:bg-surface-1 hover:text-ink",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-(--control-sm) px-4",
  md: "h-(--control-md) px-5",
  lg: "h-(--control-lg) px-6 text-body-lg",
};

type Shared = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

function classes({ variant = "primary", size = "md", fullWidth, className }: Shared & { className?: string }) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

export type ButtonProps = Shared & Omit<ComponentProps<"button">, "children"> & { children: ReactNode };

export function Button({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={classes({ variant, size, fullWidth, className })} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

export type ButtonLinkProps = Shared & Omit<ComponentProps<typeof Link>, "children"> & { children: ReactNode };

/** A link styled as a button, for navigation that is not an action. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={classes({ variant, size, fullWidth, className })} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
