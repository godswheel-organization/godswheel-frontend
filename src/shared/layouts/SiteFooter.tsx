import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import Logo from "@/shared/ui/brand/Logo";
import Container from "@/shared/ui/container/Container";

const FOOTER_LINKS = [
  { label: "About and standards", href: ROUTES.about },
  { label: "Privacy notice", href: ROUTES.privacy },
  { label: "Terms", href: ROUTES.terms },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo />
          <p className="text-sm text-muted">Sermons by speaker, topic or scripture.</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted transition hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>

      <Container className="border-t border-border/40 py-6">
        <p className="text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} GodsWheel. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
