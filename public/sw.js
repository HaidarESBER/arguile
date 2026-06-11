// Nuage PWA Service Worker
//
// Strategy (fixes the previous cache-first-forever behavior):
// - Navigations (HTML): network-first, fall back to cache, then /offline.
// - /_next/static & images: stale-while-revalidate (hashed/immutable assets).
// - /api/* and any non-GET request: NEVER cached, always network.
// - Versioned cache names; old versions are deleted on activate.
//
// Bump SW_VERSION on deploys that should invalidate runtime caches.
const SW_VERSION = 'v2';
const PAGE_CACHE = `nuage-pages-${SW_VERSION}`;
const ASSET_CACHE = `nuage-assets-${SW_VERSION}`;
const CURRENT_CACHES = [PAGE_CACHE, ASSET_CACHE];

const OFFLINE_URL = '/offline';
const MAX_ASSET_ENTRIES = 200;

// Install event - precache the offline fallback page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !CURRENT_CACHES.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

/** Best-effort trim so the asset cache doesn't grow forever. */
async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
      await Promise.all(
        keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key))
      );
    }
  } catch {
    // Ignore trim failures
  }
}

/** Network-first for navigations: fresh HTML wins, cache only as offline fallback. */
async function handleNavigation(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return Response.error();
  }
}

/** Stale-while-revalidate for static assets and images. */
async function handleAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
        trimCache(ASSET_CACHE, MAX_ASSET_ENTRIES);
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    return cached;
  }
  const response = await networkFetch;
  return response || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests over http(s)
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // Never touch cross-origin requests or API routes
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigations: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Hashed build assets and images: stale-while-revalidate
  const isStaticAsset = url.pathname.startsWith('/_next/static/');
  const isImage =
    url.pathname.startsWith('/_next/image') ||
    request.destination === 'image' ||
    /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$/i.test(url.pathname);
  const isFontOrMedia =
    request.destination === 'font' || request.destination === 'video';

  if (isStaticAsset || isImage || isFontOrMedia) {
    event.respondWith(handleAsset(request));
  }
  // Everything else (RSC payloads, data, etc.): let the network handle it.
});

// Message event - handle commands from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
