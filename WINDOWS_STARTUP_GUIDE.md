# RevNova Windows Auto-Startup Configuration

## 🎯 Overview

This setup ensures RevNova development environment automatically starts every time Windows boots, with:
- VS Code opening the repository
- Backend server running on port 3000
- Frontend server running on port 5173
- Service monitoring terminal
- All 3 developer terminals ready

---

## 📁 Files Created

### 1. **startup-revnova.ps1** (Main Startup Script)
- Opens VS Code with repository
- Starts 3 PowerShell terminals for all developers
- Installs/updates npm dependencies
- Starts backend and frontend servers
- Provides service monitoring terminal

### 2. **startup-revnova.bat** (Batch Wrapper)
- Calls the PowerShell script with proper execution policy
- Used for compatibility with Task Scheduler

### 3. **startup-revnova.vbs** (Silent Launcher)
- Runs the batch file without showing a command window
- Provides clean startup experience

### 4. **configure-windows-startup.ps1** (Configuration Script)
- Registers Windows Task Scheduler task
- Configures auto-start on user logon
- Must be run as Administrator

---

## 🚀 Setup Instructions

### Step 1: Configure Auto-Startup (One-Time Setup)

Run this command in PowerShell **as Administrator**:

```powershell
cd C:\Dev\RevNovaRepository
.\scripts\configure-windows-startup.ps1
```

This will:
1. ✅ Check Administrator privileges
2. ✅ Remove any existing auto-start task
3. ✅ Create new scheduled task named "RevNova-AutoStart"
4. ✅ Configure it to run at user logon
5. ✅ Test the startup immediately

### Step 2: Verify Configuration

Check the task was created:

```powershell
Get-ScheduledTask -TaskName "RevNova-AutoStart"
```

Expected output:
```
TaskPath  TaskName             State
--------  --------             -----
\         RevNova-AutoStart    Ready
```

---

## 🎮 What Happens on Windows Startup

1. **Wait** (5 seconds) - System initialization
2. **VS Code Opens** - With C:\Dev\RevNovaRepository
3. **Terminal 1** - Backend Server (Developer 1)
   - Install dependencies: `npm install`
   - Start server: `npm run dev`
   - URL: http://localhost:3000
4. **Terminal 2** - Frontend Server (Developer 2)
   - Install dependencies: `npm install`
   - Start server: `npm run dev`
   - URL: http://localhost:5173
5. **Terminal 3** - Service Monitor (Developer 3)
   - Monitors all service ports
   - Interactive commands: `status`, `health`, `full`

---

## 🔧 Management Commands

### Test Startup Now (Without Restarting)
```powershell
Start-ScheduledTask -TaskName "RevNova-AutoStart"
```

### Disable Auto-Startup
```powershell
Disable-ScheduledTask -TaskName "RevNova-AutoStart"
```

### Enable Auto-Startup
```powershell
Enable-ScheduledTask -TaskName "RevNova-AutoStart"
```

### Remove Auto-Startup Completely
```powershell
Unregister-ScheduledTask -TaskName "RevNova-AutoStart" -Confirm:$false
```

### View Task Details
```powershell
Get-ScheduledTask -TaskName "RevNova-AutoStart" | Get-ScheduledTaskInfo
```

### View Task Properties
```powershell
Get-ScheduledTask -TaskName "RevNova-AutoStart" | Select-Object *
```

---

## 🖥️ Service Monitor Terminal Commands

Once the Service Monitor terminal is open, you can use these commands:

| Command | Description |
|---------|-------------|
| `status` | Check all service status (PostgreSQL, Redis, Backend, Frontend) |
| `health` | Test backend API health endpoint |
| `front` | Test frontend server availability |
| `full` | Complete health check (all services) |
| `restart` | Show instructions to restart services |
| `exit` | Close the monitor terminal |

---

## 📊 Service Port Mapping

| Service | Port | Technology | Developer |
|---------|------|------------|-----------|
| PostgreSQL | 5432 | PostgreSQL 16 | Developer 1 |
| Redis | 6379 | Redis 7 | Developer 1 |
| Backend API | 3000 | Express + TypeScript | Developer 1 |
| Frontend UI | 5173 | Vite + React | Developer 2 |

