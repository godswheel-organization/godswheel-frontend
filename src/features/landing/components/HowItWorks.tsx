import Container from "@/shared/ui/container/Container";
import SectionHeading from "@/shared/ui/section-heading/SectionHeading";
import { HOW_IT_WORKS_COPY, SECTION_IDS } from "../content";

export default function HowItWorks() {
  return (
    <section id={SECTION_IDS.howItWorks} aria-labelledby="how-title" className="scroll-mt-24 py-14 sm:py-20">
      <Container>
        <SectionHeading
          id="how-title"
          eyebrow={HOW_IT_WORKS_COPY.eyebrow}
          title={HOW_IT_WORKS_COPY.title}
          align="center"
        />

        <ol className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {HOW_IT_WORKS_COPY.steps.map(({ icon: Icon, title, description }, index) => (
            // A compact row on phones, a tall card from md up.
            <li
              key={title}
              className="relative flex items-start gap-4 rounded-2xl border border-border bg-surface/40 p-5 md:block md:p-6"
            >
              <span
                className="absolute right-5 top-5 font-serif text-3xl text-surface-raised md:right-6 md:top-6 md:text-4xl"
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Icon className="size-6" aria-hidden />
              </span>
              <div className="pr-10 md:pr-0">
                <h3 className="text-lg font-semibold text-foreground md:mt-5">{title}</h3>
                <p className="mt-1 text-muted md:mt-2">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
