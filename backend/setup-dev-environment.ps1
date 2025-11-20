# RevNova Backend - Development Environment Setup Script
# This script sets up and runs the backend on the development server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RevNova Backend Setup - Development" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# 1. Check Prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-CommandExists "node")) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green

if (-not (Test-CommandExists "npm")) {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

$npmVersion = npm --version
Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green

# 2. Check PostgreSQL
Write-Host "`nChecking PostgreSQL..." -ForegroundColor Yellow

if (-not (Test-CommandExists "psql")) {
    Write-Host "⚠️  PostgreSQL command-line tools not found in PATH" -ForegroundColor Yellow
    Write-Host "   Please ensure PostgreSQL 14+ is installed and running" -ForegroundColor Yellow
    Write-Host "   Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
} else {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
}

# 3. Check Redis (optional but recommended)
Write-Host "`nChecking Redis..." -ForegroundColor Yellow

if (-not (Test-CommandExists "redis-cli")) {
    Write-Host "⚠️  Redis not found (optional)" -ForegroundColor Yellow
    Write-Host "   For caching support, install Redis:" -ForegroundColor Yellow
    Write-Host "   Windows: https://redis.io/docs/install/install-redis/install-redis-on-windows/" -ForegroundColor Yellow
} else {
    Write-Host "✅ Redis found" -ForegroundColor Green
}

# 4. Install Dependencies
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# 5. Check Database Connection
Write-Host "`nChecking database configuration..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    # Read database config
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "DB_NAME=(\w+)") {
        $dbName = $matches[1]
        Write-Host "   Database: $dbName" -ForegroundColor Cyan
    }
    if ($envContent -match "DB_USER=(\w+)") {
        $dbUser = $matches[1]
        Write-Host "   User: $dbUser" -ForegroundColor Cyan
    }
    if ($envContent -match "PORT=(\d+)") {
        $port = $matches[1]
        Write-Host "   API Port: $port" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
    Write-Host "   Please configure database settings in .env" -ForegroundColor Yellow
}

# 6. Database Setup
Write-Host "`nDatabase Setup:" -ForegroundColor Yellow
Write-Host "To create the database manually, run:" -ForegroundColor Cyan
Write-Host "  psql -U postgres" -ForegroundColor White
Write-Host "  CREATE DATABASE revnova_dev;" -ForegroundColor White
Write-Host "  \q" -ForegroundColor White

$createDb = Read-Host "`nAttempt to create database now? (y/N)"
if ($createDb -eq 'y' -or $createDb -eq 'Y') {
    Write-Host "`nCreating database..." -ForegroundColor Yellow
    
    # Try to create database
    $createDbCommand = "CREATE DATABASE revnova_dev;"
    $result = psql -U postgres -c $createDbCommand 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result -match "already exists") {
        Write-Host "✅ Database ready" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not create database automatically" -ForegroundColor Yellow
        Write-Host "   Please create it manually using the commands above" -ForegroundColor Yellow
    }
}

# 7. Run Migrations
Write-Host "`nRunning database migrations..." -ForegroundColor Yellow
Write-Host "Note: Migrations will create all required tables" -ForegroundColor Cyan

$runMigrations = Read-Host "Run migrations now? (y/N)"
if ($runMigrations -eq 'y' -or $runMigrations -eq 'Y') {
    npm run migrate:ts
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations completed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Migrations failed - check database connection" -ForegroundColor Yellow
    }
}

# 8. Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure API keys in .env file:" -ForegroundColor White
Write-Host "   - OPENAI_API_KEY (for AI mapping suggestions)" -ForegroundColor Cyan
Write-Host "   - SALESFORCE_CLIENT_ID & SECRET (for OAuth)" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "3. Test the API:" -ForegroundColor White
Write-Host "   http://localhost:3000/api/v1/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. For production deployment:" -ForegroundColor White
Write-Host "   - Point dev.revnova.in to this server" -ForegroundColor Cyan
Write-Host "   - Update CORS_ORIGIN in .env" -ForegroundColor Cyan
Write-Host "   - Use a process manager (PM2)" -ForegroundColor Cyan
Write-Host ""

# 9. Offer to start server
$startServer = Read-Host "Start development server now? (y/N)"
if ($startServer -eq 'y' -or $startServer -eq 'Y') {
    Write-Host "`nStarting server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow
    npm run dev
}
