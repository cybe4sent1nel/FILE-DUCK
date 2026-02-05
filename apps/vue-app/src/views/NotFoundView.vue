<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FFFBF5] px-4 py-8 relative overflow-hidden">
    <!-- Background Animation -->
    <div class="absolute inset-0 flex items-center justify-center opacity-25">
      <Vue3Lottie
        :animationData="ShockedDuckAnimation"
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
          <AlertCircle class="w-16 h-16 text-orange-500" />
          <h1 class="text-6xl font-bold text-gray-800">404</h1>
        </div>

        <!-- Witty Message -->
        <h2 class="text-3xl font-semibold text-gray-700 mb-4">{{ wittyMessage }}</h2>
        
        <p class="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist, has been moved, or is hiding from the authorities.
        </p>

        <!-- Troubleshooting Steps -->
        <div class="bg-white/80 backdrop-blur rounded-xl p-6 mb-8 text-left shadow-lg">
          <div class="flex items-center gap-2 mb-4">
            <Lightbulb class="w-5 h-5 text-yellow-500" />
            <h3 class="text-xl font-semibold text-gray-800">What can you do?</h3>
          </div>
          
          <ol class="space-y-3 text-gray-700">
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">1</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <Search class="w-4 h-4" />
                  Check the URL for typos
                </div>
                <p class="text-sm text-gray-500 mt-1">Make sure the web address is spelled correctly</p>
              </div>
            </li>
            
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">2</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <Home class="w-4 h-4" />
                  Go back to the homepage
                </div>
                <p class="text-sm text-gray-500 mt-1">Start fresh from our main page</p>
              </div>
            </li>
            
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">3</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <ArrowLeft class="w-4 h-4" />
                  Use the back button
                </div>
                <p class="text-sm text-gray-500 mt-1">Return to the previous page</p>
              </div>
            </li>
            
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-semibold shrink-0 mt-0.5">4</span>
              <div>
                <div class="flex items-center gap-2 font-medium">
                  <Mail class="w-4 h-4" />
                  Contact support
                </div>
                <p class="text-sm text-gray-500 mt-1">Let us know if you think this is a mistake</p>
              </div>
            </li>
          </ol>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/"
            class="btn-primary inline-flex items-center justify-center px-6 py-3"
          >
            <Home class="w-5 h-5 mr-2" />
            Go Back Home
          </router-link>
          
          <button
            @click="goBack"
            class="btn-secondary inline-flex items-center justify-center px-6 py-3"
          >
            <ArrowLeft class="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import { 
  Home, 
  ArrowLeft, 
  AlertCircle, 
  Search, 
  Mail,
  Lightbulb
} from 'lucide-vue-next';
import ShockedDuckAnimation from '../../../../animations/Shocked Duck.json';
import { useRouter } from 'vue-router';

const router = useRouter();

// Witty duck messages
const duckMessages = [
  "Quack! This page went on vacation! 🦆",
  "404: Duck not found in this pond! 🦆",
  "Even our GPS duck got lost here! 🦆",
  "This page flew the coop! 🦆",
  "Waddle you do? Page not found! 🦆",
  "Our duck checked everywhere... nothing! 🦆",
  "Page missing: Reward - one bread crumb! 🦆",
  "Duck, duck... no page! 🦆",
  "This URL is for the birds! 🦆",
  "Page went quackers and disappeared! 🦆"
];

const wittyMessage = ref(duckMessages[Math.floor(Math.random() * duckMessages.length)]);

const goBack = () => {
  router.back();
};
</script>
