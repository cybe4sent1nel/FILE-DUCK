# 📊 FileDuck - Technical Architecture

## System Overview

FileDuck is a globally distributed, secure file-sharing platform built with modern web technologies. It solves three critical pain points in file sharing: speed, security, and privacy.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER DEVICE                                 │
│  ┌──────────────┐                                                   │
│  │   Browser    │  SHA-256 Hash Computation                         │
│  │  Vue 3 App   │  Client-Side Encryption (Optional)                │
│  └──────┬───────┘                                                   │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          │ HTTPS
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Serverless Functions (Node.js/TypeScript)                   │  │
│  │  • POST /api/upload-meta    - Generate presigned URLs        │  │
│  │  • POST /api/complete-upload - Trigger malware scan          │  │
│  │  • POST /api/redeem         - Validate & generate signed URL │  │
│  │  • GET  /api/health         - Health check                   │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
└─────────────────────┼─────────────────────────────────────────────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────────┐
│ Upstash  │   │   AWS    │   │   Scanner    │
│  Redis   │   │    S3    │   │   Service    │
│          │   │          │   │              │
│ Metadata │   │ Buckets: │   │  ClamAV +    │
│ Store    │   │ • quarantine│  VirusTotal  │
│          │   │ • public │   │              │
│ TTL Auto │   │          │   │  Quarantine  │
│ Expiry   │   │          │   │  Pipeline    │
└──────────┘   └─────┬────┘   └──────────────┘
                     │
                     │ CDN
                     ▼
           ┌─────────────────┐
           │  CloudFront or  │
           │   Cloudflare    │
           │                 │
           │  • Signed URLs  │
           │  • Edge Caching │
           │  • DDoS Protect │
           └─────────────────┘
```

## Component Details

### Frontend (Vue 3 + Vite)

**Location**: `apps/vue-app/`

**Key Features**:
- Client-side SHA-256 hashing using Web Crypto API
- Drag-and-drop file upload interface
- Real-time upload progress tracking
- Share code management
- Download link generation
- Responsive design with Tailwind CSS

**Tech Stack**:
- Vue 3 (Composition API)
- Vite (build tool)
- Vue Router (routing)
- Pinia (state management)
- Axios (HTTP client)
- Tailwind CSS (styling)

**Key Files**:
- [src/views/UploadView.vue](apps/vue-app/src/views/UploadView.vue) - Upload interface
- [src/views/DownloadView.vue](apps/vue-app/src/views/DownloadView.vue) - Download interface
- [src/services/api.ts](apps/vue-app/src/services/api.ts) - API client

### Backend API (Vercel Serverless)

**Location**: `apps/api/`

**Endpoints**:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/upload-meta` | POST | Generate share code & presigned upload URLs |
| `/complete-upload` | POST | Complete multipart upload, trigger scan |
| `/redeem` | POST | Validate code, return signed download URL |
| `/health` | GET | Health check |

**Tech Stack**:
- TypeScript
- Vercel Edge Functions
- Upstash Redis SDK
- AWS SDK v3 (S3, CloudFront)

**Key Components**:

1. **Redis Integration** ([lib/redis.ts](apps/api/lib/redis.ts))
   - Metadata storage with TTL
   - Atomic GET+DEL for one-time downloads
   - Rate limiting per IP
   - Failed attempt tracking

2. **S3 Integration** ([lib/s3.ts](apps/api/lib/s3.ts))
   - Multipart upload presigning
   - File movement (quarantine → public)
   - Presigned download URLs

3. **CDN Integration** ([lib/cdn.ts](apps/api/lib/cdn.ts))
   - CloudFront signed URLs
   - Custom policy support
   - IP-based restrictions (optional)

### Malware Scanner (Docker Service)

**Location**: `packages/scanner/`

**Architecture**:
- Node.js TypeScript service
- ClamAV daemon integration
- VirusTotal API integration
- S3 file download/cleanup

**Scan Pipeline**:

