# 🚀 FileDuck Quick Start Guide

## Prerequisites

**You must start Docker Desktop manually before running FileDuck.**

1. Open Docker Desktop from Start Menu
2. Wait for the whale icon in system tray to be steady
3. Keep Docker Desktop running during development

## One-Time Setup

```bash
pnpm setup
```

This installs all dependencies.

## Start Development

### 1. Start Docker Desktop (Manual)
Open Docker Desktop application and ensure it's running.

### 2. Start Docker Containers
```bash
pnpm docker:up
```

This starts MinIO, ClamAV, Redis, and Scanner services.

### 3. Start Development Servers
```bash
pnpm start
```
Checks Docker is running, then starts API + Vue app in development mode

### Start Services Individually

```bash
# Start only Docker services
pnpm docker:up

# Start only development servers (requires Docker running)
pnpm dev

# Start only Vue app
pnpm dev:web

# Start only API
pnpm dev:api
```

## Docker Service Management

```bash
# View logs from all containers
pnpm docker:logs

# Stop all Docker services
pnpm docker:down

# Restart Docker services
pnpm docker:restart

# Clean all Docker data (volumes included)
pnpm docker:clean
```

## Stop Everything

```bash
pnpm stop
```

## Initial MinIO Setup

After running `pnpm docker:up`, create buckets:

1. Open MinIO Console: http://localhost:9001
2. Login: `minioadmin` / `minioadmin123`
3. Create buckets:
   - `fileduck-quarantine` (Private)
   - `fileduck-public` (Public Read)

## Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Vue App** | http://localhost:5173 | Frontend application |
| **API** | http://localhost:3000 | Vercel Dev server |
| **MinIO Console** | http://localhost:9001 | S3 storage admin panel |
| **MinIO API** | http://localhost:9000 | S3-compatible endpoint |
| **Redis** | localhost:6379 | Key-value store |
| **ClamAV** | localhost:3310 | Antivirus daemon |
| **Scanner** | http://localhost:4000 | File scanning service |

## Troubleshooting

### Docker services won't start
```bash
# Check if ports are in use
netstat -ano | findstr "9000 9001 6379 3310 4000"

# Clean and restart
pnpm docker:clean
pnpm docker:up
```

### ClamAV not ready
ClamAV takes 2-3 minutes to download virus definitions on first start.
```bash
# Check logs
docker logs fileduck-clamav -f
```

### Scanner service fails
```bash
# Ensure .env file has VIRUSTOTAL_API_KEY
# Check scanner logs
docker logs fileduck-scanner -f
```

## Development Workflow

1. **First time setup**:
   ```bash
   pnpm setup
   ```

2. **Daily development**:
   ```bash
   # Step 1: Start Docker Desktop (manually)
   # Step 2: Start containers
   pnpm docker:up
   # Step 3: Configure MinIO buckets at http://localhost:9001 (first time only)
   # Step 4: Start dev servers
   pnpm start
   # Access app at http://localhost:5173
   ```

3. **End of day**:
   ```bash
   pnpm docker:down  # Stop containers
   # Close Docker Desktop if desired
   ```

## Build for Production

```bash
pnpm build
```

## Deploy to Vercel

```bash
cd apps/api && pnpm deploy
cd apps/vue-app && vercel --prod
```

---

**Note**: Ensure `.env` file is configured with all required credentials before starting services.
