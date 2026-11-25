import Container from "@/shared/ui/container/Container";
import Reveal from "@/shared/ui/reveal/Reveal";
import SectionHeading from "@/shared/ui/section-heading/SectionHeading";
import { MISSION_COPY, SECTION_IDS } from "../content";

export default function MissionStatement() {
  const { statement, scripture, pillars } = MISSION_COPY;

  return (
    <section id={SECTION_IDS.mission} aria-labelledby="mission-title" className="relative scroll-mt-24 overflow-hidden py-16 sm:py-24">
      {/* A soft sunrise behind the statement. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_35%_at_50%_42%,color-mix(in_oklab,var(--color-brand-500)_16%,transparent),transparent)]"
      />

      <Container className="relative">
        <Reveal>
          <SectionHeading id="mission-title" eyebrow={MISSION_COPY.eyebrow} title={MISSION_COPY.title} align="center" />
        </Reveal>

        <Reveal delayMs={120} className="mx-auto mt-10 max-w-3xl text-center">
          <figure>
            <span aria-hidden className="block font-serif text-7xl leading-none text-brand-500/40 sm:text-8xl">
              &ldquo;
            </span>
            <blockquote className="-mt-4 font-serif text-2xl leading-snug text-foreground/85 sm:-mt-6 sm:text-[2rem] sm:leading-snug">
              {statement.map((part, index) =>
                part.highlight ? (
                  <span key={index} className="text-brand-400">
                    {part.text}
                  </span>
                ) : (
                  <span key={index}>{part.text}</span>
                )
              )}
            </blockquote>
          </figure>
        </Reveal>

        <Reveal delayMs={220} className="mt-10 flex justify-center">
          <figure className="inline-flex max-w-xl flex-col items-center gap-2 rounded-2xl border border-brand-500/25 bg-surface/50 px-6 py-5 text-center backdrop-blur-sm">
            <blockquote className="font-serif text-lg italic text-foreground">&ldquo;{scripture.text}&rdquo;</blockquote>
            <figcaption className="text-sm font-medium tracking-wide text-brand-500">{scripture.reference} (KJV)</figcaption>
          </figure>
        </Reveal>

        <ul className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }, index) => (
            <li key={title}>
              {/* The hover lives on the inner card: Reveal's own transition would otherwise override it. */}
              <Reveal delayMs={300 + index * 110} className="h-full">
                <div className="group h-full rounded-2xl border border-border bg-surface/40 p-6 text-center transition duration-300 ease-out hover:-translate-y-1.5 hover:border-brand-500/40 hover:bg-surface/70 hover:shadow-[0_18px_40px_-22px_var(--color-brand-500)] motion-reduce:hover:translate-y-0">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 transition duration-300 ease-out group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-brand-950 motion-reduce:group-hover:scale-100">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground transition-colors duration-300 group-hover:text-brand-400">{title}</h3>
                  <p className="mt-2 text-sm text-muted">{description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