```
1. Receive scan request (HTTP POST /scan)
2. Download file from S3 quarantine bucket to temp
3. Scan with ClamAV (fast, local)
4. If clean: Scan with VirusTotal (comprehensive)
5. Determine verdict:
   - Clean: Move to public bucket, update Redis
   - Infected: Delete file, flag in Redis, alert
6. Cleanup temp files
7. Return result
```

**Tech Stack**:
- TypeScript + Express
- ClamAV (via clamscan npm package)
- VirusTotal API v3
- AWS SDK (S3 operations)
- Docker (containerization)

**Key Files**:
- [src/scanner.ts](packages/scanner/src/scanner.ts) - Main scan orchestration
- [src/clamav.ts](packages/scanner/src/clamav.ts) - ClamAV integration
- [src/virustotal.ts](packages/scanner/src/virustotal.ts) - VirusTotal integration
- [Dockerfile](packages/scanner/Dockerfile) - Container build

### Shared Package

**Location**: `packages/shared/`

**Purpose**: Common types, utilities, and constants shared across frontend and backend.

**Exports**:
- TypeScript interfaces (`FileMetadata`, `ScanResults`, etc.)
- Utility functions (`generateShareCode`, `computeSHA256`, etc.)
- Constants (`MAX_FILE_SIZE`, `RATE_LIMIT_MAX`, etc.)

## Data Flow

### Upload Flow

```
┌──────┐     ┌─────────┐     ┌──────┐     ┌────────┐     ┌─────────┐
│Client│     │   API   │     │Redis │     │   S3   │     │ Scanner │
└──┬───┘     └────┬────┘     └───┬──┘     └───┬────┘     └────┬────┘
   │              │               │            │               │
   │ Compute SHA-256              │            │               │
   ├──────────────┘               │            │               │
   │              │               │            │               │
   │ POST /upload-meta            │            │               │
   ├─────────────►│               │            │               │
   │              │               │            │               │
   │              │ Generate code │            │               │
   │              ├──────────────►│            │               │
   │              │               │            │               │
   │              │ Store metadata│            │               │
   │              ├──────────────►│            │               │
   │              │               │            │               │
   │              │ Presign URLs  │            │               │
   │              ├───────────────────────────►│               │
   │              │               │            │               │
   │◄─────────────┤ Return URLs   │            │               │
   │              │               │            │               │
   │ Upload chunks (multipart)    │            │               │
   ├───────────────────────────────────────────►               │
   │              │               │            │               │
   │ POST /complete-upload        │            │               │
   ├─────────────►│               │            │               │
   │              │               │            │               │
   │              │ Trigger scan  │            │               │
   │              ├───────────────────────────────────────────►│
   │              │               │            │               │
   │◄─────────────┤ Return code   │            │               │
   │              │               │            │               │
   │              │               │            │    Download   │
   │              │               │            │◄──────────────┤
   │              │               │            │               │
   │              │               │            │    Scan       │
   │              │               │            │    ┌─────┐    │
   │              │               │            │    │ClamAV│   │
   │              │               │            │    └─────┘    │
   │              │               │            │    ┌──────┐   │
   │              │               │            │    │VirusT│   │
   │              │               │            │    └──────┘   │
   │              │               │            │               │
   │              │               │            │ If clean:     │
   │              │               │            │ Move to public│
   │              │               │            │◄──────────────┤
   │              │               │            │               │
   │              │               │ Update status              │
   │              │               │◄───────────────────────────┤
   │              │               │            │               │
```

### Download Flow

