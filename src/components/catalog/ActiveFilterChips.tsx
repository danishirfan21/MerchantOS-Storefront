import { X } from "lucide-react";
import { activeFilterList, type CatalogFilters } from "@/lib/catalog";

type Props = { filters: CatalogFilters; onChange: (next: CatalogFilters) => void; onClear: () => void };

/** Removable chips for every applied filter (and the search query), plus Clear all. */
export function ActiveFilterChips({ filters, onChange, onClear }: Props) {
  const active = activeFilterList(filters);
  if (active.length === 0) return null;

  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
      {active.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() => onChange(chip.remove(filters))}
            aria-label={`Remove filter: ${chip.label}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-soft/60 ps-3 pe-2 text-label-md text-brand transition-colors hover:bg-brand-soft"
          >
            {chip.label}
            <X size={14} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </li>
      ))}
      <li>
        <button type="button" onClick={onClear} className="h-9 rounded-lg px-2 text-label-md text-brand underline-offset-2 hover:underline">
          Clear all
        </button>
      </li>
    </ul>
  );
}
