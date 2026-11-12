import { Play } from "lucide-react";
import PlaySermonButton from "@/features/player/components/PlaySermonButton";
import SermonArtwork from "@/features/sermons/components/SermonArtwork";
import { formatSermonMeta } from "@/features/sermons/lib/formatSermon";
import type { Sermon } from "@/features/sermons/types";
import { ROUTES } from "@/lib/routes";
import Button from "@/shared/ui/button/Button";
import { HOME_COPY } from "../content";

// Two half-width buttons must each fit one line on a 360px phone.
const PHONE_FIT = "whitespace-nowrap px-3 text-[0.9375rem] sm:px-7 sm:text-base";

interface FeaturedSermonCardProps {
  sermon: Sermon;
}

// Phones: a compact card with a small cover. From md up: a wide hero card with the cover alongside.
export default function FeaturedSermonCard({ sermon }: FeaturedSermonCardProps) {
  return (
    <section
      aria-labelledby="featured-sermon-title"
      className="relative overflow-hidden rounded-3xl border border-border bg-surface p-4 sm:p-6 md:grid md:grid-cols-[minmax(0,1fr)_16rem] md:items-center md:gap-8 md:p-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div aria-hidden className="bg-brand-glow absolute inset-0 opacity-60" />

      <div className="relative">
        <div className="flex items-start gap-4">
          <SermonArtwork topic={sermon.topic} className="size-20 shrink-0 md:hidden" iconClassName="size-7" />
          <div className="min-w-0 pt-1">
            <p className="text-sm text-muted">{HOME_COPY.featuredLabel}</p>
            <h2 id="featured-sermon-title" className="mt-1 text-2xl font-semibold text-foreground md:font-serif md:text-4xl">
              {sermon.title}
            </h2>
            <p className="mt-1 text-muted">{sermon.preacher}</p>
            <p className="mt-1 hidden text-sm text-gray-400 md:block">{formatSermonMeta(sermon)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:flex">
          <PlaySermonButton
            sermon={sermon}
            size="lg"
            className={PHONE_FIT}
            startIcon={<Play className="size-5 fill-current" aria-hidden />}
          >
            {HOME_COPY.listenNow}
          </PlaySermonButton>
          <Button href={ROUTES.sermons} variant="secondary" size="lg" className={PHONE_FIT}>
            {HOME_COPY.browseDirectory}
          </Button>
        </div>
      </div>

      <SermonArtwork topic={sermon.topic} className="relative hidden aspect-square w-full rounded-2xl md:flex" iconClassName="size-16" />
    </section>
  );
}
