# ☁️ Cloudflare CDN Setup Guide

## � Your Assigned Cloudflare Nameservers

When setting up your domain with Cloudflare, use these nameservers:

```
hank.ns.cloudflare.com
lisa.ns.cloudflare.com
```

**⚠️ Important:** Replace ALL existing nameservers at your domain registrar with these two.

---

## �🔑 Credentials I Need From You

When you're ready to enable Cloudflare CDN (for production), provide these 3 credentials:

### 1. **CLOUDFLARE_DOMAIN**
- **What it is:** Your CDN domain name
- **Example:** `cdn.yoursite.com` or `files.yoursite.com`
- **How to get it:** 
  - Option A: Use your custom domain with CNAME (e.g., `cdn.yoursite.com`)
  - Option B: Use Cloudflare Workers subdomain (e.g., `yoursite.workers.dev`)

### 2. **CLOUDFLARE_TOKEN**
- **What it is:** API Token for Cloudflare API access
- **How to get it:**
  1. Go to https://dash.cloudflare.com/profile/api-tokens
  2. Click "Create Token"
  3. Choose "Edit zone DNS" template OR create custom token with:
     - Permissions: `Zone > DNS > Edit`
     - Zone Resources: `Include > Specific zone > yourdomain.com`
  4. Click "Continue to summary" → "Create Token"
  5. **Copy the token** (you won't see it again!)

### 3. **CLOUDFLARE_SIGNING_KEY**
- **What it is:** Secret key for generating signed URLs (prevents unauthorized access)
- **How to create:**
  ```bash
  # Run in terminal:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # Or PowerShell:
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
  ```
- **Security:** Keep this secret! Store it securely, never commit to git

---

## 🚀 Quick Setup Steps

### For Local Development (Current Setup) ⭐ START HERE
```env
# .env file
USE_CDN=false  # Direct MinIO access, no CDN needed
```
✅ **You're good to go! No domain or Cloudflare setup needed for local dev.**

**Skip all the steps below** - they're only for production deployment with a custom domain.

---

### For Production Deployment (Optional - Only When You Have a Domain)

**📋 Prerequisites - Choose ONE Option:**

**Option A: Use Vercel Free Subdomain (Recommended for FREE deployment) ⭐**
- ✅ FREE subdomain: `yourapp.vercel.app`
- ✅ No domain purchase needed
- ✅ Automatic HTTPS
- ✅ Global CDN included
- ✅ Perfect for FileDuck!

**Option B: Use Your Own Domain**
- ✅ You must own a domain name (e.g., `yoursite.com`)
- ✅ Domain purchased from registrar (Namecheap, GoDaddy, etc.)
- ✅ Access to domain's DNS settings
- 💰 Cost: $10-15/year

**Don't have a domain and want to deploy?**
- ✅ Use Vercel's free subdomain (e.g., `fileduck.vercel.app`)
- Deploy now, add custom domain later if needed

---

#### Deployment Option 1: Vercel (FREE - Recommended)

**Benefits:**
- ✅ FREE hosting for frontend + API
- ✅ FREE subdomain: `yourapp.vercel.app`
- ✅ Global CDN built-in
- ✅ Automatic HTTPS
- ✅ Zero configuration

**Setup:**
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd C:\Users\Pc\Downloads\filequack
   vercel
   ```

3. Your app will be live at: `https://yourapp.vercel.app`

4. For CDN with Cloudflare signed URLs:
   ```env
   USE_CDN=false  # Vercel has built-in global CDN!
   # Or if you want signed URLs:
   USE_CDN=true
   CLOUDFLARE_DOMAIN=yourapp.vercel.app
   CLOUDFLARE_SIGNING_KEY=your-generated-key
   ```

**Note:** Vercel already provides global CDN, so you may not need Cloudflare for CDN purposes. Use Cloudflare only if you need signed URLs for security.

---

#### Deployment Option 2: Custom Domain with Cloudflare

#### Step 1: Sign Up for Cloudflare (FREE)
1. Go to https://dash.cloudflare.com/sign-up
2. Create free account
3. Add your domain (if you have one)

#### Step 2: Update Nameservers to Activate Cloudflare
**🚨 IMPORTANT: This is required to activate Cloudflare on your domain**

1. **Log into your DNS provider** (usually your domain registrar)
   - Find your registrar using [ICANN Lookup](https://lookup.icann.org/)
   - If you use a separate DNS provider, log in there instead

2. **Find your nameservers section**
   - Usually under: DNS Settings, Nameservers, or Domain Management

3. **Replace with your assigned Cloudflare nameservers:**
   - Add: `hank.ns.cloudflare.com`
   - Add: `lisa.ns.cloudflare.com`
   - **Delete any other existing nameservers**

4. **Save your changes**
   - DNS propagation takes 24-48 hours (usually much faster)
   - You can check status in Cloudflare Dashboard

5. **Turn off DNSSEC** (if enabled)
   - Find DNSSEC setting in your registrar
   - Turn it OFF (you can re-enable later via Cloudflare)

6. **Verify activation**
   - Go to Cloudflare Dashboard
   - Wait for "Great news! Cloudflare is now protecting your site" message

**⏱️ Expected wait time:** 5-30 minutes for nameserver changes to take effect

#### Step 3: Set Up CDN Domain
#### Step 3: Set Up CDN Domain
**Option A: Custom Domain (Recommended)**
1. In Cloudflare Dashboard → DNS
2. Add CNAME record:
   - **Name:** `cdn` (or `files`)
   - **Target:** `yourdomain.com` (or MinIO public endpoint)
   - **Proxy status:** ✅ Proxied (orange cloud)
3. Your CDN domain: `cdn.yourdomain.com`

**Option B: Cloudflare Workers (Alternative)**
1. Go to Workers & Pages → Create Worker
2. Deploy a simple proxy worker
3. Your CDN domain: `yoursite.workers.dev`

#### Step 4: Secure Your Origin Server (Recommended)
**🛡️ Only allow Cloudflare IP addresses at your origin**

This prevents direct attacks bypassing Cloudflare's protection:

1. **Update your server firewall** (via hosting provider or server console)
2. **Block all traffic** except from Cloudflare IP ranges:
   - Get IP lists: https://www.cloudflare.com/ips/
   - IPv4 ranges: https://www.cloudflare.com/ips-v4
   - IPv6 ranges: https://www.cloudflare.com/ips-v6

**Example firewall rules (iptables):**
```bash
# Allow Cloudflare IPs only
iptables -A INPUT -p tcp --dport 80 -s 173.245.48.0/20 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -s 173.245.48.0/20 -j ACCEPT
# Add more Cloudflare IP ranges...

# Drop all other traffic
iptables -A INPUT -p tcp --dport 80 -j DROP
iptables -A INPUT -p tcp --dport 443 -j DROP
```

#### Step 5: Create API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create Token → "Edit zone DNS" template
3. Copy the token

#### Step 6: Generate Signing Key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Step 7: Update .env File
```env
USE_CDN=true
CLOUDFLARE_DOMAIN=cdn.yourdomain.com
CLOUDFLARE_TOKEN=your_api_token_here
CLOUDFLARE_SIGNING_KEY=your_generated_key_here
```

#### Step 8: Test
```bash
pnpm dev
# Upload a file and verify the download URL uses Cloudflare domain
```

---

## 🔒 How Signed URLs Work

### What Are Signed URLs?
Signed URLs prevent unauthorized access to your files by adding:
1. **Expiration timestamp** - URL expires after 1 hour
2. **Cryptographic signature** - HMAC-SHA256 hash prevents tampering

### Example Signed URL:
```
https://cdn.yoursite.com/public/file.pdf?exp=1709654400&sig=abc123...
```

- `exp` - Expiration Unix timestamp
- `sig` - HMAC signature (verifies URL hasn't been tampered with)

### Security Benefits:
✅ **Time-limited access** - Links expire automatically  
✅ **Tamper-proof** - Changing URL invalidates signature  
✅ **IP restrictions** - (Optional) Limit access to specific IPs  
✅ **No authentication required** - But still secure!  

---

## 💰 Cloudflare Free Tier

| Feature | Free Tier |
|---------|-----------|
| Bandwidth | ✅ Unlimited |
| Requests | ✅ Unlimited |
| Global CDN | ✅ 200+ data centers |
| SSL/TLS | ✅ Free certificates |
| DDoS Protection | ✅ Included |
| Cache | ✅ Automatic |
| **Cost** | **$0/month** |

**Perfect for FileDuck!** 🦆

---

## 🛡️ Advanced Configuration (Optional)

### Enable IP Restrictions
Update your code to pass IP address:
```typescript
const signedUrl = getCDNUrlWithPolicy(s3Key, {
  ipAddress: '192.168.1.100/32', // Only this IP can access
});
```

### Custom Expiration Time
Edit in `apps/api/lib/cdn.ts`:
```typescript
const expiresAt = Math.floor(Date.now() / 1000) + 7200; // 2 hours instead of 1
```

### Cloudflare Cache Rules
In Cloudflare Dashboard → Cache Rules:
1. Create rule for `cdn.yoursite.com/public/*`
2. Set cache level: "Cache Everything"
3. Edge TTL: 1 day
4. Browser TTL: 1 hour

---

## 🆘 Troubleshooting

### "Cloudflare configuration missing" Error
✅ **Fix:** Check `.env` file has all 3 variables:
```env
CLOUDFLARE_DOMAIN=cdn.yoursite.com
CLOUDFLARE_TOKEN=your_token
CLOUDFLARE_SIGNING_KEY=your_key
```

### Signed URLs Not Working
✅ **Check:**
1. Expiration hasn't passed (`exp` timestamp)
2. Signature is base64url encoded (not base64)
3. CLOUDFLARE_SIGNING_KEY matches the one used to generate URL

### CDN Not Caching
✅ **Fix:**
1. Ensure Cloudflare proxy is enabled (orange cloud)
2. Add Cache Rules in Cloudflare Dashboard
3. Check file size (very large files may not cache)

---

## 📝 Summary

### What I Need From You (When Ready for Production):

**❌ NOT needed right now for local development!**

Only provide these when deploying to production with a custom domain:

1. ✅ **CLOUDFLARE_DOMAIN** - Your CDN domain name (requires owning a domain first)
2. ✅ **CLOUDFLARE_TOKEN** - API token from Cloudflare dashboard
3. ✅ **CLOUDFLARE_SIGNING_KEY** - Generated secret key (run node command above)

### For Now (Local Development):
- ❌ No domain needed
- ❌ No Cloudflare needed
- ✅ MinIO direct access works perfectly
- ✅ Focus on getting other credentials first:
  - Upstash Redis
  - VirusTotal API
  - reCAPTCHA
  - JWT Secret

### When You Need Cloudflare:
- 🌍 Deploying to production
- 🚀 Want global CDN for fast downloads
- 🔒 Need DDoS protection
- 💰 Ready to purchase a domain ($10-15/year)

---

**Current Status:** ✅ Ready for local development without Cloudflare!

---

## 🔗 Useful Links

- Cloudflare Dashboard: https://dash.cloudflare.com/
- API Tokens: https://dash.cloudflare.com/profile/api-tokens
- Cloudflare DNS: https://dash.cloudflare.com/ → Your Domain → DNS
- Cloudflare Workers: https://dash.cloudflare.com/ → Workers & Pages
- Documentation: https://developers.cloudflare.com/

---

**Ready to enable Cloudflare?** Just send me the 3 credentials above! 🚀
