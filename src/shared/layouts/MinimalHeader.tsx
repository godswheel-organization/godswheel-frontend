import Logo from "@/shared/ui/brand/Logo";
import Container from "@/shared/ui/container/Container";

// Logo-only header for error and offline pages, where navigation could lead back into the failure.
export default function MinimalHeader() {
  return (
    <header className="border-b border-border/60 bg-background">
      <Container className="flex h-18 items-center">
        <Logo />
      </Container>
    </header>
  );
}
