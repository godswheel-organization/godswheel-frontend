import ClosingCta from "@/features/landing/components/ClosingCta";
import FeaturedSermons from "@/features/landing/components/FeaturedSermons";
import Hero from "@/features/landing/components/Hero";
import HowItWorks from "@/features/landing/components/HowItWorks";
import TopicGrid from "@/features/landing/components/TopicGrid";
import { LANDING_NAV } from "@/features/landing/content";
import { featuredSermons } from "@/features/sermons/mocks/sermons";
import SiteFooter from "@/shared/layouts/SiteFooter";
import SiteHeader from "@/shared/layouts/SiteHeader";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
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
