# RevNova Server Administrator Setup Guide

**Purpose**: This guide is for the SERVER ADMINISTRATOR to set up the Windows server that will host the RevNova development/production environment. Developers will work on their local machines and connect to services running on this server.

**Your Role**: You maintain the server infrastructure that developers connect to for:
- Shared PostgreSQL database
- Shared Redis cache
- Backend API services
- Deployment infrastructure

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Administrator access to the Windows Server
- [ ] Internet connection for downloads
- [ ] Firewall rules allowing necessary ports (3000, 5432, 6379)

---

## 🔧 Step 1: Install Node.js (REQUIRED)

**Status**: ❌ NOT INSTALLED (as of Nov 17, 2025)

### Why You Need This:
- Runs the backend API (Express/TypeScript)
- Required for npm package management
- Developers need this API running to test their frontend work

### Installation Steps:

1. **Download Node.js v20.x LTS**
   - Go to: https://nodejs.org/en/download/
   - Download: "Windows Installer (.msi)" - 64-bit
   - Choose LTS version (currently v20.x)

2. **Run the Installer**
   - Double-click the downloaded `.msi` file
   - Click "Next" through the installation wizard
   - ✅ **IMPORTANT**: Check "Automatically install necessary tools" (includes Python, Visual Studio Build Tools)
   - Choose default installation path: `C:\Program Files\nodejs`
   - Click "Install"
   - Wait for installation to complete (5-10 minutes)

3. **Verify Installation**
   - Open a **NEW** PowerShell window (close old ones)
   - Run these commands:
   ```powershell
   node --version
   # Should show: v20.x.x
   
   npm --version
   # Should show: 10.x.x
   ```

4. **If Commands Not Found**
   - Restart PowerShell as Administrator
   - Check PATH: `$env:Path` should contain `C:\Program Files\nodejs`
   - Restart the server if needed

---

## 🗄️ Step 2: Verify PostgreSQL (ALREADY RUNNING ✅)

**Status**: ✅ RUNNING on port 5432

### Current Configuration:
- Service: `postgresql-x64-18`
- Status: Running
- Port: 5432

### What You Should Check:

```powershell
# Check service status
Get-Service -Name postgresql*

# Should show: Running

# Check if listening on port 5432
netstat -ano | findstr ":5432"

# Should show: LISTENING
```

### Create RevNova Database (If Not Already Done):

```powershell
# Open PostgreSQL command line
psql -U postgres

# In psql prompt:
CREATE DATABASE revnova_dev;
CREATE USER revnova_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE revnova_dev TO revnova_user;
\q
```

### Configure for Network Access (if developers need remote access):

1. Edit `postgresql.conf`:
   - Location: `C:\Program Files\PostgreSQL\18\data\postgresql.conf`
   - Find: `listen_addresses = 'localhost'`
   - Change to: `listen_addresses = '*'` (or specific IPs)

