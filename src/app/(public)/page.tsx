import type { Metadata } from "next";
import SiteHeaderActions from "@/features/auth/components/SiteHeaderActions";
import ClosingCta from "@/features/landing/components/ClosingCta";
import FeaturedSermons from "@/features/landing/components/FeaturedSermons";
import Hero from "@/features/landing/components/Hero";
import HowItWorks from "@/features/landing/components/HowItWorks";
import MissionStatement from "@/features/landing/components/MissionStatement";
import TopicGrid from "@/features/landing/components/TopicGrid";
import { LANDING_NAV } from "@/features/landing/content";
import { getLatestSermons } from "@/features/sermons/server/getSermon";
import SiteFooter from "@/shared/layouts/SiteFooter";
import SiteHeader from "@/shared/layouts/SiteHeader";
import InstallGuideOnArrival from "@/shared/pwa/install/InstallGuideOnArrival";
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

export default async function Home() {
  // The newest sermons: the first shows in the hero's player, all four in the Latest section.
  const latest = await getLatestSermons(4);

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={SITE_JSON_LD} />
      {/* A few seconds in, shows first-time visitors how to put GodsWheel on their home screen. */}
      <InstallGuideOnArrival />
      <SiteHeader nav={LANDING_NAV} actions={<SiteHeaderActions />} />
      <main className="flex-1">
        <Hero featuredSermon={latest[0]} />
        <TopicGrid />
        {latest.length > 0 && <FeaturedSermons sermons={latest} />}
        <HowItWorks />
        <MissionStatement />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
