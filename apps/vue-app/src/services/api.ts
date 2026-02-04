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

export interface ScanFileResponse {
  clean: boolean;
  decision: 'clean' | 'infected' | 'suspicious';
  clamav: {
    infected: boolean;
    virus?: string;
  };
  virustotal?: {
    positives: number;
    total: number;
  };
  score: number;
}

export async function scanFileBeforeUpload(
  file: File,
  sha256: string
): Promise<ScanFileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sha256', sha256);

  // Scanner service runs on port 4000
  const scannerUrl = import.meta.env.VITE_SCANNER_URL || 'http://localhost:4000';
  
  const response = await axios.post(`${scannerUrl}/scan`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

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
  // If no upload URLs provided, it means we're using GitHub storage (server-side upload)
  if (!uploadUrls || uploadUrls.length === 0) {
    // GitHub storage is handled server-side in complete-upload
    // Just report 100% progress immediately
    onProgress?.(100);
    return;
  }

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

export async function deleteFile(shareCode: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete('/delete-file', {
    data: { shareCode },
  });
  return response.data;
}
