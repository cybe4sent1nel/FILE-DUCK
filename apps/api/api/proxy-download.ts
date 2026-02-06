import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMetadata } from '../lib/redis.js';
import { validateShareCode } from '@fileduck/shared';

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

    if (!metadata.downloadUrl) {
      return res.status(400).json({ error: 'No download URL available' });
    }

    // Check if it's a GitHub URL
    if (!metadata.downloadUrl.includes('github.com')) {
      // Redirect to the URL directly for non-GitHub URLs
      return res.redirect(302, metadata.downloadUrl);
    }

    console.log(`[Proxy] Fetching from GitHub: ${metadata.downloadUrl}`);

    // Fetch from GitHub
    const response = await fetch(metadata.downloadUrl, {
      headers: {
        'User-Agent': 'FileDuck/1.0',
        'Accept': 'application/octet-stream',
      },
    });

    if (!response.ok) {
      console.error(`[Proxy] GitHub fetch failed: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: 'Failed to fetch file from storage',
        status: response.status 
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(metadata.filename)}"`);
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Stream the response
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
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
