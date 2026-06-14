const CACHE_NAME = 'coaster-tracker-v1';

// List all the core files your app needs to run offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './master_coasters.json'
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
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Fetch the newest version from the network in the background
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Update the cache with the fresh response
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
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