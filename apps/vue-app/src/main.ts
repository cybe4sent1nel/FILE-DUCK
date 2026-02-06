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
