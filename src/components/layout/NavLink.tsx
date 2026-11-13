import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PENDING_HINT, type NavItem } from "@/lib/navigation";

type NavLinkProps = {
  item: NavItem;
  className?: string;
  /** Classes applied only to the disabled state. */
  disabledClassName?: string;
  children?: ReactNode;
};

/** Renders a link when the route exists, otherwise an honest disabled entry. */
export function NavLink({ item, className, disabledClassName, children }: NavLinkProps) {
  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {children ?? item.label}
      </Link>
    );
  }
  return (
    <span
      role="link"
      aria-disabled="true"
      title={PENDING_HINT}
      className={cn(className, "cursor-not-allowed opacity-60", disabledClassName)}
    >
      {children ?? item.label}
    </span>
  );
}
