import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateShareCode, CONSTANTS } from '@fileduck/shared';
// @ts-ignore - lib files are compiled separately
import { storeMetadata } from '../../lib/redis';
// @ts-ignore - lib files are compiled separately
import { createMultipartUpload } from '../../lib/s3';
// @ts-ignore - lib files are compiled separately
import { checkRateLimit } from '../../lib/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get client IP
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';

    // Check rate limit
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        resetAt: rateLimit.resetAt,
      });
    }

    const { filename, size, sha256, mimeType, ttlHours, maxUses, encrypted } = req.body;

    // Validation
    if (!filename || !size || !sha256 || !mimeType) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'INVALID_REQUEST',
      });
    }

    if (size > CONSTANTS.MAX_FILE_SIZE) {
      return res.status(400).json({
        error: 'File too large',
        code: 'INVALID_REQUEST',
        details: { maxSize: CONSTANTS.MAX_FILE_SIZE },
      });
    }

    // Generate share code
    const shareCode = generateShareCode();
    const now = Date.now();
    const ttl = (ttlHours || CONSTANTS.DEFAULT_TTL_HOURS) * 3600;
    const expiresAt = now + ttl * 1000;

    // Create multipart upload
    const { uploadId, presignedUrls } = await createMultipartUpload(filename, size);
    const s3Key = `quarantine/${now}-${filename}`;

    // Store metadata in Redis
    await storeMetadata(
      shareCode,
      {
        id: shareCode,
        shareCode,
        filename,
        size,
        sha256,
        mimeType,
        uploadedAt: now,
        expiresAt,
        usesLeft: maxUses || CONSTANTS.DEFAULT_MAX_USES,
        maxUses: maxUses || CONSTANTS.DEFAULT_MAX_USES,
        s3Key,
        scanStatus: 'pending',
        encrypted: encrypted || false,
      },
      ttl
    );

    // Trigger malware scan asynchronously (webhook or queue)
    // This would be implemented via a separate background job
    // For now, we'll add a TODO
    // TODO: Trigger malware scan via SQS or webhook

    return res.status(200).json({
      shareCode,
      uploadUrls: presignedUrls,
      uploadId,
      expiresAt,
    });
  } catch (error: any) {
    console.error('Upload meta error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR',
      details: error.message,
    });
  }
}