---

## 🔍 Troubleshooting

### Auto-Startup Not Working

**Check if task exists:**
```powershell
Get-ScheduledTask -TaskName "RevNova-AutoStart"
```

**Check last run result:**
```powershell
Get-ScheduledTask -TaskName "RevNova-AutoStart" | Get-ScheduledTaskInfo
```

**View task logs in Event Viewer:**
- Open Event Viewer
- Navigate to: Windows Logs > System
- Filter for "Task Scheduler"

### Services Not Starting

**Check Node.js is in PATH:**
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
node --version
npm --version
```

**Manually test startup script:**
```powershell
cd C:\Dev\RevNovaRepository
.\scripts\startup-revnova.ps1
```

### Ports Already in Use

**Find process using a port:**
```powershell
netstat -ano | findstr ":3000"
netstat -ano | findstr ":5173"
```

**Kill process by PID:**
```powershell
Stop-Process -Id <PID> -Force
```

### VS Code Not Opening

**Check VS Code is in PATH:**
```powershell
Get-Command code -ErrorAction SilentlyContinue
```

**If not found, add VS Code to PATH manually:**
```powershell
# Add to User PATH
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$vscodePath = "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin"
[System.Environment]::SetEnvironmentVariable("Path", "$userPath;$vscodePath", "User")
```

---

## 🛑 Manual Startup (Alternative)

If you prefer to start manually instead of auto-startup:

```powershell
cd C:\Dev\RevNovaRepository
.\scripts\startup-revnova.ps1
```

Or use the simpler version:
```powershell
.\scripts\start-all-services.ps1
```

---

## 📝 Customization

### Change Startup Delay

Edit `startup-revnova.ps1`, line 14:
```powershell
Start-Sleep -Seconds 5  # Change to desired seconds
```

### Change Service Monitor Wait Time

Edit `startup-revnova.ps1`, monitor script section:
```powershell
Start-Sleep -Seconds 30  # Change wait time before first status check
```

### Disable Specific Terminal

Comment out the terminal section in `startup-revnova.ps1`:

```powershell
# # Terminal 2: Frontend Server (Developer 2)
# Write-Host "🎨 Starting Frontend Server (Developer 2)..." -ForegroundColor Cyan
# ... (comment out the entire section)
```

---

## ✅ Verification Checklist

After configuration, verify:

- [ ] Task Scheduler shows "RevNova-AutoStart" task
- [ ] Task state is "Ready"
- [ ] Task trigger is set to "At log on"
- [ ] Task runs as current user with highest privileges
- [ ] VS Code opens on startup
- [ ] Backend terminal opens and runs `npm run dev`
- [ ] Frontend terminal opens and runs `npm run dev`
- [ ] Monitor terminal opens with status commands
- [ ] Backend accessible at http://localhost:3000
- [ ] Frontend accessible at http://localhost:5173

---

## 🔄 Update Process

If you update the startup scripts:

1. **No need to reconfigure Task Scheduler** - It automatically uses latest script
2. **Test changes manually first:**
   ```powershell
   .\scripts\startup-revnova.ps1
   ```
3. **If satisfied, restart Windows to test auto-startup**

---

## 🗑️ Complete Removal

To completely remove auto-startup:

```powershell
# Remove Task Scheduler task
Unregister-ScheduledTask -TaskName "RevNova-AutoStart" -Confirm:$false

# Optionally delete scripts
Remove-Item C:\Dev\RevNovaRepository\scripts\startup-revnova.* -Force
Remove-Item C:\Dev\RevNovaRepository\scripts\configure-windows-startup.ps1 -Force
```

---

## 📞 Support

If services aren't starting properly:

1. Check SERVICE_STATUS.md for detailed status
2. Check QUICK_START.md for manual setup
3. Run DEVELOPMENT_SETUP.md instructions
4. Review terminal output for specific error messages

---

**Last Updated:** November 18, 2025  
**Repository:** C:\Dev\RevNovaRepository  
**Task Name:** RevNova-AutoStart
