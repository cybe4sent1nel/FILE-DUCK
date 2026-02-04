@echo off
echo 🦆 FileDuck - Quick Start Script
echo =================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js ≥18
    exit /b 1
)

REM Check pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  pnpm not found. Installing pnpm...
    npm install -g pnpm
)

REM Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker not found. Please install Docker Desktop
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Create .env if not exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env with your credentials before running
)

REM Start Docker services
echo.
echo 🐳 Starting Docker services (ClamAV, MinIO, Redis, Scanner)...
docker-compose up -d

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ✅ Setup complete!
echo.
echo 📖 Next steps:
echo    1. Edit .env file with your credentials (if not already done)
echo    2. Run 'pnpm dev' to start development servers
echo    3. Open http://localhost:3000 in your browser
echo.
echo 📚 Documentation:
echo    - README.md - Overview and features
echo    - DEPLOYMENT.md - Production deployment guide
echo    - TROUBLESHOOTING.md - Common issues and solutions
echo.
echo 🎉 Happy coding with FileDuck!
pause
