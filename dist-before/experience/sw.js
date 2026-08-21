// Wenu Mapu portal — service worker
// Caches all critical assets so the second visit is instant + offline-capable.
const CACHE_NAME = 'wenu-portal-v30';
const CRITICAL = [
  './',
  './index.html',
  './journey.css?v=20260710f',
  './journey.js?v=20260710f',
  './portal-run.css?v=20260710f',
  './portal-run.js?v=20260710f',
  './wenu-assets/wenu-mandala.png',
  './wenu-assets/wenu-favicon.png',
  './wenu-assets/wenu-og-image.jpg',
  './wenu-assets/wenu-wordmark-wenu.png',
  './wenu-assets/wenu-wordmark-mapu.png',
  './wenu-assets/wenu-bg-starmap.webp',
  './wenu-assets/wenu-n-antu.webp',
  './wenu-assets/wenu-s-kuyen.webp',
  './wenu-assets/wenu-e-azmapu.webp',
  './wenu-assets/wenu-w-lafken.webp',
  './wenu-assets/wenu-ne-dawn.webp',
  './wenu-assets/wenu-se-tierra.webp',
  './wenu-assets/wenu-sw-nebula.webp',
  './wenu-assets/wenu-nw-void.webp',
  './wenu-assets/wenu-ne-wunelfe.webp',
  './wenu-assets/wenu-treng-chakana.webp',
  './wenu-assets/wenu-center-portal-default.mp4',
  './wenu-assets/wenu-center-portal-default.webm',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Use addAll with catch so a single failure doesn't abort install
      Promise.all(CRITICAL.map((url) => cache.add(url).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Cache-first for assets, network-first for HTML (so updates propagate)
  const url = new URL(event.request.url);
  const isHTML = event.request.mode === 'navigate' || url.pathname.endsWith('.html');
  if (isHTML) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request).then((r) => r || caches.match('./index.html')))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached || fetch(event.request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached)
      )
    );
  }
});