```
┌──────┐     ┌─────────┐     ┌──────┐     ┌────────┐     ┌─────────┐
│Client│     │   API   │     │Redis │     │ CDN/S3 │     │         │
└──┬───┘     └────┬────┘     └───┬──┘     └───┬────┘     └─────────┘
   │              │               │            │
   │ Enter code   │               │            │
   ├──────────────┘               │            │
   │              │               │            │
   │ POST /redeem │               │            │
   ├─────────────►│               │            │
   │              │               │            │
   │              │ Check rate limit           │
   │              ├──────────────►│            │
   │              │               │            │
   │              │ Get metadata  │            │
   │              ├──────────────►│            │
   │              │               │            │
   │              │ Check status  │            │
   │              │◄──────────────┤            │
   │              │               │            │
   │              │ Decrement uses│            │
   │              ├──────────────►│            │
   │              │               │            │
   │              │ Generate signed URL        │
   │              ├───────────────────────────►│
   │              │               │            │
   │◄─────────────┤ Return URL    │            │
   │              │               │            │
   │ Download file│               │            │
   ├───────────────────────────────────────────►
   │              │               │            │
   │ Verify SHA-256               │            │
   ├──────────────┘               │            │
```

## Security Measures

### Layer 1: Input Validation

- Share code format validation (8-10 base62 characters)
- File size limits (5 GB max)
- MIME type validation
- SHA-256 format validation

### Layer 2: Rate Limiting

- IP-based throttling (10 req/min)
- Redis-backed counters
- Exponential backoff on failures
- CAPTCHA after 3 failed attempts

### Layer 3: Malware Scanning

**Quarantine Pipeline**:
1. All uploads go to quarantine bucket
2. Files blocked from public access
3. ClamAV signature-based scan
4. VirusTotal multi-engine scan (70 engines)
5. Score-based verdict (≥3/70 = infected)
6. Infected files deleted immediately
7. Clean files moved to public bucket

**Scan Coverage**:
- Viruses, trojans, malware
- Ransomware, rootkits
- Exploits, shellcode
- PUPs (Potentially Unwanted Programs)

### Layer 4: Access Control

**S3 Bucket Policies**:
- Quarantine: Private, no public access
- Public: Restricted to CloudFront OAI only

**CDN Signed URLs**:
- 1-hour expiration
- CloudFront private key signing
- Optional IP-based restrictions
- Optional time-window constraints

### Layer 5: Data Privacy

- **Client-side SHA-256**: Computed in browser, never sent unverified
- **Optional E2E encryption**: AES-256-GCM with key in URL fragment
- **TTL auto-expiry**: Files and metadata automatically deleted
- **One-time downloads**: Atomic operations prevent replay
- **Minimal logging**: No content inspection, only metadata

## Performance Optimizations

### 1. Multipart Uploads

- Files chunked at 100 MB
- Parallel upload to S3
- Faster for large files (>100 MB)
- Resume capability (future)

### 2. CDN Edge Caching

**CloudFront/Cloudflare**:
- 200+ edge locations globally
- Automatic cache invalidation on TTL
- Gzip/Brotli compression
- HTTP/2 support

**Cache Strategy**:
- Hot files: 24-hour TTL
- One-time files: 1-hour TTL
- Adaptive based on access patterns

### 3. Redis Performance

- In-memory storage (<1ms latency)
- TTL-based auto-expiry (no cleanup cron)
- Atomic operations (GET+DEL)
- Connection pooling

### 4. Frontend Optimizations

- Code splitting (Vue Router lazy loading)
- Tree shaking (Vite)
- Asset compression
- Progressive Web App (future)

## Scalability

### Horizontal Scaling

| Component | Scaling Strategy |
|-----------|------------------|
| Frontend | Vercel auto-scales |
| API | Vercel Edge Functions auto-scale |
| Redis | Upstash auto-scales |
| S3 | AWS auto-scales |
| CDN | CloudFront/Cloudflare auto-scales |
| Scanner | Deploy multiple instances, load-balanced |

### Load Estimates

**1000 uploads/day**:
- Redis: ~10K operations/day (free tier)
- S3: ~20 GB storage, 1000 PUTs, 3000 GETs
- CloudFront: ~100 GB transfer
- Scanner: ~8 hours CPU time (ClamAV)

