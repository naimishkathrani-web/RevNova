# RevNova - Start All Development Services
# This script opens 3 dedicated terminals for all developer services

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  RevNova Development Environment Startup" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = $null
try {
    $nodeVersion = & node --version 2>$null
} catch {}

if (-not $nodeVersion) {
    Write-Host "❌ ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js LTS from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green

# Check npm
$npmVersion = & npm --version 2>$null
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green

# Check PostgreSQL
Write-Host ""
Write-Host "Checking services..." -ForegroundColor Yellow
$pgRunning = netstat -ano | findstr ":5432" | Select-Object -First 1
if ($pgRunning) {
    Write-Host "✅ PostgreSQL running on port 5432" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: PostgreSQL not detected on port 5432" -ForegroundColor Yellow
}

# Check Redis
$redisRunning = netstat -ano | findstr ":6379" | Select-Object -First 1
if ($redisRunning) {
    Write-Host "✅ Redis running on port 6379" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: Redis not detected on port 6379" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Starting Development Terminals..." -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Get repository root
$repoRoot = Split-Path -Parent $PSScriptRoot

# Terminal 1: Backend Server (Developer 1)
Write-Host "🚀 Opening Backend Server terminal..." -ForegroundColor Cyan
$backendCommand = @"
cd '$repoRoot\backend'
Write-Host ''
Write-Host '=====================================================' -ForegroundColor Cyan
Write-Host '  DEVELOPER 1: Backend Server (Express + TypeScript)' -ForegroundColor Cyan
Write-Host '=====================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Installing dependencies (first time only)...' -ForegroundColor Yellow
npm install
Write-Host ''
Write-Host 'Starting backend server...' -ForegroundColor Yellow
Write-Host 'Server will run on: http://localhost:3000' -ForegroundColor Green
Write-Host ''
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

Start-Sleep -Seconds 2

# Terminal 2: Frontend Server (Developer 2)
Write-Host "🚀 Opening Frontend Server terminal..." -ForegroundColor Cyan
$frontendCommand = @"
cd '$repoRoot\frontend'
Write-Host ''
Write-Host '=====================================================' -ForegroundColor Cyan
Write-Host '  DEVELOPER 2: Frontend Server (Vite + React)' -ForegroundColor Cyan
Write-Host '=====================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Installing dependencies (first time only)...' -ForegroundColor Yellow
npm install
Write-Host ''
Write-Host 'Starting frontend server...' -ForegroundColor Yellow
Write-Host 'Server will run on: http://localhost:5173' -ForegroundColor Green
Write-Host ''
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Start-Sleep -Seconds 2

# Terminal 3: Service Monitor (Developer 3)
Write-Host "🚀 Opening Service Monitor terminal..." -ForegroundColor Cyan
$monitorCommand = @"
cd '$repoRoot'
Write-Host ''
Write-Host '=====================================================' -ForegroundColor Cyan
Write-Host '  DEVELOPER 3: Service Monitor & DevOps Terminal' -ForegroundColor Cyan
Write-Host '=====================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Monitoring all service ports...' -ForegroundColor Yellow
Write-Host ''

# Function to check services
function Check-Services {
    Write-Host '─────────────────────────────────────────────────────' -ForegroundColor Gray
    Write-Host 'Service Status:' -ForegroundColor Cyan
    Write-Host ''
    
    `$services = @(
        @{Name='PostgreSQL'; Port=5432; PID=`$null},
        @{Name='Redis'; Port=6379; PID=`$null},
        @{Name='Backend API'; Port=3000; PID=`$null},
        @{Name='Frontend UI'; Port=5173; PID=`$null}
    )
    
    foreach (`$svc in `$services) {
        `$result = netstat -ano | findstr ":`$(`$svc.Port)" | Select-Object -First 1
        if (`$result -match 'LISTENING\s+(\d+)') {
            `$svc.PID = `$matches[1]
            Write-Host "✅ `$(`$svc.Name) (:`$(`$svc.Port)) - Running (PID: `$(`$svc.PID))" -ForegroundColor Green
        } else {
            Write-Host "❌ `$(`$svc.Name) (:`$(`$svc.Port)) - Not Running" -ForegroundColor Red
        }
    }
    Write-Host ''
}

# Initial check
Check-Services

Write-Host '─────────────────────────────────────────────────────' -ForegroundColor Gray
Write-Host 'Commands available:' -ForegroundColor Yellow
Write-Host '  check   - Check service status' -ForegroundColor White
Write-Host '  test    - Test backend API health' -ForegroundColor White
Write-Host '  logs    - View Docker logs (if using Docker)' -ForegroundColor White
Write-Host '  exit    - Close this terminal' -ForegroundColor White
Write-Host ''

while (`$true) {
    `$cmd = Read-Host 'DevOps'
    switch (`$cmd) {
        'check' { Check-Services }
        'test' { 
            Write-Host 'Testing backend API...' -ForegroundColor Yellow
            try {
                `$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/v1/health' -Method GET -TimeoutSec 5
                Write-Host '✅ Backend API is healthy!' -ForegroundColor Green
                Write-Host (`$response.Content) -ForegroundColor Gray
            } catch {
                Write-Host '❌ Backend API is not responding' -ForegroundColor Red
                Write-Host `$_.Exception.Message -ForegroundColor Red
            }
            Write-Host ''
        }
        'logs' { 
            if (Get-Command docker -ErrorAction SilentlyContinue) {
                docker-compose logs -f --tail=50
            } else {
                Write-Host '⚠️  Docker not installed' -ForegroundColor Yellow
            }
        }
        'exit' { exit }
        default { 
            if (`$cmd) {
                Write-Host "Unknown command: `$cmd" -ForegroundColor Red
                Write-Host "Try: check, test, logs, or exit" -ForegroundColor Yellow
            }
        }
    }
}
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $monitorCommand

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  ✅ All terminals opened!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminals created for:" -ForegroundColor White
Write-Host "  1️⃣  Backend Server - http://localhost:3000" -ForegroundColor Cyan
Write-Host "  2️⃣  Frontend Server - http://localhost:5173" -ForegroundColor Cyan
Write-Host "  3️⃣  Service Monitor - DevOps terminal" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait for 'npm install' to complete in each terminal." -ForegroundColor Yellow
Write-Host "Then servers will start automatically." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to close this window..." -ForegroundColor Gray
Read-Host
