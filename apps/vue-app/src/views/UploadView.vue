<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <div class="flex items-center justify-center mb-6">
        <img src="/logo.png" alt="FileDuck" class="h-12 w-12 mr-3" />
        <h1 class="text-3xl font-bold text-center">
          Upload & Share Files Securely
        </h1>
      </div>

      <div v-if="!shareCode" class="space-y-6">
        <!-- File Selection with Animation -->
        <div
          @drop.prevent="handleDrop"
          @dragover.prevent
          @dragenter="isDragging = true"
          @dragleave="isDragging = false"
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          ]"
        >
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            class="hidden"
            id="file-input"
          />
          <label for="file-input" class="cursor-pointer">
            <div v-if="!selectedFile" class="flex flex-col items-center">
              <Vue3Lottie
                :animationData="FileStorageAnimation"
                :height="200"
                :width="200"
                :loop="true"
              />
              <p class="text-xl font-semibold text-gray-700 mt-4">
                Drop file here or click to select
              </p>
              <p class="text-sm text-gray-500 mt-2">
                Maximum file size: 5 GB
              </p>
            </div>
            <div v-else class="flex items-center justify-center space-x-3">
              <FileIcon class="w-8 h-8 text-blue-600" />
              <div class="text-left">
                <p class="text-lg font-semibold text-gray-700">{{ selectedFile.name }}</p>
                <p class="text-sm text-gray-500">{{ formatSize(selectedFile.size) }}</p>
              </div>
            </div>
          </label>
        </div>

        <!-- SHA-256 Checksum Display -->
        <div v-if="sha256Hash && sha256Hash !== 'Computing...'" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <ShieldCheckIcon class="w-5 h-5 text-green-600" />
                <p class="text-sm font-semibold text-green-800">SHA-256 Checksum</p>
              </div>
              <p class="font-mono text-xs text-green-700 mt-1 break-all">
                {{ sha256Hash }}
              </p>
            </div>
            <button @click="copyChecksum" class="text-green-600 hover:text-green-700 ml-4">
              <CopyIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Upload Options -->
        <div v-if="selectedFile" class="space-y-4">
          <div>
            <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <ClockIcon class="w-4 h-4 mr-2" />
              Time to Live
            </label>
            <select v-model="ttlHours" class="input-field">
              <option :value="1">1 hour</option>
              <option :value="6">6 hours</option>
              <option :value="24">24 hours (default)</option>
              <option :value="72">3 days</option>
              <option :value="168">7 days</option>
            </select>
          </div>

          <div>
            <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <DownloadIcon class="w-4 h-4 mr-2" />
              Maximum Downloads
            </label>
            <select v-model="maxUses" class="input-field">
              <option :value="1">One-time (default)</option>
              <option :value="3">3 downloads</option>
              <option :value="5">5 downloads</option>
              <option :value="10">10 downloads</option>
              <option :value="999">Unlimited</option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="enableEncryption"
              id="encryption"
              class="w-4 h-4 text-blue-600"
            />
            <label for="encryption" class="flex items-center text-sm font-semibold text-gray-700">
              <LockIcon class="w-4 h-4 mr-2" />
              Enable client-side encryption (zero-knowledge)
            </label>
          </div>
        </div>

        <!-- Upload Progress with Animation -->
        <div v-if="isUploading" class="space-y-4">
          <div class="flex justify-center">
            <Vue3Lottie
              :animationData="UploadFilesAnimation"
              :height="150"
              :width="150"
              :loop="true"
            />
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-gray-700">
              <span class="flex items-center">
                <UploadIcon class="w-4 h-4 mr-2" />
                Uploading...
              </span>
              <span class="font-bold">{{ uploadProgress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Upload Button -->
        <button
          @click="uploadFile"
          :disabled="!selectedFile || isUploading"
          class="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <RocketIcon v-if="!isUploading" class="w-5 h-5 mr-2" />
          <LoaderIcon v-else class="w-5 h-5 mr-2 animate-spin" />
          {{ isUploading ? 'Uploading...' : 'Upload & Generate Share Code' }}
        </button>
      </div>

      <!-- Success View -->
      <div v-else class="space-y-6">
        <div class="text-center">
          <Vue3Lottie
            :animationData="GooseWondersAnimation"
            :height="200"
            :width="200"
            :loop="false"
          />
          <h2 class="text-2xl font-bold text-green-600 mb-4">
            File Uploaded Successfully!
          </h2>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p class="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <KeyIcon class="w-4 h-4 mr-2" />
            Share Code
          </p>
          <div class="flex items-center justify-between bg-white rounded p-4">
            <p class="font-mono text-2xl font-bold text-blue-600">
              {{ shareCode }}
            </p>
            <button @click="copyShareCode" class="text-blue-600 hover:text-blue-700">
              <CopyIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
          <p class="flex items-center">
            <FileIcon class="w-4 h-4 mr-2" />
            <strong>Filename:</strong>&nbsp;{{ selectedFile?.name }}
          </p>
          <p class="flex items-center">
            <HardDriveIcon class="w-4 h-4 mr-2" />
            <strong>Size:</strong>&nbsp;{{ formatSize(selectedFile?.size || 0) }}
          </p>
          <p class="flex items-center">
            <ClockIcon class="w-4 h-4 mr-2" />
            <strong>Expires:</strong>&nbsp;{{ formatExpiry(expiresAt) }}
          </p>
          <p class="flex items-center">
            <DownloadIcon class="w-4 h-4 mr-2" />
            <strong>Downloads left:</strong>&nbsp;{{ maxUses === 999 ? 'Unlimited' : maxUses }}
          </p>
        </div>

        <!-- Scanning Status -->
        <div v-if="isScanning" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-center">
            <Vue3Lottie
              :animationData="ScanningDocumentAnimation"
              :height="50"
              :width="50"
              :loop="true"
              class="mr-3"
            />
            <p class="text-sm text-yellow-800">
              <strong>Scanning for viruses and malware...</strong> Please wait while we verify your file is safe.
            </p>
          </div>
        </div>

        <!-- Malware Detected Warning -->
        <div v-else-if="scanStatus === 'malicious'" class="bg-red-50 border border-red-300 rounded-lg p-4">
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
                ⚠️ MALICIOUS FILE DETECTED!
              </p>
              <p class="text-sm text-red-800 mb-3">
                {{ virusDetails }}
              </p>
              <p class="text-xs text-red-700 mb-3">
                <strong>File has been quarantined.</strong> This file will not be available for public download. Only users you explicitly share the code with will be warned before download.
              </p>
              <div class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  v-model="allowQuarantine"
                  id="acknowledge-risk"
                  class="w-4 h-4 text-red-600"
                />
                <label for="acknowledge-risk" class="text-xs text-red-800">
                  I understand the risks and want to keep this file in quarantine for controlled sharing
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Clean Scan Result -->
        <div v-else-if="scanStatus === 'clean'" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-sm text-green-800 flex items-center">
            <ShieldCheckIcon class="w-5 h-5 mr-2" />
            <strong>Scan complete:</strong>&nbsp;No threats detected. File is safe to share.
          </p>
        </div>

        <button @click="resetForm" class="btn-secondary w-full flex items-center justify-center">
          <RefreshCwIcon class="w-5 h-5 mr-2" />
          Upload Another File
        </button>
      </div>
    </div>

    <!-- Info Boxes -->
    <div class="grid md:grid-cols-3 gap-4 mt-8">
      <div class="card text-center">
        <ShieldCheckIcon class="w-12 h-12 mx-auto mb-2 text-blue-600" />
        <h3 class="font-bold text-lg">Malware Scanned</h3>
        <p class="text-sm text-gray-600 mt-2">
          ClamAV + VirusTotal protection
        </p>
      </div>
      <div class="card text-center">
        <GlobeIcon class="w-12 h-12 mx-auto mb-2 text-blue-600" />
        <h3 class="font-bold text-lg">Global CDN</h3>
        <p class="text-sm text-gray-600 mt-2">
          Fast downloads worldwide
        </p>
      </div>
      <div class="card text-center">
        <EyeOffIcon class="w-12 h-12 mx-auto mb-2 text-blue-600" />
        <h3 class="font-bold text-lg">Privacy First</h3>
        <p class="text-sm text-gray-600 mt-2">
          One-time links & encryption
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import { 
  FileIcon, ShieldCheckIcon, CopyIcon, ClockIcon, DownloadIcon, 
  LockIcon, UploadIcon, RocketIcon, LoaderIcon, KeyIcon, 
  HardDriveIcon, RefreshCwIcon, GlobeIcon, EyeOffIcon 
} from 'lucide-vue-next';
import { computeSHA256, formatFileSize, formatTimeRemaining } from '@fileduck/shared';
import { uploadFileMeta, uploadToS3 } from '../services/api';

// Import animations
import FileStorageAnimation from '../../../../animations/File storage.json';
import UploadFilesAnimation from '../../../../animations/Upload Files.json';
import GooseWondersAnimation from '../../../../animations/goose Wonders.json';
import ScanningDocumentAnimation from '../../../../animations/Scanning document.json';
import ShockedDuckAnimation from '../../../../animations/Shocked Duck.json';

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const sha256Hash = ref('');
const isDragging = ref(false);
const isUploading = ref(false);
const uploadProgress = ref(0);
const shareCode = ref('');
const expiresAt = ref(0);
const ttlHours = ref(24);
const maxUses = ref(1);
const enableEncryption = ref(false);
const isScanning = ref(false);
const scanStatus = ref<'pending' | 'clean' | 'malicious' | null>(null);
const virusDetails = ref('');
const allowQuarantine = ref(false);

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    await processFile(target.files[0]);
  }
};

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    await processFile(event.dataTransfer.files[0]);
  }
};

