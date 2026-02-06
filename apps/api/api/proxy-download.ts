import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMetadata } from '../lib/redis.js';
import { validateShareCode } from '@fileduck/shared';
import { fetchDownloadBuffer } from '../lib/download-buffer.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const shareCode = req.query.code as string;

    if (!shareCode || !validateShareCode(shareCode)) {
      return res.status(400).json({ error: 'Invalid share code' });
    }

    const metadata = await getMetadata(shareCode);
    if (!metadata) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!metadata.downloadUrl && !metadata.githubReleaseId) {
      return res.status(400).json({ error: 'No download URL available' });
    }

    // Check if it's a GitHub URL
    if (metadata.downloadUrl && !metadata.downloadUrl.includes('github.com')) {
      // Redirect to the URL directly for non-GitHub URLs
      return res.redirect(302, metadata.downloadUrl);
    }

    const buffer = await fetchDownloadBuffer(metadata);

    if (!buffer) {
      return res.status(404).json({
        error: 'Failed to fetch file from storage',
        status: 404,
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(metadata.filename)}"`);
    res.setHeader('Content-Length', buffer.length.toString());

    console.log(`[Proxy] Sending ${buffer.length} bytes for ${metadata.filename}`);

    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('[Proxy] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy download',
      details: error.message 
    });
  }
}
