"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

type HeaderSearchProps = {
  className?: string;
  /** Show the attached "Search" button (desktop). */
  withButton?: boolean;
  inputId?: string;
  /** Called after a search navigates (lets the mobile panel close). */
  onSearched?: () => void;
};

/**
 * Shared search field. Submitting opens the catalog with `?q=`; the catalog
 * reads the query from the URL. Without JavaScript the GET form does the same.
 */
export function HeaderSearch({ className, withButton, inputId, onSearched }: HeaderSearchProps) {
  const router = useRouter();

  return (
    <form
      role="search"
      action="/products"
      method="get"
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
        onSearched?.();
      }}
    >
      <div className="flex items-center gap-2">
        <Input
          id={inputId}
          type="search"
          name="q"
          label="Search products"
          hideLabel
          placeholder="Search smartphones, laptops, audio..."
          leadingIcon={<Search size={20} strokeWidth={2} />}
          wrapperClassName="min-w-0 flex-1"
        />
        {withButton ? (
          <button
            type="submit"
            className="h-(--control-md) shrink-0 rounded-lg bg-brand px-5 text-label-lg font-heading text-brand-on transition-colors hover:bg-brand-hover"
          >
            Search
          </button>
        ) : null}
      </div>
    </form>
  );
}
