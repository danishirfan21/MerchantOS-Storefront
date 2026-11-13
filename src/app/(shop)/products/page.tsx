import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "All products",
  description:
    "Browse and filter electronics by category, brand, price and availability. Sample products shown while the catalogue is being built.",
  alternates: { canonical: "/products" },
};

function CatalogFallback() {
  return (
    <Container className="pt-6 pb-12">
      <h1 className="font-heading text-headline-xl text-ink">All products</h1>
      <p className="mt-2 text-body-md text-ink-slate" role="status">
        Loading products…
      </p>
    </Container>
  );
}

export default function ProductsPage() {
  return (
    // The catalogue reads filters from the URL, so it renders client-side behind a Suspense boundary.
    <Suspense fallback={<CatalogFallback />}>
      <CatalogBrowser />
    </Suspense>
  );
}
