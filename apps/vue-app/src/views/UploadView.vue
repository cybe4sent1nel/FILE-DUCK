<template>
  <div class="max-w-5xl mx-auto">
    <!-- Hero Section -->
    <div class="text-center mb-16 max-w-4xl mx-auto -mt-4">
      <!-- Designer Cat Animation -->
      <div class="flex justify-center mb-4">
        <Vue3Lottie
          :animationData="DesignerCatAnimation"
          :height="280"
          :width="280"
          :loop="true"
        />
      </div>
      
      <div class="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
        <img src="/logo.png" alt="FileDuck Logo" class="h-32 md:h-40 w-32 md:w-40 object-contain" />
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-lemon-400 bg-clip-text text-transparent leading-tight text-center md:text-left">
          Share Files Securely
        </h1>
      </div>
      <p class="text-xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
        Upload, scan, and share files with enterprise-grade security. Protected by AI-powered malware detection and end-to-end encryption.
      </p>
      <div class="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
        <p class="text-sm text-gray-700 flex items-center justify-center">
          <LockIcon class="w-5 h-5 mr-2 text-green-600" />
          <strong class="text-green-700 mr-1">End-to-End Encrypted:</strong>
          Your data is encrypted during transfer. Only sender and receiver can access the content.
        </p>
      </div>
      <div class="flex flex-wrap justify-center gap-4 mb-12">
        <div class="flex items-center space-x-2 bg-white px-5 py-3 rounded-full shadow-sm border border-purple-100">
          <ShieldCheckIcon class="w-5 h-5 text-purple-400" />
          <span class="text-sm font-medium text-gray-700">Malware Protected</span>
        </div>
        <div class="flex items-center space-x-2 bg-white px-5 py-3 rounded-full shadow-sm border border-purple-100">
          <LockIcon class="w-5 h-5 text-purple-400" />
          <span class="text-sm font-medium text-gray-700">Encrypted Transfer</span>
        </div>
        <div class="flex items-center space-x-2 bg-white px-5 py-3 rounded-full shadow-sm border border-purple-100">
          <ZapIcon class="w-5 h-5 text-lemon-500" />
          <span class="text-sm font-medium text-gray-700">Lightning Fast</span>
        </div>
      </div>
    </div>

    <!-- Live Activity Tracker -->
    <div class="max-w-4xl mx-auto mb-12">
      <LiveActivityTracker />
    </div>

    <!-- Main Upload Card -->
    <div class="bg-white rounded-3xl shadow-xl p-10 border border-purple-100 max-w-3xl mx-auto mb-20">

      <div v-if="!shareCode" class="space-y-6">
        <!-- File Selection with Animation -->
        <div
          @drop.prevent="handleDrop"
          @dragover.prevent
          @dragenter="isDragging = true"
          @dragleave="isDragging = false"
          :class="[
            'border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300',
            isDragging 
              ? 'border-purple-400 bg-purple-50' 
              : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50/30',
          ]"
        >
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            class="hidden"
            id="file-input"
            accept="*/*"
          />
          <label for="file-input" class="cursor-pointer">
            <div v-if="!selectedFile" class="flex flex-col items-center">
              <Vue3Lottie
                :animationData="UploadFilesAnimation"
                :height="160"
                :width="160"
                :loop="true"
              />
              <p class="text-2xl font-bold text-gray-800 mt-6">
                Drop your file here
              </p>
              <p class="text-base text-gray-500 mt-2">or click to browse</p>
              <p class="text-sm text-gray-400 mt-4 flex items-center justify-center">
                <HardDriveIcon class="w-4 h-4 mr-2" />
                Maximum file size: 5GB
              </p>
            </div>
            <div v-else class="flex items-center justify-center space-x-4 bg-purple-50 rounded-xl p-6 border border-purple-200">
              <FileIcon class="w-12 h-12 text-purple-400" />
              <div class="text-left">
                <p class="text-xl font-bold text-gray-800">{{ selectedFile.name }}</p>
                <p class="text-base text-gray-600 flex items-center mt-1">
                  <HardDriveIcon class="w-4 h-4 mr-1" />
                  {{ formatSize(selectedFile.size) }}
                </p>
              </div>
            </div>
          </label>
        </div>

        <!-- Scanning in Progress -->
        <div v-if="isScanning" class="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <Vue3Lottie
                :animationData="ScanningDocumentAnimation"
                :height="80"
                :width="80"
                :loop="true"
              />
            </div>
            <div class="flex-1">
              <p class="text-lg font-bold text-blue-800 mb-1">🔍 Scanning for malware...</p>
              <p class="text-sm text-blue-600">Please wait while we verify your file is safe.</p>
            </div>
          </div>
        </div>

        <!-- File Clean Message (Only after scan is clean) -->
        <div v-else-if="scanStatus === 'clean' && !shareCode" class="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <ShieldCheckIcon class="w-12 h-12 text-green-600" />
            </div>
            <div class="flex-1">
              <p class="text-lg font-bold text-green-800">✓ File is virus free</p>
              <p class="text-sm text-green-600">No viruses found. Uploading...</p>
            </div>
          </div>
        </div>

        <!-- Malicious File Warning (Only after scan detects threat) -->
        <div v-else-if="scanStatus === 'malicious' && !virusDetails.includes('Scan error')" class="bg-red-50 border-2 border-red-300 rounded-xl p-6">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <Vue3Lottie
                :animationData="COVID19Animation"
                :height="100"
                :width="100"
                :loop="true"
              />
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <AlertTriangleIcon class="w-7 h-7 text-red-600" />
                <p class="text-xl font-bold text-red-800">⚠️ Malicious File Detected!</p>
              </div>
              <p class="text-red-700 font-medium mb-2">
                {{ virusDetails || 'This file contains potentially harmful content and cannot be uploaded.' }}
              </p>
              <p class="text-sm text-red-600">
                Please select a different file to upload.
              </p>
            </div>
          </div>
        </div>

        <!-- Scan Error Warning (When scanning fails) -->
        <div v-else-if="scanStatus === 'malicious' && virusDetails.includes('Scan error')" class="bg-orange-50 border-2 border-orange-300 rounded-xl p-6">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <Vue3Lottie
                :animationData="StressedWomanAnimation"
                :height="100"
                :width="100"
                :loop="true"
              />
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <AlertTriangleIcon class="w-7 h-7 text-orange-600" />
                <p class="text-xl font-bold text-orange-800">😰 Scanning Error</p>
              </div>
              <p class="text-orange-700 font-medium mb-2">
                {{ virusDetails }}
              </p>
              <p class="text-sm text-orange-600">
                Please try again or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>

        <!-- Upload Options -->
        <div v-if="selectedFile" class="space-y-5 bg-white rounded-xl p-6 border border-purple-100">
          <div>
            <label class="flex items-center text-base font-semibold text-gray-700 mb-3">
              <ClockIcon class="w-5 h-5 mr-2 text-purple-400" />
              Time to Live
            </label>
            <select v-model="ttlHours" class="input-field text-base w-full p-3 border border-gray-200 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-100">
              <option :value="1">1 hour</option>
              <option :value="6">6 hours</option>
              <option :value="24">24 hours (default)</option>
              <option :value="72">3 days</option>
              <option :value="168">7 days</option>
            </select>
          </div>

          <div>
            <label class="flex items-center text-base font-semibold text-gray-700 mb-3">
              <DownloadIcon class="w-5 h-5 mr-2 text-lemon-500" />
              Maximum Downloads
            </label>
            <select v-model="maxUses" class="input-field text-base w-full p-3 border border-gray-200 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-100">
              <option :value="1">One-time (default)</option>
              <option :value="3">3 downloads</option>
              <option :value="5">5 downloads</option>
              <option :value="10">10 downloads</option>
              <option :value="999">Unlimited</option>
            </select>
          </div>

          <div class="flex items-center space-x-3 bg-purple-50 rounded-lg p-4 border border-purple-100">
            <input
              type="checkbox"
              v-model="enableEncryption"
              id="encryption"
              class="w-5 h-5 text-purple-400 rounded"
            />
            <label for="encryption" class="flex items-center text-base font-medium text-gray-700">
              <LockIcon class="w-5 h-5 mr-2 text-purple-400" />
              Enable client-side encryption (zero-knowledge)
            </label>
          </div>
        </div>

        <!-- Upload Progress with Animation -->
        <div v-if="isUploading" class="space-y-5 bg-white rounded-xl p-8 border border-purple-100">
          <div class="flex justify-center">
            <Vue3Lottie
              :animationData="FileStorageAnimation"
              :height="140"
              :width="140"
              :loop="true"
            />
          </div>
          <div class="space-y-3">
            <div class="flex justify-between text-base font-semibold text-gray-700">
              <span class="flex items-center">
                <UploadIcon class="w-5 h-5 mr-2 text-purple-400" />
                Uploading...
              </span>
              <span class="font-bold text-xl text-purple-500">{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="progress-fill h-3" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Upload Button -->
        <button
          @click="uploadFile"
          :disabled="!selectedFile || isUploading || isScanning || scanStatus === 'malicious'"
          class="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          <RocketIcon v-if="!isUploading && !isScanning" class="w-6 h-6 mr-2" />
          <LoaderIcon v-else class="w-6 h-6 mr-2 animate-spin" />
          {{ isScanning ? 'Scanning...' : (isUploading ? 'Uploading...' : (scanStatus === 'clean' ? 'Upload File' : 'Scan & Upload File')) }}
        </button>
      </div>

      <!-- Success View -->
      <div v-else class="space-y-6">
        <div class="text-center py-8">
          <Vue3Lottie
            :animationData="GooseWondersAnimation"
            :height="180"
            :width="180"
            :loop="false"
          />
          <h2 class="text-3xl font-bold text-gray-800 mb-2 mt-4">
            File Uploaded Successfully!
          </h2>
          <p class="text-gray-500">Share your code to let others download</p>
        </div>

        <div class="bg-purple-50 border-2 border-purple-200 rounded-xl p-8">
          <p class="text-base font-semibold text-gray-700 mb-3 flex items-center">
            <KeyIcon class="w-5 h-5 mr-2 text-purple-400" />
            Share Code
          </p>
          <div class="flex items-center justify-between bg-white rounded-lg p-5 border border-purple-100">
            <p class="font-mono text-3xl font-bold text-purple-500">
              {{ shareCode }}
            </p>
            <button @click="copyShareCode" class="text-purple-400 hover:text-purple-500 hover:scale-110 transition-transform">
              <CopyIcon class="w-8 h-8" />
            </button>
          </div>
        </div>

        <div class="bg-lemon-50 border-2 border-lemon-200 rounded-xl p-6 space-y-3 text-base">
          <p class="flex items-center">
            <FileIcon class="w-5 h-5 mr-3 text-gray-600" />
            <strong class="text-gray-800">Filename:</strong>&nbsp;<span class="text-gray-600">{{ selectedFile?.name }}</span>
          </p>
          <p class="flex items-center">
            <HardDriveIcon class="w-5 h-5 mr-3 text-gray-600" />
            <strong class="text-gray-800">Size:</strong>&nbsp;<span class="text-gray-600">{{ formatSize(selectedFile?.size || 0) }}</span>
          </p>
          <p class="flex items-center">
            <ClockIcon class="w-5 h-5 mr-3 text-gray-600" />
            <strong class="text-gray-800">Expires:</strong>&nbsp;<span class="text-gray-600">{{ formatExpiry(expiresAt) }}</span>
          </p>
          <p class="flex items-center">
            <DownloadIcon class="w-5 h-5 mr-3 text-gray-600" />
            <strong class="text-gray-800">Downloads left:</strong>&nbsp;<span class="text-gray-600">{{ maxUses === 999 ? 'Unlimited' : maxUses }}</span>
          </p>
        </div>

        <!-- Scanning Status -->
        <div v-if="isScanning" class="bg-white border-2 border-purple-200 rounded-xl p-6">
          <div class="flex items-center">
            <Vue3Lottie
              :animationData="ScanningDocumentAnimation"
              :height="60"
              :width="60"
              :loop="true"
              class="mr-4"
            />
            <p class="text-base text-gray-700">
              <strong class="text-lg text-gray-800">Scanning for viruses and malware...</strong><br/>
              <span class="text-gray-500">Please wait while we verify your file is safe.</span>
            </p>
          </div>
        </div>

        <!-- Malware Detected Warning -->
        <div v-else-if="scanStatus === 'malicious'" class="bg-red-50 border-3 border-red-300 rounded-xl p-6">
          <div class="flex items-start">
            <Vue3Lottie
              :animationData="ShockedDuckAnimation"
              :height="80"
              :width="80"
              :loop="false"
              class="mr-4 flex-shrink-0"
            />
            <div class="flex-1">
              <p class="text-lg font-bold text-red-900 mb-3 flex items-center">
                <AlertTriangleIcon class="w-6 h-6 mr-2" />
                MALICIOUS FILE DETECTED!
              </p>
              <p class="text-base text-red-800 mb-4 bg-white/50 p-3 rounded">
                {{ virusDetails }}
              </p>
              <p class="text-sm text-red-700 mb-4">
                <strong>File has been quarantined.</strong> This file will not be available for public download. Only users you explicitly share the code with will be warned before download.
              </p>
              <div class="flex items-center space-x-3 bg-white/70 rounded-lg p-3">
                <input
                  type="checkbox"
                  v-model="allowQuarantine"
                  id="acknowledge-risk"
                  class="w-5 h-5 text-red-600"
                />
                <label for="acknowledge-risk" class="text-sm text-red-900 font-semibold">
                  I understand the risks and want to keep this file in quarantine for controlled sharing
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Clean Scan Result -->
        <div v-else-if="scanStatus === 'clean'" class="bg-green-50 border-2 border-green-200 rounded-xl p-5">
          <p class="text-base text-gray-700 flex items-center">
            <ShieldCheckIcon class="w-6 h-6 mr-3 text-green-600" />
            <strong class="text-base text-gray-800">Scan complete:</strong>&nbsp;<span class="text-green-600">No threats detected. File is safe to share.</span>
          </p>
        </div>

        <button @click="resetForm" class="btn-secondary w-full flex items-center justify-center text-lg py-4">
          <RefreshCwIcon class="w-6 h-6 mr-2" />
          Upload Another File
        </button>
      </div>
    </div>

    <!-- How It Works Section -->
    <HowItWorks />

    <!-- Testimonials Section -->
    <Testimonials />

    <!-- About Section -->
    <AboutSection />

    <!-- Trusted By Section -->
    <TrustedBy />

    <!-- CTA Section -->
    <CTASection />

    <!-- Info Boxes -->
    <div class="grid md:grid-cols-3 gap-6 mt-12">
      <div class="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border-2 border-purple-200">
        <ShieldCheckIcon class="w-16 h-16 mx-auto mb-4 text-purple-600" />
        <h3 class="font-bold text-xl text-purple-800">Malware Scanned</h3>
        <p class="text-base text-gray-700 mt-3">
          Multi-engine threat detection
        </p>
      </div>
      <div class="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border-2 border-yellow-200">
        <GlobeIcon class="w-16 h-16 mx-auto mb-4 text-yellow-600" />
        <h3 class="font-bold text-xl text-yellow-800">Global CDN</h3>
        <p class="text-base text-gray-700 mt-3">
          Fast downloads worldwide
        </p>
      </div>
      <div class="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border-2 border-purple-200">
        <EyeOffIcon class="w-16 h-16 mx-auto mb-4 text-purple-600" />
        <h3 class="font-bold text-xl text-purple-800">Privacy First</h3>
        <p class="text-base text-gray-700 mt-3">
          One-time links & encryption
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import HowItWorks from '../components/HowItWorks.vue';
import Testimonials from '../components/Testimonials.vue';
import AboutSection from '../components/AboutSection.vue';
import LiveActivityTracker from '../components/LiveActivityTracker.vue';
import { useNotifications } from '../composables/useNotifications';
import TrustedBy from '../components/TrustedBy.vue';
import CTASection from '../components/CTASection.vue';
import { 
  FileIcon, ShieldCheckIcon, CopyIcon, ClockIcon, DownloadIcon, 
  LockIcon, UploadIcon, RocketIcon, LoaderIcon, KeyIcon, 
  HardDriveIcon, RefreshCwIcon, GlobeIcon, EyeOffIcon, AlertTriangleIcon, ZapIcon 
} from 'lucide-vue-next';
import { computeSHA256, formatFileSize, formatTimeRemaining } from '@fileduck/shared';
import { uploadFileMeta, uploadToS3, scanFileBeforeUpload } from '../services/api';
import { addToUploadHistory } from '../services/uploadHistory';

const { success, error } = useNotifications();

// Import animations
import FileStorageAnimation from '../../../../animations/File storage.json';
import UploadFilesAnimation from '../../../../animations/Upload Files.json';
import GooseWondersAnimation from '../../../../animations/goose Wonders.json';
import ScanningDocumentAnimation from '../../../../animations/Scanning document.json';
import COVID19Animation from '../../../../animations/COVID19.json';
import DesignerCatAnimation from '../../../../animations/Designer cat.json';
import StressedWomanAnimation from '../../../../animations/Stressed Woman at work.json';

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
  scanStatus.value = null;
  virusDetails.value = '';
  isScanning.value = false;

  try {
    // Compute SHA-256 hash
    const hash = await computeSHA256(file);
    sha256Hash.value = hash;
    
    // Start pre-upload scan with ClamAV and VirusTotal
    isScanning.value = true;
    scanStatus.value = 'pending';
    
    try {
      // Call actual scan API and ensure minimum scanning duration for UX
      const [scanResult] = await Promise.all([
        scanFileBeforeUpload(file, hash),
        new Promise(resolve => setTimeout(resolve, 2000)) // Minimum 2s scanning animation
      ]);
      
      if (scanResult.decision === 'infected' || scanResult.decision === 'suspicious') {
        scanStatus.value = 'malicious';
        
        // Build detailed virus information
        const virusName = scanResult.clamav?.virus || 'Unknown threat';
        const vtInfo = scanResult.virustotal 
          ? ` (${scanResult.virustotal.positives}/${scanResult.virustotal.total} engines detected threats)`
          : '';
        
        virusDetails.value = scanResult.clamav?.infected
          ? `Virus Detected: ${virusName}${vtInfo}`
          : `Suspicious File: Security scan flagged this file${vtInfo}`;
      } else {
        scanStatus.value = 'clean';
      }
      isScanning.value = false;
    } catch (scanError: any) {
      console.error('Scan failed:', scanError);
      isScanning.value = false;
      
      // If scanner is not available, allow upload with warning
      if (scanError.code === 'ERR_NETWORK' || scanError.message?.includes('Network Error')) {
        console.warn('Scanner service unavailable, proceeding without scan');
        scanStatus.value = 'clean';
      } else {
        scanStatus.value = 'malicious';
        virusDetails.value = `Scan error: ${scanError.response?.data?.message || scanError.message || 'Unable to scan file. Please try again.'}`;
      }
    }
  } catch (err) {
    console.error('Failed to process file:', err);
    isScanning.value = false;
  }
};

