import type { Metadata } from "next";
import ClosingCta from "@/features/landing/components/ClosingCta";
import FeaturedSermons from "@/features/landing/components/FeaturedSermons";
import Hero from "@/features/landing/components/Hero";
import HowItWorks from "@/features/landing/components/HowItWorks";
import TopicGrid from "@/features/landing/components/TopicGrid";
import { LANDING_NAV } from "@/features/landing/content";
import { featuredSermons } from "@/features/sermons/mocks/sermons";
import SiteFooter from "@/shared/layouts/SiteFooter";
import SiteHeader from "@/shared/layouts/SiteHeader";
import { ROUTES } from "@/lib/routes";
import JsonLd from "@/lib/seo/JsonLd";
import { BASE_OPEN_GRAPH } from "@/lib/seo/metadata";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  // The brand leads here, rather than following the page name as on other pages.
  title: { absolute: `${SITE_NAME} · ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: ROUTES.landing },
  openGraph: { ...BASE_OPEN_GRAPH, title: `${SITE_NAME} · ${SITE_TAGLINE}`, description: SITE_DESCRIPTION, url: ROUTES.landing },
};

// Tells search engines what the site is and how to search it (which can show a search box in results).
const SITE_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl(ROUTES.search)}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icons/pwa/icon-512x512.png"),
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={SITE_JSON_LD} />
      <SiteHeader nav={LANDING_NAV} />
      <main className="flex-1">
        <Hero featuredSermon={featuredSermons[0]} />
        <TopicGrid />
        <FeaturedSermons sermons={featuredSermons} />
        <HowItWorks />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
