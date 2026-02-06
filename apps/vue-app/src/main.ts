import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './style.css';
import { registerSW } from 'virtual:pwa-register';

// Force offline landing before app initializes
if (!navigator.onLine && window.location.pathname !== '/offline') {
  window.location.replace('/offline');
}

const app = createApp(App);

// Global error handler for unhandled errors
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err, info);
  // Navigate to error page for critical errors
  if (err instanceof Error && !err.message.includes('navigation')) {
    router.push({
      name: 'Error',
      params: { 
        errorCode: '500',
        errorDescription: err.message 
      }
    });
  }
};

app.use(createPinia());
app.use(router);
app.mount('#app');

// Helper: clear cached documents for forbidden pages
async function clearForbiddenCachesClient() {
  if (!('caches' in window)) return;
  const forbiddenPages = ['/', '/index.html', 'index.html', '/download', '/privacy', '/terms'];
  const cacheNames = await caches.keys();

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    for (const request of requests) {
      const url = new URL(request.url);
      const isForbidden = forbiddenPages.includes(url.pathname);
      const isDocument = request.destination === 'document';
      if (isForbidden || isDocument) {
        await cache.delete(request);
      }
    }
  }
}

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, will update on next visit');
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegistered(registration) {
    console.log('Service Worker registered');
    // Check for updates every hour
    setInterval(() => {
      registration?.update();
    }, 60 * 60 * 1000);

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_FORBIDDEN_CACHES',
      });
    }

    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: 'CLEAR_FORBIDDEN_CACHES' });
    });

    clearForbiddenCachesClient();
  },
  onRegisterError(error) {
    console.error('SW registration error', error);
  },
});

// Handle offline navigation (force hard navigation to avoid cached home shell)
window.addEventListener('offline', () => {
  console.log('Browser is offline');
  if (window.location.pathname !== '/offline') {
    window.location.replace('/offline');
  }
});

window.addEventListener('online', () => {
  console.log('Browser is online');
  if (window.location.pathname === '/offline') {
    router.replace('/');
  }
});

// Check online status on app load
if (!navigator.onLine && window.location.pathname !== '/offline') {
  window.location.replace('/offline');
}

// Periodic offline guard to prevent stale home page when connectivity drops
setInterval(() => {
  if (!navigator.onLine && window.location.pathname !== '/offline') {
    window.location.replace('/offline');
  }
}, 2000);

// Connectivity check (handles cases where navigator.onLine is unreliable)
const apiBase = import.meta.env.VITE_API_URL || '';

async function checkConnectivity() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const healthUrl = apiBase ? `${apiBase}/health` : '/api/health';

    const response = await fetch(healthUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    if (window.location.pathname === '/offline') {
      router.replace('/');
    }
  } catch {
    if (window.location.pathname !== '/offline') {
      window.location.replace('/offline');
    }
  }
}

setInterval(checkConnectivity, 5000);
