const CACHE_NAME = 'coaster-tracker-v2';

// List all the core files your app needs to run offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './master_coasters.json',
  'https://cdn.jsdelivr.net/npm/mobile-drag-drop@3.0.0-rc.0/default.css',
  'https://cdn.jsdelivr.net/npm/mobile-drag-drop@3.0.0-rc.0/index.min.js',
  'https://cdn.jsdelivr.net/npm/mobile-drag-drop@3.0.0-rc.0/scroll-behaviour.min.js',
  'https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];

// Install Event: Cache initial assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches if the version number changes
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  // STRICT REQUIREMENT: Only cache GET requests. Ignore POST, PUT, etc.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      // Fetch the newest version from the network in the background
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Update the cache with the fresh response (allowing status 0 for external CDNs)
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          caches.open(CACHE_NAME).then(cache => {
            // Strip the cache-busting query string before saving
            const cleanUrl = event.request.url.split('?')[0];
            cache.put(cleanUrl, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // If network fails (offline), just rely on the cached response
        console.log('Network request failed, relying on cache.');
      });

      // Immediately return the cached response if we have it, otherwise wait for the network
      return cachedResponse || fetchPromise;
    })
  );
});