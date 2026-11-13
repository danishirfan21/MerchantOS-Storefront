import { CategoryCard } from "@/components/products/CategoryCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { departments } from "@/lib/fixtures/home";

/** Shop by Department: scroll row on mobile, 4 columns at md, 7 at lg. */
export function Departments() {
  return (
    <section id="departments" aria-labelledby="departments-title" className="scroll-mt-28 pb-12 md:pb-14">
      <Container>
        <SectionHeading id="departments-title" eyebrow="Curated catalog" title="Shop by department" />
        <ul className="no-scrollbar -mx-(--page-gutter) mt-5 flex snap-x gap-3 overflow-x-auto px-(--page-gutter) pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-7">
          {departments.map((category) => (
            <li key={category.slug} className="w-32 shrink-0 snap-start md:w-auto">
              <CategoryCard category={category} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
