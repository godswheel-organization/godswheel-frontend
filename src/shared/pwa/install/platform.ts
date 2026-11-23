// How this browser installs a web app, which decides the steps the install guide shows.
export type InstallPlatform =
  // iPhone / iPad: Share, then Add to Home Screen (Safari, and other iOS browsers since iOS 16.4).
  | "ios"
  // Android: Chrome and most others offer it natively; the menu has Install app / Add to Home screen.
  | "android"
  // Chrome, Edge, Brave, Opera on a computer: native install, or the install icon in the address bar.
  | "desktop-chromium"
  // Safari 17+ on a Mac: File, then Add to Dock.
  | "mac-safari"
  // Can't install web apps (Firefox on a computer, and anything unrecognised): no toast, no guide.
  | "unsupported";

export function detectInstallPlatform(userAgent: string, maxTouchPoints = 0): InstallPlatform {
  // iPadOS reports itself as a Mac; touch support gives it away.
  if (/iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)) return "ios";
  if (/Android/.test(userAgent)) return "android";
  if (/Firefox\//.test(userAgent)) return "unsupported";
  // Chromium browsers also say "Safari", so they're checked before Safari itself.
  if (/Chrome\/|Chromium\/|Edg\//.test(userAgent)) return "desktop-chromium";
  if (/Macintosh/.test(userAgent) && /Version\/\d+.*Safari\//.test(userAgent)) return "mac-safari";
  return "unsupported";
}

export function currentInstallPlatform(): InstallPlatform {
  return detectInstallPlatform(navigator.userAgent, navigator.maxTouchPoints);
}
