// Hand-written (no Workbox) — Turbopack doesn't run Serwist's webpack build hook.

const CACHE_VERSION = "v1";
const SHELL_CACHE = `godswheel-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `godswheel-assets-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

const SHELL_URLS = [OFFLINE_URL, "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS))
  );
});

self.addEventListener("activate", (event) => {
  const currentCaches = [SHELL_CACHE, ASSET_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !currentCaches.includes(key)).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function isExcludedPath(pathname) {
  return pathname.startsWith("/api") || pathname.startsWith("/v1");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin || isExcludedPath(url.pathname)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => (await caches.match(request)) ?? (await caches.match(OFFLINE_URL)))
    );
    return;
  }

  if (["script", "style", "image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? fetchPromise;
      })
    );
  }
});
