# RevNova Development Environment Setup Guide

## Prerequisites Installation

### 1. Install Node.js (Required for Backend & Frontend)

**Download:**
- Visit: https://nodejs.org/
- Download: Node.js v20.x LTS (Long Term Support)
- Run installer and follow prompts
- ✅ Check "Add to PATH" option

**Verify Installation:**
```powershell
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2. Install PostgreSQL (Required for Database)

**Download:**
- Visit: https://www.postgresql.org/download/windows/
- Download PostgreSQL 15 or later
- Run installer
- Set password for `postgres` user: `revnova123` (or your choice)
- Port: `5432` (default)

**Verify Installation:**
```powershell
psql --version  # Should show PostgreSQL 15.x
```

**Create Database:**
```powershell
# Open PowerShell as Administrator
psql -U postgres
# Enter password when prompted

# In psql prompt:
CREATE DATABASE revnova_dev;
\q
```

### 3. Install Redis (Required for Caching)

**Download:**
- Visit: https://github.com/microsoftarchive/redis/releases
- Download: Redis-x64-3.0.504.msi
- Run installer
- Port: `6379` (default)

**Verify Installation:**
```powershell
redis-cli ping  # Should respond: PONG
```

## Backend Setup

### Step 1: Install Dependencies
```powershell
cd c:\Dev\RevNovaRepository\backend
npm install
```

### Step 2: Configure Environment
Edit `backend\.env` file:
```env
# Database
DATABASE_URL=postgresql://postgres:revnova123@localhost:5432/revnova_dev

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development

# Salesforce (for testing)
SFDC_CLIENT_ID=your_connected_app_client_id
SFDC_CLIENT_SECRET=your_connected_app_client_secret
SFDC_CALLBACK_URL=http://localhost:3000/api/v1/auth/callback
```

### Step 3: Run Database Migrations
```powershell
cd c:\Dev\RevNovaRepository\backend
npm run migrate
```

### Step 4: Start Backend Server
```powershell
cd c:\Dev\RevNovaRepository\backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on http://localhost:3000
✅ PostgreSQL connected
✅ Redis connected
```

**Keep this terminal open while developing!**

## Frontend Setup

### Step 1: Navigate to Frontend Directory
```powershell
cd c:\Dev\RevNovaRepository\frontend
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Configure API Endpoint
Edit `frontend\src\config\api.ts` (or similar):
```typescript
export const API_BASE_URL = 'http://localhost:3000/api/v1';
```

### Step 4: Start Frontend Development Server
```powershell
cd c:\Dev\RevNovaRepository\frontend
npm run dev
```

**Expected Output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal open while developing!**

## Testing the Setup

### Test 1: Backend Health Check
Open browser: http://localhost:3000/health

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected"
}
```

### Test 2: Frontend Loading
Open browser: http://localhost:5173/

Should see RevNova dashboard/login page.

### Test 3: Connection Test
1. Navigate to: http://localhost:5173/migration/connect
2. Fill in SFDC credentials
3. Click "Test Connection"
4. Should call: `POST http://localhost:3000/api/v1/connections/test`
5. Check browser DevTools > Network tab for request

**If you see "Failed to fetch":**
- ✅ Backend is running on port 3000
- ✅ Frontend API_BASE_URL is configured correctly
- ✅ CORS is enabled in backend

## Common Issues & Solutions

### Issue: "npm: The term 'npm' is not recognized"
**Solution:** Node.js not installed or not in PATH
1. Install Node.js from nodejs.org
2. Restart PowerShell
3. Verify: `node --version`

### Issue: "Failed to fetch" on connection test
**Solution:** Backend not running
1. Open new PowerShell terminal
2. `cd c:\Dev\RevNovaRepository\backend`
3. `npm run dev`
4. Verify: http://localhost:3000/health

### Issue: "ECONNREFUSED" database error
**Solution:** PostgreSQL not running
1. Open Services (Win + R, type `services.msc`)
2. Find "postgresql-x64-15"
3. Right-click > Start
4. Restart backend

### Issue: Redis connection failed
**Solution:** Redis not running
1. Open Services (Win + R, type `services.msc`)
2. Find "Redis"
3. Right-click > Start
4. Restart backend

### Issue: Port 3000 already in use
**Solution:** Kill existing process
```powershell
netstat -ano | findstr ":3000"
# Note the PID number
taskkill /PID <PID_NUMBER> /F
```

## Development Workflow

### For Developer 1 (Backend):
```powershell
# Terminal 1: Backend server
cd c:\Dev\RevNovaRepository\backend
npm run dev

# Terminal 2: Run tests
cd c:\Dev\RevNovaRepository\backend
npm test

# Terminal 3: Database queries
psql -U postgres -d revnova_dev
```

### For Developer 2 (Frontend):
```powershell
# Terminal 1: Frontend dev server
cd c:\Dev\RevNovaRepository\frontend
npm run dev

# Terminal 2: Run tests
cd c:\Dev\RevNovaRepository\frontend
npm test

# Browser: http://localhost:5173
```

### For Developer 3 (DevOps):
```powershell
# Terminal 1: Docker containers
docker-compose up

# Terminal 2: Run tests
npm run test:e2e

# Monitor logs
docker-compose logs -f
```

## Quick Start Commands

### Start All Services (Run in Order):
```powershell
# Terminal 1: Backend
cd c:\Dev\RevNovaRepository\backend ; npm run dev

# Terminal 2: Frontend
cd c:\Dev\RevNovaRepository\frontend ; npm run dev

# Terminal 3: Monitor (optional)
cd c:\Dev\RevNovaRepository ; npm run test:watch
```

### Stop All Services:
- Press `Ctrl + C` in each terminal
- Or close all PowerShell windows

## Verify Everything is Running

Run this command to check all ports:
```powershell
netstat -ano | findstr ":3000 :5173 :5432 :6379"
```

**Expected Output:**
```
TCP    0.0.0.0:3000     # Backend
TCP    0.0.0.0:5173     # Frontend
TCP    0.0.0.0:5432     # PostgreSQL
TCP    0.0.0.0:6379     # Redis
```

---

## Next Steps

Once setup is complete:
1. ✅ Backend running on port 3000
2. ✅ Frontend running on port 5173
3. ✅ PostgreSQL running on port 5432
4. ✅ Redis running on port 6379

**Then proceed with your assigned daily tasks!**

- **Developer 1:** Continue with backend API development
- **Developer 2:** Continue with frontend UI development
- **Developer 3:** Set up CI/CD and testing

---

**Questions?** Check the onboarding pages for your role:
- Dev1: http://localhost:5173/Onboarding/dev1-day01.html
- Dev2: http://localhost:5173/Onboarding/dev2-day01.html
- Dev3: http://localhost:5173/Onboarding/dev3-day01.html
