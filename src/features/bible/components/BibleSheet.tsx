"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { Sermon } from "@/features/sermons/types";
import ChipButton from "@/shared/ui/chip/ChipButton";
import SelectField from "@/shared/ui/form/SelectField";
import Loader from "@/shared/ui/loaders/Loader";
import Sheet from "@/shared/ui/modal/Sheet";
import { useGetBibleVersionsQuery, useGetPassageQuery } from "../api/bibleApi";
import { fullChapterUrl } from "../lib/chapter";

interface BibleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sermon: Sermon;
}

// The passages a sermon draws on, readable without leaving the player.
export default function BibleSheet({ open, onOpenChange, sermon }: BibleSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Bible" subtitle={`${sermon.title} · ${sermon.preacher}`}>
      <BibleReader sermon={sermon} />
    </Sheet>
  );
}

// Mounts with the sheet, so it always opens on the sermon's main passage.
function BibleReader({ sermon }: { sermon: Sermon }) {
  const references = [sermon.scripture, ...(sermon.scriptureRefs ?? [])];
  const [reference, setReference] = useState(references[0]);
  const { data: versions } = useGetBibleVersionsQuery();
  const [version, setVersion] = useState("KJV");
  const { data: passage, isFetching, isError } = useGetPassageQuery({ reference, version });

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="in-this-sermon">
        <h3 id="in-this-sermon" className="text-sm text-muted">
          In this sermon
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {references.map((ref) => (
            <li key={ref}>
              <ChipButton pressed={ref === reference} onClick={() => setReference(ref)}>
                {ref}
              </ChipButton>
            </li>
          ))}
        </ul>
      </section>

      <SelectField
        id="bible-version"
        label="Version"
        value={version}
        onChange={(event) => setVersion(event.target.value)}
        options={(versions ?? [{ id: "KJV", name: "King James Version (KJV)" }]).map((option) => ({
          value: option.id,
          label: option.name,
        }))}
      />

      <article aria-live="polite" aria-busy={isFetching} className="min-h-32 rounded-2xl bg-ink/40 p-5">
        <h3 className="font-semibold text-foreground">{reference}</h3>
        {isFetching && !passage ? (
          <Loader className="mt-4 justify-start sm:justify-start" size={24} label="Loading passage" />
        ) : isError ? (
          <p className="mt-3 text-muted">This passage isn&rsquo;t available in this version yet.</p>
        ) : (
          <p className="mt-3 leading-relaxed text-foreground">{passage?.text}</p>
        )}
      </article>

      <a
        href={fullChapterUrl(reference, version)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-raised px-6 py-3.5 font-semibold text-foreground ring-1 ring-inset ring-border transition hover:bg-gray-700"
      >
        Open full chapter
        <ExternalLink className="size-4" aria-hidden />
        <span className="sr-only">(opens Bible Gateway in a new tab)</span>
      </a>
    </div>
  );
}
