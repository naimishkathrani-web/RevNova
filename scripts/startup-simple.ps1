# RevNova Simple Startup Script
# Starts all 3 developer terminals with services

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         RevNova Development Environment Startup              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Refresh PATH to ensure Node.js is available
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = & node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
Write-Host "✅ npm $(& npm --version) detected" -ForegroundColor Green
Write-Host ""

# Repository path
$repoPath = "C:\Dev\RevNovaRepository"

# Terminal 1: Backend (Developer 1)
Write-Host "🚀 Opening Backend terminal..." -ForegroundColor Cyan
$backendCmd = '$Host.UI.RawUI.WindowTitle = "RevNova - Backend (Developer 1)"; ' +
'$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User"); ' +
'cd C:\Dev\RevNovaRepository\backend; ' +
'Write-Host "================================" -ForegroundColor Cyan; ' +
'Write-Host "DEVELOPER 1: Backend Server" -ForegroundColor Cyan; ' +
'Write-Host "================================" -ForegroundColor Cyan; ' +
'Write-Host ""; ' +
'Write-Host "Installing dependencies..." -ForegroundColor Yellow; ' +
'npm install; ' +
'Write-Host ""; ' +
'Write-Host "Starting server on http://localhost:3000..." -ForegroundColor Green; ' +
'npm run dev'

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 2

# Terminal 2: Frontend (Developer 2)
Write-Host "🚀 Opening Frontend terminal..." -ForegroundColor Cyan
$frontendCmd = '$Host.UI.RawUI.WindowTitle = "RevNova - Frontend (Developer 2)"; ' +
'$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User"); ' +
'cd C:\Dev\RevNovaRepository\frontend; ' +
'Write-Host "================================" -ForegroundColor Cyan; ' +
'Write-Host "DEVELOPER 2: Frontend Server" -ForegroundColor Cyan; ' +
'Write-Host "================================" -ForegroundColor Cyan; ' +
'Write-Host ""; ' +
'Write-Host "Installing dependencies..." -ForegroundColor Yellow; ' +
'npm install; ' +
'Write-Host ""; ' +
'Write-Host "Starting server on http://localhost:5173..." -ForegroundColor Green; ' +
'npm run dev'

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
Start-Sleep -Seconds 2

# Terminal 3: Monitor (Developer 3)
Write-Host "🚀 Opening Monitor terminal..." -ForegroundColor Cyan
$monitorCmd = '$Host.UI.RawUI.WindowTitle = "RevNova - Monitor (Developer 3)"; ' +
'cd C:\Dev\RevNovaRepository; ' +
'Write-Host "================================" -ForegroundColor Cyan; ' +
'Write-Host "DEVELOPER 3: Service Monitor" -ForegroundColor Cyan; ' +
'Write-Host "================================" -ForegroundColor Cyan; ' +
'Write-Host ""; ' +
'Write-Host "Waiting for services to start (30 sec)..." -ForegroundColor Yellow; ' +
'Start-Sleep -Seconds 30; ' +
'function Check-Services { ' +
'  Write-Host ""; ' +
'  Write-Host "Service Status:" -ForegroundColor Cyan; ' +
'  $svcs = @(@{n="PostgreSQL";p=5432},@{n="Redis";p=6379},@{n="Backend";p=3000},@{n="Frontend";p=5173}); ' +
'  foreach($s in $svcs) { ' +
'    $r = netstat -ano | findstr "LISTENING" | findstr ":$($s.p) "; ' +
'    if($r) { Write-Host "  ✅ $($s.n) (port $($s.p)) - Running" -ForegroundColor Green } ' +
'    else { Write-Host "  ❌ $($s.n) (port $($s.p)) - Not Running" -ForegroundColor Red } ' +
'  }; ' +
'  Write-Host "" ' +
'}; ' +
'Check-Services; ' +
'Write-Host "Commands:" -ForegroundColor Yellow; ' +
'Write-Host "  status - Check service status" -ForegroundColor White; ' +
'Write-Host "  exit   - Close terminal" -ForegroundColor White; ' +
'Write-Host ""; ' +
'while($true) { ' +
'  $cmd = Read-Host "Monitor>"; ' +
'  if($cmd -eq "status") { Check-Services } ' +
'  elseif($cmd -eq "exit") { exit } ' +
'  elseif($cmd) { Write-Host "Unknown command. Try: status, exit" -ForegroundColor Red } ' +
'}'

Start-Process powershell -ArgumentList "-NoExit", "-Command", $monitorCmd

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ All Terminals Opened!                     ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "3 PowerShell windows opened:" -ForegroundColor White
Write-Host "  1️⃣  Backend Server (port 3000)" -ForegroundColor Cyan
Write-Host "  2️⃣  Frontend Server (port 5173)" -ForegroundColor Cyan
Write-Host "  3️⃣  Service Monitor" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait 1-2 minutes for npm install to complete..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to close this window..." -ForegroundColor Gray
Read-Host
