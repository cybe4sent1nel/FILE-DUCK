<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full">
      <div class="card text-center">
        <Vue3Lottie
          :animationData="ShockedDuckAnimation"
          :height="250"
          :width="250"
          :loop="false"
        />
        <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p class="text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <router-link
          to="/"
          class="btn-primary inline-flex items-center justify-center px-6 py-3"
        >
          <HomeIcon class="w-5 h-5 mr-2" />
          Go Back Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie';
import { HomeIcon } from 'lucide-vue-next';
import ShockedDuckAnimation from '../../../../animations/Shocked Duck.json';
</script>
