import { Cross } from "lucide-react";
import LaunchSplashDismiss from "./LaunchSplashDismiss";

// The logo screen a phone sees as the app opens: the mark pops in, the name rises under it, then it all fades
// into the page. Always in the HTML but hidden by CSS unless the head script turned it on (see splashConfig.ts),
// so it's on screen from the very first frame, with no flash of the page underneath.
// TODO(design): swap the lucide cross for the real GodsWheel mark with the other brand assets.
export default function LaunchSplash() {
  return (
    <>
      {/* Styled only by splashStyles.ts (inlined in <head>), so it draws before the main stylesheet loads. */}
      <div className="launch-splash" aria-hidden>
        <div className="launch-splash-glow" />
        <div className="launch-splash-body">
          <span className="launch-splash-ring" />
          <span className="launch-splash-mark">
            <Cross strokeWidth={1.5} />
          </span>
          <span className="launch-splash-name">GodsWheel</span>
        </div>
      </div>
      <LaunchSplashDismiss />
    </>
  );
}
