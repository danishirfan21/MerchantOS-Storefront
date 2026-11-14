import { slugify } from "@/lib/products";
import type { SpecGroup } from "@/types/product";

export function ProductSpecifications({ groups }: { groups: SpecGroup[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {groups.map((group) => {
        const id = `spec-${slugify(group.title)}`;
        return (
          <section key={group.title} aria-labelledby={id}>
            <h3 id={id} className="mb-2 text-label-md font-semibold uppercase tracking-wide text-brand">
              {group.title}
            </h3>
            <dl className="flex flex-col gap-1.5">
              {group.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap justify-between gap-x-4 rounded-lg bg-surface-1 px-4 py-3 text-body-sm"
                >
                  <dt className="text-ink-slate">{row.label}</dt>
                  <dd className="min-w-0 text-end font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
