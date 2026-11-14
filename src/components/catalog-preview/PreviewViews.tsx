import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { loadApiProduct, loadApiProducts } from "@/lib/catalog-api/client";
import {
  ApiPrice,
  ApiProductCard,
  AvailabilityBadge,
  PREVIEW_PATH,
  PreviewBanner,
  PreviewNotice,
} from "@/components/catalog-preview/PreviewParts";

const PAGE_SIZE = 12;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pageQuery(search: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page > 1) params.set("page", String(page));
  const text = params.toString();
  return text ? `?${text}` : "";
}

/** Server Component: fetches the live POS catalogue on the server and renders it read-only. */
export async function PreviewList({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const search = single(params.search)?.trim() || undefined;
  const rawPage = single(params.page);
  const page = rawPage && /^\d{1,4}$/.test(rawPage) ? Number(rawPage) : 1;

  const result = await loadApiProducts({ search, page, pageSize: PAGE_SIZE });
  const retryHref = `${PREVIEW_PATH}${pageQuery(search, page)}`;

  return (
    <>
      <PreviewBanner />
      <header className="mb-6">
        <h1 className="font-heading text-headline-xl text-ink">Live catalogue preview</h1>
        <form method="get" action={PREVIEW_PATH} role="search" className="mt-4 flex max-w-md gap-2">
          <label htmlFor="preview-search" className="sr-only">
            Search the live catalogue
          </label>
          <input
            id="preview-search"
            name="search"
            type="search"
            maxLength={64}
            defaultValue={search ?? ""}
            placeholder="Search live products"
            className="min-w-0 flex-1 rounded-xl border border-line bg-card px-4 py-2.5 text-body-md"
          />
          <button type="submit" className="rounded-xl bg-brand px-4 py-2.5 text-label-lg text-brand-on">
            Search
          </button>
        </form>
      </header>

      {result.status !== "ok" ? (
        <PreviewNotice kind={result.status} retryHref={retryHref} />
      ) : result.data.items.length === 0 ? (
        <PreviewNotice kind="empty" />
      ) : (
        <>
          <p role="status" className="mb-4 text-label-md text-ink-slate" data-testid="api-count">
            {result.data.total} live {result.data.total === 1 ? "product" : "products"}
          </p>
          <ul aria-label="Live products" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.items.map((product) => (
              <ApiProductCard key={product.slug} product={product} />
            ))}
          </ul>
          {result.data.total > result.data.page * result.data.pageSize ? (
            <p className="mt-6">
              <Link href={`${PREVIEW_PATH}${pageQuery(search, result.data.page + 1)}`} className="text-label-lg text-brand underline">
                Next page
              </Link>
            </p>
          ) : null}
        </>
      )}
    </>
  );
}

export async function PreviewDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadApiProduct(slug);
  const trail = (label: string) => [
    { label: "Home", href: "/" },
    { label: "Live catalogue preview", href: PREVIEW_PATH },
    { label },
  ];

  if (result.status !== "ok") {
    return (
      <>
        <Breadcrumb items={trail("Product")} className="mb-5" />
        <PreviewBanner />
        <PreviewNotice kind={result.status} retryHref={`${PREVIEW_PATH}/${encodeURIComponent(slug)}`} />
      </>
    );
  }

  const product = result.data;
  return (
    <>
      <Breadcrumb items={trail(product.name)} className="mb-5" />
      <PreviewBanner />
      <article data-testid="api-product-detail" className="grid gap-8 rounded-2xl bg-card p-6 shadow-card md:p-10">
        <div>
          <p className="text-label-md text-ink-muted">{product.category.label}</p>
          <h1 className="mt-1 font-heading text-headline-xl text-ink">{product.name}</h1>
          <div className="mt-5">
            <ApiPrice halalas={product.priceHalalas} size="lg" />
          </div>
          <p className="mt-4">
            <AvailabilityBadge availability={product.availability} />
          </p>
          <p data-testid="read-only-note" className="mt-6 max-w-xl rounded-xl bg-surface-1 p-4 text-body-sm text-ink-slate">
            Read-only preview. This product is not available to add to the cart or to buy in this storefront yet.
          </p>
          <p className="mt-6">
            <Link href={PREVIEW_PATH} className="text-label-lg text-brand underline">
              Back to the live catalogue
            </Link>
          </p>
        </div>
      </article>
    </>
  );
}
