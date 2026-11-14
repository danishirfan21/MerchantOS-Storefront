"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseCatalogParams, toSearchString } from "@/lib/catalog";

/** Back to the catalog, restoring the filters the visitor came from (sanitized through the catalog parser). */
export function CatalogBackLink() {
  const params = useSearchParams();
  const from = params.get("from");
  const { filters, sort } = parseCatalogParams(new URLSearchParams(from ?? ""));
  const search = from ? toSearchString(filters, sort) : "";
  return (
    <Link
      href={`/products${search}`}
      className="inline-flex min-h-(--touch-min) items-center gap-2 text-label-lg text-brand hover:underline"
    >
      <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" className="rtl:rotate-180" />
      Back to catalog
    </Link>
  );
}
