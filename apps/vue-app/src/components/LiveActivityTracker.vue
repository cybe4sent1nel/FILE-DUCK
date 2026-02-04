<template>
  <div class="bg-gradient-to-r from-purple-50 to-yellow-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
    <div class="text-center mb-6">
      <h3 class="text-2xl font-bold text-purple-800 mb-2">🔥 Live Activity</h3>
      <p class="text-sm text-gray-600">Real-time file sharing happening now</p>
    </div>

    <!-- Live Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-md text-center transform hover:scale-105 transition-transform">
        <div class="flex items-center justify-center mb-2">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <UploadIcon class="w-5 h-5 text-green-600" />
        </div>
        <div class="text-3xl font-bold text-green-600 font-mono">{{ liveStats.uploadsToday }}</div>
        <div class="text-xs text-gray-600 mt-1">Uploads Today</div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-md text-center transform hover:scale-105 transition-transform">
        <div class="flex items-center justify-center mb-2">
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
          <DownloadIcon class="w-5 h-5 text-blue-600" />
        </div>
        <div class="text-3xl font-bold text-blue-600 font-mono">{{ liveStats.downloadsToday }}</div>
        <div class="text-xs text-gray-600 mt-1">Downloads Today</div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-md text-center transform hover:scale-105 transition-transform">
        <div class="flex items-center justify-center mb-2">
          <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse mr-2"></div>
          <UsersIcon class="w-5 h-5 text-purple-600" />
        </div>
        <div class="text-3xl font-bold text-purple-600 font-mono">{{ liveStats.activeUsers }}</div>
        <div class="text-xs text-gray-600 mt-1">Users Online</div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-md text-center transform hover:scale-105 transition-transform">
        <div class="flex items-center justify-center mb-2">
          <div class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
          <ShieldCheckIcon class="w-5 h-5 text-yellow-600" />
        </div>
        <div class="text-3xl font-bold text-yellow-600 font-mono">{{ liveStats.filesScanned }}</div>
        <div class="text-xs text-gray-600 mt-1">Files Scanned</div>
      </div>
    </div>

    <!-- Global Reach Animation -->
    <div class="bg-white rounded-xl p-4 shadow-md mb-6 flex flex-col md:flex-row items-center md:items-start md:space-x-4">
      <div class="w-full md:w-1/3">
        <Vue3Lottie
          :animationData="EarthAnimation"
          :height="180"
          :width="180"
          :loop="true"
          :autoplay="true"
        />
      </div>
      <div class="w-full md:w-2/3 space-y-2 text-sm text-gray-700">
        <p class="font-semibold text-purple-800">Worldwide deliveries</p>
        <p>Realtime transfers across regions with CDN edges and secure scanning before release.</p>
        <p class="text-gray-500">Activity feed is anonymized: filenames are redacted by design.</p>
      </div>
    </div>

    <!-- Recent Activity Feed -->
    <div class="bg-white rounded-xl p-4 shadow-md max-h-64 overflow-y-auto">
      <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center">
        <ActivityIcon class="w-4 h-4 mr-2" />
        Recent Activity
      </h4>
      <TransitionGroup name="activity" tag="div" class="space-y-2">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center space-x-2">
            <component
              :is="activity.type === 'upload' ? UploadIcon : DownloadIcon"
              :class="[
                'w-4 h-4',
                activity.type === 'upload' ? 'text-green-600' : 'text-blue-600'
              ]"
            />
            <span class="font-semibold text-gray-700">{{ activity.filename }}</span>
            <span class="text-gray-500">({{ formatFileSize(activity.size) }})</span>
          </div>
          <span class="text-gray-400">{{ activity.timeAgo }}</span>
        </div>
      </TransitionGroup>
      
      <div v-if="recentActivities.length === 0" class="text-center text-gray-400 py-8">
        <p class="text-sm">Activity will appear here</p>
      </div>
    </div>

    <!-- Trust Badge -->
    <div class="mt-4 text-center">
      <div class="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-xs font-bold">
        <CheckCircleIcon class="w-4 h-4 mr-2" />
        100% Secure • Trusted by {{ (liveStats.totalUsers / 1000).toFixed(1) }}K+ Users
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import { 
  UploadIcon, 
  DownloadIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  ActivityIcon,
  CheckCircleIcon 
} from 'lucide-vue-next';
import { formatFileSize } from '@fileduck/shared';
import EarthAnimation from '../../../../animations/Earth globe rotating with Seamless loop animation.json';

