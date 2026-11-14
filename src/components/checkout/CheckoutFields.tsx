import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { Input, type InputProps } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { CheckoutField } from "@/lib/checkout";

/** A text input tied to a checkout field: stable id, focus hook and required marker. */
export function TextField({
  field,
  label,
  required,
  ...rest
}: Omit<InputProps, "id" | "name" | "required"> & { field: CheckoutField; label: string; required?: boolean }) {
  return (
    <Input
      id={`checkout-${field}`}
      name={field}
      data-field={field}
      label={required ? `${label} (required)` : `${label} (optional)`}
      aria-required={required ? true : undefined}
      {...rest}
    />
  );
}

type SelectFieldProps = Omit<ComponentProps<"select">, "id" | "name" | "required"> & {
  field: CheckoutField;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function SelectField({ field, label, error, hint, className, children, ...rest }: SelectFieldProps) {
  const id = `checkout-${field}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-md text-ink-muted">
        {label} (required)
      </label>
      <div
        className={cn(
          "flex h-(--control-md) items-center rounded-lg bg-surface-1 px-3 focus-within:ring-2 focus-within:ring-brand",
          error && "ring-2 ring-danger focus-within:ring-danger",
        )}
      >
        <select
          id={id}
          name={field}
          data-field={field}
          aria-required
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("h-full min-w-0 flex-1 bg-transparent text-body-md text-ink outline-none", className)}
          {...rest}
        >
          {children}
        </select>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-label-md text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-label-md font-normal text-ink-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type Option = { id: string; label: string; description: string };

/**
 * A keyboard-operable radio group (native radios, arrow keys work). The first radio carries
 * the focus hook so a validation error can move focus into the group.
 */
export function RadioCardGroup({
  field,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  field: CheckoutField;
  legend: string;
  options: readonly Option[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const uid = useId();
  const errorId = `checkout-${field}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined} className="min-w-0">
      <legend className="mb-2 text-label-md text-ink-muted">{legend} (required)</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option, index) => (
          <label
            key={option.id}
            htmlFor={`${uid}-${option.id}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl bg-surface-1 p-4 transition-shadow",
              "has-checked:bg-surface-2 has-checked:ring-2 has-checked:ring-brand has-focus-visible:ring-2 has-focus-visible:ring-brand",
              error && !value && "ring-2 ring-danger",
            )}
          >
            <input
              id={`${uid}-${option.id}`}
              type="radio"
              name={field}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              data-field={index === 0 ? field : undefined}
              className="mt-0.5 size-5 shrink-0 accent-brand"
            />
            <span className="min-w-0">
              <span className="block text-label-lg font-semibold text-ink">{option.label}</span>
              <span className="mt-0.5 block text-label-md font-normal text-ink-slate">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={errorId} className="mt-2 text-label-md text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
