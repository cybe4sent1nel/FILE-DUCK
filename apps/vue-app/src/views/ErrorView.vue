<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FFFBF5] px-4 py-8 relative overflow-hidden">
    <!-- Background Animation -->
    <div class="absolute inset-0 flex items-center justify-center opacity-20">
      <Vue3Lottie
        :animationData="ErrorAnimation"
        :height="700"
        :width="700"
        :loop="true"
        class="pointer-events-none"
      />
    </div>

    <!-- Content -->
    <div class="max-w-2xl w-full relative z-10">
      <div class="text-center">
        <!-- Error Code -->
        <div class="flex items-center justify-center gap-3 mb-6">
          <AlertTriangle class="w-16 h-16 text-red-500" />
          <h1 class="text-6xl font-bold text-gray-800">{{ errorCode || 'Error' }}</h1>
        </div>

        <!-- Witty Message -->
        <div class="flex items-center justify-center gap-3 mb-4">
          <img src="/logo.png" alt="FileDuck" class="w-10 h-10" />
          <h2 class="text-3xl font-semibold text-gray-700">{{ wittyMessage }}</h2>
        </div>
        
        <p class="text-lg text-gray-600 mb-8">
          {{ errorDescription || 'Something unexpected happened. Our ducks are working on it!' }}
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
            <h3 class="text-xl font-semibold text-gray-800">Try these steps</h3>
          </div>
          
          <ol class="space-y-3 text-gray-700">
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">1</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <RefreshCw class="w-4 h-4" />
                  Refresh the page
                </div>
                <p class="text-sm text-gray-500 mt-1">Sometimes a simple refresh fixes everything</p>
              </div>
            </li>
            
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">2</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <Trash2 class="w-4 h-4" />
                  Clear browser cache
                </div>
                <p class="text-sm text-gray-500 mt-1">Old cached data might be causing issues</p>
              </div>
            </li>
            
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">3</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <Clock class="w-4 h-4" />
                  Wait a few minutes
                </div>
                <p class="text-sm text-gray-500 mt-1">Our servers might be temporarily overwhelmed</p>
              </div>
            </li>
            
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">4</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <MessageCircle class="w-4 h-4" />
                  Contact support
                </div>
                <p class="text-sm text-gray-500 mt-1">If the problem persists, let us know</p>
              </div>
            </li>
          </ol>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="reloadPage"
            class="btn-primary inline-flex items-center justify-center px-6 py-3"
          >
            <RefreshCw class="w-5 h-5 mr-2" />
            Reload Page
          </button>
          
          <router-link
            to="/"
            class="btn-secondary inline-flex items-center justify-center px-6 py-3"
          >
            <Home class="w-5 h-5 mr-2" />
            Go Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Lightbulb,
  Trash2,
  Clock,
  MessageCircle,
  ChevronDown
} from 'lucide-vue-next';
import ErrorAnimation from '../../../../animations/Error.json';

interface Props {
  errorCode?: string | number;
  errorDescription?: string;
}

const props = withDefaults(defineProps<Props>(), {
  errorCode: undefined,
  errorDescription: undefined,
});

// Witty duck messages
const duckMessages = [
  "Quack! Something went wrong!",
  "Our ducks tripped over the code!",
  "Error: Duck overflow detected!",
  "The server ducks are on a coffee break!",
  "Oops! A wild bug appeared!",
  "Houston, we have a duck problem!",
  "Error: Too many ducks in the system!",
  "The code went duck-shaped!",
  "Something's fishy... or should we say, ducky!",
  "Our debugging duck needs debugging!"
];

const wittyMessage = ref(duckMessages[Math.floor(Math.random() * duckMessages.length)]);
const showTroubleshooting = ref(false);

const reloadPage = () => {
  window.location.reload();
};
</script>
