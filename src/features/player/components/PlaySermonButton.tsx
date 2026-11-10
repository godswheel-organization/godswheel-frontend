"use client";

import type { ComponentProps } from "react";
import type { Sermon } from "@/features/sermons/types";
import { useAppDispatch } from "@/lib/store";
import Button from "@/shared/ui/button/Button";
import { playSermon } from "../store/playerSlice";

type PlaySermonButtonProps = Omit<ComponentProps<typeof Button>, "onClick" | "href"> & {
  sermon: Sermon;
};

// Any button that loads a sermon into the mini player (e.g. "Listen now").
export default function PlaySermonButton({ sermon, ...buttonProps }: PlaySermonButtonProps) {
  const dispatch = useAppDispatch();
  return <Button type="button" {...buttonProps} onClick={() => dispatch(playSermon(sermon))} />;
}
