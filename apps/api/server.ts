import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Load environment variables
config({ path: '../../.env' });

const app: Express = express();
const PORT = parseInt(process.env.PORT || process.env.API_PORT || '3001', 10);

// Middleware - Configure CORS for Vercel frontend
app.use(cors({
  origin: process.env.VERCEL ? '*' : [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://fileduck.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 file data

// Lazy load Vercel handlers
const getHealthHandler = () => require('./api/health').default;
const getUploadMetaHandler = () => require('./api/upload-meta').default;
const getCompleteUploadHandler = () => require('./api/complete-upload').default;
const getRedeemHandler = () => require('./api/redeem').default;
const getGitHubUploadHandler = () => require('./api/github-upload').default;
const getScanHandler = () => require('./api/scan').default;
const getDeleteFileHandler = () => require('./api/delete-file').default;
const getCleanupExpiredHandler = () => require('./api/cleanup-expired').default;

// Routes - compatible with both Express and Vercel
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await getHealthHandler()(req as any, res as any);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/upload-meta', async (req: Request, res: Response) => {
  try {
    await getUploadMetaHandler()(req as any, res as any);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/complete-upload', async (req: Request, res: Response) => {
  try {
    await getCompleteUploadHandler()(req as any, res as any);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/redeem', async (req: Request, res: Response) => {
  try {
    await getRedeemHandler()(req as any, res as any);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/github-upload', async (req: Request, res: Response) => {
  try {
    await getGitHubUploadHandler()(req as any, res as any);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    await getScanHandler()(req as any, res as any);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete('/api/delete-file', async (req: Request, res: Response) => {
  try {
    await getDeleteFileHandler()(req as any, res as any);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/cleanup-expired', async (req: Request, res: Response) => {
  try {
    await getCleanupExpiredHandler()(req as any, res as any);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Start server (only in non-Vercel environments)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 FileDuck API running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Health check: http://0.0.0.0:${PORT}/api/health\n`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📦 Storage: ${process.env.USE_GITHUB_STORAGE === 'true' ? 'GitHub' : 'S3'}\n`);
  });
}

// Export for Vercel serverless
export default app;
