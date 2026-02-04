// Service Worker for Persistent Storage
const CACHE_NAME = 'fileduck-v1';
const STORAGE_CACHE = 'fileduck-storage-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll([
        '/',
        '/index.html',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STORAGE_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Message handler for persisting data
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SAVE_UPLOAD_HISTORY') {
    // Store upload history in IndexedDB via Cache API
    const data = event.data.payload;
    caches.open(STORAGE_CACHE).then((cache) => {
      const response = new Response(JSON.stringify(data));
      cache.put('/upload-history', response);
    });
  }
  
  if (event.data && event.data.type === 'GET_UPLOAD_HISTORY') {
    caches.open(STORAGE_CACHE).then((cache) => {
      cache.match('/upload-history').then((response) => {
        if (response) {
          response.json().then((data) => {
            event.ports[0].postMessage({ type: 'UPLOAD_HISTORY', data });
          });
        } else {
          event.ports[0].postMessage({ type: 'UPLOAD_HISTORY', data: [] });
        }
      });
    });
  }
});

// Fetch event - network first for API, cache first for assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network first for API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});
