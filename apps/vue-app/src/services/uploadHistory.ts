/**
 * Local Storage Manager for Upload History (No Sign-In Required)
 * Stores user's upload history in browser localStorage + Service Worker
 */

export interface UploadHistoryItem {
  id: string;
  shareCode: string;
  filename: string;
  size: number;
  uploadedAt: number;
  expiresAt: number;
  verificationCode: string;
  maxUses: number;
  usesLeft: number;
  downloadUrl?: string;
  githubReleaseId?: number; // For deletion
  githubMetadata?: any; // Chunk info, compression, etc.
}

const STORAGE_KEY = 'fileduck_upload_history';
const MAX_HISTORY_ITEMS = 50; // Keep last 50 uploads
const MAX_TTL_DAYS = 7; // Maximum 7 days

// Register service worker for persistent storage
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service Worker registered:', registration.scope);
      },
      (error) => {
        console.log('Service Worker registration failed:', error);
      }
    );
  });
}

/**
 * Get all upload history from localStorage
 */
export function getUploadHistory(): UploadHistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const history: UploadHistoryItem[] = JSON.parse(data);
    
    // Filter out expired items
    const now = Date.now();
    const validHistory = history.filter(item => item.expiresAt > now);
    
    // Save cleaned history if items were removed
    if (validHistory.length !== history.length) {
      saveUploadHistory(validHistory);
    }
    
    return validHistory.sort((a, b) => b.uploadedAt - a.uploadedAt);
  } catch (error) {
    console.error('Failed to get upload history:', error);
    return [];
  }
}

/**
 * Add new upload to history
 */
export function addToUploadHistory(item: UploadHistoryItem): void {
  try {
    const history = getUploadHistory();
    
    // Add new item at the beginning
    history.unshift(item);
    
    // Keep only MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    saveUploadHistory(trimmedHistory);
  } catch (error) {
    console.error('Failed to add to upload history:', error);
  }
}

/**
 * Update existing upload in history
 */
export function updateUploadHistory(shareCode: string, updates: Partial<UploadHistoryItem>): void {
  try {
    const history = getUploadHistory();
    const index = history.findIndex(item => item.shareCode === shareCode);
    
    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      saveUploadHistory(history);
    }
  } catch (error) {
    console.error('Failed to update upload history:', error);
  }
}

/**
 * Remove upload from history
 */
export function removeFromUploadHistory(shareCode: string): void {
  try {
    const history = getUploadHistory();
    const filtered = history.filter(item => item.shareCode !== shareCode);
    saveUploadHistory(filtered);
  } catch (error) {
    console.error('Failed to remove from upload history:', error);
  }
}

/**
 * Clear all upload history
 */
export function clearUploadHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear upload history:', error);
  }
}

/**
 * Get time remaining for an upload
 */
export function getTimeRemaining(expiresAt: number): string {
  const now = Date.now();
  const remaining = expiresAt - now;
  
  if (remaining <= 0) return 'Expired';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}

/**
 * Get upload statistics
 */
export function getUploadStats(): {
  totalUploads: number;
  activeUploads: number;
  totalSize: number;
  expiringSoon: number;
} {
  const history = getUploadHistory();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  return {
    totalUploads: history.length,
    activeUploads: history.filter(item => item.usesLeft > 0).length,
    totalSize: history.reduce((sum, item) => sum + item.size, 0),
    expiringSoon: history.filter(item => item.expiresAt - now < oneHour && item.expiresAt > now).length,
  };
}

// Private helper
function saveUploadHistory(history: UploadHistoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  
  // Also save to service worker for persistence
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SAVE_UPLOAD_HISTORY',
      payload: history,
    });
  }
}

/**
 * Enforce maximum TTL of 7 days
 */
export function enforceMaxTTL(ttlHours: number): number {
  const maxHours = MAX_TTL_DAYS * 24;
  return Math.min(ttlHours, maxHours);
}

/**
 * Calculate expiration time with 7-day max
 */
export function calculateExpirationTime(ttlHours?: number): number {
  const hours = ttlHours || MAX_TTL_DAYS * 24; // Default to 7 days
  const enforcedHours = enforceMaxTTL(hours);
  return Date.now() + (enforcedHours * 60 * 60 * 1000);
}
