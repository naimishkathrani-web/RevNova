# RevNova Backend - Production Deployment Script
# Deploy backend to dev.revnova.in with PM2 process manager

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RevNova Backend - Production Deployment" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Check if PM2 is installed
Write-Host "Checking PM2..." -ForegroundColor Yellow

$pm2Installed = $null -ne (Get-Command pm2 -ErrorAction SilentlyContinue)

if (-not $pm2Installed) {
    Write-Host "PM2 not found. Installing PM2 globally..." -ForegroundColor Yellow
    npm install -g pm2
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install PM2" -ForegroundColor Red
        Write-Host "Try running: npm install -g pm2" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ PM2 installed" -ForegroundColor Green
} else {
    Write-Host "✅ PM2 is already installed" -ForegroundColor Green
    $pm2Version = pm2 --version
    Write-Host "   Version: $pm2Version" -ForegroundColor Cyan
}

# 2. Build TypeScript
Write-Host "`nBuilding TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed" -ForegroundColor Green

# 3. Check if PM2 process exists
Write-Host "`nChecking existing PM2 processes..." -ForegroundColor Yellow
$existingProcess = pm2 list | Select-String "revnova-backend"

if ($existingProcess) {
    Write-Host "Found existing process. Restarting..." -ForegroundColor Yellow
    pm2 restart revnova-backend
} else {
    Write-Host "Starting new process..." -ForegroundColor Yellow
    pm2 start dist/index.js --name revnova-backend `
        --env production `
        --instances 1 `
        --max-memory-restart 500M `
        --log-date-format "YYYY-MM-DD HH:mm:ss Z"
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend started with PM2" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start backend" -ForegroundColor Red
    exit 1
}

# 4. Show status
Write-Host "`nPM2 Process Status:" -ForegroundColor Cyan
pm2 list

# 5. Show logs location
Write-Host "`nLogs:" -ForegroundColor Cyan
Write-Host "  View logs: pm2 logs revnova-backend" -ForegroundColor White
Write-Host "  Error logs: pm2 logs revnova-backend --err" -ForegroundColor White
Write-Host "  Monitor: pm2 monit" -ForegroundColor White

# 6. Save PM2 configuration
Write-Host "`nSaving PM2 configuration..." -ForegroundColor Yellow
pm2 save

# 7. Setup PM2 startup (optional)
Write-Host "`nSetup PM2 auto-startup on system reboot?" -ForegroundColor Yellow
$setupStartup = Read-Host "Configure PM2 startup? (y/N)"

if ($setupStartup -eq 'y' -or $setupStartup -eq 'Y') {
    pm2 startup
    Write-Host "`nFollow the instructions above to complete startup configuration" -ForegroundColor Cyan
}

# 8. Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Backend Status:" -ForegroundColor Yellow
Write-Host "✅ Running on: http://localhost:3000" -ForegroundColor Green
Write-Host "✅ Health Check: http://localhost:3000/api/v1/health" -ForegroundColor Green
Write-Host ""
Write-Host "PM2 Commands:" -ForegroundColor Yellow
Write-Host "  pm2 list                    - List all processes" -ForegroundColor White
Write-Host "  pm2 logs revnova-backend    - View logs" -ForegroundColor White
Write-Host "  pm2 restart revnova-backend - Restart server" -ForegroundColor White
Write-Host "  pm2 stop revnova-backend    - Stop server" -ForegroundColor White
Write-Host "  pm2 monit                   - Monitor resources" -ForegroundColor White
Write-Host ""
Write-Host "Domain Configuration:" -ForegroundColor Yellow
Write-Host "1. Configure DNS:" -ForegroundColor White
Write-Host "   Point dev.revnova.in to this server's IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Setup reverse proxy (nginx):" -ForegroundColor White
Write-Host "   proxy_pass http://localhost:3000;" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Update .env CORS_ORIGIN:" -ForegroundColor White
Write-Host "   Add https://dev.revnova.in" -ForegroundColor Cyan
Write-Host ""
