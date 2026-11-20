import { Cross } from "lucide-react";
import LaunchSplashDismiss from "./LaunchSplashDismiss";

// The logo screen a phone sees as the app opens: the mark pops in, the name rises under it, then it all fades
// into the page. Always in the HTML but hidden by CSS unless the head script turned it on (see splashConfig.ts),
// so it's on screen from the very first frame, with no flash of the page underneath.
// TODO(design): swap the lucide cross for the real GodsWheel mark with the other brand assets.
export default function LaunchSplash() {
  return (
    <>
      <div className="launch-splash" aria-hidden>
        <div className="launch-splash-glow" />
        <div className="relative flex flex-col items-center">
          <span className="launch-splash-ring" />
          <span className="launch-splash-mark flex size-20 items-center justify-center rounded-2xl border border-border bg-surface shadow-theme-xl">
            <Cross className="size-10 text-foreground" strokeWidth={1.5} />
          </span>
          <span className="launch-splash-name mt-5 text-2xl font-semibold tracking-tight text-foreground">GodsWheel</span>
        </div>
      </div>
      <LaunchSplashDismiss />
    </>
  );
}
