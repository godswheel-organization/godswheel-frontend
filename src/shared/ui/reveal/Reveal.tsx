"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface RevealProps {
  children: ReactNode;
  // Staggers a group: each item a little after the one before.
  delayMs?: number;
  className?: string;
}

// Fades and lifts its content in as it scrolls into view. It's always rendered visible first (so search engines,
// no-JS visitors and anything already on screen see it straight away); only content still below the fold is
// hidden, to be revealed once. Reduced motion: no effect at all. The animation lives in globals.css ([data-reveal]).
export default function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    // Set on the element directly (React doesn't manage this attribute), so there's no extra render.
    element.dataset.reveal = "waiting";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn(className)} style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}>
      {children}
    </div>
  );
}
