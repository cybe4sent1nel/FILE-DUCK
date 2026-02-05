import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './style.css';
import { registerSW } from 'virtual:pwa-register';

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
  },
  onRegisterError(error) {
    console.error('SW registration error', error);
  },
});

// Handle offline navigation
window.addEventListener('offline', () => {
  console.log('Browser is offline');
  if (router.currentRoute.value.path !== '/offline') {
    router.push('/offline');
  }
});

window.addEventListener('online', () => {
  console.log('Browser is online');
  if (router.currentRoute.value.path === '/offline') {
    router.push('/');
  }
});

// Check online status on app load
if (!navigator.onLine && router.currentRoute.value.path !== '/offline') {
  router.push('/offline');
}
