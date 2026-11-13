"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FiltersPanel } from "@/components/catalog/FiltersPanel";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { EMPTY_FILTERS, filterProducts, type CatalogFilters } from "@/lib/catalog";
import { catalogProducts } from "@/lib/fixtures/products";

type Props = {
  initial: CatalogFilters;
  onApply: (filters: CatalogFilters) => void;
  onClose: () => void;
};

/**
 * Filter sheet below lg. Uses the native <dialog> (showModal) for focus trapping,
 * Escape to close and focus return. Edits a draft; "Show results" applies it.
 * Mount it only while open so the draft always starts from the URL state.
 */
export function FilterDrawer({ initial, onApply, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(initial);
  const count = filterProducts(catalogProducts, draft).length;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="filter-drawer-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) ref.current?.close();
      }}
      className="m-0 mt-auto flex max-h-[90dvh] w-full max-w-none flex-col overflow-hidden rounded-t-2xl bg-card p-0 text-ink shadow-overlay backdrop:bg-ink/40 md:mt-0 md:ms-auto md:h-dvh md:max-h-none md:w-96 md:rounded-none md:rounded-s-2xl"
    >
      <div className="flex items-center justify-between border-b border-line/30 px-5 py-3">
        <h2 id="filter-drawer-title" className="font-heading text-headline-sm">
          Filters
        </h2>
        <IconButton label="Close filters" onClick={() => ref.current?.close()}>
          <X size={22} strokeWidth={2} />
        </IconButton>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <FiltersPanel filters={draft} onChange={setDraft} idPrefix="drawer" />
      </div>
      <div className="flex gap-3 border-t border-line/30 px-5 py-3">
        <Button variant="outline" onClick={() => setDraft({ ...EMPTY_FILTERS, q: draft.q })}>
          Reset
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            onApply(draft);
            ref.current?.close();
          }}
        >
          Show {count} {count === 1 ? "result" : "results"}
        </Button>
      </div>
    </dialog>
  );
}
