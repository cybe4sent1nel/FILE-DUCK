<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FFFBF5] px-4 py-8 relative overflow-hidden">
    <!-- Background Animation -->
    <div class="absolute inset-0 flex items-center justify-center opacity-20">
      <Vue3Lottie
        :animationData="NoInternetAnimation"
        :height="800"
        :width="800"
        :loop="true"
        class="pointer-events-none"
      />
    </div>

    <!-- Content -->
    <div class="max-w-2xl w-full relative z-10">
      <div class="text-center">
        <!-- Error Code -->
        <div class="flex items-center justify-center gap-3 mb-6">
          <WifiOff class="w-16 h-16 text-orange-500" />
          <h1 class="text-6xl font-bold text-gray-800">Offline</h1>
        </div>

        <!-- Witty Message -->
        <h2 class="text-3xl font-semibold text-gray-700 mb-4">{{ wittyMessage }}</h2>
        
        <p class="text-lg text-gray-600 mb-8">
          It seems you've lost your internet connection. Your files are safe, but you'll need to reconnect to continue.
        </p>

        <!-- Troubleshooting Toggle -->
        <button
          @click="showTroubleshooting = !showTroubleshooting"
          class="mb-8 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          <Lightbulb class="w-5 h-5" />
          {{ showTroubleshooting ? 'Hide' : 'Show' }} Troubleshooting Steps
          <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showTroubleshooting }" />
        </button>

        <!-- Troubleshooting Steps -->
        <div v-if="showTroubleshooting" class="bg-white/80 backdrop-blur rounded-xl p-6 mb-8 text-left shadow-lg">
          <div class="flex items-center gap-2 mb-4">
            <Lightbulb class="w-5 h-5 text-yellow-500" />
            <h3 class="text-xl font-semibold text-gray-800">Troubleshooting Steps</h3>
          </div>
          
          <ol class="space-y-3 text-gray-700">
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">1</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <Wifi class="w-4 h-4" />
                  Check your WiFi or network connection
                </div>
                <p class="text-sm text-gray-500 mt-1">Make sure you're connected to a network</p>
              </div>
            </li>
            
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">2</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <Router class="w-4 h-4" />
                  Restart your router or modem
                </div>
                <p class="text-sm text-gray-500 mt-1">Unplug for 30 seconds, then plug back in</p>
              </div>
            </li>
            
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">3</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <ToggleLeft class="w-4 h-4" />
                  Try airplane mode on/off
                </div>
                <p class="text-sm text-gray-500 mt-1">Toggle to reset your connection</p>
              </div>
            </li>
            
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">4</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <RefreshCw class="w-4 h-4" />
                  Refresh this page once connected
                </div>
                <p class="text-sm text-gray-500 mt-1">We'll automatically detect when you're back online</p>
              </div>
            </li>
          </ol>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="retryConnection"
            class="btn-primary inline-flex items-center justify-center px-6 py-3"
          >
            <RefreshCw class="w-5 h-5 mr-2" :class="{ 'animate-spin': isRetrying }" />
            {{ isRetrying ? 'Checking...' : 'Retry Connection' }}
          </button>
          
          <router-link
            to="/"
            class="btn-secondary inline-flex items-center justify-center px-6 py-3"
          >
            <Home class="w-5 h-5 mr-2" />
            Go Home
          </router-link>
        </div>

        <!-- Online Status Indicator -->
        <div class="mt-8 flex items-center justify-center gap-2 text-sm">
          <div :class="isOnline ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full animate-pulse"></div>
          <span class="text-gray-600">{{ isOnline ? 'Back online!' : 'Currently offline' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import { 
  WifiOff, 
  Wifi, 
  Router, 
  ToggleLeft, 
  RefreshCw, 
  Home,
  Lightbulb,
  ChevronDown
} from 'lucide-vue-next';
import NoInternetAnimation from '../../../../animations/No internet connection.json';
import { useRouter } from 'vue-router';

const router = useRouter();
const isRetrying = ref(false);
const isOnline = ref(navigator.onLine);

// Witty duck messages
const duckMessages = [
  "Quack! The internet flew away! 🦆",
  "Even ducks need WiFi to fly! 🦆",
  "Houston, we've lost connection! 🦆",
  "The internet took a duck break! 🦆",
  "No signal? Must be duck season! 🦆",
  "Looks like the WiFi went south for winter! 🦆",
  "Connection paddled away! 🦆",
  "The web is playing hide and seek! 🦆",
  "Internet? More like... outer-net! 🦆",
  "Even our rubber ducky can't debug this! 🦆"
];

const wittyMessage = ref(duckMessages[Math.floor(Math.random() * duckMessages.length)]);
const showTroubleshooting = ref(false);

const retryConnection = async () => {
  isRetrying.value = true;
  
  try {
    const response = await fetch('/api/health', { method: 'HEAD' });
    if (response.ok) {
      isOnline.value = true;
      setTimeout(() => {
        router.push('/');
      }, 500);
    }
  } catch (error) {
    isOnline.value = false;
  } finally {
    setTimeout(() => {
      isRetrying.value = false;
    }, 1000);
  }
};

const handleOnline = () => {
  isOnline.value = true;
  setTimeout(() => {
    router.push('/');
  }, 1000);
};

const handleOffline = () => {
  isOnline.value = false;
};

onMounted(() => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>
