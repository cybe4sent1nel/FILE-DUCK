<template>
  <div class="min-h-screen bg-gradient-to-br from-cream via-white to-lemon-50 py-12 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-lemon-400 bg-clip-text text-transparent">
          📂 My Uploads
        </h1>
        <p class="text-xl text-gray-600">
          Track your shared files - No sign-in required!
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
          <div class="text-3xl font-bold text-purple-600">{{ stats.totalUploads }}</div>
          <div class="text-sm text-gray-600 mt-1">Total Uploads</div>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <div class="text-3xl font-bold text-green-600">{{ stats.activeUploads }}</div>
          <div class="text-sm text-gray-600 mt-1">Active Files</div>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div class="text-3xl font-bold text-blue-600">{{ formatSize(stats.totalSize) }}</div>
          <div class="text-sm text-gray-600 mt-1">Total Size</div>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
          <div class="text-3xl font-bold text-orange-600">{{ stats.expiringSoon }}</div>
          <div class="text-sm text-gray-600 mt-1">Expiring Soon</div>
        </div>
      </div>

      <!-- Important Notice -->
      <div class="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
        <p class="text-sm text-gray-700 flex items-center">
          <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <strong class="mr-1">Important:</strong>
          Deleting from history will permanently remove the file from our storage and make it inaccessible to anyone with the share code.
        </p>
      </div>

      <!-- Upload History List -->
      <div v-if="history.length === 0" class="text-center py-20">
        <Vue3Lottie
          :animationData="EmptyAnimation"
          :height="200"
          :width="200"
          :loop="true"
          class="mx-auto"
        />
        <p class="text-xl text-gray-600 mt-4">No uploads yet</p>
        <router-link to="/" class="inline-block mt-4 px-6 py-3 bg-purple-400 text-white rounded-lg hover:bg-purple-500">
          Upload Your First File
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="item in history"
          :key="item.shareCode"
          class="bg-white rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all relative"
        >
          <!-- Expired Banner -->
          <div v-if="isExpired(item.expiresAt)" class="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl font-bold text-sm shadow-lg">
            ⚠️ EXPIRED
          </div>
          
          <div class="flex items-center justify-between">
            <!-- File Info -->
            <div class="flex items-center space-x-4 flex-1">
              <div class="bg-purple-50 rounded-lg p-3">
                <FileIcon class="w-8 h-8 text-purple-400" />
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-lg text-gray-800">{{ item.filename }}</h3>
                <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>{{ formatSize(item.size) }}</span>
                  <span>•</span>
                  <span>{{ formatDate(item.uploadedAt) }}</span>
                  <span>•</span>
                  <span :class="getExpiryClass(item.expiresAt)" class="flex items-center space-x-1">
                    <ClockLoader v-if="!isExpired(item.expiresAt)" />
                    <span>{{ getLiveTimeRemaining(item.expiresAt) }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-3">
              <button
                @click="copyShareCode(item.shareCode)"
                class="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 flex items-center space-x-2"
              >
                <CopyIcon class="w-4 h-4" />
                <span>Copy Code</span>
              </button>
              <button
                @click="deleteUpload(item.shareCode)"
                class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <Trash2Icon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Extended Info -->
          <div class="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-3 gap-4">
            <div>
              <div class="text-xs text-gray-500 mb-1">Share Code</div>
              <div class="font-mono font-bold text-purple-600">{{ item.shareCode }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Verification Code</div>
              <div class="font-mono font-bold text-green-600">{{ item.verificationCode }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Uses Remaining</div>
              <div class="font-bold text-gray-800">{{ item.usesLeft }} / {{ item.maxUses }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Clear History Button -->
      <div v-if="history.length > 0" class="text-center mt-8">
        <button
          @click="confirmClearHistory"
          class="px-6 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        >
          Clear All History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useNotifications } from '../composables/useNotifications';
import { Vue3Lottie } from 'vue3-lottie';
import { FileIcon, CopyIcon, Trash2Icon } from 'lucide-vue-next';
import ClockLoader from '../components/ClockLoader.vue';
import {
  getUploadHistory,
  getUploadStats,
  getTimeRemaining,
  removeFromUploadHistory,
  clearUploadHistory,
  type UploadHistoryItem,
} from '../services/uploadHistory';
import { deleteFile } from '../services/api';
import { formatFileSize } from '@fileduck/shared';
import FileStorageAnimation from '../../../../animations/File storage.json';

const EmptyAnimation = FileStorageAnimation;
const { success, confirm } = useNotifications();

const history = ref<UploadHistoryItem[]>([]);
const stats = ref({
  totalUploads: 0,
  activeUploads: 0,
  totalSize: 0,
  expiringSoon: 0,
});

let countdownInterval: NodeJS.Timeout;

onMounted(() => {
  loadHistory();
  // Update countdown every second
  countdownInterval = setInterval(() => {
    // Force reactivity update for live countdown
    history.value = [...history.value];
  }, 1000);
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});

function loadHistory() {
  history.value = getUploadHistory();
  stats.value = getUploadStats();
}

function formatSize(bytes: number): string {
  return formatFileSize(bytes);
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

function isExpired(expiresAt: number): boolean {
  return expiresAt <= Date.now();
}

function getLiveTimeRemaining(expiresAt: number): string {
  const now = Date.now();
  const remaining = expiresAt - now;
  
  if (remaining <= 0) return 'Expired';
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function getExpiryClass(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  const oneHour = 60 * 60 * 1000;
  
  if (remaining <= 0) return 'text-gray-400 line-through';
  if (remaining < oneHour) return 'text-red-600 font-bold';
  if (remaining < 24 * oneHour) return 'text-orange-600';
  return 'text-green-600';
}

function copyShareCode(shareCode: string) {
  navigator.clipboard.writeText(shareCode);
  success(`✓ Share code ${shareCode} copied to clipboard!`);
}

async function deleteUpload(shareCode: string) {
  const confirmed = await confirm('⚠️ This will PERMANENTLY delete the file from storage and make it inaccessible to anyone with the share code. Continue?');
  if (confirmed) {
    try {
      // Delete from backend storage (GitHub/S3) and Redis
      await deleteFile(shareCode);
      
      // Remove from local history
      removeFromUploadHistory(shareCode);
      loadHistory();
      success('✓ File permanently deleted from storage and history');
    } catch (error: any) {
      console.error('Delete failed:', error);
      // Even if backend deletion fails, remove from local history
      removeFromUploadHistory(shareCode);
      loadHistory();
      
      if (error.response?.status === 404) {
        success('✓ File already deleted or expired');
      } else {
        success('⚠️ Removed from history (backend deletion may have failed)');
      }
    }
  }
}

async function confirmClearHistory() {
  const confirmed = await confirm('⚠️ Clear all upload history? This will not delete files from storage, only remove them from your local browser history. This cannot be undone.');
  if (confirmed) {
    clearUploadHistory();
    loadHistory();
    success('✓ Upload history cleared');
  }
}
</script>
