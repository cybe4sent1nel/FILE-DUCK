import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Load environment variables
config({ path: '../../.env' });

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 file data

// Lazy load Vercel handlers
const getHealthHandler = () => require('./api/health').default;
const getUploadMetaHandler = () => require('./api/upload-meta').default;
const getCompleteUploadHandler = () => require('./api/complete-upload').default;
const getRedeemHandler = () => require('./api/redeem').default;
const getGitHubUploadHandler = () => require('./api/github-upload').default;

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

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 FileDuck API running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
});