**10,000 uploads/day** (scaled):
- Add SQS queue for scan jobs
- Multi-region S3 replication
- Multiple scanner instances
- Upstash paid tier

## Cost Breakdown (1000 uploads/day)

| Service | Cost/Month |
|---------|------------|
| Vercel (Frontend + API) | $20 (Pro plan) |
| Upstash Redis | $10 |
| AWS S3 (20 GB) | $1 |
| CloudFront (100 GB) | $5 |
| Scanner VPS (Hetzner) | $5 |
| VirusTotal API (optional) | Free tier |
| **Total** | **~$40** |

## Monitoring & Observability

### Logs

- **Vercel**: Edge function logs
- **CloudWatch**: S3 access logs
- **Scanner**: Docker logs
- **Redis**: Upstash dashboard

### Metrics

- Upload success rate
- Scan completion time
- Malware detection rate
- CDN cache hit ratio
- API response times
- Storage usage

### Alerts

- Malware detection → SNS → Email
- High error rate → Vercel alerts
- Storage quota → CloudWatch alarm
- Scanner downtime → Health check failure

## Future Enhancements

### Phase 2 (Q2 2026)

- [ ] WebRTC peer-to-peer transfers
- [ ] Batch uploads
- [ ] Upload resume
- [ ] Password-protected links
- [ ] Custom expiration times
- [ ] Anonymous analytics

### Phase 3 (Q3 2026)

- [ ] Mobile apps (React Native)
- [ ] Desktop apps (Electron)
- [ ] Browser extensions
- [ ] API rate limit tiers
- [ ] Premium features
- [ ] Team/organization accounts

### Phase 4 (Q4 2026)

- [ ] End-to-end encryption by default
- [ ] Zero-knowledge architecture
- [ ] Blockchain-based file verification
- [ ] Decentralized storage (IPFS)
- [ ] Advanced threat detection (ML)

## Development Workflow

### Local Development

```bash
# Start infrastructure
docker-compose up -d

# Start all apps
pnpm dev

# Or individually
pnpm --filter @fileduck/vue-app dev
pnpm --filter @fileduck/api dev
pnpm --filter @fileduck/scanner dev
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests (Playwright)
pnpm test:e2e

# Load testing (k6)
k6 run tests/load/upload.js
```

### Deployment

```bash
# Deploy to Vercel
pnpm deploy

# Deploy scanner
docker build -t fileduck-scanner ./packages/scanner
docker push ecr.../fileduck-scanner
```

## Repository Structure

```
fileduck/
├── apps/
│   ├── vue-app/          # Frontend (Vue 3 + Vite)
│   └── api/              # Backend (Vercel Functions)
├── packages/
│   ├── shared/           # Shared types & utilities
│   └── scanner/          # Malware scanning service
├── infrastructure/       # Terraform IaC
├── docker-compose.yml    # Local development stack
├── turbo.json            # Turborepo config
├── pnpm-workspace.yaml   # pnpm workspaces
├── README.md             # Main documentation
├── DEPLOYMENT.md         # Deployment guide
├── TROUBLESHOOTING.md    # Common issues
├── SECURITY.md           # Security policy
├── API.md                # API documentation
└── ARCHITECTURE.md       # This file
```

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3, Vite, Tailwind CSS, TypeScript |
| API | Vercel Edge Functions, TypeScript |
| Storage | AWS S3, MinIO (dev) |
| Cache | Upstash Redis |
| CDN | CloudFront, Cloudflare |
| Scanner | ClamAV, VirusTotal |
| Infrastructure | Docker, Terraform |
| CI/CD | GitHub Actions, Vercel |
| Monitoring | CloudWatch, Vercel Analytics |

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [CloudFront Signed URLs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html)
- [ClamAV Documentation](https://docs.clamav.net/)
- [VirusTotal API](https://developers.virustotal.com/reference/overview)

---

**Last Updated**: 2026-02-03  
**Version**: 1.0.0  
**Maintainers**: FileDuck Team
