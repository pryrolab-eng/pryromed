/* Pryrox PWA service worker — installable shell, offline fallback, safe caching.
 * Auth / notifications / streams always go to the network.
 */
const CACHE_VERSION = "pryrox-pwa-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("pryrox-pwa-") && key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isNetworkOnly(url) {
  const path = url.pathname;
  return (
    path.startsWith("/api/auth") ||
    path.startsWith("/api/notifications") ||
    path.includes("/stream") ||
    path.startsWith("/api/cron")
  );
}

function isStaticAsset(request, url) {
  if (request.destination === "style" || request.destination === "script" || request.destination === "font" || request.destination === "image") {
    return true;
  }
  return (
    pathIsNextStatic(url.pathname) ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".webmanifest")
  );
}

function pathIsNextStatic(pathname) {
  return pathname.startsWith("/_next/static/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (isNetworkOnly(url)) return;

  // Navigations: network-first, offline to offline page
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Next static + icons: cache-first
  if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirstAsset(request));
  }
});

async function networkFirstNavigation(request) {
  try {
    const fresh = await fetch(request);
    return fresh;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      await cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    return cached || Response.error();
  }
}