2. Edit `pg_hba.conf`:
   - Location: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`
   - Add line: `host all all 0.0.0.0/0 md5`

3. Restart PostgreSQL service:
   ```powershell
   Restart-Service postgresql-x64-18
   ```

---

## 🔴 Step 3: Install Redis (REQUIRED)

**Status**: ❌ NOT INSTALLED

### Why You Need This:
- Caching layer for Salesforce API responses
- Session management
- Job queue management (Bull)
- Required starting Week 2 (Developer 1, Day 7-8)

### Installation Steps for Windows:

#### Option A: Using Memurai (Redis-compatible, Windows-native)

1. **Download Memurai**
   - Go to: https://www.memurai.com/get-memurai
   - Download: Memurai Developer Edition (Free)

2. **Install**
   - Run the installer
   - Choose default settings
   - Install as Windows Service
   - Start service automatically

3. **Verify**
   ```powershell
   Get-Service Memurai
   # Should show: Running
   
   netstat -ano | findstr ":6379"
   # Should show: LISTENING
   ```

#### Option B: Using WSL2 + Redis (Alternative)

1. **Install WSL2**
   ```powershell
   wsl --install
   # Restart server
   ```

2. **Install Redis in Ubuntu**
   ```bash
   wsl
   sudo apt update
   sudo apt install redis-server
   sudo service redis-server start
   ```

3. **Verify**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

---

## 🚀 Step 4: Set Up Backend API Service

**Status**: ❌ CANNOT START (Node.js not installed)

### After Installing Node.js:

1. **Navigate to Backend Directory**
   ```powershell
   cd C:\Dev\RevNovaRepository\backend
   ```

2. **Install Dependencies**
   ```powershell
   npm install
   # This will take 2-3 minutes
   ```

3. **Create Environment Configuration**
   ```powershell
   # Copy example config
   Copy-Item .env.example .env
   
   # Edit .env file with your settings
   notepad .env
   ```

4. **Configure .env File**
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=revnova_dev
   DB_USER=revnova_user
   DB_PASSWORD=your_secure_password
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Salesforce (Developer 1 will provide these)
   SALESFORCE_CLIENT_ID=xxx
   SALESFORCE_CLIENT_SECRET=xxx
   SALESFORCE_REDIRECT_URI=http://localhost:3000/api/auth/callback
   
   # OpenAI (Developer 1 will provide this)
   OPENAI_API_KEY=sk-xxx
   ```

5. **Start Backend Server (Development Mode)**
   ```powershell
   npm run dev
   ```
   
   **Expected Output:**
   ```
   [nodemon] starting `ts-node-dev src/index.ts`
   Server running on port 3000
   Database connected successfully
   Redis connected successfully
   ```

6. **Test Backend is Working**
   - Open browser: http://localhost:3000
   - Or use curl: `curl http://localhost:3000/api/health`

---

## 🔥 Step 5: Set Up Backend as Windows Service (Production)

**Purpose**: Keep backend running automatically, restart on failure

### Using NSSM (Non-Sucking Service Manager):

1. **Download NSSM**
   - Go to: https://nssm.cc/download
   - Download: nssm 2.24 (latest)
   - Extract to: `C:\Program Files\nssm`

2. **Install Backend as Service**
   ```powershell
   # Open PowerShell as Administrator
   cd "C:\Program Files\nssm\win64"
   
   # Install service
   .\nssm.exe install RevNovaBackend "C:\Program Files\nodejs\node.exe" "C:\Dev\RevNovaRepository\backend\dist\index.js"
   
   # Configure service
   .\nssm.exe set RevNovaBackend AppDirectory "C:\Dev\RevNovaRepository\backend"
   .\nssm.exe set RevNovaBackend DisplayName "RevNova Backend API"
   .\nssm.exe set RevNovaBackend Description "RevNova Migration Platform Backend Service"
   .\nssm.exe set RevNovaBackend Start SERVICE_AUTO_START
   
   # Start service
   Start-Service RevNovaBackend
   ```

3. **Verify Service**
   ```powershell
   Get-Service RevNovaBackend
   # Should show: Running
   
   netstat -ano | findstr ":3000"
   # Should show: LISTENING
   ```

---

## 🌐 Step 6: Configure Windows Firewall

**Purpose**: Allow developers to access services from their machines

### Open Required Ports:

```powershell
# Backend API (port 3000)
New-NetFirewallRule -DisplayName "RevNova Backend API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# PostgreSQL (port 5432) - if remote access needed
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow

# Redis (port 6379) - if remote access needed
New-NetFirewallRule -DisplayName "Redis" -Direction Inbound -LocalPort 6379 -Protocol TCP -Action Allow
```

### Check Firewall Rules:
```powershell
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*RevNova*" -or $_.DisplayName -like "*PostgreSQL*" -or $_.DisplayName -like "*Redis*"}
```

---

## 📊 Step 7: Monitoring & Maintenance

### Daily Health Checks:

