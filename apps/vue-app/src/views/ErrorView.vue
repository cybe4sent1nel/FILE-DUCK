<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full">
      <div class="card text-center">
        <Vue3Lottie
          :animationData="ErrorAnimation"
          :height="250"
          :width="250"
          :loop="true"
        />
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Oops! Something Went Wrong</h1>
        <p class="text-gray-600 mb-6">
          We're experiencing technical difficulties. Please try again in a few moments.
        </p>
        <button
          @click="retry"
          class="btn-primary inline-flex items-center justify-center px-6 py-3"
        >
          <RefreshCwIcon class="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie';
import { RefreshCwIcon } from 'lucide-vue-next';
import ErrorAnimation from '../../../../animations/Error.json';

const retry = () => {
  window.location.reload();
};
</script>
