"use client";

import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import Button from "@/shared/ui/button/Button";

type GoBackButtonProps = Omit<ComponentProps<typeof Button>, "onClick" | "href" | "children"> & {
  children?: ComponentProps<typeof Button>["children"];
};

export default function GoBackButton({ children = "Go back", ...buttonProps }: GoBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // No history to go back to (e.g. a direct link) — home is the only sane fallback.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <Button type="button" {...buttonProps} onClick={handleClick}>
      {children}
    </Button>
  );
}
