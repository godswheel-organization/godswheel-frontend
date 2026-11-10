import Chip from "@/shared/ui/chip/Chip";
import ChipRow from "@/shared/ui/chip/ChipRow";
import { TOPIC_ORDER, TOPICS } from "../lib/topics";
import type { SermonTopic } from "../types";

interface TopicChipsProps {
  // No topic = "All" is lit.
  activeTopic?: SermonTopic;
  // Where each chip leads; undefined is the "All" chip.
  hrefFor: (topic: SermonTopic | undefined) => string;
  // false when the chips filter the page they're on, so tapping one doesn't jump to the top.
  scroll?: boolean;
  className?: string;
}

export default function TopicChips({ activeTopic, hrefFor, scroll, className }: TopicChipsProps) {
  return (
    <ChipRow label="Categories" className={className}>
      <li>
        <Chip href={hrefFor(undefined)} active={!activeTopic} scroll={scroll}>
          All
        </Chip>
      </li>
      {TOPIC_ORDER.map((topic) => (
        <li key={topic}>
          <Chip href={hrefFor(topic)} active={activeTopic === topic} scroll={scroll}>
            {TOPICS[topic].label}
          </Chip>
        </li>
      ))}
    </ChipRow>
  );
}
