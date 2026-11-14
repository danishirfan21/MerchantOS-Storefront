"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Product name, to give each stepper on a page a unique accessible name. */
  subject?: string;
  className?: string;
};

const stepper =
  "flex size-(--touch-min) items-center justify-center text-ink transition-colors hover:bg-surface-1 disabled:pointer-events-none disabled:text-ink-subtle/60";

/** Stepper with a minimum of 1 and a stock-derived maximum. */
export function QuantitySelector({ value, min = 1, max, onChange, disabled, subject, className }: Props) {
  const suffix = subject ? ` for ${subject}` : "";
  return (
    <div
      role="group"
      aria-label={`Quantity${suffix}`}
      className={cn("inline-flex items-center overflow-hidden rounded-lg border border-line/60 bg-card", className)}
    >
      <button
        type="button"
        className={stepper}
        aria-label={`Decrease quantity${suffix}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={18} strokeWidth={2} aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        aria-label={`Selected quantity${suffix}`}
        className="min-w-10 text-center text-label-lg tabular-nums text-ink"
      >
        {disabled ? 0 : value}
      </output>
      <button
        type="button"
        className={stepper}
        aria-label={`Increase quantity${suffix}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={18} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
