// Shared by the inline script (runs before first paint) and LaunchSplashDismiss (runs once the app is ready).

// Set on <html> while the splash shows: "" = showing, "leaving" = fading out.
export const SPLASH_ATTRIBUTE = "data-launch-splash";

// Marks this launch as having had its splash. sessionStorage lasts as long as the app (or tab) stays open,
// so reopening the app shows the splash again, but moving around inside it doesn't.
export const SPLASH_SEEN_KEY = "godswheel_launch_splash_seen";

// Phones only (below Tailwind's `md`). Tablets and desktops open straight into the page.
export const SPLASH_MEDIA_QUERY = "(max-width: 767px)";

// On screen at least this long (counted from the start of the page load), so it reads as a moment, not a flicker.
export const SPLASH_MIN_MS = 1300;
// Matches the splash-out animation in globals.css.
export const SPLASH_EXIT_MS = 400;

// Runs synchronously in <head>, before anything paints: turns the splash on for a phone's first page of a launch.
// Wrapped in try/catch so blocked storage (private mode, strict settings) just means no splash.
export const SPLASH_SCRIPT = `try{if(matchMedia(${JSON.stringify(SPLASH_MEDIA_QUERY)}).matches&&!sessionStorage.getItem(${JSON.stringify(
  SPLASH_SEEN_KEY
)}))document.documentElement.setAttribute(${JSON.stringify(SPLASH_ATTRIBUTE)},"")}catch(e){}`;