interface LiveStats {
  uploadsToday: number;
  downloadsToday: number;
  activeUsers: number;
  filesScanned: number;
  totalUsers: number;
}

interface Activity {
  id: string;
  type: 'upload' | 'download';
  filename: string;
  size: number;
  timeAgo: string;
  timestamp: number;
}

const liveStats = ref<LiveStats>({
  uploadsToday: 1247,
  downloadsToday: 3892,
  activeUsers: 156,
  filesScanned: 1189,
  totalUsers: 500000,
});

const recentActivities = ref<Activity[]>([]);

let statsInterval: NodeJS.Timeout;
let activityInterval: NodeJS.Timeout;

const sampleExtensions = ['pdf', 'zip', 'jpg', 'docx', 'mp4', 'sql', 'psd', 'gz', 'xlsx', 'bin'];

const generateRedactedName = () => {
  const ext = sampleExtensions[Math.floor(Math.random() * sampleExtensions.length)];
  const token = Math.random().toString(36).slice(2, 8);
  return `file-${token}.${ext}`;
};

const updateStats = () => {
  // Simulate live stats updates
  liveStats.value.uploadsToday += Math.floor(Math.random() * 3);
  liveStats.value.downloadsToday += Math.floor(Math.random() * 5);
  liveStats.value.activeUsers = 120 + Math.floor(Math.random() * 100);
  liveStats.value.filesScanned += Math.floor(Math.random() * 2);
  liveStats.value.totalUsers += Math.floor(Math.random() * 2);
};

const addRandomActivity = () => {
  const activity: Activity = {
    id: `activity-${Date.now()}-${Math.random()}`,
    type: Math.random() > 0.4 ? 'download' : 'upload',
    filename: generateRedactedName(),
    size: Math.floor(Math.random() * 100000000) + 10000, // 10KB to 100MB
    timeAgo: 'Just now',
    timestamp: Date.now(),
  };

  recentActivities.value.unshift(activity);
  
  // Keep only last 10 activities
  if (recentActivities.value.length > 10) {
    recentActivities.value.pop();
  }

  // Update time ago
  updateTimeAgo();
};

const updateTimeAgo = () => {
  const now = Date.now();
  recentActivities.value.forEach((activity) => {
    const seconds = Math.floor((now - activity.timestamp) / 1000);
    if (seconds < 60) {
      activity.timeAgo = 'Just now';
    } else if (seconds < 3600) {
      activity.timeAgo = `${Math.floor(seconds / 60)}m ago`;
    } else {
      activity.timeAgo = `${Math.floor(seconds / 3600)}h ago`;
    }
  });
};

onMounted(() => {
  // Update stats every 5 seconds
  statsInterval = setInterval(updateStats, 5000);
  
  // Add new activity every 3-8 seconds
  const addActivity = () => {
    addRandomActivity();
    activityInterval = setTimeout(addActivity, 3000 + Math.random() * 5000);
  };
  addActivity();

  // Update time ago every 10 seconds
  setInterval(updateTimeAgo, 10000);

  // Initial activities
  for (let i = 0; i < 5; i++) {
    setTimeout(() => addRandomActivity(), i * 1000);
  }
});

onUnmounted(() => {
  if (statsInterval) clearInterval(statsInterval);
  if (activityInterval) clearTimeout(activityInterval);
});
</script>

<style scoped>
.activity-enter-active,
.activity-leave-active {
  transition: all 0.3s ease;
}

.activity-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.activity-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.activity-move {
  transition: transform 0.3s ease;
}
</style>
