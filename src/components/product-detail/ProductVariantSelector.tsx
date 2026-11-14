"use client";

import { cn } from "@/lib/cn";
import type { VariantGroup } from "@/types/product";

type Props = {
  group: VariantGroup;
  selectedId: string;
  onSelect: (optionId: string) => void;
};

/** One variant group as a native radio group: arrow keys, labels and focus come for free. */
export function ProductVariantSelector({ group, selectedId, onSelect }: Props) {
  const selected = group.options.find((option) => option.id === selectedId);
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-label-lg text-ink">
        {group.label}: <span className="font-normal text-ink-slate">{selected?.label}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {group.options.map((option) => {
          const checked = option.id === selectedId;
          return (
            <label
              key={option.id}
              className={cn(
                "flex min-h-(--touch-min) cursor-pointer items-center rounded-lg border px-4 text-label-md transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
                checked ? "border-brand bg-brand-soft text-brand" : "border-line/60 bg-card text-ink hover:bg-surface-1",
              )}
            >
              <input
                type="radio"
                name={`variant-${group.id}`}
                value={option.id}
                checked={checked}
                onChange={() => onSelect(option.id)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
