import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { ROUTES } from "@/lib/routes";
import type { Sermon } from "../types";
import { primaryCategory, sermonCategories } from "./categories";
import { sermonMinutes } from "./formatSermon";

// Search-result title: what people search by is the sermon and the preacher.
export const sermonSeoTitle = (sermon: Sermon) => `${sermon.title} by ${sermon.preacher}`;

// Search engines show ~155 characters; cut at a word boundary rather than mid-word.
export function sermonSeoDescription(sermon: Sermon, maxLength = 155): string {
  const minutes = sermonMinutes(sermon);
  const lead = [sermon.scripture, minutes && `${minutes} min`].filter(Boolean).join(" · ");
  const text = [lead && `${lead}.`, sermon.description ?? `A sermon by ${sermon.preacher}.`].filter(Boolean).join(" ");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
}

// schema.org language: a BCP 47 code where we know it, otherwise the name as given.
const LANGUAGE_CODES: Record<string, string> = { English: "en", Yoruba: "yo", Igbo: "ig", Hausa: "ha", French: "fr" };

// Structured data for a sermon page: the sermon as an audio recording, and where it sits in the site.
export function sermonJsonLd(sermon: Sermon): Record<string, unknown>[] {
  const url = absoluteUrl(ROUTES.sermon(sermon.id));
  const main = primaryCategory(sermon);
  const categoryNames = sermonCategories(sermon).map((category) => category.name);

  return [
    {
      "@context": "https://schema.org",
      "@type": "AudioObject",
      "@id": url,
      url,
      name: sermon.title,
      ...(sermon.description && { description: sermon.description }),
      // ISO 8601 duration, e.g. PT1989S.
      ...(sermon.durationSeconds && { duration: `PT${sermon.durationSeconds}S` }),
      ...(sermon.language && { inLanguage: LANGUAGE_CODES[sermon.language] ?? sermon.language }),
      ...(sermon.publishedAt && { datePublished: sermon.publishedAt }),
      author: { "@type": "Person", name: sermon.preacher },
      genre: "Sermon",
      keywords: [...categoryNames, sermon.scripture, ...(sermon.scriptureRefs ?? [])].filter(Boolean).join(", "),
      // Only a public address: the API says audioUrl will become a storage key, played through presigned links.
      ...(/^https?:\/\//.test(sermon.audioUrl ?? "") && { contentUrl: sermon.audioUrl, encodingFormat: "audio/mpeg" }),
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      ...(sermon.source && { copyrightHolder: { "@type": "Organization", name: sermon.source.name } }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      // Sermons › its main category (when it has one) › the sermon.
      itemListElement: [
        { name: "Sermons", item: absoluteUrl(ROUTES.sermons) },
        ...(main ? [{ name: main.name, item: absoluteUrl(ROUTES.sermonsByCategory(main.slug)) }] : []),
        { name: sermon.title, item: url },
      ].map((crumb, index) => ({ "@type": "ListItem", position: index + 1, ...crumb })),
    },
  ];
}
