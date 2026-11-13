import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "@/lib/catalog";

type Props = { value: SortKey; onChange: (value: SortKey) => void; id: string };

/** Native select: accessible and touch-friendly by default. */
export function SortSelect({ value, onChange, id }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-label-md text-ink-slate max-sm:sr-only">
        Sort by
      </label>
      <div className="relative min-w-0 flex-1">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as SortKey)}
          className="h-(--control-md) w-full appearance-none rounded-lg bg-surface-1 ps-3 pe-9 text-label-lg text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} strokeWidth={2} aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-ink-slate" />
      </div>
    </div>
  );
}
