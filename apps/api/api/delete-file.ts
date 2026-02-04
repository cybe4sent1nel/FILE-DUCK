import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMetadata, deleteMetadata } from '../lib/redis.js';
import { cleanupSpecificFile } from '../lib/cleanup.js';

/**
 * DELETE /api/delete-file
 * Delete file from storage and Redis
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shareCode } = req.body;

    if (!shareCode) {
      return res.status(400).json({
        error: 'Missing shareCode',
        code: 'INVALID_REQUEST',
      });
    }

    // Get metadata to check if file exists
    const metadata = await getMetadata(shareCode);
    
    if (!metadata) {
      return res.status(404).json({
        error: 'File not found',
        code: 'NOT_FOUND',
      });
    }

    // Delete from storage (GitHub Releases or S3)
    const deletedFromStorage = await cleanupSpecificFile(shareCode);

    // Delete from Redis
    await deleteMetadata(shareCode);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      deletedFromStorage,
      filename: metadata.filename,
    });
  } catch (error: any) {
    console.error('Delete file error:', error);
    return res.status(500).json({
      error: 'Failed to delete file',
      code: 'SERVER_ERROR',
      details: error.message,
    });
  }
}
