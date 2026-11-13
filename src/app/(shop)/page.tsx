import type { Metadata } from "next";
import { DealOfTheDay } from "@/components/home/DealOfTheDay";
import { Departments } from "@/components/home/Departments";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Hero } from "@/components/home/Hero";
import { PromoCard } from "@/components/home/PromoCard";
import { SupportBand } from "@/components/home/SupportBand";
import { TrustStrip } from "@/components/home/TrustStrip";
import { Container } from "@/components/ui/Container";
import { promos } from "@/lib/fixtures/home";

export const metadata: Metadata = {
  title: "Flagship electronics, delivered",
  description:
    "Browse smartphones, laptops, audio and more on MerchantOS Storefront. Sample products shown while the catalogue is being built.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <TrustStrip />

      <section aria-label="Featured promotions" className="pb-12 md:pb-14">
        <Container>
          <div className="grid items-stretch gap-4 md:gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Hero />
            </div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:col-span-4 lg:grid-cols-1">
              {promos.map((promo) => (
                <PromoCard key={promo.id} promo={promo} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Departments />
      <FeaturedProducts />
      <DealOfTheDay />
      <SupportBand />
    </>
  );
}
