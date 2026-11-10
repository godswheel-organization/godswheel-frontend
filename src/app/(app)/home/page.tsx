import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import AccountButton from "@/features/auth/components/AccountButton";
import FeaturedSermonCard from "@/features/home/components/FeaturedSermonCard";
import ForYourListening from "@/features/home/components/ForYourListening";
import TopicChips from "@/features/sermons/components/TopicChips";
import { featuredSermons, recommendedSermons } from "@/features/sermons/mocks/sermons";
import { ROUTES } from "@/lib/routes";
import AppTopBar from "@/shared/layouts/AppTopBar";
import Container from "@/shared/ui/container/Container";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <>
      <AppTopBar
        actions={
          <>
            <Link
              href={ROUTES.search}
              aria-label="Search sermons"
              className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-surface"
            >
              <Search className="size-5" aria-hidden />
            </Link>
            <AccountButton />
          </>
        }
      />

      <Container className="flex flex-col gap-8 pb-8 pt-2 md:gap-10 md:py-10">
        <h1 className="sr-only">Home</h1>
        <FeaturedSermonCard sermon={featuredSermons[0]} />
        <TopicChips hrefFor={(topic) => (topic ? ROUTES.sermonsByTopic(topic) : ROUTES.sermons)} />
        <ForYourListening sermons={recommendedSermons} />
      </Container>
    </>
  );
}
