import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './style.css';
import { registerSW } from 'virtual:pwa-register';

const app = createApp(App);
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
  router.push('/offline');
});

window.addEventListener('online', () => {
  if (router.currentRoute.value.path === '/offline') {
    router.push('/');
  }
});
