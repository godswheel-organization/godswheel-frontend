import Link from "next/link";
import { TOPIC_ORDER, TOPICS } from "@/features/sermons/lib/topics";
import { ROUTES } from "@/lib/routes";
import Container from "@/shared/ui/container/Container";
import SectionHeading from "@/shared/ui/section-heading/SectionHeading";
import { SECTION_IDS, TOPICS_COPY } from "../content";

export default function TopicGrid() {
  return (
    <section id={SECTION_IDS.topics} aria-labelledby="topics-title" className="scroll-mt-24 py-14 sm:py-20">
      <Container>
        <SectionHeading id="topics-title" eyebrow={TOPICS_COPY.eyebrow} title={TOPICS_COPY.title} />

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TOPIC_ORDER.map((topic) => {
            const { label, icon: Icon } = TOPICS[topic];
            return (
              <li key={topic}>
                <Link
                  href={ROUTES.sermonsByTopic(topic)}
                  className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface/40 p-4 transition hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-surface"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 transition group-hover:bg-brand-500 group-hover:text-brand-950">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-medium text-foreground">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
