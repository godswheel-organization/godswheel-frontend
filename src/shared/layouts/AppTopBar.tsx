import type { ReactNode } from "react";
import { ROUTES } from "@/lib/routes";
import Logo from "@/shared/ui/brand/Logo";
import Container from "@/shared/ui/container/Container";

interface AppTopBarProps {
  actions?: ReactNode;
}

// Phones only: from md up the sidebar already shows the logo and account.
export default function AppTopBar({ actions }: AppTopBarProps) {
  return (
    <header className="md:hidden">
      <Container className="flex h-18 items-center justify-between gap-3">
        <Logo href={ROUTES.home} />
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </Container>
    </header>
  );
}
