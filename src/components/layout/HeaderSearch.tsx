"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

type HeaderSearchProps = {
  className?: string;
  /** Show the attached "Search" button (desktop). */
  withButton?: boolean;
  inputId?: string;
};

/**
 * Search field. Catalog search does not exist yet, so submitting shows an
 * honest status message instead of navigating to a missing page.
 */
export function HeaderSearch({ className, withButton, inputId }: HeaderSearchProps) {
  const [notice, setNotice] = useState("");

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        setNotice("Product search opens with the catalog.");
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
          onChange={() => notice && setNotice("")}
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
      <p role="status" className={cn("absolute start-0 top-full z-10 mt-1 text-label-md text-ink-slate", !notice && "sr-only")}>
        {notice}
      </p>
    </form>
  );
}
