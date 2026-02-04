# 🚀 Deployment Guide

## Prerequisites

- Node.js ≥18
- pnpm ≥8
- Docker & Docker Compose
- AWS Account (or compatible S3 storage)
- Upstash Redis account
- Vercel account
- CloudFront distribution (optional but recommended)

## 1. Local Development Setup

### Install Dependencies

```bash
pnpm install
```

### Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### Start Infrastructure Services

```bash
docker-compose up -d
```

This starts:
- ClamAV daemon (malware scanning)
- MinIO (S3-compatible storage)
- Redis (metadata storage)
- Scanner service

### Create S3 Buckets (MinIO)

```bash
# Install MinIO client
brew install minio/stable/mc  # macOS
# or download from https://min.io/download

# Configure MinIO client
mc alias set local http://localhost:9000 minioadmin minioadmin123

# Create buckets
mc mb local/fileduck-quarantine
mc mb local/fileduck-public

# Set public read policy on public bucket
mc anonymous set download local/fileduck-public
```

### Run Development Servers

```bash
# Terminal 1: Run all services
pnpm dev

# Or run individually:
# Terminal 1: Frontend
cd apps/vue-app && pnpm dev

# Terminal 2: API
cd apps/api && pnpm dev

# Terminal 3: Scanner (if not using Docker)
cd packages/scanner && pnpm dev
```

Access the app at http://localhost:3000

## 2. Production Deployment

### A. Set up AWS Infrastructure

#### S3 Buckets

```bash
# Create buckets
aws s3 mb s3://fileduck-quarantine --region us-east-1
aws s3 mb s3://fileduck-public --region us-east-1

# Block public access on quarantine bucket
aws s3api put-public-access-block \
  --bucket fileduck-quarantine \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket fileduck-quarantine \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-versioning \
  --bucket fileduck-public \
  --versioning-configuration Status=Enabled
```

#### CloudFront Distribution

```bash
# Create Origin Access Identity
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
  CallerReference=fileduck-$(date +%s),Comment="FileDuck OAI"

# Create distribution (use AWS Console or CloudFormation)
# Point to fileduck-public bucket
# Enable signed URLs
```

Generate CloudFront key pair:

```bash
# Generate RSA key pair
openssl genrsa -out cloudfront-private-key.pem 2048
openssl rsa -pubout -in cloudfront-private-key.pem -out cloudfront-public-key.pem

# Convert private key to base64 for env var
base64 -i cloudfront-private-key.pem | tr -d '\n' > cloudfront-key-base64.txt

# Upload public key to AWS CloudFront (via Console)
# Note the Key Pair ID
```

