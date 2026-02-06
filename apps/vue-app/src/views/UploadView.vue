<template>
  <div class="max-w-5xl mx-auto px-2 sm:px-4">
    <!-- Hero Section -->
    <div class="text-center mb-8 sm:mb-12 max-w-4xl mx-auto -mt-4">
      <!-- Designer Cat Animation -->
      <div class="flex justify-center mb-4">
        <Vue3Lottie
          :animationData="DesignerCatAnimation"
          :height="200"
          :width="200"
          class="sm:!h-[250px] sm:!w-[250px] md:!h-[280px] md:!w-[280px]"
          :loop="true"
        />
      </div>
      
      <div class="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 mb-4 px-2">
        <img src="/logo.png" alt="FileDuck Logo" class="h-24 sm:h-32 md:h-40 w-24 sm:w-32 md:w-40 object-contain" />
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight text-indigo-950 leading-tight text-center md:text-left pb-2">
          Share Files Securely
        </h1>
      </div>

      <!-- Scanning Animation Component -->
      <div class="-mt-4 mb-3">
        <ScanningAnimation />
      </div>
      
      <p class="text-xl text-gray-600 mb-3 max-w-2xl mx-auto leading-relaxed">
        Upload, scan, and share files with enterprise-grade security. Protected by AI-powered malware detection and end-to-end encryption.
      </p>
      <div class="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
        <p class="text-sm text-gray-700 flex items-center justify-center">
          <LockIcon class="w-5 h-5 mr-2 text-green-600" />
          <strong class="text-green-700 mr-1">End-to-End Encrypted:</strong>
          Your data is encrypted during transfer. Only sender and receiver can access the content.
        </p>
      </div>
      <div class="flex flex-wrap justify-center gap-4 mb-8">
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
    <div id="upload" class="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-10 border border-purple-100 max-w-3xl mx-auto mb-12 sm:mb-20 scroll-mt-20">

      <div v-if="!uploadComplete" class="space-y-6">
        <!-- File Selection with Animation -->
        <div
          @drop.prevent="handleDrop"
          @dragover.prevent
          @dragenter="isDragging = true"
          @dragleave="isDragging = false"
          :class="[
            'border-2 sm:border-3 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-all duration-300',
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
                :height="120"
                :width="120"
                class="sm:!h-[140px] sm:!w-[140px] md:!h-[160px] md:!w-[160px]"
                :loop="true"
              />
              <p class="text-xl sm:text-2xl font-bold text-gray-800 mt-4 sm:mt-6 px-2">
                Drop your file here
              </p>
              <p class="text-sm sm:text-base text-gray-500 mt-2">or click to browse</p>
              <p class="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4 flex items-center justify-center">
                <HardDriveIcon class="w-4 h-4 mr-2" />
                Maximum file size: 5GB
              </p>
            </div>
            <div v-else class="relative flex items-center justify-between bg-purple-50 rounded-xl p-6 border border-purple-200">
              <div class="flex items-center space-x-4">
                <FileIcon class="w-12 h-12 text-purple-400" />
                <div class="text-left">
                  <p class="text-xl font-bold text-gray-800">{{ selectedFile.name }}</p>
                  <p class="text-base text-gray-600 flex items-center mt-1">
                    <HardDriveIcon class="w-4 h-4 mr-1" />
                    {{ formatSize(selectedFile.size) }}
                  </p>
                </div>
              </div>
              <button 
                @click.stop="removeFile" 
                class="absolute top-4 right-4 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-110"
                title="Remove file"
              >
                <XIcon class="w-5 h-5" />
              </button>
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
        <div v-else-if="scanStatus === 'clean' && !uploadComplete" class="bg-green-50 border-2 border-green-200 rounded-xl p-6">
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

        <!-- Scan Skipped Warning (Large files or scanner unavailable) -->
        <div v-else-if="scanStatus === 'skipped'" class="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <AlertTriangleIcon class="w-16 h-16 text-yellow-600" />
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <AlertTriangleIcon class="w-7 h-7 text-yellow-600" />
                <p class="text-xl font-bold text-yellow-800">
                  ⚠️
                  <span v-if="scanSkipReason === 'too_large'">File Too Large for Scanning</span>
                  <span v-else-if="scanSkipReason === 'scanner_unavailable'">Scanner Temporarily Unavailable</span>
                  <span v-else>Large File - Scanning Disabled by Default</span>
                </p>
              </div>
              <p class="text-yellow-700 font-medium mb-2">
                <span v-if="scanSkipReason === 'too_large'">
                  This file is larger than 100MB and cannot be scanned with our malware scanner.
                </span>
                <span v-else-if="scanSkipReason === 'scanner_unavailable'">
                  Our large-file scanner is currently unavailable.
                </span>
                <span v-else>
                  Large files (&gt;50MB) have scanning disabled by default to reduce delays.
                </span>
              </p>
              <p class="text-sm text-yellow-600 mb-3">
                The file will be uploaded <strong>without virus scanning</strong>. Recipients will be warned that this file was not scanned.
              </p>
              <p class="text-xs text-yellow-600">
                💡 <strong>Tip:</strong> Files ≤32MB use VirusTotal. Files &gt;32MB use our large-file scanner. Files &gt;100MB skip scanning.
              </p>
            </div>
          </div>
        </div>

        <!-- SHA256 Hash for Verification -->
        <div v-if="selectedFile && sha256Hash" class="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
          <p class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <ShieldCheckIcon class="w-4 h-4 mr-2 text-blue-600" />
            File Verification Hash (SHA-256)
          </p>
          <p class="text-xs text-gray-600 mb-3">
            This unique code verifies your file hasn't been tampered with during transfer
          </p>
          <div class="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
            <p class="font-mono text-xs text-blue-600 break-all flex-1">
              {{ sha256Hash }}
            </p>
            <button @click="copyHash" class="ml-3 text-blue-500 hover:text-blue-600 hover:scale-110 transition-transform flex-shrink-0">
              <CopyIcon class="w-5 h-5" />
            </button>
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
            <label class="neon-checkbox">
              <input type="checkbox" v-model="enableEncryption" id="encryption" />
              <div class="neon-checkbox__frame">
                <div class="neon-checkbox__box">
                  <div class="neon-checkbox__check-container">
                    <svg viewBox="0 0 24 24" class="neon-checkbox__check">
                      <path d="M3,12.5l7,7L21,5"></path>
                    </svg>
                  </div>
                  <div class="neon-checkbox__glow"></div>
                  <div class="neon-checkbox__borders">
                    <span></span><span></span><span></span><span></span>
                  </div>
                </div>
                <div class="neon-checkbox__effects">
                  <div class="neon-checkbox__particles">
                    <span></span><span></span><span></span><span></span>
                    <span></span><span></span><span></span><span></span>
                    <span></span><span></span><span></span><span></span>
                  </div>
                  <div class="neon-checkbox__rings">
                    <div class="ring"></div>
                    <div class="ring"></div>
                    <div class="ring"></div>
                  </div>
                  <div class="neon-checkbox__sparks">
                    <span></span><span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </label>
            <label for="encryption" class="flex items-center text-base font-medium text-gray-700 cursor-pointer">
              <LockIcon class="w-5 h-5 mr-2 text-purple-400" />
              Enable client-side encryption (zero-knowledge)
            </label>
          </div>

          <!-- Captcha Toggle -->
          <CaptchaToggle v-model="requireCaptcha" />

          <!-- Scan Toggle -->
          <ScanToggle v-model="enableScan" />
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
            <div class="w-full h-5 rail-track relative p-[2px]">
              <div
                class="h-full plasma-fill rounded-sm transition-all duration-150 ease-linear"
                :style="{ width: uploadProgress + '%' }"
              >
                <div v-if="uploadProgress > 0" class="fusion-head"></div>
              </div>
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
          {{ isScanning ? 'Scanning...' : (isUploading ? 'Uploading...' : (scanStatus === 'clean' ? 'Upload File' : (scanStatus === 'skipped' ? 'Upload File (Unscanned)' : 'Scan & Upload File'))) }}
        </button>
      </div>

      <!-- Success View -->
      <div v-else class="space-y-6">
        <div class="text-center py-8">
          <Vue3Lottie
            :animationData="UploadSuccessAnimation"
            :height="180"
            :width="180"
            :loop="true"
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

        <!-- SHA256 Hash Verification -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
          <p class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <ShieldCheckIcon class="w-4 h-4 mr-2 text-blue-600" />
            File Verification Hash (SHA-256)
          </p>
          <p class="text-xs text-gray-600 mb-3">
            Share this hash with recipients to verify file integrity. They can compare it after download to ensure the file hasn't been modified.
          </p>
          <div class="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
            <p class="font-mono text-xs text-blue-600 break-all flex-1">
              {{ sha256Hash }}
            </p>
            <button @click="copyHash" class="ml-3 text-blue-500 hover:text-blue-600 hover:scale-110 transition-transform flex-shrink-0">
              <CopyIcon class="w-5 h-5" />
            </button>
          </div>
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
import { ref, watch } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import HowItWorks from '../components/HowItWorks.vue';
import Testimonials from '../components/Testimonials.vue';
import AboutSection from '../components/AboutSection.vue';
import LiveActivityTracker from '../components/LiveActivityTracker.vue';
import ScanningAnimation from '../components/ScanningAnimation.vue';
import CaptchaToggle from '../components/CaptchaToggle.vue';
import ScanToggle from '../components/ScanToggle.vue';
import { useNotifications } from '../composables/useNotifications';
import TrustedBy from '../components/TrustedBy.vue';
import CTASection from '../components/CTASection.vue';
import { 
  FileIcon, ShieldCheckIcon, CopyIcon, ClockIcon, DownloadIcon, 
  LockIcon, UploadIcon, RocketIcon, LoaderIcon, KeyIcon, 
  HardDriveIcon, RefreshCwIcon, GlobeIcon, EyeOffIcon, AlertTriangleIcon, ZapIcon, XIcon 
} from 'lucide-vue-next';
import { computeSHA256, formatFileSize, formatTimeRemaining } from '@fileduck/shared';
import { uploadFileMeta, uploadToS3, scanFileBeforeUpload } from '../services/api';
import { addToUploadHistory } from '../services/uploadHistory';

