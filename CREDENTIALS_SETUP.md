# 🔑 Credentials & API Keys Setup Guide

This guide lists all the credentials and API keys you need to configure for FileDuck, **using FREE tier services**.

## ✅ Required Services (Free Tier)

### 1. 🗄️ MinIO (Local S3 Storage) - FREE ✓
**Purpose:** S3-compatible object storage for files

**Setup:**
- Run locally with Docker: `docker-compose up minio`
- Access Console: http://localhost:9001
- Login: `minioadmin` / `minioadmin123`

**Create Buckets:**
1. Go to http://localhost:9001
2. Create bucket: `fileduck-quarantine`
3. Create bucket: `fileduck-public`
4. Set `fileduck-public` to public access

**Environment Variables:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
AWS_ENDPOINT=http://localhost:9000
S3_BUCKET_QUARANTINE=fileduck-quarantine
S3_BUCKET_PUBLIC=fileduck-public
MINIO_LICENSE=eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJhaWQiOjAsImNhcCI6MCwiaWF0IjoxLjc3MDE3MTgyNzQ2MDE2MDE3NGU5LCJpc3MiOiJzdWJuZXRAbWluLmlvIiwibGlkIjoiNDE4MzM0ZDMtM2JmYy00ZjE0LTljZTItMmFjY2VhM2ZhMjkxIiwib3JnIjoiIiwicGxhbiI6IkZSRUUiLCJzdWIiOiJmYWhhZGtoYW54eXo4ODE2QGdtYWlsLmNvbSIsInRyaWFsIjpmYWxzZX0.7PJKPWPQ9Q_l2HKBX-wEP1Xg1oA1X9uF-OIIzYkOjDMEVQj7UAu_oRP9j-yTSuqx5ztJrjqWNNelr9pm2-y5D_Xr_TYGe5QivO1wHjlypzWthb-Xj0Tqa8IqjnAHkJ49
```

---

### 2. 🔴 Upstash Redis - FREE ✓ (10,000 commands/day)
**Purpose:** Store temporary file metadata and download codes

**Setup:**
1. Go to https://upstash.com/
2. Sign up with GitHub (FREE)
3. Create new database (select Free plan)
4. Copy REST URL and Token

**Environment Variables:**
```env
UPSTASH_REDIS_URL=https://your-instance.upstash.io
UPSTASH_REDIS_TOKEN=your-token-here
```

**Free Tier Limits:**
- 10,000 commands/day
- Max 256 MB storage
- Perfect for development!

---

### 3. 🦠 ClamAV (Malware Scanner) - FREE ✓
**Purpose:** Scan uploaded files for malware

**Setup:**
- Run locally with Docker: `docker-compose up clamav`
- No API keys needed!
- First startup takes 5-10 minutes (downloads virus definitions)

**Environment Variables:**
```env
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
```

---

### 4. 🔍 VirusTotal API - FREE ✓ (500 requests/day)
**Purpose:** Additional malware verification

**Setup:**
1. Go to https://www.virustotal.com/
2. Sign up for FREE account
3. Get API key from: https://www.virustotal.com/gui/my-apikey

**Environment Variables:**
```env
VIRUSTOTAL_API_KEY=your-api-key-here
```

**Free Tier Limits:**
- 500 requests/day
- 4 requests/minute
- Perfect for development!

---

### 5. 🔐 JWT Secret - FREE ✓
**Purpose:** Secure token generation

**Generate:**
```bash
# Option 1: PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Environment Variables:**
```env
JWT_SECRET=your-generated-secret-min-32-chars
```

---

### 6. 🤖 Google reCAPTCHA - FREE ✓ (Unlimited)
**Purpose:** Prevent abuse and bot uploads

**Setup:**
1. Go to https://www.google.com/recaptcha/admin/create
2. Select reCAPTCHA v2 or v3
3. Add domain: `localhost` (for dev)
4. Get Site Key and Secret Key

**Environment Variables:**
```env
CAPTCHA_SITE_KEY=your-recaptcha-site-key
CAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

**Free Tier:** Unlimited requests!

---

### 7. 🌐 Cloudflare CDN - FREE ✓ (Optional for Production)
**Purpose:** Global CDN for fast file downloads with signed URLs

**Setup (Optional - Only needed for production):**
1. Go to https://dash.cloudflare.com/sign-up
2. Add your domain to Cloudflare (FREE plan)
3. Enable Cloudflare CDN
4. Create API Token:
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit zone DNS" template or create custom
   - Copy the API Token
5. Create URL Signing Key:
   ```bash
   # Generate a random 32-character key
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
6. Set up custom domain for CDN:
   - Create CNAME record: `cdn.yourdomain.com` → `yourdomain.com`
   - Or use Cloudflare Worker subdomain

**Environment Variables:**
```env
USE_CDN=true
CLOUDFLARE_DOMAIN=cdn.yourdomain.com
CLOUDFLARE_TOKEN=your-cloudflare-api-token
CLOUDFLARE_SIGNING_KEY=your-generated-signing-key
```

**Free Tier Features:**
- ✅ Unlimited bandwidth
- ✅ Global CDN (200+ data centers)
- ✅ DDoS protection
- ✅ SSL/TLS encryption
- ✅ Signed URLs for secure access

**For Development:** Keep `USE_CDN=false` (direct MinIO access)

---

## 📋 Complete .env File Template

Copy this to your `.env` file:

