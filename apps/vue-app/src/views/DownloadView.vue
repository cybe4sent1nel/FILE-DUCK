<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <div class="flex items-center justify-center mb-6">
        <img src="/logo.png" alt="FileDuck" class="h-12 w-12 mr-3" />
        <h1 class="text-3xl font-bold text-center">
          Download File
        </h1>
      </div>

      <div v-if="!downloadUrl" class="space-y-6">
        <!-- Verify Code Animation -->
        <div class="flex justify-center">
          <Vue3Lottie
            :animationData="VerifyCodeAnimation"
            :height="150"
            :width="150"
            :loop="true"
          />
        </div>

        <!-- Share Code Input -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <KeyIcon class="w-4 h-4 mr-2" />
            Enter Share Code
          </label>
          <input
            v-model="inputCode"
            type="text"
            placeholder="e.g., aBc123XyZ9"
            class="input-field text-center text-2xl font-mono"
            @keyup.enter="redeemCode"
            maxlength="10"
          />
        </div>

        <!-- CAPTCHA (if required) -->
        <div v-if="captchaRequired" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm text-yellow-800 mb-3 flex items-center">
            <AlertTriangleIcon class="w-5 h-5 mr-2" />
            CAPTCHA verification required
          </p>
          <div class="flex justify-center">
            <!-- Placeholder for reCAPTCHA widget -->
            <div class="bg-gray-200 rounded p-8 text-center">
              <p class="text-sm text-gray-600">reCAPTCHA Widget</p>
              <p class="text-xs text-gray-500">(Add Google reCAPTCHA script)</p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-start">
            <Vue3Lottie
              v-if="errorMessage.toLowerCase().includes('malicious') || errorMessage.toLowerCase().includes('quarantine')"
              :animationData="ShockedDuckAnimation"
              :height="80"
              :width="80"
              :loop="false"
              class="mr-3 flex-shrink-0"
            />
            <XCircleIcon v-else class="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
            <div class="flex-1">
              <p class="text-sm font-bold text-red-900 mb-1">
                {{ errorMessage.toLowerCase().includes('malicious') || errorMessage.toLowerCase().includes('quarantine') ? '⚠️ WARNING: Potentially Malicious File' : 'Error' }}
              </p>
              <p class="text-sm text-red-800">
                {{ errorMessage }}
              </p>
              <p v-if="errorMessage.toLowerCase().includes('quarantine')" class="text-xs text-red-700 mt-2">
                This file has been flagged by our security systems. Proceed with extreme caution and scan with your own antivirus before opening.
              </p>
            </div>
          </div>
        </div>

        <!-- Redeem Button -->
        <button
          @click="redeemCode"
          :disabled="!inputCode || isRedeeming"
          class="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <LoaderIcon v-if="isRedeeming" class="w-5 h-5 mr-2 animate-spin" />
          <UnlockIcon v-else class="w-5 h-5 mr-2" />
          {{ isRedeeming ? 'Verifying...' : 'Access File' }}
        </button>
      </div>

      <!-- File Info & Download -->
      <div v-else class="space-y-6">
        <!-- Quarantine Warning (if applicable) -->
        <div v-if="fileInfo.isQuarantined" class="bg-red-50 border-2 border-red-400 rounded-lg p-4">
          <div class="flex items-start">
            <Vue3Lottie
              :animationData="ShockedDuckAnimation"
              :height="80"
              :width="80"
              :loop="false"
              class="mr-3 flex-shrink-0"
            />
            <div class="flex-1">
              <p class="text-sm font-bold text-red-900 mb-2">
                ⚠️ SECURITY WARNING: QUARANTINED FILE
              </p>
              <p class="text-sm text-red-800 mb-2">
                This file has been flagged as potentially malicious by one or more antivirus engines.
              </p>
              <ul class="text-xs text-red-700 space-y-1 mb-3">
                <li>• File is stored in quarantine and isolated from public access</li>
                <li>• Download at your own risk</li>
                <li>• Scan with updated antivirus before opening</li>
                <li>• Do NOT execute or open if you are unsure</li>
              </ul>
              <p class="text-xs font-bold text-red-900">
                FileDuck is not responsible for any damage caused by downloading this file.
              </p>
            </div>
          </div>
        </div>

        <div class="text-center">
          <Vue3Lottie
            :animationData="DataDownloadingAnimation"
            :height="180"
            :width="180"
            :loop="false"
          />
          <h2 class="text-2xl font-bold" :class="fileInfo.isQuarantined ? 'text-red-600' : 'text-green-600'" class="mb-4">
            {{ fileInfo.isQuarantined ? 'Quarantined File Access' : 'File Ready for Download' }}
          </h2>
        </div>

        <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-3">
          <div class="flex justify-between items-center">
            <span class="flex items-center font-semibold">
              <FileIcon class="w-4 h-4 mr-2" />
              Filename:
            </span>
            <span>{{ fileInfo.filename }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="flex items-center font-semibold">
              <HardDriveIcon class="w-4 h-4 mr-2" />
              Size:
            </span>
            <span>{{ formatSize(fileInfo.size) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="flex items-center font-semibold">
              <DownloadIcon class="w-4 h-4 mr-2" />
              Downloads left:
            </span>
            <span>{{ fileInfo.usesLeft === 999 ? 'Unlimited' : fileInfo.usesLeft }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="flex items-center font-semibold">
              <ClockIcon class="w-4 h-4 mr-2" />
              Expires:
            </span>
            <span>{{ formatExpiry(fileInfo.expiresAt) }}</span>
          </div>
        </div>

        <!-- SHA-256 Checksum -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-semibold text-blue-800 flex items-center">
                <ShieldCheckIcon class="w-4 h-4 mr-2" />
                SHA-256 Checksum
              </p>
              <p class="font-mono text-xs text-blue-700 mt-1 break-all">
                {{ fileInfo.sha256 }}
              </p>
            </div>
            <button @click="copyChecksum" class="text-blue-600 hover:text-blue-700 ml-4">
              <CopyIcon class="w-5 h-5" />
            </button>
          </div>
          <p class="text-xs text-blue-600 mt-2 flex items-center">
            <CheckCircleIcon class="w-3 h-3 mr-1" />
            Verify this checksum after download to ensure integrity
          </p>
        </div>

        <!-- Download Progress -->
        <div v-if="downloadProgress > 0 && downloadProgress < 100" class="space-y-2">
          <div class="flex justify-between text-sm text-gray-700">
            <span class="flex items-center">
              <DownloadIcon class="w-4 h-4 mr-2" />
              Downloading...
            </span>
            <span class="font-bold">{{ downloadProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: downloadProgress + '%' }"></div>
          </div>
        </div>

        <!-- Download Button -->
        <button
          @click="initiateDownload"
          class="btn-primary w-full text-lg py-3 flex items-center justify-center"
        >
          <DownloadIcon class="w-5 h-5 mr-2" />
          Download File
        </button>

        <button @click="resetForm" class="btn-secondary w-full flex items-center justify-center">
          <RefreshCwIcon class="w-5 h-5 mr-2" />
          Download Another File
        </button>

        <!-- Warning -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-xs text-yellow-800 flex items-center">
            <AlertTriangleIcon class="w-4 h-4 mr-2" />
            This link expires in 1 hour. The file was scanned for malware, but always verify the checksum and scan downloads with your antivirus.
          </p>
        </div>
      </div>
    </div>

    <!-- Security Info -->
    <div class="mt-8 card bg-green-50 border-green-200">
      <div class="flex items-start space-x-3">
        <ShieldCheckIcon class="w-8 h-8 text-green-600" />
        <div>
          <h3 class="font-bold text-lg text-green-800">Security Verified</h3>
          <ul class="text-sm text-green-700 mt-2 space-y-1">
            <li class="flex items-center">
              <CheckCircleIcon class="w-4 h-4 mr-2" />
              Scanned by ClamAV antivirus
            </li>
            <li class="flex items-center">
              <CheckCircleIcon class="w-4 h-4 mr-2" />
              Checked against VirusTotal database
            </li>
            <li class="flex items-center">
              <CheckCircleIcon class="w-4 h-4 mr-2" />
              SHA-256 integrity checksum provided
            </li>
            <li class="flex items-center">
              <CheckCircleIcon class="w-4 h-4 mr-2" />
              Served via secure CDN with signed URLs
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Vue3Lottie } from 'vue3-lottie';
import {
  KeyIcon, AlertTriangleIcon, XCircleIcon, UnlockIcon, LoaderIcon,
  FileIcon, HardDriveIcon, DownloadIcon, ClockIcon, ShieldCheckIcon,
  CopyIcon, CheckCircleIcon, RefreshCwIcon
} from 'lucide-vue-next';
import { formatFileSize, formatTimeRemaining } from '@fileduck/shared';
import { redeemShareCode } from '../services/api';

// Import animations
import VerifyCodeAnimation from '../../../../animations/Verify Code.json';
import DataDownloadingAnimation from '../../../../animations/Data Downloading.json';
import ShockedDuckAnimation from '../../../../animations/Shocked Duck.json';

const route = useRoute();
const inputCode = ref('');
const isRedeeming = ref(false);
const captchaRequired = ref(false);
const errorMessage = ref('');
const downloadUrl = ref('');
const downloadProgress = ref(0);
const fileInfo = ref({
  filename: '',
  size: 0,
  sha256: '',
  mimeType: '',
  usesLeft: 0,
  expiresAt: 0,
  isQuarantined: false,
});

onMounted(() => {
  // Check if share code is in URL
  if (route.params.code) {
    inputCode.value = route.params.code as string;
    redeemCode();
  }
});

const redeemCode = async () => {
  if (!inputCode.value) return;

  isRedeeming.value = true;
  errorMessage.value = '';

  try {
    const response = await redeemShareCode({
      shareCode: inputCode.value,
      captchaToken: undefined, // TODO: Implement reCAPTCHA
    });

    downloadUrl.value = response.downloadUrl;
    fileInfo.value = {
      filename: response.filename,
      size: response.size,
      sha256: response.sha256,
      mimeType: response.mimeType,
      usesLeft: response.usesLeft,
      expiresAt: response.expiresAt,
      isQuarantined: response.isQuarantined || false,
    };
  } catch (err: any) {
    console.error('Redeem failed:', err);
    
    if (err.response?.data?.code === 'CAPTCHA_REQUIRED') {
      captchaRequired.value = true;
      errorMessage.value = 'CAPTCHA verification required';
    } else if (err.response?.data?.code === 'SCAN_PENDING') {
      errorMessage.value = 'File is being scanned for malware. Please try again in a moment.';
    } else if (err.response?.data?.code === 'MALWARE_DETECTED') {
      errorMessage.value = 'This file was flagged as malicious and has been removed.';
    } else {
      errorMessage.value = err.response?.data?.error || 'Invalid or expired share code';
    }
  } finally {
    isRedeeming.value = false;
  }
};

const initiateDownload = async () => {
  if (!downloadUrl.value) return;

  try {
    downloadProgress.value = 0;
    const response = await fetch(downloadUrl.value);
    const reader = response.body?.getReader();
    const contentLength = +(response.headers.get('Content-Length') || fileInfo.value.size);

    let receivedLength = 0;
    const chunks = [];

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;
        downloadProgress.value = Math.round((receivedLength / contentLength) * 100);
      }
    }

    const blob = new Blob(chunks);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileInfo.value.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    downloadProgress.value = 100;
    setTimeout(() => {
      downloadProgress.value = 0;
    }, 2000);
  } catch (err) {
    console.error('Download failed:', err);
    alert('Download failed. Please try again.');
    downloadProgress.value = 0;
  }
};

const resetForm = () => {
  inputCode.value = '';
  downloadUrl.value = '';
  errorMessage.value = '';
  captchaRequired.value = false;
  downloadProgress.value = 0;
};

const copyChecksum = () => {
  navigator.clipboard.writeText(fileInfo.value.sha256);
  alert('Checksum copied to clipboard!');
};

const formatSize = formatFileSize;
const formatExpiry = formatTimeRemaining;
</script>
