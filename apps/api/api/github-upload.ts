import type { VercelRequest, VercelResponse } from '@vercel/node';
import { uploadToGitHub } from '../lib/github-storage.js';
import { updateMetadata } from '../lib/redis.js';

const USE_GITHUB_STORAGE = process.env.USE_GITHUB_STORAGE !== 'false';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shareCode, fileData, filename, sha256 } = req.body;

    if (!shareCode || !fileData) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'INVALID_REQUEST',
      });
    }

    // Convert base64 to Buffer
    const fileBuffer = Buffer.from(fileData, 'base64');

    if (USE_GITHUB_STORAGE && IS_PRODUCTION) {
      // Production: Upload to GitHub Releases
      console.log(`Uploading ${filename} to GitHub (${fileBuffer.length} bytes)...`);
      
      const result = await uploadToGitHub(filename || 'file', fileBuffer, sha256);
      
      // Update Redis metadata with GitHub download URL and release ID
      await updateMetadata(shareCode, {
        downloadUrl: result.downloadUrl,
        githubReleaseId: result.metadata.releaseId,
        scanStatus: 'clean',
      });

      console.log(`✓ File uploaded to GitHub: ${result.downloadUrl}`);

      return res.status(200).json({
        success: true,
        message: 'File uploaded to GitHub',
        downloadUrl: result.downloadUrl,
      });
    } else {
      // Development: Store as base64 data URL in Redis
      await updateMetadata(shareCode, {
        downloadUrl: `data:application/octet-stream;base64,${fileData}`,
        scanStatus: 'clean',
      });

      console.log(`✓ File stored in Redis (development mode)`);

      return res.status(200).json({
        success: true,
        message: 'File uploaded (development mode)',
      });
    }
  } catch (error: any) {
    console.error('GitHub upload error:', error);
    return res.status(500).json({
      error: 'Failed to upload file',
      code: 'SERVER_ERROR',
      details: error.message,
    });
  }
}
