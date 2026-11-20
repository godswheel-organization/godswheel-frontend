import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, ogImage } from "@/lib/seo/ogImage";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

// The default link-preview image for every page that doesn't draw its own (sermons do).
export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return ogImage({ eyebrow: "Welcome to GodsWheel", title: "Make room for the Word.", subtitle: SITE_TAGLINE });
}
