import axios from 'axios';
import type {
  UploadMetaRequest,
  UploadMetaResponse,
  RedeemRequest,
  RedeemResponse,
} from '@fileduck/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function uploadFileMeta(
  request: UploadMetaRequest
): Promise<UploadMetaResponse> {
  const response = await api.post('/upload-meta', request);
  return response.data;
}

export async function uploadToS3(
  file: File,
  uploadUrls: string[],
  uploadId: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const chunkSize = 100 * 1024 * 1024; // 100 MB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  const parts: { ETag: string; PartNumber: number }[] = [];

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const response = await axios.put(uploadUrls[i], chunk, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      onUploadProgress: (progressEvent: any) => {
        const chunkProgress = (progressEvent.loaded / progressEvent.total!) * 100;
        const totalProgress = ((i + chunkProgress / 100) / chunks) * 100;
        onProgress?.(Math.round(totalProgress));
      },
    });

    parts.push({
      ETag: response.headers.etag,
      PartNumber: i + 1,
    });
  }

  // Complete multipart upload
  await api.post('/complete-upload', {
    uploadId,
    parts,
  });
}

export async function redeemShareCode(request: RedeemRequest): Promise<RedeemResponse> {
  const response = await api.post('/redeem', request);
  return response.data;
}

export async function healthCheck(): Promise<{ status: string }> {
  const response = await api.get('/health');
  return response.data;
}
