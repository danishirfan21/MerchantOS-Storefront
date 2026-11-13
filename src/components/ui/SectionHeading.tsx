import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Heading level to render; visual size is controlled by `size`. */
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "lg" | "md";
  /** Optional trailing content such as a link or a count. */
  actions?: ReactNode;
  className?: string;
  /** Id placed on the heading element, for aria-labelledby. */
  id?: string;
};

const sizeClass = {
  xl: "text-headline-xl",
  lg: "text-headline-lg",
  md: "text-headline-md",
};

export function SectionHeading({
  title,
  eyebrow,
  description,
  as: Tag = "h2",
  size = "lg",
  actions,
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-2", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-label-sm font-semibold uppercase text-brand">{eyebrow}</p>
        ) : null}
        <Tag id={id} className={cn("font-heading text-ink", sizeClass[size])}>{title}</Tag>
        {description ? <p className="mt-1 max-w-prose text-body-md text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
