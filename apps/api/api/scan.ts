import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import crypto from 'crypto';

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY || '';
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3';
const VIRUSTOTAL_THRESHOLD = 3; // If 3+ engines detect malware, flag as infected

interface ScanResponse {
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

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll use formidable
  },
};

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
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB max
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const sha256Provided = Array.isArray(fields.sha256) ? fields.sha256[0] : fields.sha256;

    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify SHA256 hash
    const fileBuffer = fs.readFileSync(file.filepath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    if (sha256Provided && hash !== sha256Provided) {
      // Cleanup temp file
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'SHA256 hash mismatch' });
    }

    // Scan with VirusTotal
    console.log('Scanning file with VirusTotal...');
    const vtResult = await scanWithVirusTotal(hash, file.filepath);

    // Cleanup temp file
    fs.unlinkSync(file.filepath);

    // Determine decision
    let decision: 'clean' | 'infected' | 'suspicious' = 'clean';
    let score = vtResult?.positives || 0;

    if (vtResult && vtResult.positives >= VIRUSTOTAL_THRESHOLD) {
      decision = 'infected';
    } else if (vtResult && vtResult.positives > 0) {
      decision = 'suspicious';
    }

    const response: ScanResponse = {
      clean: decision === 'clean',
      decision,
      clamav: {
        infected: false, // ClamAV not available on serverless
      },
      virustotal: vtResult ? {
        positives: vtResult.positives,
        total: vtResult.total,
      } : undefined,
      score,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Scan error:', error);
    return res.status(500).json({
      error: 'Scan failed',
      message: error.message,
    });
  }
}

async function scanWithVirusTotal(sha256: string, filePath: string): Promise<{ positives: number; total: number } | null> {
  if (!VIRUSTOTAL_API_KEY) {
    console.warn('VirusTotal API key not configured, skipping scan');
    return null;
  }

  try {
    // First, check if file hash is already known
    const hashReport = await getHashReport(sha256);
    if (hashReport) {
      return hashReport;
    }

    // File not in VT database, upload for scanning
    console.log('File not in VirusTotal database, uploading for scan...');
    const uploadResult = await uploadFileToVirusTotal(filePath);
    
    if (!uploadResult) {
      return null;
    }

    // Poll for results with timeout
    const analysisResult = await pollAnalysis(uploadResult.scanId, 30000); // 30 second timeout
    return analysisResult;
  } catch (error: any) {
    console.error('VirusTotal scan error:', error);
    return null; // Don't fail the entire scan if VT is down
  }
}

async function getHashReport(sha256: string): Promise<{ positives: number; total: number } | null> {
  try {
    const response = await axios.get(`${VIRUSTOTAL_API_URL}/files/${sha256}`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
      },
      timeout: 10000,
    });

    const data = response.data.data;
    const stats = data.attributes.last_analysis_stats;

    return {
      positives: stats.malicious,
      total: stats.malicious + stats.undetected + stats.suspicious + stats.harmless,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      // File not found in VT database
      return null;
    }
    throw error;
  }
}

async function uploadFileToVirusTotal(filePath: string): Promise<{ scanId: string } | null> {
  try {
    // Get upload URL
    const urlResponse = await axios.get(`${VIRUSTOTAL_API_URL}/files/upload_url`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
      },
      timeout: 10000,
    });

    const uploadUrl = urlResponse.data.data;

    // Upload file
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const uploadResponse = await axios.post(uploadUrl, form, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000, // 2 minutes for upload
    });

    return {
      scanId: uploadResponse.data.data.id,
    };
  } catch (error: any) {
    console.error('VirusTotal upload error:', error);
    return null;
  }
}

async function pollAnalysis(analysisId: string, timeoutMs: number = 30000): Promise<{ positives: number; total: number } | null> {
  const startTime = Date.now();
  const pollInterval = 3000; // 3 seconds

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await axios.get(`${VIRUSTOTAL_API_URL}/analyses/${analysisId}`, {
        headers: {
          'x-apikey': VIRUSTOTAL_API_KEY,
        },
        timeout: 10000,
      });

      const data = response.data.data;
      const status = data.attributes.status;

      if (status === 'completed') {
        const stats = data.attributes.stats;
        return {
          positives: stats.malicious,
          total: stats.malicious + stats.undetected + stats.suspicious + stats.harmless,
        };
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error: any) {
      console.error('VirusTotal polling error:', error);
      return null;
    }
  }

  // Timeout reached
  console.warn('VirusTotal analysis timeout');
  return null;
}
