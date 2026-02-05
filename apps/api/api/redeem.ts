import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateShareCode } from '@fileduck/shared';
import { getMetadata, decrementUses, checkRateLimit, trackFailedAttempt } from '../lib/redis.js';
import { generateSignedCDNUrl } from '../lib/cdn.js';
import { getPresignedDownloadUrl } from '../lib/s3.js';
import { verifyCaptcha } from '../lib/captcha.js';

const CAPTCHA_THRESHOLD = 3;
const USE_CDN = process.env.USE_CDN === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    // Get metadata first to check requireCaptcha setting
    const metadata = await getMetadata(shareCode);

    if (!metadata) {
      await trackFailedAttempt(ip);
      return res.status(404).json({
        error: 'Share code not found or expired',
        code: 'INVALID_CODE',
      });
    }

    // Smart Hybrid CAPTCHA Logic (skip in development)
    if (IS_PRODUCTION) {
      const failedAttempts = await trackFailedAttempt(ip);
      
      // Risk-based triggers for CAPTCHA requirement
      const captchaRequired = 
        metadata.requireCaptcha || // Uploader opted-in for captcha protection
        failedAttempts >= CAPTCHA_THRESHOLD || // Multiple failed attempts (brute force)
        metadata.size > 50 * 1024 * 1024; // Large files (>50MB)
      
      if (captchaRequired && !captchaToken) {
        return res.status(403).json({
          error: 'CAPTCHA verification required',
          code: 'CAPTCHA_REQUIRED',
          reason: metadata.requireCaptcha ? 'uploader_required' : 
                  failedAttempts >= CAPTCHA_THRESHOLD ? 'failed_attempts' : 
                  'large_file',
        });
      }

      // Verify CAPTCHA token (Turnstile or reCAPTCHA)
      if (captchaToken) {
        const isValid = await verifyCaptcha(captchaToken);
        if (!isValid) {
          return res.status(403).json({ 
            error: 'Invalid CAPTCHA', 
            code: 'CAPTCHA_INVALID' 
          });
        }
      }
    } else {
      console.log('⚠️ Development mode - CAPTCHA verification skipped');
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

    // SECURITY: Auto-delete if download limit reached
    if (updatedMetadata.usesLeft <= 0 && metadata.githubReleaseId) {
      try {
        // Import cleanup function
        const { cleanupSpecificFile } = await import('../lib/cleanup.js');
        await cleanupSpecificFile(shareCode);
        console.log(`Auto-deleted file ${metadata.filename} - download limit reached`);
      } catch (error: any) {
        console.error('Failed to auto-delete after download limit:', error);
      }
    }

    // Generate download URL based on storage type
    let downloadUrl: string;
    let fileContent: string | undefined;

    if (metadata.downloadUrl) {
      // GitHub storage - use direct download URL
      downloadUrl = metadata.downloadUrl;
    } else {
      // For GitHub storage without downloadUrl (file was just uploaded)
      // Return the file content directly from metadata if available
      // Otherwise fall back to S3
      if (USE_CDN) {
        downloadUrl = generateSignedCDNUrl(metadata.s3Key);
      } else {
        downloadUrl = await getPresignedDownloadUrl(metadata.s3Key);
      }
    }

    return res.status(200).json({
      downloadUrl,
      filename: metadata.filename,
      size: metadata.size,
      sha256: metadata.sha256,
      mimeType: metadata.mimeType,
      usesLeft: updatedMetadata.usesLeft,
      expiresAt: metadata.expiresAt,
      scanSkipped: metadata.scanSkipped || false,
      isQuarantined: false, // Always false here since infected files return earlier
      warning: updatedMetadata.usesLeft === 0 ? 'File will be deleted after this download' : undefined,
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
