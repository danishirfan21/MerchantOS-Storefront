import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "brand" | "neutral" | "danger" | "warning" | "dark";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-soft text-brand",
  neutral: "bg-surface-2 text-ink-slate",
  danger: "bg-danger-soft text-danger-ink",
  warning: "bg-warning-soft text-warning-ink",
  dark: "bg-inverse text-brand-on",
};

export function Badge({
  tone = "neutral",
  className,
  ...rest
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
