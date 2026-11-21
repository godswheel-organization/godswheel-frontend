import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/shared/ui/brand/Logo";
import Container from "@/shared/ui/container/Container";

export interface NavItem {
  label: string;
  href: string;
}

interface SiteHeaderProps {
  // Shown from the md breakpoint up; phones get the logo and Sign in only.
  nav?: NavItem[];
  // The right-hand buttons (session-aware, so passed in by the page: shared layouts don't import features).
  actions?: ReactNode;
}

export default function SiteHeader({ nav = [], actions }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between gap-6">
        <Logo />

        {nav.length > 0 && (
          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted transition hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {actions}
      </Container>
    </header>
  );
}
