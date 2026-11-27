import type { Metadata } from "next";
import FeaturedSermonCard from "@/features/home/components/FeaturedSermonCard";
import ForYourListening from "@/features/home/components/ForYourListening";
import CategoryChips from "@/features/sermons/components/CategoryChips";
import { getCategories } from "@/features/sermons/server/getCategories";
import { getLatestSermons } from "@/features/sermons/server/getSermon";
import { ROUTES } from "@/lib/routes";
import Container from "@/shared/ui/container/Container";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Home",
  description: "Pick up where you left off, and find sermons chosen for your listening.",
  path: ROUTES.home,
});

export default async function HomePage() {
  // The newest sermon leads ("Latest sermon") and the next four follow.
  const [categories, [featured, ...recent]] = await Promise.all([getCategories(), getLatestSermons(5)]);

  return (
    <Container className="flex flex-col gap-8 py-6 md:gap-10 md:py-10">
      <h1 className="sr-only">Home</h1>
      {featured && <FeaturedSermonCard sermon={featured} />}
      {categories.length > 0 && (
        <CategoryChips categories={categories} hrefFor={(slug) => (slug ? ROUTES.sermonsByCategory(slug) : ROUTES.sermons)} />
      )}
      {recent.length > 0 && <ForYourListening sermons={recent} />}
    </Container>
  );
}
