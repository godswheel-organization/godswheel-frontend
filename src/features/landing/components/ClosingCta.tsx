import { ROUTES } from "@/lib/routes";
import Button from "@/shared/ui/button/Button";
import Container from "@/shared/ui/container/Container";
import { CLOSING_COPY } from "../content";

export default function ClosingCta() {
  return (
    <section aria-labelledby="closing-title" className="py-14 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="bg-brand-glow absolute inset-0" />
          <div className="relative mx-auto max-w-xl">
            <h2 id="closing-title" className="font-serif text-3xl leading-tight text-foreground sm:text-5xl">
              {CLOSING_COPY.title}
            </h2>
            <p className="mt-4 text-lg text-muted">{CLOSING_COPY.description}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href={ROUTES.signUp} size="lg">
                {CLOSING_COPY.primaryCta}
              </Button>
              <Button href={ROUTES.signIn} size="lg" variant="outline">
                {CLOSING_COPY.secondaryCta}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
