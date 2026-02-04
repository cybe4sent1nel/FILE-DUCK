import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateShareCode } from '@fileduck/shared';
// @ts-ignore - lib files are compiled separately
import { getMetadata, decrementUses, checkRateLimit, trackFailedAttempt } from '../../lib/redis';
// @ts-ignore - lib files are compiled separately
import { generateSignedCDNUrl } from '../../lib/cdn';
// @ts-ignore - lib files are compiled separately
import { getPresignedDownloadUrl } from '../../lib/s3';

const CAPTCHA_THRESHOLD = 3;
const USE_CDN = process.env.USE_CDN === 'true';

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

    const { shareCode, captchaToken } = req.body;

    // Validation
    if (!shareCode || !validateShareCode(shareCode)) {
      await trackFailedAttempt(ip);
      return res.status(400).json({
        error: 'Invalid share code format',
        code: 'INVALID_CODE',
      });
    }

    // Check if CAPTCHA is required
    const failedAttempts = await trackFailedAttempt(ip);
    if (failedAttempts >= CAPTCHA_THRESHOLD && !captchaToken) {
      return res.status(403).json({
        error: 'CAPTCHA verification required',
        code: 'CAPTCHA_REQUIRED',
      });
    }

    // TODO: Verify CAPTCHA token with Google reCAPTCHA
    // if (captchaToken) {
    //   const isValid = await verifyCaptcha(captchaToken);
    //   if (!isValid) {
    //     return res.status(403).json({ error: 'Invalid CAPTCHA', code: 'CAPTCHA_REQUIRED' });
    //   }
    // }

    // Get metadata from Redis
    const metadata = await getMetadata(shareCode);

    if (!metadata) {
      await trackFailedAttempt(ip);
      return res.status(404).json({
        error: 'Share code not found or expired',
        code: 'INVALID_CODE',
      });
    }

    // Check expiration
    if (metadata.expiresAt < Date.now()) {
      return res.status(410).json({
        error: 'Share code has expired',
        code: 'EXPIRED',
      });
    }

    // Check uses left
    if (metadata.usesLeft <= 0) {
      return res.status(410).json({
        error: 'No downloads remaining',
        code: 'NO_USES_LEFT',
      });
    }

    // Check scan status
    if (metadata.scanStatus === 'pending' || metadata.scanStatus === 'scanning') {
      return res.status(202).json({
        error: 'File is being scanned for malware',
        code: 'SCAN_PENDING',
      });
    }

    if (metadata.scanStatus === 'infected') {
      return res.status(403).json({
        error: 'File was flagged as malicious',
        code: 'MALWARE_DETECTED',
      });
    }

    // Decrement uses atomically
    const updatedMetadata = await decrementUses(shareCode);

    if (!updatedMetadata) {
      return res.status(500).json({
        error: 'Failed to process download',
        code: 'SERVER_ERROR',
      });
    }

    // Generate download URL
    let downloadUrl: string;

    if (USE_CDN) {
      // Use CDN signed URL
      downloadUrl = generateSignedCDNUrl(metadata.s3Key);
    } else {
      // Use S3 presigned URL
      downloadUrl = await getPresignedDownloadUrl(metadata.s3Key);
    }

    return res.status(200).json({
      downloadUrl,
      filename: metadata.filename,
      size: metadata.size,
      sha256: metadata.sha256,
      mimeType: metadata.mimeType,
      usesLeft: updatedMetadata.usesLeft,
      expiresAt: metadata.expiresAt,
    });
  } catch (error: any) {
    console.error('Redeem error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR',
      details: error.message,
    });
  }
}
