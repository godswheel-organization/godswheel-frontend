import { primaryCategory } from "@/features/sermons/lib/categories";
import { sermonMinutes } from "@/features/sermons/lib/formatSermon";
import { getSermon } from "@/features/sermons/server/getSermon";
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, ogImage } from "@/lib/seo/ogImage";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

// The preview a shared sermon link shows: its title, preacher, category and passage.
export const alt = "Sermon on GodsWheel";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const sermon = await getSermon((await params).id);
  if (!sermon) return ogImage({ title: SITE_NAME, subtitle: SITE_TAGLINE });

  return ogImage({
    eyebrow: [primaryCategory(sermon)?.name, sermon.scripture].filter(Boolean).join(" · "),
    title: sermon.title,
    subtitle: sermon.preacher,
    meta: [sermonMinutes(sermon) && `${sermonMinutes(sermon)} min`, sermon.language].filter(Boolean).join(" · ") || undefined,
  });
}
