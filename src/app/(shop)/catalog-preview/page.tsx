import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviewList } from "@/components/catalog-preview/PreviewViews";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Live catalogue preview",
  description: "Read-only preview of products from the MerchantOS POS catalogue.",
  robots: { index: false, follow: false },
};

export default function CatalogPreviewPage(props: PageProps<"/catalog-preview">) {
  return (
    <Container className="py-6 md:py-10">
      <Suspense fallback={<p role="status" className="text-body-md text-ink-slate">Loading the live catalogue…</p>}>
        <PreviewList searchParams={props.searchParams} />
      </Suspense>
    </Container>
  );
}
