import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { ROUTES } from "@/lib/routes";
import type { Sermon } from "../types";
import { TOPICS } from "./topics";

// Search-result title: what people search by is the sermon and the preacher.
export const sermonSeoTitle = (sermon: Sermon) => `${sermon.title} by ${sermon.preacher}`;

// Search engines show ~155 characters; cut at a word boundary rather than mid-word.
export function sermonSeoDescription(sermon: Sermon, maxLength = 155): string {
  const lead = `${sermon.scripture} · ${sermon.durationMinutes} min. `;
  const text = `${lead}${sermon.description}`;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
}

// schema.org language: a BCP 47 code where we know it, otherwise the name as given.
const LANGUAGE_CODES: Record<string, string> = { English: "en", Yoruba: "yo", Igbo: "ig", Hausa: "ha", French: "fr" };

// Structured data for a sermon page: the sermon as an audio recording, and where it sits in the site.
export function sermonJsonLd(sermon: Sermon): Record<string, unknown>[] {
  const url = absoluteUrl(ROUTES.sermon(sermon.id));
  const topic = TOPICS[sermon.topic].label;
  const topics = [sermon.topic, ...(sermon.relatedTopics ?? [])].map((key) => TOPICS[key].label);

  return [
    {
      "@context": "https://schema.org",
      "@type": "AudioObject",
      "@id": url,
      url,
      name: sermon.title,
      description: sermon.description,
      // ISO 8601 duration, e.g. PT38M.
      duration: `PT${sermon.durationMinutes}M`,
      inLanguage: LANGUAGE_CODES[sermon.language] ?? sermon.language,
      datePublished: sermon.publishedAt,
      author: { "@type": "Person", name: sermon.preacher },
      genre: "Sermon",
      keywords: [...topics, sermon.scripture, ...(sermon.scriptureRefs ?? [])].join(", "),
      ...(sermon.audioUrl && { contentUrl: sermon.audioUrl, encodingFormat: "audio/mpeg" }),
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      copyrightHolder: { "@type": "Organization", name: sermon.source.name },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Sermons", item: absoluteUrl(ROUTES.sermons) },
        { "@type": "ListItem", position: 2, name: topic, item: absoluteUrl(ROUTES.sermonsByTopic(sermon.topic)) },
        { "@type": "ListItem", position: 3, name: sermon.title, item: url },
      ],
    },
  ];
}
