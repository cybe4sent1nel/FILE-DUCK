# 🦆 FileDuck - Secure Global File Sharing

> Fast, private, and secure file sharing with global CDN, malware scanning, and zero-knowledge encryption.

## ✨ Features

### 🚀 Performance
- **Global CDN** - CloudFront/Cloudflare edge caching for ultra-low latency
- **Presigned Multipart Uploads** - Direct-to-S3 uploads, no server bottleneck
- **Adaptive Caching** - Hot files cached longer at edge locations
- **WebRTC Fast Path** - LAN transfers for same-network peers

### 🔒 Security
- **Malware Scanning Pipeline** - ClamAV + VirusTotal integration
- **Quarantine System** - Files scanned before public access
- **SHA-256 Integrity** - Client-side checksums verified on download
- **Signed URLs** - Time-limited CDN access tokens

### 🕵️ Privacy
- **One-Time Codes** - Atomic GET+DEL from Redis
- **Limited-Use Links** - Configurable download limits
- **Client-Side Encryption** - Optional zero-knowledge E2E encryption
- **Short Codes** - ≥40-bit entropy (8-10 base62 chars)

### 🛡️ Abuse Prevention
- **Rate Limiting** - IP-based throttling
- **CAPTCHA Integration** - After failed attempts
- **Entropy Enforcement** - Prevents brute-force attacks
- **Audit Logging** - Full request tracking

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Vue 3 App     │────▶│ Vercel Edge  │────▶│  Upstash Redis  │
│   (Frontend)    │     │  Functions   │     │  (Metadata)     │
└─────────────────┘     └──────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  S3/MinIO       │◀────│   Malware    │────▶│  VirusTotal     │
│  (Storage)      │     │   Scanner    │     │    API          │
└─────────────────┘     └──────────────┘     └─────────────────┘
        │
        │
        ▼
┌─────────────────┐
│ CloudFront/CF   │
│    (CDN)        │
└─────────────────┘
```

## 📦 Monorepo Structure

```
fileduck/
├── apps/
│   ├── vue-app/          # Vue 3 + Vite frontend
│   └── api/              # Vercel serverless functions
├── packages/
│   ├── shared/           # Shared types & utilities
│   └── scanner/          # Malware scanning service
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js ≥18
- pnpm ≥8
- Docker (for local MinIO/ClamAV)
- Vercel CLI

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development servers
pnpm dev
```

### Environment Variables

```env
# Redis (Upstash)
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your-token

# S3 Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_QUARANTINE=fileduck-quarantine
S3_BUCKET_PUBLIC=fileduck-public

# CDN
CLOUDFRONT_DISTRIBUTION_ID=E123456
CLOUDFRONT_KEYPAIR_ID=K123456
CLOUDFRONT_PRIVATE_KEY=base64-encoded-key

# Malware Scanning
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
VIRUSTOTAL_API_KEY=your-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Security
JWT_SECRET=your-secret-key
CAPTCHA_SITE_KEY=your-recaptcha-key
CAPTCHA_SECRET_KEY=your-secret
```

## 🔧 Development

```bash
# Run all apps in dev mode
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Run tests
pnpm test

# Clean build artifacts
pnpm clean
```

## 📱 Usage Flow

### Upload

1. User selects file in Vue app
2. SHA-256 computed client-side
3. Request presigned multipart upload URLs
4. Direct upload to S3 quarantine bucket
5. Backend generates short code (8-10 chars)
6. Metadata stored in Redis with TTL
7. Malware scan triggered asynchronously
8. On clean scan: move to public bucket
9. Return share code to user

### Download

1. User enters share code
2. API validates code in Redis
3. Check uses_left counter
4. Decrement atomically (GET+DEL)
5. Generate signed CDN URL (1-hour TTL)
6. Return presigned URL + metadata
7. Client verifies SHA-256 on download

## 🛡️ Security Measures

### Code Generation
- Base62 alphabet (a-zA-Z0-9)
- 8-10 characters = 47-59 bits entropy
- Cryptographically secure random

### Rate Limiting
- 10 requests/minute per IP
- CAPTCHA after 3 failed redemptions
- Exponential backoff

### Malware Scanning
1. Upload to quarantine bucket
2. ClamAV daemon scan (signatures)
3. VirusTotal API check (optional)
4. Score ≥3/70 = quarantine
5. Clean files → public bucket
6. Infected files → deleted + logged

### CDN Security
- Signed URLs with 1-hour expiration
- Origin access identity (OAI)
- Geographic restrictions (optional)
- DDoS protection via CloudFlare

## 🌍 Global Edge Locations

Optimized for low latency to:
- **India (Gonda, UP)** - Mumbai, Chennai PoPs
- **North America** - US East/West
- **Europe** - Frankfurt, London
- **Asia-Pacific** - Singapore, Tokyo
- **Global** - 200+ CloudFlare locations

## 📊 Comparison with Alternatives

| Feature | FileDuck | WeTransfer | SendAnywhere | Snapdrop |
|---------|----------|------------|--------------|----------|
| Malware Scan | ✅ ClamAV+VT | ❌ | ❌ | ❌ |
| Global CDN | ✅ CF/CloudFront | ✅ | ⚠️ Limited | ❌ |
| Client Encryption | ✅ Optional E2E | ❌ | ✅ | ❌ |
| One-Time Links | ✅ Atomic | ⚠️ Expires | ❌ | ✅ P2P |
| Self-Hostable | ✅ | ❌ | ❌ | ✅ |
| Cost | 💰 Minimal | 💰💰💰 Pro | 💰💰 | Free |

## 🚢 Deployment

### Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

### Docker (Scanner Service)

```bash
# Build scanner image
docker build -t fileduck-scanner ./packages/scanner

# Run ClamAV + scanner
docker-compose up -d
```

### Infrastructure

```bash
# Terraform (provision S3, CloudFront, etc.)
cd infrastructure
terraform init
terraform apply
```

## 🔍 Monitoring

- **Logs**: Vercel Edge Logs + CloudWatch
- **Metrics**: Upstash metrics dashboard
- **Alerts**: SNS for malware detections
- **Tracing**: OpenTelemetry integration

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Credits

Built with:
- Vue 3 + Vite
- Vercel Edge Functions
- Upstash Redis
- AWS S3 + CloudFront
- ClamAV + VirusTotal
- Turborepo

---

Made with 🦆 by the FileDuck team
