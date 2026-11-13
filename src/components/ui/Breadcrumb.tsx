import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/cn";

export type BreadcrumbItem = {
  label: string;
  /** Omit for the current page. */
  href?: string;
};

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-label-md text-ink-slate">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex items-center">
                {item.href && !isLast ? (
                  <Link href={item.href} className="rounded-sm transition-colors hover:text-brand">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined} className={cn(isLast && "text-ink")}>
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast ? (
                <li aria-hidden="true" className="flex items-center text-ink-subtle">
                  <ChevronRight size={14} strokeWidth={2} className="rtl:rotate-180" />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
