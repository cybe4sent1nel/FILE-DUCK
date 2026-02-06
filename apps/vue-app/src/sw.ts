/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute, Route } from 'workbox-routing';
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

const PAGES_CACHE = 'pages-v2';
const CACHEABLE_PAGES = ['/offline', '/error', '/history'];

// Claim control immediately
self.skipWaiting();
clientsClaim();

// Clean up old caches
cleanupOutdatedCaches();

// Filter out forbidden pages from precache manifest
const FORBIDDEN_PATTERNS = ['/', '/index.html', '/download', '/privacy', '/terms'];
const filteredManifest = self.__WB_MANIFEST.filter((entry: any) => {
  const url = typeof entry === 'string' ? entry : entry.url;
  const shouldExclude = FORBIDDEN_PATTERNS.some(pattern => url === pattern || url.endsWith(pattern));
  if (shouldExclude) {
    console.log('[SW] Excluding from precache:', url);
  }
  return !shouldExclude;
});

// Precache only filtered assets (NO home page, download, privacy, terms)
precacheAndRoute(filteredManifest);

// Install event - cache offline, error, and history pages
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES_CACHE);
      // Cache all cacheable pages
      for (const page of CACHEABLE_PAGES) {
        try {
          await cache.add(new Request(page, { cache: 'reload' }));
          console.log('[SW] Cached page:', page);
        } catch (err) {
          console.warn('[SW] Failed to cache page:', page, err);
        }
      }
    })()
  );
});

// Activate event - clean old caches and remove home page from all caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      
      // Pages that should NEVER be cached
      const forbiddenPages = ['/', '/index.html', '/download', '/privacy', '/terms'];
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        
        // Remove forbidden pages from every cache
        for (const page of forbiddenPages) {
          const deleted = await cache.delete(page);
          if (deleted) {
            console.log(`[SW] Removed ${page} from ${cacheName}`);
          }
          // Also try with origin
          const fullUrl = new URL(page, self.location.origin).href;
          const deleted2 = await cache.delete(fullUrl);
          if (deleted2) {
            console.log(`[SW] Removed ${fullUrl} from ${cacheName}`);
          }
        }
        
        // Delete old page caches
        if ((cacheName.startsWith('pages-') || cacheName.startsWith('offline-')) && cacheName !== PAGES_CACHE) {
          await caches.delete(cacheName);
          console.log(`[SW] Deleted old cache: ${cacheName}`);
        }
      }
    })()
  );
});

// Cache Google Fonts
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache images
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Network First strategy for API calls (don't cache API responses when offline)
registerRoute(
  /\/api\/.*/,
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 5, // 5 minutes
      }),
    ],
  })
);

// Pages that should NEVER be cached (always fetch from network)
const FORBIDDEN_PAGES = ['/', '/index.html', '/download', '/privacy', '/terms'];

// Custom navigation handler - redirect to offline page when offline
const navigationHandler = async (options: any) => {
  const { request } = options;
  const url = new URL(request.url);
  
  // Check if this is a forbidden page (never cache)
  const isForbiddenPage = FORBIDDEN_PAGES.some(page => url.pathname === page);
  
  // Check if this is a cacheable page (offline, error, history)
  const isCacheablePage = !isForbiddenPage && CACHEABLE_PAGES.some(page => url.pathname === page || url.pathname.startsWith(page + '/'));
  
  // If forbidden page somehow got cached, remove it
  if (isForbiddenPage) {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      await cache.delete(request);
      await cache.delete(url.pathname);
    }
  }
  
  try {
    // Try to get from network first with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(request, { 
      signal: controller.signal,
      cache: 'no-cache'
    });
    clearTimeout(timeoutId);
    
    // Cache the response ONLY for cacheable pages (offline, error, history)
    // NEVER cache forbidden pages
    if (response.ok && isCacheablePage && !isForbiddenPage) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network request failed or timed out
    console.log('[SW] Network failed for:', url.pathname);
    
    // For forbidden pages, always show offline page (never serve from cache)
    if (isForbiddenPage) {
      console.log('[SW] Forbidden page offline, showing offline page');
    }
    // For cacheable pages (offline, error, history), try to serve from cache
    else if (isCacheablePage) {
      const cache = await caches.open(PAGES_CACHE);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', url.pathname);
        return cachedResponse;
      }
    }
    
    // For any page when offline, redirect to offline page
    console.log('[SW] Looking for offline page in caches...');
    
    // Try the pages cache first
    const pagesCache = await caches.open(PAGES_CACHE);
    const offlineResponse = await pagesCache.match('/offline');
    if (offlineResponse) {
      console.log('[SW] Serving offline page from', PAGES_CACHE);
      return offlineResponse;
    }
    
    // Search all caches as fallback
    const cacheNames = await caches.keys();
    console.log('[SW] Available caches:', cacheNames);
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const cachedOffline = await cache.match('/offline');
      if (cachedOffline) {
        console.log('[SW] Serving offline page from', cacheName);
        return cachedOffline;
      }
    }
    
    // Final fallback - return a basic offline HTML
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - FileDuck</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a2e; color: white; text-align: center; padding: 20px; }
          h1 { font-size: 2rem; margin-bottom: 1rem; }
          p { color: #888; margin-bottom: 2rem; }
          button { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem; }
          button:hover { background: #5a67d8; }
        </style>
      </head>
      <body>
        <h1>🦆 You're Offline</h1>
        <p>Check your internet connection and try again.</p>
        <button onclick="window.location.reload()">Retry</button>
      </body>
      </html>
    `, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/html; charset=utf-8'
      })
    });
  }
};

// Register navigation route
const navigationRoute = new NavigationRoute(navigationHandler, {
  denylist: [/^\/api/], // Don't handle API routes
});

registerRoute(navigationRoute);

// Additional fetch event handler for better offline detection
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  
  // Forbidden pages that should NEVER be cached
  const forbiddenPaths = ['/', '/index.html', '/download', '/privacy', '/terms'];
  const isForbiddenPage = forbiddenPaths.some(path => url.pathname === path);
  
  // If it's a forbidden page request, force network or show offline
  if (isForbiddenPage) {
    console.log('[SW] Intercepting forbidden page:', url.pathname);
    event.respondWith(
      fetch(event.request)
        .then(response => {
          console.log('[SW] Serving forbidden page from network:', url.pathname);
          return response;
        })
        .catch(async () => {
          console.log('[SW] Network failed for forbidden page, showing offline');
          // Serve offline page
          const pagesCache = await caches.open(PAGES_CACHE);
          const offlineResponse = await pagesCache.match('/offline');
          if (offlineResponse) {
            return offlineResponse;
          }
          
          // Fallback HTML
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Offline - FileDuck</title>
              <style>
                body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a2e; color: white; text-align: center; padding: 20px; }
                h1 { font-size: 2rem; margin-bottom: 1rem; }
                p { color: #888; margin-bottom: 2rem; }
                button { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem; }
                button:hover { background: #5a67d8; }
              </style>
            </head>
            <body>
              <h1>🦆 You're Offline</h1>
              <p>Check your internet connection and try again.</p>
              <button onclick="window.location.reload()">Retry</button>
            </body>
            </html>
          `, {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }
  
  // Only handle navigation requests to same origin (HTML pages)
  if (event.request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(navigationHandler({ request: event.request, event }));
  }
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