const { success, error } = useNotifications();

// Import animations
import FileStorageAnimation from '../../../../animations/File storage.json';
import UploadFilesAnimation from '../../../../animations/Upload Files.json';
import UploadSuccessAnimation from '../../../../animations/upload success.json';
import ScanningDocumentAnimation from '../../../../animations/Scanning document.json';
import COVID19Animation from '../../../../animations/COVID19.json';
import DesignerCatAnimation from '../../../../animations/Designer cat.json';
import StressedWomanAnimation from '../../../../animations/Stressed Woman at work.json';

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const sha256Hash = ref('');
const verificationCode = ref('');
const isDragging = ref(false);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadComplete = ref(false);
const shareCode = ref('');
const expiresAt = ref(0);
const ttlHours = ref(24);
const maxUses = ref(1);
const enableEncryption = ref(false);
const isScanning = ref(false);
const scanStatus = ref<'pending' | 'clean' | 'malicious' | 'skipped' | null>(null);
const virusDetails = ref('');
const scanSkipReason = ref<'too_large' | 'user_disabled' | 'scanner_unavailable' | ''>('');
const allowQuarantine = ref(false);
const requireCaptcha = ref(false);
const enableScan = ref(true);

// Watch file size changes to adjust scan toggle default
watch(selectedFile, (file) => {
  if (file) {
    // Default to skip scan for large files (>50MB), otherwise enable
    enableScan.value = file.size <= 50 * 1024 * 1024;
  }
});

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
  scanSkipReason.value = '';

  try {
    // Compute SHA-256 hash
    const hash = await computeSHA256(file);
    sha256Hash.value = hash;
    
    // Default: disable scanning for large files (>50MB)
    enableScan.value = file.size <= 50 * 1024 * 1024;

    // Check if file is too large for scanning (>100MB)
    const isTooLargeForScan = file.size > 100 * 1024 * 1024;
    
    // Check if user disabled scanning
    if (!enableScan.value || isTooLargeForScan) {
      // File scanning is disabled or file is too large
      if (isTooLargeForScan) {
        console.warn('File too large for virus scanning (>100MB), skipping scan');
        scanSkipReason.value = 'too_large';
      } else {
        console.warn('Scanning disabled by user (large file)');
        scanSkipReason.value = 'user_disabled';
      }
      isScanning.value = false;
      scanStatus.value = 'skipped';
      return;
    }
    
    // Start pre-upload scan with VirusTotal
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
      if (scanError.response?.status === 503 && scanError.response?.data?.code === 'SCANNER_UNAVAILABLE') {
        console.warn('Large-file scanner unavailable, skipping scan');
        scanStatus.value = 'skipped';
        scanSkipReason.value = 'scanner_unavailable';
      } else if (scanError.code === 'ERR_NETWORK' || scanError.message?.includes('Network Error')) {
        console.warn('Scanner service unavailable, proceeding without scan');
        scanStatus.value = 'skipped';
        scanSkipReason.value = 'scanner_unavailable';
      } else if (scanError.response?.status === 413) {
        console.warn('File too large for scanning, skipping scan');
        scanStatus.value = 'skipped';
        scanSkipReason.value = 'too_large';
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
  if (!selectedFile.value || !sha256Hash.value) return;
  if (isUploading.value) return; // Prevent double upload
  
  // Allow upload if scan is clean or skipped (for large files)
  if (scanStatus.value !== 'clean' && scanStatus.value !== 'skipped') return;

  isUploading.value = true;
  uploadProgress.value = 0;
  uploadComplete.value = false;

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
      scanSkipped: scanStatus.value === 'skipped', // Include skip-scan flag
      requireCaptcha: requireCaptcha.value, // Include captcha requirement
    });

    shareCode.value = metaResponse.shareCode;
    expiresAt.value = metaResponse.expiresAt;

    // Simulate upload progress (GitHub storage happens server-side during scan)
    if (metaResponse.useGitHub || !metaResponse.uploadUrls || metaResponse.uploadUrls.length === 0) {
      // GitHub storage - send file in chunks using FormData (avoid base64 bloat)
      const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks (stays under Railway's 10MB limit)
      const totalChunks = Math.ceil(selectedFile.value.size / CHUNK_SIZE);
      
      console.log(`📦 Uploading file in ${totalChunks} chunk(s)...`);
      
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, selectedFile.value.size);
        const chunk = selectedFile.value.slice(start, end);
        
        console.log(`📤 Uploading chunk ${chunkIndex + 1}/${totalChunks} (${chunk.size} bytes)`);
        
        // Use FormData for direct binary upload (no base64 encoding)
        const formData = new FormData();
        formData.append('file', chunk, selectedFile.value.name);
        formData.append('shareCode', shareCode.value);
        formData.append('filename', selectedFile.value.name);
        formData.append('sha256', sha256Hash.value);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('isLastChunk', (chunkIndex === totalChunks - 1).toString());
        
        // Calculate progress before sending
        const progressBefore = Math.floor((chunkIndex / totalChunks) * 100);
        const progressAfter = Math.floor(((chunkIndex + 1) / totalChunks) * 100);
        
        // Animate progress while uploading
        let currentProgress = progressBefore;
        const progressInterval = setInterval(() => {
          if (currentProgress < progressAfter - 1) {
            currentProgress++;
            uploadProgress.value = currentProgress;
          }
        }, 50);
        
        // Send chunk to server
        const response = await fetch(`${import.meta.env.VITE_API_URL}/github-upload`, {
          method: 'POST',
          body: formData, // Send as multipart/form-data
        });
        
        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.message || `Server error: ${response.status}`;
          throw new Error(errorMsg);
        }
        
        // Set progress to after value
        uploadProgress.value = progressAfter;
        console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully (${uploadProgress.value}%)`);
        
        // Small delay between chunks to avoid overwhelming the server
        if (chunkIndex < totalChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Ensure progress reaches 100%
      uploadProgress.value = 100;
      console.log('✅ All chunks uploaded successfully!');
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
    
    // Keep progress at 100% visible for a moment
    await new Promise(resolve => setTimeout(resolve, 1200));
    uploadComplete.value = true;
    
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
    
    // Handle specific error codes
    let errorMessage = 'Upload failed';
    if (err.response) {
      const status = err.response.status;
      if (status === 402) {
        errorMessage = 'Payment required: Storage quota exceeded. Please upgrade your plan.';
      } else if (status === 502) {
        errorMessage = 'Server temporarily unavailable. Please try again in a moment.';
      } else if (status === 413) {
        errorMessage = 'File too large. Maximum size is 5GB.';
      } else if (status === 429) {
        errorMessage = 'Too many uploads. Please wait a moment and try again.';
      } else if (status >= 500) {
        errorMessage = `Server error (${status}). Please try again later.`;
      } else {
        errorMessage = err.response.data?.message || err.message || 'Unknown error occurred';
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    error(errorMessage);
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
  uploadComplete.value = false;
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
    //   virusDetails.value = 'Threat detected: Trojan.Generic.12345 | VirusTotal: 3/70 engines detected malicious signatures';
    // }
    scanStatus.value = 'clean'; // Default to clean
  }, 3000);
};

const removeFile = () => {
  selectedFile.value = null;
  sha256Hash.value = '';
  scanStatus.value = null;
  virusDetails.value = '';
  isScanning.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const copyHash = () => {
  navigator.clipboard.writeText(sha256Hash.value);
  success('✓ SHA-256 hash copied to clipboard!');
};

const copyShareCode = () => {
  navigator.clipboard.writeText(shareCode.value);
  success('✓ Share code copied to clipboard!');
};

const formatSize = formatFileSize;
const formatExpiry = formatTimeRemaining;
</script>

<style scoped>
/* Neon Checkbox Styles */
.neon-checkbox {
  --primary: #00ffaa;
  --primary-dark: #00cc88;
  --primary-light: #88ffdd;
  --size: 30px;
  position: relative;
  width: var(--size);
  height: var(--size);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.neon-checkbox input {
  display: none;
}

.neon-checkbox__frame {
  position: relative;
  width: 100%;
  height: 100%;
}

.neon-checkbox__box {
  position: absolute;
  inset: 0;
  background: rgba(237, 228, 228, 0.8);
  border-radius: 4px;
  border: 2px solid var(--primary-dark);
  transition: all 0.4s ease;
}

.neon-checkbox__check-container {
  position: absolute;
  inset: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.neon-checkbox__check {
  width: 80%;
  height: 80%;
  fill: none;
  stroke: var(--primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  transform-origin: center;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.neon-checkbox__glow {
  position: absolute;
  inset: -2px;
  border-radius: 6px;
  background: var(--primary);
  opacity: 0;
  filter: blur(8px);
  transform: scale(1.2);
  transition: all 0.4s ease;
}

.neon-checkbox__borders {
  position: absolute;
  inset: 0;
  border-radius: 4px;
  overflow: hidden;
}

.neon-checkbox__borders span {
  position: absolute;
  width: 40px;
  height: 1px;
  background: var(--primary);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.neon-checkbox__borders span:nth-child(1) {
  top: 0;
  left: -100%;
  animation: borderFlow1 2s linear infinite;
}

.neon-checkbox__borders span:nth-child(2) {
  top: -100%;
  right: 0;
  width: 1px;
  height: 40px;
  animation: borderFlow2 2s linear infinite;
}

.neon-checkbox__borders span:nth-child(3) {
  bottom: 0;
  right: -100%;
  animation: borderFlow3 2s linear infinite;
}

.neon-checkbox__borders span:nth-child(4) {
  bottom: -100%;
  left: 0;
  width: 1px;
  height: 40px;
  animation: borderFlow4 2s linear infinite;
}

.neon-checkbox__particles span {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  top: 50%;
  left: 50%;
  box-shadow: 0 0 6px var(--primary);
}

.neon-checkbox__rings {
  position: absolute;
  inset: -20px;
  pointer-events: none;
}

.neon-checkbox__rings .ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid var(--primary);
  opacity: 0;
  transform: scale(0);
}

.neon-checkbox__sparks span {
  position: absolute;
  width: 20px;
  height: 1px;
  background: linear-gradient(90deg, var(--primary), transparent);
  opacity: 0;
}

/* Hover Effects */
.neon-checkbox:hover .neon-checkbox__box {
  border-color: var(--primary);
  transform: scale(1.05);
}

/* Checked State */
.neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__box {
  border-color: var(--primary);
  background: rgba(0, 255, 170, 0.1);
}

.neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__check {
  stroke-dashoffset: 0;
  transform: scale(1.1);
}

.neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__glow {
  opacity: 0.2;
}

.neon-checkbox
  input:checked
  ~ .neon-checkbox__frame
  .neon-checkbox__borders
  span {
  opacity: 1;
}

/* Particle Animations */
.neon-checkbox
  input:checked
  ~ .neon-checkbox__frame
  .neon-checkbox__particles
  span {
  animation: particleExplosion 0.6s ease-out forwards;
}

.neon-checkbox
  input:checked
  ~ .neon-checkbox__frame
  .neon-checkbox__rings
  .ring {
  animation: ringPulse 0.6s ease-out forwards;
}

.neon-checkbox
  input:checked
  ~ .neon-checkbox__frame
  .neon-checkbox__sparks
  span {
  animation: sparkFlash 0.6s ease-out forwards;
}

/* Animations */
@keyframes borderFlow1 {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(200%);
  }
}

@keyframes borderFlow2 {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(200%);
  }
}

@keyframes borderFlow3 {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-200%);
  }
}

@keyframes borderFlow4 {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-200%);
  }
}

@keyframes particleExplosion {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translate(
        calc(-50% + var(--x, 20px)),
        calc(-50% + var(--y, 20px))
      )
      scale(0);
    opacity: 0;
  }
}

@keyframes ringPulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes sparkFlash {
  0% {
    transform: rotate(var(--r, 0deg)) translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: rotate(var(--r, 0deg)) translateX(30px) scale(0);
    opacity: 0;
  }
}

/* Particle Positions */
.neon-checkbox__particles span:nth-child(1) {
  --x: 25px;
  --y: -25px;
}
.neon-checkbox__particles span:nth-child(2) {
  --x: -25px;
  --y: -25px;
}
.neon-checkbox__particles span:nth-child(3) {
  --x: 25px;
  --y: 25px;
}
.neon-checkbox__particles span:nth-child(4) {
  --x: -25px;
  --y: 25px;
}
.neon-checkbox__particles span:nth-child(5) {
  --x: 35px;
  --y: 0px;
}
.neon-checkbox__particles span:nth-child(6) {
  --x: -35px;
  --y: 0px;
}
.neon-checkbox__particles span:nth-child(7) {
  --x: 0px;
  --y: 35px;
}
.neon-checkbox__particles span:nth-child(8) {
  --x: 0px;
  --y: -35px;
}
.neon-checkbox__particles span:nth-child(9) {
  --x: 20px;
  --y: -30px;
}
.neon-checkbox__particles span:nth-child(10) {
  --x: -20px;
  --y: 30px;
}
.neon-checkbox__particles span:nth-child(11) {
  --x: 30px;
  --y: 20px;
}
.neon-checkbox__particles span:nth-child(12) {
  --x: -30px;
  --y: -20px;
}

/* Spark Rotations */
.neon-checkbox__sparks span:nth-child(1) {
  --r: 0deg;
  top: 50%;
  left: 50%;
}
.neon-checkbox__sparks span:nth-child(2) {
  --r: 90deg;
  top: 50%;
  left: 50%;
}
.neon-checkbox__sparks span:nth-child(3) {
  --r: 180deg;
  top: 50%;
  left: 50%;
}
.neon-checkbox__sparks span:nth-child(4) {
  --r: 270deg;
  top: 50%;
  left: 50%;
}

/* Ring Delays */
.neon-checkbox__rings .ring:nth-child(1) {
  animation-delay: 0s;
}
.neon-checkbox__rings .ring:nth-child(2) {
  animation-delay: 0.1s;
}
.neon-checkbox__rings .ring:nth-child(3) {
  animation-delay: 0.2s;
}

/* Progress Bar Animation */
.progress-fill {
  background: linear-gradient(90deg, #a855f7, #ec4899, #f97316);
  border-radius: 9999px;
  transition: width 0.3s ease;
}
</style>
