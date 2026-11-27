import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoryStyle } from "@/features/sermons/lib/categories";
import { getCategories } from "@/features/sermons/server/getCategories";
import { ROUTES } from "@/lib/routes";
import Container from "@/shared/ui/container/Container";
import SectionHeading from "@/shared/ui/section-heading/SectionHeading";
import { SECTION_IDS, TOPICS_COPY } from "../content";

// The landing page's categories, from the API's live list (rendered on the server, so they're in the HTML for
// search engines). If the API can't be reached, a single link to the full directory stands in.
export default async function TopicGrid() {
  const categories = await getCategories();

  return (
    <section id={SECTION_IDS.topics} aria-labelledby="topics-title" className="scroll-mt-24 py-14 sm:py-20">
      <Container>
        <SectionHeading id="topics-title" eyebrow={TOPICS_COPY.eyebrow} title={TOPICS_COPY.title} />

        {categories.length > 0 ? (
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((category) => {
              const { icon: Icon } = categoryStyle(category.slug);
              return (
                <li key={category.slug}>
                  <Link
                    href={ROUTES.sermonsByCategory(category.slug)}
                    className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface/40 p-4 transition hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-surface"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 transition group-hover:bg-brand-500 group-hover:text-brand-950">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="font-medium text-foreground">{category.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <Link
            href={ROUTES.sermons}
            className="mt-8 inline-flex items-center gap-2 font-medium text-brand-500 underline-offset-4 hover:underline"
          >
            Browse all sermons
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </Container>
    </section>
  );
}
