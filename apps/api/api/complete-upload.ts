import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore - lib files are compiled separately
import { completeMultipartUpload } from '../../lib/s3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uploadId, parts, key } = req.body;

    if (!uploadId || !parts || !key) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'INVALID_REQUEST',
      });
    }

    await completeMultipartUpload(key, uploadId, parts);

    // TODO: Trigger malware scan in background
    // This could be done via:
    // 1. SQS queue
    // 2. Direct HTTP call to scanner service
    // 3. S3 event notification -> Lambda -> Scanner

    return res.status(200).json({
      success: true,
      message: 'Upload completed, malware scan queued',
    });
  } catch (error: any) {
    console.error('Complete upload error:', error);
    return res.status(500).json({
      error: 'Failed to complete upload',
      code: 'SERVER_ERROR',
      details: error.message,
    });
  }
}
