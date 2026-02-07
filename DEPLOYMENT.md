# Automatic Deployment Configuration

This project is configured to automatically deploy to multiple platforms when code is pushed to GitHub.

## Connected Platforms

### 1. Vercel (Frontend + API)
- **Auto-Deploy**: ✅ Enabled
- **Branch**: `main`
- **Build Command**: Automatically detected
- **Deploy URL**: https://file-duck.vercel.app

**Setup Instructions:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project `file-duck`
3. Go to Settings → Git
4. Ensure "Production Branch" is set to `main`
5. Enable "Automatic deployments from GitHub"

### 2. Netlify (Frontend Backup)
- **Auto-Deploy**: ✅ Enabled
- **Branch**: `main`
- **Build Command**: `pnpm run build`
- **Publish Directory**: `apps/vue-app/dist`

**Setup Instructions:**
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to Site Settings → Build & Deploy → Continuous Deployment
4. Ensure "Branch deploys" is set to `main`
5. Enable "Auto publishing"

### 3. Railway (Backend API - Optional)
- **Auto-Deploy**: ✅ Enabled
- **Branch**: `main`
- **Root Directory**: `apps/api`

**Setup Instructions:**
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Go to Settings → GitHub
4. Ensure "Production Branch" is set to `main`
5. Enable "Auto Deploy"

## Deployment Triggers

All platforms will automatically deploy when:
- ✅ Code is pushed to `main` branch
- ✅ Pull requests are merged to `main`
- ✅ Commits are made directly to `main`

## Deployment Status

You can check deployment status at:
- **Vercel**: https://vercel.com/fahad-khans-projects-67c6958c/file-duck/deployments
- **Netlify**: https://app.netlify.com/sites/YOUR_SITE_NAME/deploys
- **Railway**: https://railway.app/project/YOUR_PROJECT_ID

## Manual Deployment

If you need to manually trigger a deployment:

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Railway
railway up
```

## Webhook Configuration (Advanced)

For instant deployments, ensure webhooks are configured:

### Vercel Webhook
- Automatically configured via GitHub integration

### Netlify Webhook
1. Go to Site Settings → Build & Deploy → Build hooks
2. Add build hook named "GitHub Push"
3. Copy webhook URL
4. Add to GitHub: Settings → Webhooks → Add webhook

### Railway Webhook
- Automatically configured via GitHub integration

## Testing Auto-Deployment

To test if auto-deployment works:

```bash
# Create a test commit
git commit --allow-empty -m "Test auto-deployment"
git push origin main
```

Then check:
- Vercel Dashboard - Should see new deployment
- Netlify Dashboard - Should see new deploy
- Railway Dashboard - Should see new deployment

## Troubleshooting

If deployments don't trigger automatically:

1. **Check GitHub Integration**
   - Ensure GitHub app is installed for your repository
   - Verify repository permissions

2. **Check Build Settings**
   - Ensure build commands are correct
   - Verify environment variables are set

3. **Check Branch Settings**
   - Ensure production branch is set to `main`
   - Verify branch protection rules don't block deployments

4. **Check Webhook Delivery**
   - Go to GitHub → Settings → Webhooks
   - Check recent deliveries
   - Look for failed webhook calls

## Environment Variables

Ensure these are set on all platforms:

### Vercel
- `VITE_API_URL`
- All other environment variables from `.env`

### Netlify
- `VITE_API_URL`
- Build environment variables

### Railway
- Database credentials
- API keys
- Other backend-specific variables
