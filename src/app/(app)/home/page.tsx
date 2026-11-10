import type { Metadata } from "next";
import FeaturedSermonCard from "@/features/home/components/FeaturedSermonCard";
import ForYourListening from "@/features/home/components/ForYourListening";
import TopicChips from "@/features/sermons/components/TopicChips";
import { featuredSermons, recommendedSermons } from "@/features/sermons/mocks/sermons";
import { ROUTES } from "@/lib/routes";
import Container from "@/shared/ui/container/Container";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <Container className="flex flex-col gap-8 py-6 md:gap-10 md:py-10">
      <h1 className="sr-only">Home</h1>
      <FeaturedSermonCard sermon={featuredSermons[0]} />
      <TopicChips hrefFor={(topic) => (topic ? ROUTES.sermonsByTopic(topic) : ROUTES.sermons)} />
      <ForYourListening sermons={recommendedSermons} />
    </Container>
  );
}
