import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type InputProps = Omit<ComponentProps<"input">, "size"> & {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  /** Hide the visible label but keep it for assistive technology. */
  hideLabel?: boolean;
  wrapperClassName?: string;
};

export function Input({
  label,
  hint,
  error,
  leadingIcon,
  hideLabel,
  wrapperClassName,
  className,
  id,
  disabled,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label ? (
        <label htmlFor={inputId} className={cn("text-label-md text-ink-muted", hideLabel && "sr-only")}>
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          "flex h-(--control-md) items-center gap-2 rounded-lg bg-surface-1 px-3 transition-shadow",
          "focus-within:ring-2 focus-within:ring-brand",
          error && "ring-2 ring-danger focus-within:ring-danger",
          disabled && "bg-surface-2 opacity-70",
        )}
      >
        {leadingIcon ? (
          <span aria-hidden="true" className="flex shrink-0 text-ink-subtle">
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-body-md text-ink outline-none placeholder:text-ink-subtle disabled:cursor-not-allowed",
            className,
          )}
          {...rest}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-label-md text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-label-md font-normal text-ink-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
