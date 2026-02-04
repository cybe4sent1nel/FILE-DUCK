import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export interface StoredMetadata {
  id: string;
  shareCode: string;
  filename: string;
  size: number;
  sha256: string;
  mimeType: string;
  uploadedAt: number;
  expiresAt: number;
  usesLeft: number;
  maxUses: number;
  s3Key: string;
  scanStatus: 'pending' | 'scanning' | 'clean' | 'infected' | 'error';
  encrypted: boolean;
}

export async function storeMetadata(
  shareCode: string,
  metadata: StoredMetadata,
  ttlSeconds: number
): Promise<void> {
  await redis.setex(shareCode, ttlSeconds, JSON.stringify(metadata));
}

export async function getMetadata(shareCode: string): Promise<StoredMetadata | null> {
  const data = await redis.get(shareCode);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) as StoredMetadata : data as StoredMetadata;
}

export async function decrementUses(shareCode: string): Promise<StoredMetadata | null> {
  const metadata = await getMetadata(shareCode);
  if (!metadata) return null;

  if (metadata.usesLeft <= 1) {
    // Last use - delete the key
    await redis.del(shareCode);
    return { ...metadata, usesLeft: 0 };
  }

  // Decrement uses
  metadata.usesLeft--;
  const ttl = await redis.ttl(shareCode);
  await redis.setex(shareCode, ttl > 0 ? ttl : 86400, JSON.stringify(metadata));

  return metadata;
}

export async function updateScanStatus(
  shareCode: string,
  status: 'pending' | 'scanning' | 'clean' | 'infected' | 'error'
): Promise<void> {
  const metadata = await getMetadata(shareCode);
  if (!metadata) return;

  metadata.scanStatus = status;
  const ttl = await redis.ttl(shareCode);
  await redis.setex(shareCode, ttl > 0 ? ttl : 86400, JSON.stringify(metadata));
}

// Rate limiting
export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const key = `ratelimit:${ip}`;
  const now = Date.now();
  const window = 60 * 1000; // 1 minute
  const maxRequests = 10;

  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.pexpire(key, window);
  }

  const ttl = await redis.pttl(key);
  const resetAt = now + (ttl > 0 ? ttl : window);

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetAt,
  };
}

export async function trackFailedAttempt(ip: string): Promise<number> {
  const key = `failed:${ip}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 3600); // 1 hour
  }

  return count;
}

export default redis;