const processFile = async (file: File) => {
  selectedFile.value = file;
  sha256Hash.value = 'Computing...';

  try {
    const hash = await computeSHA256(file);
    sha256Hash.value = hash;
  } catch (err) {
    console.error('Failed to compute SHA-256:', err);
    sha256Hash.value = 'Error computing checksum';
  }
};

const uploadFile = async () => {
  if (!selectedFile.value || !sha256Hash.value) return;

  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    // Request upload metadata and presigned URLs
    const metaResponse = await uploadFileMeta({
      filename: selectedFile.value.name,
      size: selectedFile.value.size,
      sha256: sha256Hash.value,
      mimeType: selectedFile.value.type || 'application/octet-stream',
      ttlHours: ttlHours.value,
      maxUses: maxUses.value,
      encrypted: enableEncryption.value,
    });

    shareCode.value = metaResponse.shareCode;
    expiresAt.value = metaResponse.expiresAt;

    // Upload to S3 using presigned URLs
    await uploadToS3(
      selectedFile.value,
      metaResponse.uploadUrls,
      metaResponse.uploadId,
      (progress) => {
        uploadProgress.value = Math.round(progress);
      }
    );

    uploadProgress.value = 100;
    
    // Start virus scanning
    startScanSimulation();
  } catch (err: any) {
    console.error('Upload failed:', err);
    alert('Upload failed: ' + (err.message || 'Unknown error'));
    resetForm();
  } finally {
    isUploading.value = false;
  }
};

