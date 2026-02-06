<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-yellow-50 relative overflow-hidden">
    <!-- Notification Container -->
    <NotificationContainer />

    <!-- Falling Icons Background -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div v-for="i in 15" :key="i" class="falling-icon" :style="getFallingIconStyle(i)">
        <component :is="getRandomIcon(i)" class="w-6 h-6 opacity-20" :class="getIconColor(i)" />
      </div>
    </div>

    <!-- Particle Background -->
    <ParticleBackground />
    
    <nav class="bg-white/95 backdrop-blur-md shadow-2xl border-b-2 border-purple-200 sticky top-0 z-50">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <router-link to="/" class="flex items-center space-x-2 sm:space-x-3 group">
            <div class="relative">
              <div class="absolute inset-0 bg-purple-100 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img src="/logo.png" alt="FileDuck" class="h-10 w-10 sm:h-12 sm:w-12 transform group-hover:scale-110 group-hover:rotate-12 transition-all relative z-10" />
            </div>
            <span class="text-xl sm:text-2xl font-bold font-display tracking-tight text-violet-900">FileDuck</span>
          </router-link>
          
          <!-- Mobile Menu Button -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors">
            <svg v-if="!mobileMenuOpen" class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <!-- Desktop Menu -->
          <div class="hidden md:flex space-x-2 lg:space-x-6 items-center">
            <router-link to="/" class="flex items-center text-gray-700 hover:text-purple-600 transition-all font-semibold px-3 lg:px-4 py-2 rounded-lg hover:bg-purple-50 group">
              <HomeIcon class="w-5 h-5 mr-1 lg:mr-2 group-hover:scale-110 transition-transform" />
              <span class="text-sm lg:text-base">Home</span>
            </router-link>
            <a href="/#upload" @click.prevent="scrollToUpload" class="flex items-center text-gray-700 hover:text-purple-600 transition-all font-semibold px-3 lg:px-4 py-2 rounded-lg hover:bg-purple-50 group cursor-pointer">
              <UploadIcon class="w-5 h-5 mr-1 lg:mr-2 group-hover:scale-110 transition-transform" />
              <span class="text-sm lg:text-base">Upload</span>
            </a>
            <router-link to="/download" class="flex items-center text-gray-700 hover:text-yellow-600 transition-all font-semibold px-3 lg:px-4 py-2 rounded-lg hover:bg-yellow-50 group cursor-pointer">
              <DownloadIcon class="w-5 h-5 mr-1 lg:mr-2 group-hover:scale-110 transition-transform" />
              <span class="text-sm lg:text-base">Download</span>
            </router-link>
            <router-link to="/history" class="flex items-center text-gray-700 hover:text-purple-600 transition-all font-semibold px-3 lg:px-4 py-2 rounded-lg hover:bg-purple-50 group cursor-pointer">
              <ClockIcon class="w-5 h-5 mr-1 lg:mr-2 group-hover:scale-110 transition-transform" />
              <span class="text-sm lg:text-base">My Uploads</span>
            </router-link>
          </div>
        </div>
        
        <!-- Mobile Menu -->
        <div v-if="mobileMenuOpen" class="md:hidden mt-4 pb-2 space-y-2">
          <router-link @click="mobileMenuOpen = false" to="/" class="flex items-center text-gray-700 hover:text-purple-600 transition-all font-semibold px-4 py-3 rounded-lg hover:bg-purple-50 group">
            <HomeIcon class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Home
          </router-link>
          <a @click="scrollToUpload(); mobileMenuOpen = false" href="/#upload" class="flex items-center text-gray-700 hover:text-purple-600 transition-all font-semibold px-4 py-3 rounded-lg hover:bg-purple-50 group cursor-pointer">
            <UploadIcon class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Upload
          </a>
          <router-link @click="mobileMenuOpen = false" to="/download" class="flex items-center text-gray-700 hover:text-yellow-600 transition-all font-semibold px-4 py-3 rounded-lg hover:bg-yellow-50 group cursor-pointer">
            <DownloadIcon class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Download
          </router-link>
          <router-link @click="mobileMenuOpen = false" to="/history" class="flex items-center text-gray-700 hover:text-purple-600 transition-all font-semibold px-4 py-3 rounded-lg hover:bg-purple-50 group">
            <ClockIcon class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            My Uploads
          </router-link>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 relative z-10">
      <!-- AdSense Display Ad (Responsive) - Only show if ads loaded -->
      <div v-if="adsLoaded" class="max-w-4xl mx-auto mb-2">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-2332002596329232"
             data-ad-slot="auto"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>

      <router-view />

      <!-- AdSense In-feed Ad - Only show if ads loaded -->
      <div v-if="adsLoaded" class="max-w-4xl mx-auto mt-8">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-format="fluid"
             data-ad-layout-key="-fb+5w+4e-db+86"
             data-ad-client="ca-pub-2332002596329232"
             data-ad-slot="auto"></ins>
      </div>
    </main>

    <footer class="bg-gradient-to-br from-lime-50 to-lime-100 mt-16 border-t-2 border-lime-200">
      <div class="container mx-auto px-4 py-8 sm:py-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6">
          <div class="text-center sm:text-left">
            <div class="flex items-center justify-center sm:justify-start space-x-2 mb-4">
              <img src="/logo.png" alt="FileDuck" class="h-8 sm:h-10 w-8 sm:w-10" />
              <span class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-lime-500 bg-clip-text text-transparent">FileDuck</span>
            </div>
            <p class="text-sm text-gray-700 px-4 sm:px-0">
              Secure, fast, and private file sharing with malware protection
            </p>
          </div>
          <div class="text-center sm:text-left">
            <h3 class="font-bold text-lime-700 mb-3 flex items-center justify-center sm:justify-start text-base sm:text-lg">
              <ShieldCheckIcon class="w-5 h-5 mr-2" />
              Security
            </h3>
            <ul class="text-sm text-gray-600 space-y-2">
              <li class="flex items-center justify-center sm:justify-start"><span class="text-lime-600 mr-2">✓</span>Malware scanning</li>
              <li class="flex items-center justify-center sm:justify-start"><span class="text-lime-600 mr-2">✓</span>Zero-knowledge encryption</li>
              <li class="flex items-center justify-center sm:justify-start"><span class="text-lime-600 mr-2">✓</span>Time-limited links</li>
            </ul>
          </div>
          <div class="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h3 class="font-bold text-lime-700 mb-3 flex items-center justify-center sm:justify-start text-base sm:text-lg">
              <ZapIcon class="w-5 h-5 mr-2" />
              Features
            </h3>
            <ul class="text-sm text-gray-600 space-y-2">
              <li class="flex items-center justify-center sm:justify-start"><span class="text-lime-600 mr-2">✓</span><span class="break-words">Up to 5GB files (100MB scan limit)</span></li>
              <li class="flex items-center justify-center sm:justify-start"><span class="text-lime-600 mr-2">✓</span>Global CDN delivery</li>
              <li class="flex items-center justify-center sm:justify-start"><span class="text-lime-600 mr-2">✓</span>SHA-256 checksums</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-lime-300 pt-6 text-center text-xs sm:text-sm text-gray-600">
          <div class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
            <router-link to="/privacy" class="hover:text-lime-600 transition-colors font-medium">Privacy Policy</router-link>
            <span class="hidden sm:inline">•</span>
            <router-link to="/terms" class="hover:text-lime-600 transition-colors font-medium">Terms of Service</router-link>
          </div>
          <p class="text-gray-500">&copy; 2026 FileDuck. All rights reserved.</p>
          <div class="mt-4 pb-2">
             <span class="text-xs font-medium text-gray-500/80">Designed & Developed by </span>
             <span class="inline-block font-bold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent transform hover:scale-105 transition-all duration-300 cursor-default shadow-lg shadow-purple-500/10">
               Fahad Khan
             </span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { UploadIcon, DownloadIcon, ClockIcon, ShieldCheckIcon, ZapIcon, FileIcon, FolderIcon, FileTextIcon, ImageIcon, FileCodeIcon, HomeIcon } from 'lucide-vue-next';
