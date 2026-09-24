// WorkSync AI — minimal service worker.
// Purpose: enable PWA installability without any caching surprises.
// It never serves stale content: every request goes to the network;
// failures (offline) fall through untouched.
const CACHE = 'worksync-ai-v1';

self.addEventListener('install', (event) => {
  // Take over immediately once activated; no pre-caching.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up any older caches from previous iterations.
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

// Network pass-through fetch handler. Required for Chrome's install
// criteria, but it NEVER serves from cache — offline requests simply fail
// like they would without a service worker, so no stale-content risk.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
