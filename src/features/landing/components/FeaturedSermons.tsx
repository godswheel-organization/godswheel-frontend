import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SermonCard from "@/features/sermons/components/SermonCard";
import type { Sermon } from "@/features/sermons/types";
import { ROUTES } from "@/lib/routes";
import Container from "@/shared/ui/container/Container";
import SectionHeading from "@/shared/ui/section-heading/SectionHeading";
import { FEATURED_COPY, SECTION_IDS } from "../content";

interface FeaturedSermonsProps {
  sermons: Sermon[];
}

export default function FeaturedSermons({ sermons }: FeaturedSermonsProps) {
  return (
    <section id={SECTION_IDS.featured} aria-labelledby="featured-title" className="scroll-mt-24 py-14 sm:py-20">
      <Container>
        <SectionHeading
          id="featured-title"
          eyebrow={FEATURED_COPY.eyebrow}
          title={FEATURED_COPY.title}
          action={
            <Link
              href={ROUTES.sermons}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 transition hover:text-brand-300"
            >
              {FEATURED_COPY.seeAll}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />

        {/* grid-cols-1 (minmax(0, 1fr)) stops a long, nowrap title from widening the column past the screen. */}
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {sermons.map((sermon) => (
            <li key={sermon.id}>
              <SermonCard sermon={sermon} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
