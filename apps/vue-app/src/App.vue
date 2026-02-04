<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <nav class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/" class="flex items-center space-x-2">
            <img src="/logo.png" alt="FileDuck" class="h-10 w-10" />
            <span class="text-2xl font-bold text-blue-600">FileDuck</span>
          </router-link>
          <div class="flex space-x-6 items-center">
            <router-link to="/" class="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <UploadIcon class="w-4 h-4 mr-1" />
              Upload
            </router-link>
            <router-link to="/download" class="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <DownloadIcon class="w-4 h-4 mr-1" />
              Download
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <!-- AdSense Display Ad (Responsive) -->
      <div class="max-w-4xl mx-auto mb-6">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-2332002596329232"
             data-ad-slot="auto"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>

      <router-view />

      <!-- AdSense In-feed Ad -->
      <div class="max-w-4xl mx-auto mt-8">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-format="fluid"
             data-ad-layout-key="-fb+5w+4e-db+86"
             data-ad-client="ca-pub-2332002596329232"
             data-ad-slot="auto"></ins>
      </div>
    </main>

    <footer class="bg-white mt-16">
      <div class="container mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-8 mb-6">
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="FileDuck" class="h-8 w-8" />
              <span class="text-xl font-bold text-blue-600">FileDuck</span>
            </div>
            <p class="text-sm text-gray-600">
              Secure, fast, and private file sharing with malware protection
            </p>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 mb-3 flex items-center">
              <ShieldCheckIcon class="w-4 h-4 mr-2" />
              Security
            </h3>
            <ul class="text-sm text-gray-600 space-y-2">
              <li>Malware scanning</li>
              <li>Zero-knowledge encryption</li>
              <li>Time-limited links</li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 mb-3 flex items-center">
              <ZapIcon class="w-4 h-4 mr-2" />
              Features
            </h3>
            <ul class="text-sm text-gray-600 space-y-2">
              <li>Up to 5GB files</li>
              <li>Global CDN delivery</li>
              <li>SHA-256 checksums</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          <div class="flex justify-center space-x-4 mb-3">
            <router-link to="/privacy" class="hover:text-blue-600 transition-colors">Privacy Policy</router-link>
            <span>•</span>
            <router-link to="/terms" class="hover:text-blue-600 transition-colors">Terms of Service</router-link>
          </div>
          <p>&copy; 2026 FileDuck. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { UploadIcon, DownloadIcon, ShieldCheckIcon, ZapIcon } from 'lucide-vue-next';

// Initialize AdSense ads
onMounted(() => {
  try {
    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
  } catch (err) {
    console.error('AdSense error:', err);
  }
});
</script>
