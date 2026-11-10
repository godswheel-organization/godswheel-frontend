import Link from "next/link";
import SermonListItem from "@/features/sermons/components/SermonListItem";
import type { Sermon } from "@/features/sermons/types";
import { ROUTES } from "@/lib/routes";
import { HOME_COPY } from "../content";

interface ForYourListeningProps {
  sermons: Sermon[];
}

export default function ForYourListening({ sermons }: ForYourListeningProps) {
  return (
    <section aria-labelledby="for-you-title">
      <div className="flex items-center justify-between gap-4">
        <h2 id="for-you-title" className="text-xl font-semibold text-foreground">
          {HOME_COPY.forYourListening}
        </h2>
        <Link href={ROUTES.sermons} className="text-base text-foreground underline underline-offset-4 transition hover:text-brand-300">
          {HOME_COPY.seeAll}
        </Link>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {sermons.map((sermon) => (
          <li key={sermon.id}>
            <SermonListItem sermon={sermon} />
          </li>
        ))}
      </ul>
    </section>
  );
}
