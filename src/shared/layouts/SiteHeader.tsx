import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import Logo from "@/shared/ui/brand/Logo";
import Button from "@/shared/ui/button/Button";
import Container from "@/shared/ui/container/Container";

export interface NavItem {
  label: string;
  href: string;
}

interface SiteHeaderProps {
  // Shown from the md breakpoint up; phones get the logo and Sign in only.
  nav?: NavItem[];
}

export default function SiteHeader({ nav = [] }: SiteHeaderProps) {
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

        <div className="flex items-center gap-3">
          <Button href={ROUTES.signIn} variant="outline" size="sm" className="rounded-full px-5 py-2.5">
            Sign in
          </Button>
          <Button href={ROUTES.signUp} size="sm" className="hidden rounded-full px-5 py-2.5 md:inline-flex">
            Create account
          </Button>
        </div>
      </Container>
    </header>
  );
}
