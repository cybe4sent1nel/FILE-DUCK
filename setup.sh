#!/bin/bash
set -e

echo "🦆 FileDuck - Quick Start Script"
echo "================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js ≥18"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your credentials before running"
fi

# Start Docker services
echo ""
echo "🐳 Starting Docker services (ClamAV, MinIO, Redis, Scanner)..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."

# Check ClamAV
if docker ps | grep -q fileduck-clamav; then
    echo "✅ ClamAV running"
else
    echo "❌ ClamAV not running"
fi

# Check MinIO
if curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo "✅ MinIO running"
else
    echo "❌ MinIO not running"
fi

# Check Redis
if docker ps | grep -q fileduck-redis; then
    echo "✅ Redis running"
else
    echo "❌ Redis not running"
fi

# Create MinIO buckets
echo ""
echo "🪣 Creating S3 buckets in MinIO..."

if command -v mc &> /dev/null; then
    mc alias set local http://localhost:9000 minioadmin minioadmin123 2>/dev/null || true
    mc mb local/fileduck-quarantine 2>/dev/null || echo "Quarantine bucket already exists"
    mc mb local/fileduck-public 2>/dev/null || echo "Public bucket already exists"
    mc anonymous set download local/fileduck-public 2>/dev/null || true
    echo "✅ Buckets created"
else
    echo "⚠️  MinIO client (mc) not found. Please create buckets manually:"
    echo "   1. Download mc: https://min.io/download"
    echo "   2. Run: mc alias set local http://localhost:9000 minioadmin minioadmin123"
    echo "   3. Run: mc mb local/fileduck-quarantine"
    echo "   4. Run: mc mb local/fileduck-public"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "   1. Edit .env file with your credentials (if not already done)"
echo "   2. Run 'pnpm dev' to start development servers"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Overview and features"
echo "   - DEPLOYMENT.md - Production deployment guide"
echo "   - TROUBLESHOOTING.md - Common issues and solutions"
echo ""
echo "🎉 Happy coding with FileDuck!"
