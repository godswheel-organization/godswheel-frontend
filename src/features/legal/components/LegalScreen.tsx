import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import PageHeader from "@/shared/layouts/PageHeader";
import Container from "@/shared/ui/container/Container";
import SegmentedLinks from "@/shared/ui/tabs/SegmentedLinks";
import { PRIVACY_NOTICE, TERMS, type LegalDocument } from "../content";

const DOCUMENTS = {
  privacy: { href: ROUTES.privacy, document: PRIVACY_NOTICE },
  terms: { href: ROUTES.terms, document: TERMS },
} satisfies Record<string, { href: string; document: LegalDocument }>;

// "2026-10-31" → "31 October 2026", as a calendar date (never shifted by time zone).
const formatLongDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`)
  );

export default function LegalScreen({ show }: { show: keyof typeof DOCUMENTS }) {
  const { href, document } = DOCUMENTS[show];

  return (
    <Container className="py-4 md:py-8">
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Privacy notice and Terms" backHref={ROUTES.settings} variant="compact" />

        <SegmentedLinks
          label="Legal documents"
          activeHref={href}
          className="mt-6"
          items={[
            { label: PRIVACY_NOTICE.title, href: ROUTES.privacy },
            { label: TERMS.title, href: ROUTES.terms },
          ]}
        />

        <article className="mt-8">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">{document.title}</h2>
          <p className="mt-2 text-sm text-muted">Last updated: {formatLongDate(document.lastUpdated)}</p>

          {/* {document.status === "draft" && (
            <p className="mt-4 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-foreground">
              Draft for review — not yet in effect.
            </p>
          )} */}

          <div className="mt-8 flex flex-col gap-8">
            {document.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-xl font-semibold text-foreground">{section.heading}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-2 leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}
                {section.link && (
                  <Link
                    href={section.link.href}
                    className="mt-3 inline-block font-medium text-brand-500 underline-offset-4 transition hover:text-brand-300 hover:underline"
                  >
                    {section.link.label}
                  </Link>
                )}
              </section>
            ))}
          </div>
        </article>
      </div>
    </Container>
  );
}