#### IAM User for S3 Access

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::fileduck-quarantine/*",
        "arn:aws:s3:::fileduck-public/*",
        "arn:aws:s3:::fileduck-quarantine",
        "arn:aws:s3:::fileduck-public"
      ]
    }
  ]
}
```

### B. Set up Upstash Redis

1. Go to https://console.upstash.com/
2. Create a new Redis database
3. Copy `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`

### C. Deploy to Vercel

#### Install Vercel CLI

```bash
pnpm add -g vercel
```

#### Deploy Frontend

```bash
cd apps/vue-app
vercel --prod

# Set environment variables
vercel env add VITE_API_URL production
# Enter: https://your-api.vercel.app/api
```

#### Deploy API

```bash
cd apps/api
vercel --prod

# Add all environment variables:
vercel env add UPSTASH_REDIS_URL production
vercel env add UPSTASH_REDIS_TOKEN production
vercel env add AWS_REGION production
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
# ... add all other vars from .env.example
```

### D. Deploy Scanner Service

#### Option 1: Docker on EC2/ECS

```bash
# Build and push to ECR
aws ecr create-repository --repository-name fileduck-scanner

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
cd packages/scanner
docker build -t fileduck-scanner .
docker tag fileduck-scanner:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fileduck-scanner:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fileduck-scanner:latest

# Deploy to ECS (use ECS Console or CloudFormation)
```

#### Option 2: Docker on VPS (DigitalOcean, Hetzner, etc.)

```bash
# SSH to server
ssh user@your-server

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repo
git clone https://github.com/your-org/fileduck.git
cd fileduck

# Create .env file
nano .env
# Add production environment variables

# Start scanner
cd packages/scanner
docker build -t fileduck-scanner .
docker run -d --name fileduck-scanner \
  --env-file ../../.env \
  -p 4000:4000 \
  --restart unless-stopped \
  fileduck-scanner

# Set up nginx reverse proxy (optional)
```

## 3. Configure Scan Trigger

The API needs to trigger scans after uploads. Options:

### Option A: Direct HTTP Call

Update [apps/api/api/complete-upload.ts](apps/api/api/complete-upload.ts):

```typescript
import axios from 'axios';

// After completeMultipartUpload
await axios.post(process.env.SCANNER_URL + '/scan', {
  shareCode,
  s3Key,
  sha256,
});
```

### Option B: AWS SQS Queue (Recommended for production)

```bash
# Create SQS queue
aws sqs create-queue --queue-name fileduck-scan-queue

# Update API to send SQS message
# Update Scanner to poll SQS
```

### Option C: S3 Event Notification

```bash
# Configure S3 to trigger Lambda on upload
# Lambda forwards to Scanner service
```

## 4. CDN Configuration

### CloudFront

- Create distribution pointing to `fileduck-public` bucket
- Enable Origin Access Identity (OAI)
- Set default TTL: 86400 (24 hours)
- Enable gzip/brotli compression
- Add custom domain (optional)

### Cloudflare

- Add CNAME to CloudFront distribution
- Enable Argo Smart Routing
- Set cache TTL rules
- Enable Firewall rules for DDoS protection

## 5. Monitoring & Alerts

### CloudWatch Logs

```bash
# Create log groups
aws logs create-log-group --log-group-name /fileduck/scanner
aws logs create-log-group --log-group-name /fileduck/api
```

### SNS Alerts for Malware Detections

```bash
# Create SNS topic
aws sns create-topic --name fileduck-malware-alerts

# Subscribe email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789012:fileduck-malware-alerts \
  --protocol email \
  --notification-endpoint security@yourcompany.com
```

### Uptime Monitoring

- Set up UptimeRobot or Pingdom
- Monitor endpoints:
  - `https://your-app.vercel.app`
  - `https://your-api.vercel.app/api/health`
  - `http://your-scanner:4000/health`

## 6. Security Checklist

- [ ] All secrets in environment variables, not code
- [ ] S3 buckets have proper access policies
- [ ] CloudFront signed URLs enabled
- [ ] Rate limiting configured
- [ ] CAPTCHA integration enabled
- [ ] ClamAV signatures auto-update (cron job)
- [ ] HTTPS enforced everywhere
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] Regular dependency updates

## 7. Cost Optimization

### Free Tier Estimates

- **Vercel**: Free for hobby projects
- **Upstash**: 10K commands/day free
- **AWS S3**: 5 GB storage + 20K GET requests/month free
- **CloudFront**: 1 TB transfer/month free (12 months)
- **VirusTotal API**: 4 requests/minute free

### Paid Tier (1000 uploads/day)

- **Vercel**: $20/month (Pro plan)
- **Upstash**: $10/month (pay-as-you-go)
- **AWS S3**: ~$1/month (20 GB storage)
- **CloudFront**: ~$5/month (100 GB transfer)
- **Scanner VPS**: $5-10/month (Hetzner/DO)

**Total**: ~$40-50/month

## 8. Backup & Recovery

```bash
# Backup Redis to S3
redis-cli --rdb /tmp/redis-backup.rdb
aws s3 cp /tmp/redis-backup.rdb s3://fileduck-backups/redis/$(date +%Y%m%d).rdb

# Backup scripts (run daily)
0 2 * * * /scripts/backup-redis.sh
```

## 9. Performance Tuning

- Enable HTTP/2 on CloudFront
- Use WebP images for UI
- Enable CDN edge caching
- Optimize Redis memory (LRU eviction)
- Use CloudFront Lambda@Edge for dynamic TTLs

## 10. Troubleshooting

### Scanner not connecting to ClamAV

```bash
# Check ClamAV is running
docker ps | grep clamav

# Test connection
telnet localhost 3310

# Check logs
docker logs fileduck-clamav
```

### Upload failing

```bash
# Check S3 credentials
aws s3 ls s3://fileduck-quarantine

# Check API logs
vercel logs
```

### CDN signed URLs not working

```bash
# Verify CloudFront key pair
# Ensure private key matches uploaded public key
# Check key pair is associated with distribution
```

---

For more help, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or open an issue.