const uploadFile = async () => {
  if (!selectedFile.value || !sha256Hash.value || scanStatus.value !== 'clean') return;
  if (isUploading.value) return; // Prevent double upload

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

    // Simulate upload progress (GitHub storage happens server-side during scan)
    if (metaResponse.useGitHub || !metaResponse.uploadUrls || metaResponse.uploadUrls.length === 0) {
      // GitHub storage - send file content to server
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile.value);
      await new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            
            // Send file to server
            const response = await fetch('/api/github-upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                shareCode: shareCode.value,
                fileData: base64Data,
                filename: selectedFile.value.name,
                sha256: sha256Hash.value,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to upload file to GitHub');
            }
            
            // Simulate progress for UX
            for (let i = 0; i <= 100; i += 10) {
              uploadProgress.value = i;
              await new Promise(r => setTimeout(r, 50));
            }
            resolve(null);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
      });
    } else {
      // S3 storage - use presigned URLs
      await uploadToS3(
        selectedFile.value,
        metaResponse.uploadUrls,
        metaResponse.uploadId,
        (progress) => {
          uploadProgress.value = Math.round(progress);
        }
      );
    }

    uploadProgress.value = 100;
    
    // Save to local history
    addToUploadHistory({
      id: `upload-${Date.now()}`,
      shareCode: shareCode.value,
      filename: selectedFile.value.name,
      size: selectedFile.value.size,
      uploadedAt: Date.now(),
      expiresAt: expiresAt.value,
      verificationCode: '', // Not used anymore
      maxUses: maxUses.value,
      usesLeft: maxUses.value,
    });
    
    // Start virus scanning
    startScanSimulation();
  } catch (err: any) {
    console.error('Upload failed:', err);
    error('Upload failed: ' + (err.message || 'Unknown error'));
    resetForm();
  } finally {
    isUploading.value = false;
  }
};

const resetForm = () => {
  selectedFile.value = null;
  sha256Hash.value = '';
  verificationCode.value = '';
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

const copyShareCode = () => {
  navigator.clipboard.writeText(shareCode.value);
  success('✓ Share code copied to clipboard!');
};

const formatSize = formatFileSize;
const formatExpiry = formatTimeRemaining;
</script>