```env
# ===== Redis (Upstash) =====
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your-token

# ===== MinIO Storage (S3-Compatible) =====
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
AWS_ENDPOINT=http://localhost:9000
S3_BUCKET_QUARANTINE=fileduck-quarantine
S3_BUCKET_PUBLIC=fileduck-public

# MinIO License (for enterprise features)
MINIO_LICENSE=eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJhaWQiOjAsImNhcCI6MCwiaWF0IjoxLjc3MDE3MTgyNzQ2MDE2MDE3NGU5LCJpc3MiOiJzdWJuZXRAbWluLmlvIiwibGlkIjoiNDE4MzM0ZDMtM2JmYy00ZjE0LTljZTItMmFjY2VhM2ZhMjkxIiwib3JnIjoiIiwicGxhbiI6IkZSRUUiLCJzdWIiOiJmYWhhZGtoYW54eXo4ODE2QGdtYWlsLmNvbSIsInRyaWFsIjpmYWxzZX0.7PJKPWPQ9Q_l2HKBX-wEP1Xg1oA1X9uF-OIIzYkOjDMEVQj7UAu_oRP9j-yTSuqx5ztJrjqWNNelr9pm2-y5D_Xr_TYGe5QivO1wHjlypzWthb-Xj0Tqa8IqjnAHkJ49

# ===== CDN - Cloudflare (Disabled for Local Development) =====
USE_CDN=false
# For production:
# CLOUDFLARE_DOMAIN=cdn.yourdomain.com
# CLOUDFLARE_TOKEN=your-cloudflare-api-token
# CLOUDFLARE_SIGNING_KEY=your-url-signing-secret-key

# ===== Malware Scanning =====
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
VIRUSTOTAL_API_KEY=your-virustotal-api-key

# ===== Security =====
JWT_SECRET=your-generated-secret-min-32-chars
CAPTCHA_SITE_KEY=your-recaptcha-site-key
CAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# ===== Rate Limiting =====
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# ===== Scanner Service =====
SCANNER_PORT=4000
SCANNER_URL=http://localhost:4000

# ===== Vue App =====
VITE_API_URL=/api
```

---

## 🚀 Quick Start Checklist

- [ ] **Step 1:** Sign up for Upstash Redis (https://upstash.com/)
- [ ] **Step 2:** Get VirusTotal API key (https://www.virustotal.com/)
- [ ] **Step 3:** Get reCAPTCHA keys (https://www.google.com/recaptcha/admin/create)
- [ ] **Step 4:** Generate JWT secret
- [ ] **Step 5:** Copy `.env.example` to `.env`
- [ ] **Step 6:** Fill in all credentials in `.env`
- [ ] **Step 7:** Run `docker-compose up -d` (starts MinIO, ClamAV, Redis)
- [ ] **Step 8:** Create MinIO buckets (see above)
- [ ] **Step 9:** Run `pnpm install`
- [ ] **Step 10:** Run `pnpm dev`

---

## 💰 Cost Breakdown (FREE Tier)

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| MinIO (Local) | ∞ | $0 |
| Upstash Redis | 10K commands/day | $0 |
| ClamAV | ∞ | $0 |
| VirusTotal | 500 requests/day | $0 |
| reCAPTCHA | ∞ | $0 |
| **TOTAL** | | **$0/month** |

---

## � Deployment Options (All FREE)

### Option 1: Vercel (Recommended) ✅ BEST FOR FILEDUCK

**Benefits:**
- ✅ FREE hosting (frontend + API)
- ✅ FREE subdomain: `fileduck.vercel.app`
- ✅ Global CDN included
- ✅ Automatic HTTPS
- ✅ Serverless functions support
- ✅ GitHub integration

**Setup:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd C:\Users\Pc\Downloads\filequack
vercel

# Your app will be live at: https://yourapp.vercel.app
```

**Environment Variables:**
- Add all credentials from your `.env` file to Vercel:
  - Dashboard → Settings → Environment Variables
  - Or use: `vercel env add`

**For Production MinIO:**
- Use MinIO Cloud (https://min.io/pricing) - $10/month
- Or AWS S3 Free Tier (5GB storage)
- Update `AWS_ENDPOINT` to your MinIO cloud endpoint

**Cost:** **$0/month** (using Vercel free tier + local testing)

---

### Option 2: Self-Hosted VPS

**Providers:**
- DigitalOcean ($4/month)
- Linode ($5/month)  
- Vultr ($3.50/month)
- Oracle Cloud (FREE tier)

**Cost:** $0-5/month

---

## �📝 Notes

### For Production Deployment:
1. **MinIO Cloud:** Use MinIO Cloud (https://min.io/pricing) - starts at $10/month
2. **Or AWS S3:** Use AWS S3 free tier (5GB storage, 20K GET, 2K PUT requests/month)
3. **CDN:** Add Cloudflare (FREE tier available)
4. **Upstash:** Upgrade if needed ($0.2 per 100K commands)

### Security Tips:
- ✅ Never commit `.env` file to git
- ✅ Use different credentials for dev/staging/production
- ✅ Rotate API keys regularly
- ✅ Use environment-specific MinIO instances
- ✅ Enable MinIO encryption in production

---

## 🆘 Troubleshooting

**MinIO Console not accessible?**
- Check Docker is running: `docker ps`
- Verify ports: http://localhost:9001

**ClamAV taking forever?**
- First startup downloads 200MB+ virus definitions
- Wait 5-10 minutes, check logs: `docker logs fileduck-clamav`

**Upstash connection failed?**
- Verify URL format includes `https://`
- Check token doesn't have extra spaces

**Need Help?**
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open an issue on GitHub
