import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { featuredSermons } from "@/features/sermons/mocks/sermons";
import { ROUTES } from "@/lib/routes";
import { HERO_COPY } from "../content";
import Hero from "./Hero";

describe("Hero", () => {
  it("leads with the headline and both calls to action", () => {
    render(<Hero featuredSermon={featuredSermons[0]} />);

    expect(screen.getByRole("heading", { level: 1, name: HERO_COPY.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: HERO_COPY.primaryCta })).toHaveAttribute("href", ROUTES.sermons);
    expect(screen.getByRole("link", { name: HERO_COPY.secondaryCta })).toHaveAttribute("href", ROUTES.signUp);
  });

  it("previews the featured sermon", () => {
    render(<Hero featuredSermon={featuredSermons[0]} />);

    expect(screen.getByText(featuredSermons[0].title)).toBeInTheDocument();
    expect(screen.getByText(featuredSermons[0].preacher)).toBeInTheDocument();
  });
});