```powershell
# Check all services
Get-Service | Where-Object {$_.Name -like "*postgres*" -or $_.Name -like "*redis*" -or $_.Name -like "*RevNova*"}

# Check ports are listening
netstat -ano | findstr ":3000 :5432 :6379"

# Check backend logs (if using NSSM)
Get-Content "C:\Dev\RevNovaRepository\backend\logs\app.log" -Tail 50
```

### Restart Services if Needed:

```powershell
# Restart PostgreSQL
Restart-Service postgresql-x64-18

# Restart Redis/Memurai
Restart-Service Memurai

# Restart Backend
Restart-Service RevNovaBackend
```

---

## 🔍 Troubleshooting

### Issue: "Node command not found"
**Solution**: 
1. Close all PowerShell windows
2. Open NEW PowerShell as Administrator
3. Verify: `$env:Path` contains `C:\Program Files\nodejs`
4. If not, restart server

### Issue: "Cannot connect to PostgreSQL"
**Solution**:
```powershell
# Check if service is running
Get-Service postgresql*

# Check if listening
netstat -ano | findstr ":5432"

# Restart if needed
Restart-Service postgresql-x64-18
```

### Issue: "Backend won't start"
**Solution**:
1. Check .env file exists and has correct values
2. Verify database connection: `psql -U revnova_user -d revnova_dev`
3. Check logs: `npm run dev` (see error messages)
4. Verify port 3000 is not in use: `netstat -ano | findstr ":3000"`

### Issue: "Redis connection failed"
**Solution**:
```powershell
# Test Redis connection
redis-cli ping
# Should return: PONG

# If using Memurai:
Get-Service Memurai
Restart-Service Memurai
```

---

## 📝 Quick Reference - Server Status Commands

```powershell
# One-command health check
Write-Host "=== RevNova Server Status ===" -ForegroundColor Cyan
Write-Host "`nServices:" -ForegroundColor Yellow
Get-Service | Where-Object {$_.Name -like "*postgres*" -or $_.Name -like "*memurai*" -or $_.Name -like "*RevNova*"} | Format-Table
Write-Host "`nListening Ports:" -ForegroundColor Yellow
netstat -ano | findstr ":3000 :5432 :6379"
Write-Host "`nNode.js Version:" -ForegroundColor Yellow
node --version
Write-Host "`nDisk Space:" -ForegroundColor Yellow
Get-PSDrive C | Select-Object Used,Free
```

---

## ✅ Installation Checklist

Use this to track your progress:

- [ ] Node.js v20.x installed and verified
- [ ] PostgreSQL service running
- [ ] RevNova database created
- [ ] PostgreSQL user created with permissions
- [ ] Redis/Memurai installed and running
- [ ] Backend dependencies installed (`npm install`)
- [ ] .env file configured with correct values
- [ ] Backend starts successfully (`npm run dev`)
- [ ] Backend accessible at http://localhost:3000
- [ ] Windows Firewall rules configured
- [ ] Backend running as Windows Service (optional, for production)
- [ ] Health check commands working

---

## 🎯 Current Status (as of Nov 17, 2025)

| Component | Status | Port | Action Needed |
|-----------|--------|------|---------------|
| PostgreSQL | ✅ Running | 5432 | None - Working |
| Redis | ❌ Not Installed | 6379 | **INSTALL NOW** |
| Node.js | ❌ Not Installed | N/A | **INSTALL NOW** |
| Backend API | ❌ Cannot Start | 3000 | Install Node.js first |

---

## 📞 Next Steps

1. **IMMEDIATE**: Install Node.js (Step 1)
2. **IMMEDIATE**: Install Redis (Step 3)
3. **THEN**: Set up Backend API (Step 4)
4. **THEN**: Test all services working together
5. **OPTIONAL**: Set up as Windows Service for production (Step 5)

After completing these steps, developers will be able to:
- Run their frontend locally and connect to your backend
- Run integration tests against the shared database
- Test Salesforce and OpenAI integrations
- Deploy their code to the server

---

**Last Updated**: November 17, 2025  
**Server**: Windows Server  
**Project**: RevNova Migration Platform
