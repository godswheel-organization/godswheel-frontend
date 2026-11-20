import type { Metadata } from "next";
import { SITE_LOCALE, SITE_NAME, SITE_TAGLINE } from "./site";

// Open Graph fields every page shares. A page's `openGraph` replaces its parent's rather than merging,
// image included, so each page's object starts from this. The image is app/opengraph-image.tsx. A route with
// its own opengraph-image file (sermons) must leave `images` out (see `ownImage`), since this field would win.
// (No twitter:image: X falls back to og:image, which keeps a sermon's own image there too.)
export const BASE_OPEN_GRAPH = {
  siteName: SITE_NAME,
  locale: SITE_LOCALE,
  type: "website" as const,
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE_NAME}: ${SITE_TAGLINE}` }],
};

interface PageMetadataOptions {
  title: string;
  description?: string;
  // The page's canonical path (e.g. "/about"). Leave out for pages that shouldn't be indexed.
  path?: string;
  // Account pages, search results, sign-in and the like: kept out of search results, links still followed.
  noIndex?: boolean;
  openGraph?: Metadata["openGraph"];
  // The route has its own opengraph-image file: leave the default image out so that file is used.
  ownImage?: boolean;
}

// One page's metadata: title, description, canonical URL and link-preview text, built the same way everywhere.
// The share image comes from the nearest opengraph-image file (app/opengraph-image.tsx unless a route has its own).
export function pageMetadata({ title, description, path, noIndex, openGraph, ownImage }: PageMetadataOptions): Metadata {
  const fullTitle = `${title} · ${SITE_NAME}`;
  const { images, ...sharedOpenGraph } = BASE_OPEN_GRAPH;
  return {
    title,
    description,
    ...(path && { alternates: { canonical: path } }),
    ...(noIndex
      ? { robots: { index: false, follow: true } }
      : {
          openGraph: { ...sharedOpenGraph, ...(!ownImage && { images }), title: fullTitle, description, url: path, ...openGraph },
          twitter: { card: "summary_large_image", title: fullTitle, description },
        }),
  };
}
