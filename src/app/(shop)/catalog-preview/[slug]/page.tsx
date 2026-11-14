import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviewDetail } from "@/components/catalog-preview/PreviewViews";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Live catalogue product",
  robots: { index: false, follow: false },
};

export default function CatalogPreviewDetailPage(props: PageProps<"/catalog-preview/[slug]">) {
  return (
    <Container className="py-6 md:py-10">
      <Suspense fallback={<p role="status" className="text-body-md text-ink-slate">Loading product…</p>}>
        <PreviewDetail params={props.params} />
      </Suspense>
    </Container>
  );
}