import ParticleBackground from './components/ParticleBackground.vue';
import NotificationContainer from './components/NotificationContainer.vue';

const router = useRouter();

const adsLoaded = ref(false);
const mobileMenuOpen = ref(false);

const icons = [FileIcon, FolderIcon, FileTextIcon, ImageIcon, FileCodeIcon, ShieldCheckIcon, ZapIcon];

const getRandomIcon = (index: number) => {
  return icons[index % icons.length];
};

const getFallingIconStyle = (index: number) => {
  const left = (index * 7 + 3) % 100;
  const duration = 15 + (index % 10) * 2;
  const delay = (index * 1.5) % 10;
  return {
    left: `${left}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  };
};

const getIconColor = (index: number) => {
  const colors = ['text-purple-300', 'text-yellow-300', 'text-blue-300', 'text-pink-300', 'text-green-300'];
  return colors[index % colors.length];
};

// Initialize AdSense ads
let adsInitialized = false;

onMounted(() => {
  // Only initialize ads once
  if (adsInitialized) return;
  adsInitialized = true;

  // Handle online/offline status
  const handleOnline = () => {
    console.log('Back online');
    if (router.currentRoute.value.path === '/offline') {
      router.push('/');
    }
  };

  const handleOffline = () => {
    console.log('Went offline');
    if (router.currentRoute.value.path !== '/offline') {
      router.push('/offline');
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  try {
    // Wait for AdSense script to load
    setTimeout(() => {
      const adElements = document.querySelectorAll('.adsbygoogle');
      
      if (adElements.length > 0 && (window as any).adsbygoogle) {
        try {
          // Only push ads that haven't been processed yet
          adElements.forEach((el) => {
            const element = el as HTMLElement;
            const status = element.getAttribute('data-adsbygoogle-status');
            
            // Skip if already processed (has any status attribute)
            if (!status) {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
          });
        } catch (pushError) {
          console.warn('AdSense push error:', pushError);
        }
        
        // Check if ads loaded successfully
        setTimeout(() => {
          adsLoaded.value = Array.from(adElements).some(
            el => (el as HTMLElement).offsetHeight > 0 || 
                  (el as HTMLElement).getAttribute('data-ad-status') === 'filled'
          );
        }, 1500);
      } else {
        adsLoaded.value = false;
      }
    }, 500);
  } catch (err) {
    console.error('AdSense error:', err);
    adsLoaded.value = false;
  }
});

// Scroll to upload section
const scrollToUpload = () => {
  if (router.currentRoute.value.path !== '/') {
    router.push('/').then(() => {
      setTimeout(() => {
        const uploadSection = document.querySelector('#upload');
        uploadSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    });
  } else {
    const uploadSection = document.querySelector('#upload');
    uploadSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<style scoped>
@keyframes fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.2;
  }
  90% {
    opacity: 0.2;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.falling-icon {
  position: absolute;
  top: -100px;
  animation: fall linear infinite;
}
</style>
