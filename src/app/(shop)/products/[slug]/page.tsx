import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogBackLink } from "@/components/product-detail/CatalogBackLink";
import { ProductAvailability } from "@/components/product-detail/ProductAvailability";
import { ProductGallery, type GalleryImage } from "@/components/product-detail/ProductGallery";
import { ProductPurchasePanel } from "@/components/product-detail/ProductPurchasePanel";
import { ProductSpecifications } from "@/components/product-detail/ProductSpecifications";
import { RelatedProducts } from "@/components/product-detail/RelatedProducts";
import { ProductPrice } from "@/components/products/ProductPrice";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { categoryName } from "@/lib/catalog";
import {
  allProductSlugs,
  getProductBySlug,
  getRelatedProducts,
  productDescription,
  productHighlights,
  productSpecGroups,
} from "@/lib/products";
import type { Product } from "@/types/product";

/** Every catalogue product is prerendered; unknown slugs reach notFound() below. */
export function generateStaticParams() {
  return allProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: productDescription(product),
    alternates: { canonical: `/products/${slug}` },
  };
}

/** Honest placeholder gallery: distinct slots, never one image passed off as several angles. */
function galleryFor(product: Product): GalleryImage[] {
  if (product.imageUrl) return [{ id: "main", src: product.imageUrl, alt: product.name }];
  return [1, 2, 3, 4].map((n) => ({ id: `placeholder-${n}`, alt: `${product.name}, placeholder image ${n}` }));
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = categoryName(product.category) ?? product.category;
  const highlights = productHighlights(product);

  return (
    <Container className="pt-4 pb-12 md:pt-6 md:pb-16">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: category, href: `/products?category=${product.category}` },
          { label: product.name },
        ]}
      />
      <div className="mt-1">
        <Suspense fallback={<span className="inline-block min-h-(--touch-min)" />}>
          <CatalogBackLink />
        </Suspense>
      </div>

      <div className="mt-3 grid gap-6 md:grid-cols-2 md:items-start md:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <ProductGallery images={galleryFor(product)} />

        <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-card md:p-6">
          <header className="flex flex-col gap-3">
            <p className="flex flex-wrap items-center gap-2 text-label-sm font-semibold uppercase text-ink-slate">
              {product.brand}
              <span aria-hidden="true">·</span>
              {category}
              {product.badge ? <Badge tone="brand">{product.badge}</Badge> : null}
            </p>
            <h1 className="font-heading text-headline-xl text-ink">{product.name}</h1>
            {product.spec ? <p className="text-body-md text-ink-slate">{product.spec}</p> : null}
            <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
            <ProductAvailability product={product} />
          </header>
          <ProductPurchasePanel key={product.id} product={product} />
        </div>
      </div>

      <section aria-labelledby="overview-heading" className="mt-10 rounded-2xl bg-card p-5 shadow-card md:mt-12 md:p-8">
        <h2 id="overview-heading" className="font-heading text-headline-md text-ink">
          Product overview
        </h2>
        <p className="mt-3 max-w-3xl text-body-md text-ink-slate">{productDescription(product)}</p>
        {highlights.length ? (
          <ul className="mt-4 flex list-disc flex-col gap-1 ps-5 text-body-md text-ink">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="specs-heading" className="mt-6 rounded-2xl bg-card p-5 shadow-card md:p-8">
        <h2 id="specs-heading" className="font-heading text-headline-md text-ink">
          Technical specifications
        </h2>
        <p className="mt-1 mb-5 text-body-sm text-ink-slate">Sample specification data for previewing the product page.</p>
        <ProductSpecifications groups={productSpecGroups(product)} />
      </section>

      <section aria-labelledby="delivery-heading" className="mt-6 rounded-2xl bg-card p-5 shadow-card md:p-8">
        <h2 id="delivery-heading" className="font-heading text-headline-md text-ink">
          Delivery and availability
        </h2>
        <p className="mt-3 max-w-3xl text-body-md text-ink-slate">
          Delivery options, dates and costs will be shown at checkout once ordering is available. Availability on this
          page comes from sample data and is not live inventory.
        </p>
      </section>

      <RelatedProducts products={getRelatedProducts(product)} />
    </Container>
  );
}
