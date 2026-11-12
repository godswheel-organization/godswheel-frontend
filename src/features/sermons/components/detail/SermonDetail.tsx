import Link from "next/link";
import SaveSermonButton from "@/features/library/components/SaveSermonButton";
import SermonPlayButton from "@/features/player/components/SermonPlayButton";
import { ROUTES } from "@/lib/routes";
import PageHeader from "@/shared/layouts/PageHeader";
import Chip from "@/shared/ui/chip/Chip";
import ChipRow from "@/shared/ui/chip/ChipRow";
import Container from "@/shared/ui/container/Container";
import { formatSermonMeta } from "../../lib/formatSermon";
import { TOPICS } from "../../lib/topics";
import type { Sermon } from "../../types";
import SermonArtwork from "../SermonArtwork";
import ShareSermonButton from "./ShareSermonButton";

interface SermonDetailProps {
  sermon: Sermon;
}

// Phones: one column, as designed. From md up: the cover on the left (staying in view), details on the right.
export default function SermonDetail({ sermon }: SermonDetailProps) {
  const topics = [sermon.topic, ...(sermon.relatedTopics ?? [])];

  return (
    <Container className="py-4 md:py-8">
      <PageHeader
        title="Sermon detail"
        backHref={ROUTES.sermons}
        variant="compact"
        titleAs="p"
        action={<ShareSermonButton sermon={sermon} />}
      />

      <div className="mt-6 md:mt-8 md:grid md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:items-start md:gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-14">
        <SermonArtwork
          topic={sermon.topic}
          className="aspect-16/10 w-full rounded-2xl md:sticky md:top-8 md:aspect-square"
          iconClassName="size-12 md:size-16"
        />

        <div className="mt-6 md:mt-0">
          <h1 className="text-3xl font-bold text-foreground md:font-serif md:text-5xl md:font-normal md:leading-tight">
            {sermon.title}
          </h1>
          <p className="mt-3 text-base text-foreground">{sermon.preacher}</p>
          <p className="mt-2 text-sm text-muted">{formatSermonMeta(sermon, { withDate: true })}</p>

          <div className="mt-6 flex items-center gap-3 md:max-w-md">
            <SermonPlayButton sermon={sermon} className="flex-1" />
            <SaveSermonButton sermon={sermon} className="size-14 rounded-2xl border border-border hover:bg-surface" />
          </div>

          <section aria-labelledby="description-title" className="mt-8">
            <h2 id="description-title" className="text-xl font-semibold text-foreground">
              Description
            </h2>
            <p className="mt-3 max-w-prose leading-relaxed text-muted">{sermon.description}</p>
          </section>

          <ChipRow label="Categories" className="mt-6">
            {topics.map((topic) => (
              <li key={topic}>
                <Chip href={ROUTES.sermonsByTopic(topic)}>{TOPICS[topic].label}</Chip>
              </li>
            ))}
          </ChipRow>

          <section aria-labelledby="source-title" className="mt-8 rounded-2xl border border-border bg-surface p-5">
            <h2 id="source-title" className="text-base font-semibold text-foreground">
              Source and rights
            </h2>
            <p className="mt-3 text-sm text-foreground">{sermon.source.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{sermon.source.rights}</p>
          </section>

          <Link
            href={ROUTES.reportSermon(sermon.id)}
            className="mt-6 inline-block text-sm text-foreground underline underline-offset-4 transition hover:text-brand-300"
          >
            Report an issue with this sermon
          </Link>
        </div>
      </div>
    </Container>
  );
}
