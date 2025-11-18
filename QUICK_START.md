# RevNova Development - Quick Start Guide

## Current Status ✅❌

### ✅ What's Working
- **PostgreSQL** running on port 5432 (PID: 1752)
- **Redis** running on port 6379 (PID: 9912)  
- **Python 3.14.0** with virtual environment activated
- **Git repository** configured and synced
- **All 75 onboarding pages** updated with complete navigation

### ❌ What's Blocked
- **Backend API** - Cannot start (needs Node.js)
- **Frontend UI** - Cannot start (needs Node.js)
- **npm commands** - Not available (Node.js not installed)

---

## 🚀 Get Everything Running (3 Steps)

### Step 1: Install Node.js
1. Download from: **https://nodejs.org/**
2. Install **LTS version** (recommended)
3. During installation: ✅ Check "Add to PATH"
4. **Restart all PowerShell terminals** after installation

### Step 2: Run Startup Script
```powershell
cd C:\Dev\RevNovaRepository
.\scripts\start-all-services.ps1
```

This script will:
- ✅ Verify Node.js is installed
- ✅ Check PostgreSQL and Redis are running
- ✅ Open 3 dedicated terminals:
  - **Terminal 1:** Backend Server (Developer 1)
  - **Terminal 2:** Frontend Server (Developer 2)
  - **Terminal 3:** Service Monitor (Developer 3)
- ✅ Auto-install npm dependencies
- ✅ Auto-start both servers

### Step 3: Verify Everything Works
Wait 1-2 minutes for npm install to complete, then check:

```powershell
# In the Service Monitor terminal, type:
check
```

You should see:
- ✅ PostgreSQL (5432) - Running
- ✅ Redis (6379) - Running
- ✅ Backend API (3000) - Running
- ✅ Frontend UI (5173) - Running

---

## 🌐 Access Your Servers

Once running, open your browser:

- **Frontend UI:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/v1/health
- **Connection Test Page:** http://localhost:5173/migration/connect

---

## 📊 Developer Service Map

| Developer | Service | Port | Technology | Status |
|-----------|---------|------|------------|--------|
| Developer 1 | Backend API | 3000 | Express + TypeScript | ❌ Needs Node.js |
| Developer 1 | PostgreSQL | 5432 | PostgreSQL 16 | ✅ Running |
| Developer 1 | Redis | 6379 | Redis 7 | ✅ Running |
| Developer 2 | Frontend UI | 5173 | Vite + React | ❌ Needs Node.js |
| Developer 3 | Monitor | - | PowerShell + Python | ✅ Ready |

---

## 🔧 Manual Start (Alternative)

If you prefer to start services manually instead of using the script:

```powershell
# Terminal 1: Backend
cd C:\Dev\RevNovaRepository\backend
npm install
npm run dev

# Terminal 2: Frontend  
cd C:\Dev\RevNovaRepository\frontend
npm install
npm run dev

# Terminal 3: Monitor
netstat -ano | findstr ":3000 :5173 :5432 :6379"
```

---

## 📝 Files Created

I've created these helpful files for you:

1. **SERVICE_STATUS.md** - Detailed status of all services and requirements
2. **scripts/start-all-services.ps1** - Automated startup script for all 3 developer terminals
3. **QUICK_START.md** - This file (quick reference guide)

---

## 🆘 Troubleshooting

### "npm: command not found" or "node: command not found"
- Node.js is not installed or not in PATH
- Install from: https://nodejs.org/
- Restart PowerShell after installation

### Backend fails to start
- Check if port 3000 is already in use: `netstat -ano | findstr ":3000"`
- Verify PostgreSQL is running on 5432
- Verify Redis is running on 6379
- Check `.env` file in backend directory exists

### Frontend fails to start  
- Check if port 5173 is already in use: `netstat -ano | findstr ":5173"`
- Verify backend is running on 3000
- Check for CORS errors in browser console

### "Failed to fetch" error on connection page
- Backend must be running on port 3000
- Check backend CORS configuration allows http://localhost:5173
- Open browser DevTools > Network tab to see actual error

---

## 📞 Next Steps

After Node.js is installed and services are running:

1. ✅ Test backend health: http://localhost:3000/api/v1/health
2. ✅ Test frontend loads: http://localhost:5173
3. ✅ Test connection page: http://localhost:5173/migration/connect
4. 📋 Review developer onboarding tasks: docs/Onboarding/
5. 📋 Cross-check with requirements: docs/RevNovaRequirements/

---

**Last Updated:** November 18, 2025  
**Repository:** C:\Dev\RevNovaRepository  
**Branch:** main
