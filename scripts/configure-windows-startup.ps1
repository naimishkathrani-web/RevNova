# Register RevNova Auto-Startup with Windows Task Scheduler
# Run this script as Administrator

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      RevNova Windows Startup Configuration                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Task details
$taskName = "RevNova-AutoStart"
$taskDescription = "Automatically start RevNova development environment (VS Code + Backend + Frontend + Monitor)"
$scriptPath = "C:\Dev\RevNovaRepository\scripts\startup-revnova.ps1"
$vbsPath = "C:\Dev\RevNovaRepository\scripts\startup-revnova.vbs"

# Get current user
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "   Task Name: $taskName" -ForegroundColor White
Write-Host "   User: $currentUser" -ForegroundColor White
Write-Host "   Script: $scriptPath" -ForegroundColor White
Write-Host ""

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "⚠️  Task already exists. Removing old task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "✅ Old task removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Creating scheduled task..." -ForegroundColor Yellow

# Create action - Run VBScript (silent mode)
$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$vbsPath`""

# Create trigger - At user logon
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $currentUser

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -DontStopOnIdleEnd

# Create principal (run with highest privileges)
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Highest

# Register the task
try {
    Register-ScheduledTask `
        -TaskName $taskName `
        -Description $taskDescription `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Force | Out-Null
    
    Write-Host "✅ Scheduled task created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create scheduled task:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║             🎉 Auto-Startup Configured!                      ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "What happens on Windows startup:" -ForegroundColor Cyan
Write-Host "  1️⃣  Waits 5 seconds for system initialization" -ForegroundColor White
Write-Host "  2️⃣  Opens VS Code with RevNova repository" -ForegroundColor White
Write-Host "  3️⃣  Starts Backend server (port 3000)" -ForegroundColor White
Write-Host "  4️⃣  Starts Frontend server (port 5173)" -ForegroundColor White
Write-Host "  5️⃣  Opens Service Monitor terminal" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  View task:" -ForegroundColor White
Write-Host "    Get-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
Write-Host ""
Write-Host "  Disable auto-start:" -ForegroundColor White
Write-Host "    Disable-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
Write-Host ""
Write-Host "  Enable auto-start:" -ForegroundColor White
Write-Host "    Enable-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
Write-Host ""
Write-Host "  Remove auto-start:" -ForegroundColor White
Write-Host "    Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor Gray
Write-Host ""
Write-Host "  Test now (without restarting):" -ForegroundColor White
Write-Host "    Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Enter to test the startup now..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "🚀 Testing startup script..." -ForegroundColor Cyan
Start-ScheduledTask -TaskName $taskName

Write-Host ""
Write-Host "✅ Startup script launched!" -ForegroundColor Green
Write-Host "Check for VS Code and 3 PowerShell terminals opening..." -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to close this window"
