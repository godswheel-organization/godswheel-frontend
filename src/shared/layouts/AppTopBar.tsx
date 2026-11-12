import type { ReactNode } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import Logo from "@/shared/ui/brand/Logo";
import Container from "@/shared/ui/container/Container";
import { MenuButton } from "./app-nav/NavDrawer";

interface AppTopBarProps {
  // Right-hand controls after Search (the account button, passed in by the app layout).
  actions?: ReactNode;
}

// The phone header on every app screen: ☰ menu, logo, search, account. Stays at the top while the page scrolls.
// From md up the sidebar carries all of this, so it's hidden there.
export default function AppTopBar({ actions }: AppTopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-md md:hidden">
      <Container className="flex h-16 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <MenuButton />
          {/* The logo leads out to the landing page (Logo's default); Home is the first tab. */}
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.search}
            aria-label="Search sermons"
            className="flex size-11 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
          >
            <Search className="size-5" strokeWidth={1.75} aria-hidden />
          </Link>
          {actions}
        </div>
      </Container>
    </header>
  );
}
