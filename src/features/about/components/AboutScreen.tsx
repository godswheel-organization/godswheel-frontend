import { Cross } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import PageHeader from "@/shared/layouts/PageHeader";
import Container from "@/shared/ui/container/Container";
import ListRow from "@/shared/ui/list/ListRow";
import { ABOUT_COPY } from "../content";

export default function AboutScreen() {
  return (
    <Container className="py-4 md:py-8">
      <div className="mx-auto max-w-2xl">
        <PageHeader title="About and standards" backHref={ROUTES.settings} variant="compact" />

        {/* Brand panel in place of the design's image, until there's artwork for it. */}
        <div
          aria-hidden
          className="relative mt-6 flex aspect-[16/7] items-center justify-center overflow-hidden rounded-2xl border border-border bg-linear-to-br from-brand-500/30 via-surface to-surface-raised"
        >
          <div className="bg-brand-glow absolute inset-0" />
          <span className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-surface/80">
            <Cross className="size-8 text-foreground" strokeWidth={1.5} />
          </span>
        </div>

        <h2 className="mt-8 text-2xl font-bold text-foreground md:text-3xl">{ABOUT_COPY.title}</h2>
        <p className="mt-3 leading-relaxed text-muted">{ABOUT_COPY.intro}</p>

        <div className="mt-8 flex flex-col gap-8">
          {ABOUT_COPY.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="text-xl font-semibold text-foreground">{section.heading}</h3>
              <p className="mt-2 leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
        </div>

        <ul className="mt-10">
          <ListRow label="Contact us" href={ROUTES.report} />
          <ListRow label="Privacy notice and Terms" href={ROUTES.privacy} />
        </ul>
      </div>
    </Container>
  );
}
