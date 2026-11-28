import { History } from "lucide-react";
import toast from "react-hot-toast";
import { formatPlaybackTime } from "@/features/sermons/lib/formatSermon";

// Says playback jumped to where the listener left off: the toast's look comes from the Toaster (app/providers.tsx).
export function showResumeToast(positionSeconds: number) {
  toast(
    <span className="flex flex-col">
      <span className="font-medium text-foreground">Picking up where you left off</span>
      <span className="text-muted">
        From <span className="tabular-nums">{formatPlaybackTime(positionSeconds)}</span>
      </span>
    </span>,
    {
      id: "resume",
      icon: (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-500">
          <History className="size-[1.125rem]" aria-hidden />
        </span>
      ),
    }
  );
}
