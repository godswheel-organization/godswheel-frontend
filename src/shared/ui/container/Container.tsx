import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ContainerProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

// The page's content column: one max width and side gutter for every section.
export default function Container({ children, as: Component = "div", className }: ContainerProps) {
  return <Component className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>{children}</Component>;
}
