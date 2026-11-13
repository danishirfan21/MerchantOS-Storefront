import { ImageOff } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ImagePlaceholderProps = {
  /** Accessible description of what image will eventually appear here. */
  label: string;
  /** Icon shown in the well; defaults to a neutral "no image" glyph. */
  icon?: ReactNode;
  /** Show the label as visible text (large panels). */
  showLabel?: boolean;
  className?: string;
};

/**
 * Clearly temporary stand-in for authorized product imagery. Keeps the layout
 * and aspect ratios of the approved design until real assets are supplied.
 */
export function ImagePlaceholder({ label, icon, showLabel, className }: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={cn(
        "flex size-full flex-col items-center justify-center gap-2 bg-surface-1 text-ink-subtle/70",
        className,
      )}
    >
      <span aria-hidden="true" className="flex">
        {icon ?? <ImageOff size={36} strokeWidth={1.5} />}
      </span>
      {showLabel ? (
        <span className="px-4 text-center text-label-md font-medium text-ink-subtle">Image placeholder · {label}</span>
      ) : null}
    </div>
  );
}
