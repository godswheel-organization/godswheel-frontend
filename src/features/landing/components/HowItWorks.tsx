import Carousel from "@/shared/ui/carousel/Carousel";
import Container from "@/shared/ui/container/Container";
import SectionHeading from "@/shared/ui/section-heading/SectionHeading";
import { HOW_IT_WORKS_COPY, SECTION_IDS } from "../content";

export default function HowItWorks() {
  const { steps } = HOW_IT_WORKS_COPY;

  return (
    <section id={SECTION_IDS.howItWorks} aria-labelledby="how-title" className="scroll-mt-24 py-14 sm:py-20">
      <Container>
        <SectionHeading id="how-title" eyebrow={HOW_IT_WORKS_COPY.eyebrow} title={HOW_IT_WORKS_COPY.title} align="center" />

        <Carousel
          label={HOW_IT_WORKS_COPY.eyebrow}
          className="mt-10"
          slides={steps.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className="relative w-full rounded-2xl border border-border bg-surface/40 p-6">
              <span className="absolute right-6 top-6 font-serif text-4xl text-surface-raised" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-muted">{description}</p>
            </article>
          ))}
        />
      </Container>
    </section>
  );
}
