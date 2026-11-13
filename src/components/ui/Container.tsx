import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Centered page container: max 1280px with a responsive inline gutter. */
export function Container({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-page px-(--page-gutter)", className)} {...rest} />;
}
