import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-14 text-center shadow-card">
      <span className="flex size-14 items-center justify-center rounded-full bg-surface-1 text-ink-slate">
        <SearchX size={28} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-heading text-headline-md text-ink">No products found</h2>
      <p className="mt-2 max-w-md text-body-md text-ink-slate">
        {query ? `Nothing matches “${query}” with the current filters.` : "Nothing matches the current filters."} Try removing a
        filter or searching with different words.
      </p>
      <Button className="mt-6" onClick={onClear}>
        Clear all filters
      </Button>
    </div>
  );
}
