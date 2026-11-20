import type { MetadataRoute } from "next";
import { PRIVACY_NOTICE, TERMS } from "@/features/legal/content";
import { TOPIC_ORDER } from "@/features/sermons/lib/topics";
import { getAllSermons } from "@/features/sermons/server/getSermon";
import { ROUTES } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo/site";

// /sitemap.xml: every public page worth finding in search. Account pages (library, settings), search
// results and sign-in are left out on purpose; they also carry noindex (see lib/seo/metadata.ts).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sermons = await getAllSermons();
  // The catalogue changes when a sermon is added: date its listings by the newest one.
  const newest = sermons.map((sermon) => sermon.publishedAt).sort().at(-1);

  return [
    { url: absoluteUrl(ROUTES.landing), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl(ROUTES.sermons), lastModified: newest, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl(ROUTES.home), lastModified: newest, changeFrequency: "daily", priority: 0.7 },
    // Category pages: "faith sermons", "sermons on prayer"…
    ...TOPIC_ORDER.map((topic) => ({
      url: absoluteUrl(ROUTES.sermonsByTopic(topic)),
      lastModified: sermons.filter((sermon) => sermon.topic === topic).map((sermon) => sermon.publishedAt).sort().at(-1),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...sermons.map((sermon) => ({
      url: absoluteUrl(ROUTES.sermon(sermon.id)),
      lastModified: sermon.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl(ROUTES.about), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl(ROUTES.privacy), lastModified: PRIVACY_NOTICE.lastUpdated, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl(ROUTES.terms), lastModified: TERMS.lastUpdated, changeFrequency: "yearly", priority: 0.2 },
  ];
}
