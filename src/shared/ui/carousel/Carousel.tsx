"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CarouselProps {
  // Names the carousel for screen readers, e.g. "How it works".
  label: string;
  slides: ReactNode[];
  // Each slide's width; default: one (with the next peeking) on phones, two on sm, three on lg.
  slideClassName?: string;
  className?: string;
}

const DEFAULT_SLIDE = "basis-[85%] sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)]";

// A row of slides that scrolls sideways with native scroll snapping: swipe or trackpad, plus ← → buttons and dots.
// No autoplay, on purpose: moving content is hard to read and to operate with assistive tech.
export default function Carousel({ label, slides, slideClassName = DEFAULT_SLIDE, className }: CarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  // How many places the row can stop at: every slide on phones, fewer when several fit side by side
  // (5 slides, 3 in view → 3 stops). One dot per stop, so every dot can light up.
  const [stops, setStops] = useState(slides.length);

  // Which slide is leftmost, and whether there's anything further either way.
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = [...track.children] as HTMLElement[];
    const style = getComputedStyle(track);
    const start = track.scrollLeft + Number.parseFloat(style.scrollPaddingLeft || "0");
    const gap = Number.parseFloat(style.columnGap || "0");
    const perView = Math.max(1, Math.floor((track.clientWidth + gap + 1) / (items[0].offsetWidth + gap)));
    let closest = 0;
    items.forEach((item, index) => {
      if (Math.abs(item.offsetLeft - start) < Math.abs(items[closest].offsetLeft - start)) closest = index;
    });
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    const lastStop = Math.max(0, items.length - perView);
    setStops(lastStop + 1);
    // At the very end the last stop is lit, even if snapping left the leftmost slide a little short of it.
    setActive(end ? lastStop : Math.min(closest, lastStop));
    setAtStart(track.scrollLeft <= 2);
    setAtEnd(end);
  }, []);

  // Re-measure when the layout changes (rotation, resize); the observer also fires once on mount.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const item = track?.children[Math.max(0, Math.min(index, slides.length - 1))] as HTMLElement | undefined;
    if (!track || !item) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const padding = Number.parseFloat(getComputedStyle(track).scrollPaddingLeft || "0");
    track.scrollTo({ left: item.offsetLeft - padding, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const arrowClasses =
    "flex size-11 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-surface disabled:pointer-events-none disabled:opacity-40";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={className}>
      <ul
        ref={trackRef}
        onScroll={measure}
        // Focusable so keyboard users can scroll it with the arrow keys too.
        tabIndex={0}
        aria-label={`${label}: ${slides.length} cards`}
        className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 pb-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {slides.map((slide, index) => (
          <li
            key={index}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            className={cn("flex shrink-0 snap-start", slideClassName)}
          >
            {slide}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button type="button" onClick={() => goTo(active - 1)} disabled={atStart} aria-label="Previous" className={arrowClasses}>
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: stops }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to card ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              // A 24px hit area around a small dot.
              className="group flex size-6 items-center justify-center"
            >
              <span
                className={cn(
                  "block h-2 rounded-full transition-all",
                  index === active ? "w-6 bg-brand-500" : "w-2 bg-surface-raised group-hover:bg-gray-600"
                )}
              />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => goTo(active + 1)} disabled={atEnd} aria-label="Next" className={arrowClasses}>
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