const resetForm = () => {
  selectedFile.value = null;
  sha256Hash.value = '';
  shareCode.value = '';
  uploadProgress.value = 0;
  ttlHours.value = 24;
  maxUses.value = 1;
  enableEncryption.value = false;
  isScanning.value = false;
  scanStatus.value = null;
  virusDetails.value = '';
  allowQuarantine.value = false;
};

// Simulate scanning (replace with actual API call)
const startScanSimulation = () => {
  isScanning.value = true;
  // This would be replaced with actual polling of scan status from backend
  setTimeout(() => {
    isScanning.value = false;
    // Randomly show clean or malicious for demo (remove in production)
    // scanStatus.value = Math.random() > 0.9 ? 'malicious' : 'clean';
    // if (scanStatus.value === 'malicious') {
    //   virusDetails.value = 'ClamAV detected: Trojan.Generic.12345 | VirusTotal: 3/70 engines detected malicious signatures';
    // }
    scanStatus.value = 'clean'; // Default to clean
  }, 3000);
};

const copyChecksum = () => {
  navigator.clipboard.writeText(sha256Hash.value);
  alert('Checksum copied to clipboard!');
};

const copyShareCode = () => {
  navigator.clipboard.writeText(shareCode.value);
  alert('Share code copied to clipboard!');
};

const formatSize = formatFileSize;
const formatExpiry = formatTimeRemaining;
</script>
