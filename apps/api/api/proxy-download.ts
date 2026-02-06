import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMetadata } from '../lib/redis.js';
import { validateShareCode } from '@fileduck/shared';
import { Octokit } from '@octokit/rest';
import * as pako from 'pako';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const GITHUB_OWNER = process.env.GITHUB_STORAGE_OWNER || 'duckyoo9';
const GITHUB_REPO = process.env.GITHUB_STORAGE_REPO || 'fileduck-storage';

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

    let buffer: Buffer | null = null;

    // Try direct download URL first (works for public repos)
    if (metadata.downloadUrl) {
      console.log(`[Proxy] Fetching from GitHub URL: ${metadata.downloadUrl}`);
      const response = await fetch(metadata.downloadUrl, {
        headers: {
          'User-Agent': 'FileDuck/1.0',
          'Accept': 'application/octet-stream',
        },
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        console.warn(`[Proxy] Direct GitHub fetch failed: ${response.status} ${response.statusText}`);
      }
    }

    // If direct fetch failed, try GitHub API with token
    if (!buffer && metadata.githubReleaseId) {
      if (!process.env.GITHUB_TOKEN) {
        return res.status(404).json({
          error: 'Failed to fetch file from storage',
          status: 404,
          details: 'GitHub token missing for private release download',
        });
      }

      console.log(`[Proxy] Fetching from GitHub API release ${metadata.githubReleaseId}`);

      const assets = await octokit.rest.repos.listReleaseAssets({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        release_id: metadata.githubReleaseId,
        per_page: 100,
      });

      const baseName = metadata.filename;
      const matchingAssets = assets.data.filter(asset => asset.name.startsWith(baseName));

      if (matchingAssets.length === 0 && assets.data.length > 0) {
        // Fallback to first asset if names don't match
        matchingAssets.push(assets.data[0]);
      }

      if (matchingAssets.length === 0) {
        return res.status(404).json({
          error: 'Failed to fetch file from storage',
          status: 404,
          details: 'No release assets found',
        });
      }

      const isChunked = matchingAssets.some(asset => /\.part\d+/i.test(asset.name));
      const isCompressed = matchingAssets.some(asset => asset.name.endsWith('.gz'));

      if (isChunked) {
        // Sort by part number
        const sortedAssets = matchingAssets
          .map(asset => ({
            asset,
            part: parseInt((asset.name.match(/\.part(\d+)/i) || [])[1] || '0', 10),
          }))
          .sort((a, b) => a.part - b.part);

        const buffers: Buffer[] = [];
        for (const item of sortedAssets) {
          const assetResponse = await octokit.request(
            'GET /repos/{owner}/{repo}/releases/assets/{asset_id}',
            {
              owner: GITHUB_OWNER,
              repo: GITHUB_REPO,
              asset_id: item.asset.id,
              headers: { accept: 'application/octet-stream' },
            }
          );
          const assetBuffer = Buffer.isBuffer(assetResponse.data)
            ? assetResponse.data
            : Buffer.from(assetResponse.data as any);
          buffers.push(assetBuffer);
        }

        buffer = Buffer.concat(buffers);
      } else {
        const asset = matchingAssets[0];
        const assetResponse = await octokit.request(
          'GET /repos/{owner}/{repo}/releases/assets/{asset_id}',
          {
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            asset_id: asset.id,
            headers: { accept: 'application/octet-stream' },
          }
        );
        buffer = Buffer.isBuffer(assetResponse.data)
          ? assetResponse.data
          : Buffer.from(assetResponse.data as any);
      }

      if (buffer && isCompressed) {
        try {
          buffer = Buffer.from(pako.inflate(buffer));
        } catch (inflateError) {
          console.warn('[Proxy] Decompression failed, returning raw data:', inflateError);
        }
      }
    }

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
