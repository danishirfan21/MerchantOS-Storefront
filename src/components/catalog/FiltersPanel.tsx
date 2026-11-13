import type { ReactNode } from "react";
import { BRANDS, CATEGORIES, PRICE_RANGES, STORAGE_OPTIONS, countFor, type CatalogFilters } from "@/lib/catalog";
import { cn } from "@/lib/cn";

type FiltersPanelProps = {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  /** Prefix keeps input ids unique when two panels exist in the DOM. */
  idPrefix: string;
};

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-2 font-heading text-label-lg text-ink">{title}</legend>
      <div className="flex flex-col">{children}</div>
    </fieldset>
  );
}

function Option({
  id,
  type,
  name,
  checked,
  onChange,
  label,
  count,
}: {
  id: string;
  type: "checkbox" | "radio";
  name?: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-(--touch-min) cursor-pointer items-center gap-3 rounded-lg px-2 text-body-md text-ink-muted transition-colors hover:bg-surface-1 has-focus-visible:outline-2 has-focus-visible:outline-brand",
        checked && "bg-brand-soft/40 text-ink",
        count === 0 && !checked && "opacity-50",
      )}
    >
      <input id={id} type={type} name={name} checked={checked} onChange={onChange} className="size-4 shrink-0 accent-brand" />
      <span className="min-w-0 flex-1">{label}</span>
      {count !== undefined ? <span className="text-label-md font-normal text-ink-subtle">{count}</span> : null}
    </label>
  );
}

const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

/** All filter controls, driven entirely by `filters`: the desktop sidebar and the drawer share it. */
export function FiltersPanel({ filters, onChange, idPrefix }: FiltersPanelProps) {
  // Storage only applies to devices that have it, so offer the options present in the current set.
  const storageOptions = STORAGE_OPTIONS.filter(
    (s) => filters.storage.includes(s) || countFor("storage", filters, (p) => p.storage === s) > 0,
  );

  return (
    <div className="flex flex-col gap-6">
      <FilterSection title="Category">
        <Option
          id={`${idPrefix}-cat-all`}
          type="radio"
          name={`${idPrefix}-category`}
          checked={!filters.category}
          onChange={() => onChange({ ...filters, category: undefined })}
          label="All categories"
        />
        {CATEGORIES.map((c) => (
          <Option
            key={c.slug}
            id={`${idPrefix}-cat-${c.slug}`}
            type="radio"
            name={`${idPrefix}-category`}
            checked={filters.category === c.slug}
            onChange={() => onChange({ ...filters, category: c.slug })}
            label={c.name}
            count={countFor("category", filters, (p) => p.category === c.slug)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Brand">
        {BRANDS.map((brand) => (
          <Option
            key={brand}
            id={`${idPrefix}-brand-${brand}`}
            type="checkbox"
            checked={filters.brands.includes(brand)}
            onChange={() => onChange({ ...filters, brands: toggle(filters.brands, brand) })}
            label={brand}
            count={countFor("brands", filters, (p) => p.brand === brand)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Price (SAR)">
        <Option
          id={`${idPrefix}-price-any`}
          type="radio"
          name={`${idPrefix}-price`}
          checked={!filters.price}
          onChange={() => onChange({ ...filters, price: undefined })}
          label="Any price"
        />
        {PRICE_RANGES.map((range) => (
          <Option
            key={range.id}
            id={`${idPrefix}-price-${range.id}`}
            type="radio"
            name={`${idPrefix}-price`}
            checked={filters.price === range.id}
            onChange={() => onChange({ ...filters, price: range.id })}
            label={range.label}
            count={countFor("price", filters, (p) => p.price >= range.min && p.price < range.max)}
          />
        ))}
      </FilterSection>

      {storageOptions.length > 0 ? (
        <FilterSection title="Storage">
          {storageOptions.map((value) => (
            <Option
              key={value}
              id={`${idPrefix}-storage-${value}`}
              type="checkbox"
              checked={filters.storage.includes(value)}
              onChange={() => onChange({ ...filters, storage: toggle(filters.storage, value) })}
              label={value}
              count={countFor("storage", filters, (p) => p.storage === value)}
            />
          ))}
        </FilterSection>
      ) : null}

      <FilterSection title="Availability">
        <Option
          id={`${idPrefix}-stock`}
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          label="In stock only"
          count={countFor("inStockOnly", filters, (p) => p.stock !== "out-of-stock")}
        />
      </FilterSection>
    </div>
  );
}
