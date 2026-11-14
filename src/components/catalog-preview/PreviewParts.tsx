import Link from "next/link";
import { CloudOff, PackageSearch, ServerCrash, TriangleAlert } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { formatHalalas } from "@/lib/catalog-api/money";
import type { CatalogResult } from "@/lib/catalog-api/client";
import type { ApiAvailability, ApiProduct } from "@/lib/catalog-api/types";

export const PREVIEW_PATH = "/catalog-preview";

/** Always shown on preview pages so testers can tell this is live POS data, not the demo catalogue. */
export function PreviewBanner() {
  return (
    <aside
      data-testid="catalog-source-banner"
      aria-label="Catalogue source"
      className="mb-6 rounded-2xl border border-brand/30 bg-brand-soft px-5 py-4 text-body-sm text-ink"
    >
      <p className="text-label-lg text-brand">Live POS catalogue preview (read-only)</p>
      <p className="mt-1 text-ink-slate">
        These products come from the MerchantOS POS backend, not from the demo catalogue. Prices are in SAR and exclude
        VAT. They cannot be added to the cart or purchased here.
      </p>
    </aside>
  );
}

const availabilityText: Record<ApiAvailability, { label: string; tone: BadgeTone }> = {
  "in-stock": { label: "In stock", tone: "brand" },
  "low-stock": { label: "Low stock", tone: "warning" },
  "out-of-stock": { label: "Out of stock", tone: "danger" },
};

export function AvailabilityBadge({ availability }: { availability: ApiAvailability }) {
  const { label, tone } = availabilityText[availability];
  return (
    <Badge tone={tone} data-testid="availability" data-availability={availability}>
      {label}
    </Badge>
  );
}

export function ApiPrice({ halalas, size = "md" }: { halalas: number; size?: "md" | "lg" }) {
  return (
    <div>
      <p
        className={`font-heading text-brand tabular-nums ${size === "lg" ? "text-price-lg" : "text-price-md"}`}
        data-testid="api-price"
        data-halalas={halalas}
      >
        {formatHalalas(halalas)} <span className="text-label-md text-ink-slate">SAR</span>
      </p>
      <p className="text-label-sm font-normal text-ink-muted">Excludes VAT</p>
    </div>
  );
}

export function ApiProductCard({ product }: { product: ApiProduct }) {
  return (
    <li>
      <article data-testid="api-product-card" className="flex h-full flex-col gap-3 rounded-2xl bg-card p-5 shadow-card">
        <p className="text-label-md text-ink-muted">{product.category.label}</p>
        <h2 className="font-heading text-headline-sm text-ink">
          <Link href={`${PREVIEW_PATH}/${product.slug}`} className="hover:text-brand">
            {product.name}
          </Link>
        </h2>
        <ApiPrice halalas={product.priceHalalas} />
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <AvailabilityBadge availability={product.availability} />
          <Link href={`${PREVIEW_PATH}/${product.slug}`} className="text-label-lg text-brand underline">
            View details
          </Link>
        </div>
      </article>
    </li>
  );
}

type NoticeKind = Exclude<CatalogResult<unknown>["status"], "ok"> | "empty";

const notices: Record<NoticeKind, { title: string; body: string; retry: boolean; Icon: typeof CloudOff }> = {
  disabled: {
    title: "Live catalogue preview is off",
    body: "This storefront is using its demo catalogue. The preview needs the API catalogue source to be enabled on the server.",
    retry: false,
    Icon: PackageSearch,
  },
  misconfigured: {
    title: "Live catalogue is not configured correctly",
    body: "The server's catalogue settings are invalid, so nothing was loaded. The demo catalogue has not been substituted.",
    retry: false,
    Icon: TriangleAlert,
  },
  unavailable: {
    title: "The live catalogue is unavailable",
    body: "We couldn't reach the product service. No products are shown, and the demo catalogue has not been substituted.",
    retry: true,
    Icon: CloudOff,
  },
  "rate-limited": {
    title: "Too many requests",
    body: "The product service asked us to slow down. Please wait a moment and try again.",
    retry: true,
    Icon: ServerCrash,
  },
  "invalid-response": {
    title: "The catalogue response couldn't be used",
    body: "The product service returned data in an unexpected format, so nothing is shown.",
    retry: true,
    Icon: TriangleAlert,
  },
  "invalid-request": {
    title: "That request isn't valid",
    body: "The search or page you asked for isn't supported. Clear the search and try again.",
    retry: false,
    Icon: TriangleAlert,
  },
  "not-found": {
    title: "Product not found",
    body: "No published product matches this link.",
    retry: false,
    Icon: PackageSearch,
  },
  empty: {
    title: "No products to show",
    body: "The live catalogue has no published products matching this view.",
    retry: false,
    Icon: PackageSearch,
  },
};

export function PreviewNotice({ kind, retryHref }: { kind: NoticeKind; retryHref?: string }) {
  const { title, body, retry, Icon } = notices[kind];
  return (
    <div
      role="status"
      data-testid="preview-notice"
      data-kind={kind}
      className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-card px-6 py-14 text-center shadow-card"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-surface-2 text-ink-slate">
        <Icon size={30} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-heading text-headline-lg text-ink">{title}</h2>
      <p className="mt-2 text-body-md text-ink-slate">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {retry && retryHref ? (
          <ButtonLink href={retryHref} size="lg">
            Try again
          </ButtonLink>
        ) : null}
        <ButtonLink href="/products" variant="outline" size="lg">
          Browse the demo catalogue
        </ButtonLink>
      </div>
    </div>
  );
}
