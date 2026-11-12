import { ArrowRight } from "lucide-react";
import type { Sermon } from "@/features/sermons/types";
import { ROUTES } from "@/lib/routes";
import Button from "@/shared/ui/button/Button";
import Container from "@/shared/ui/container/Container";
import { HERO_COPY } from "../content";
import HeroPreview from "./HeroPreview";

interface HeroProps {
  featuredSermon: Sermon;
}

export default function Hero({ featuredSermon }: HeroProps) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div aria-hidden className="bg-brand-glow absolute inset-x-0 top-0 h-[36rem]" />

      <Container className="relative grid items-center gap-14 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-24">
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">{HERO_COPY.eyebrow}</p>
          <h1
            id="hero-title"
            className="mt-4 font-serif text-[2.5rem] leading-[1.1] text-foreground sm:text-6xl lg:text-7xl"
          >
            {HERO_COPY.title}
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">{HERO_COPY.description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={ROUTES.sermons} size="lg" endIcon={<ArrowRight className="size-5" />}>
              {HERO_COPY.primaryCta}
            </Button>
            <Button href={ROUTES.signUp} size="lg" variant="secondary">
              {HERO_COPY.secondaryCta}
            </Button>
          </div>
          <p className="mt-4 text-center text-sm text-muted sm:text-left">{HERO_COPY.note}</p>
        </div>

        <HeroPreview sermon={featuredSermon} />
      </Container>
    </section>
  );
}
