import SermonListSkeleton from "@/features/sermons/components/SermonListSkeleton";
import Container from "@/shared/ui/container/Container";
import { Skeleton } from "@/shared/ui/skeleton/Skeleton";

// Shown inside the app frame while a page is on its way: a title bar and a few rows, not a spinner.
export default function AppLoading() {
  return (
    <Container className="py-6 md:py-10">
      <Skeleton className="h-8 w-56" />
      <SermonListSkeleton count={4} className="mt-8 lg:grid-cols-2" label="Loading page" />
    </Container>
  );
}
