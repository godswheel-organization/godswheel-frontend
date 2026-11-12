// The ?redirectTo= value comes from the URL, so anyone can craft it: only same-site paths are followed,
// never "//evil.com" or "https://evil.com", which would send a freshly signed-in user off-site.
export function safeRedirect(target: string | null | undefined, fallback: string): string {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return fallback;
  }
  return target;
}
