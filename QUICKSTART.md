# 🚀 Quick Start Guide - FileDuck

Get FileDuck running locally in 5 minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm ([Install](https://pnpm.io/installation))
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop/))

## Option 1: Automated Setup (Recommended)

### Windows

```powershell
.\setup.bat
```

### Linux/macOS

```bash
chmod +x setup.sh
./setup.sh
```

This will:
1. Install dependencies
2. Create `.env` file
3. Start Docker services
4. Create S3 buckets in MinIO

## Option 2: Manual Setup

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Minimum required for local dev
UPSTASH_REDIS_URL=redis://localhost:6379
AWS_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
S3_BUCKET_QUARANTINE=fileduck-quarantine
S3_BUCKET_PUBLIC=fileduck-public
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
```

### Step 3: Start Infrastructure

```bash
docker-compose up -d
```

Wait ~30 seconds for services to initialize.

### Step 4: Create S3 Buckets

**Option A: Using MinIO Client (mc)**

```bash
# Install mc (MinIO client)
# macOS: brew install minio/stable/mc
# Windows: choco install minio-client
# Linux: wget https://dl.min.io/client/mc/release/linux-amd64/mc

# Configure
mc alias set local http://localhost:9000 minioadmin minioadmin123

# Create buckets
mc mb local/fileduck-quarantine
mc mb local/fileduck-public

# Set public download policy
mc anonymous set download local/fileduck-public
```

**Option B: Using MinIO Web UI**

1. Open http://localhost:9001
2. Login: `minioadmin` / `minioadmin123`
3. Create buckets:
   - `fileduck-quarantine` (private)
   - `fileduck-public` (public download)

### Step 5: Start Development Servers

```bash
pnpm dev
```

This starts:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Scanner: http://localhost:4000

## Verify Installation

### Check Services

```bash
# API Health
curl http://localhost:3001/api/health

# Scanner Health
curl http://localhost:4000/health

# ClamAV
echo "PING" | nc localhost 3310
# Should return: PONG

# Redis
docker exec -it fileduck-redis redis-cli ping
# Should return: PONG

# MinIO
curl http://localhost:9000/minio/health/live
# Should return: OK
```

### Test Upload

1. Open http://localhost:3000
2. Drag and drop a test file
3. Wait for SHA-256 to compute
4. Click "Upload & Generate Share Code"
5. Copy the share code
6. Wait ~10 seconds for scan to complete
7. Go to Download tab
8. Paste share code
9. Click "Access File"
10. Verify SHA-256 matches
11. Download file

## Troubleshooting

### Port Already in Use

Change ports in `docker-compose.yml`:

```yaml
services:
  minio:
    ports:
      - "9000:9000"  # Change to 9010:9000 if 9000 is taken
```

### ClamAV Not Starting

ClamAV needs ~1-2 GB RAM and takes ~60 seconds to start.

```bash
# Check logs
docker logs fileduck-clamav

# Wait for "clamd is now ready to accept connections"
```

### Upload Fails

```bash
# Check API logs
docker-compose logs api

# Check S3 connection
mc ls local/

# Restart services
docker-compose restart
```

### Full Troubleshooting Guide

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Next Steps

### Development

- **Frontend**: Edit `apps/vue-app/src/views/UploadView.vue`
- **API**: Edit `apps/api/api/upload-meta.ts`
- **Scanner**: Edit `packages/scanner/src/scanner.ts`

### Documentation

- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [API.md](API.md) - API documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- [SECURITY.md](SECURITY.md) - Security policy

### Production Deployment

1. Set up AWS S3 buckets
2. Create Upstash Redis database
3. Configure CloudFront distribution
4. Deploy to Vercel
5. Deploy scanner to VPS/ECS

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Common Commands

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format

# Clean build artifacts
pnpm clean

# Stop Docker services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart scanner
```

## Project Structure

```
fileduck/
├── apps/
│   ├── vue-app/       # Vue 3 frontend
│   │   ├── src/
│   │   │   ├── views/     # Upload & Download views
│   │   │   ├── services/  # API client
│   │   │   └── router/    # Vue Router
│   │   └── package.json
│   └── api/           # Vercel serverless API
│       ├── api/           # API endpoints
│       ├── lib/           # Utilities (Redis, S3, CDN)
│       └── package.json
├── packages/
│   ├── shared/        # Shared types & utils
│   └── scanner/       # Malware scanning service
│       ├── src/           # Scanner logic
│       └── Dockerfile
├── infrastructure/    # Terraform IaC
├── docker-compose.yml # Local dev stack
└── package.json       # Root package
```

## Environment Variables Reference

### Required for Local Development

| Variable | Default | Description |
|----------|---------|-------------|
| `UPSTASH_REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `AWS_ENDPOINT` | `http://localhost:9000` | MinIO endpoint |
| `AWS_ACCESS_KEY_ID` | `minioadmin` | MinIO access key |
| `AWS_SECRET_ACCESS_KEY` | `minioadmin123` | MinIO secret |
| `S3_BUCKET_QUARANTINE` | `fileduck-quarantine` | Quarantine bucket |
| `S3_BUCKET_PUBLIC` | `fileduck-public` | Public bucket |
| `CLAMAV_HOST` | `localhost` | ClamAV host |
| `CLAMAV_PORT` | `3310` | ClamAV port |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `VIRUSTOTAL_API_KEY` | - | VirusTotal API key |
| `USE_CDN` | `false` | Enable CloudFront |
| `CLOUDFRONT_DOMAIN` | - | CloudFront domain |
| `RATE_LIMIT_MAX_REQUESTS` | `10` | Requests/minute |

## Support

- **Issues**: https://github.com/your-org/fileduck/issues
- **Discussions**: https://github.com/your-org/fileduck/discussions
- **Email**: support@fileduck.example

## License

MIT License - see [LICENSE](LICENSE)

---

🦆 **Happy FileDuck hacking!**
