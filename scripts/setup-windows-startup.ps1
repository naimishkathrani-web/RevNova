# Configure Windows to Auto-Start RevNova on Boot
# Run this as Administrator

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     RevNova Windows Auto-Startup Configuration               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "  1. Right-click PowerShell" -ForegroundColor White
    Write-Host "  2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "  3. Run: .\scripts\setup-windows-startup.ps1" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

$taskName = "RevNova-AutoStart"
$scriptPath = "C:\Dev\RevNovaRepository\scripts\startup-simple.ps1"
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Task Name: $taskName" -ForegroundColor White
Write-Host "  User: $currentUser" -ForegroundColor White
Write-Host "  Script: $scriptPath" -ForegroundColor White
Write-Host ""

# Remove existing task
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "✅ Removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Creating scheduled task..." -ForegroundColor Yellow

# Action
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""

# Trigger
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $currentUser

# Settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Principal
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Highest

# Register
try {
    Register-ScheduledTask -TaskName $taskName -Description "Auto-start RevNova dev environment (VS Code + Backend + Frontend + Monitor)" -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
    Write-Host "✅ Task created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              🎉 Auto-Startup Configured!                     ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "RevNova will now start automatically when you log in!" -ForegroundColor White
Write-Host ""
Write-Host "What starts:" -ForegroundColor Cyan
Write-Host "  • Backend server (port 3000)" -ForegroundColor White
Write-Host "  • Frontend server (port 5173)" -ForegroundColor White
Write-Host "  • Service monitor terminal" -ForegroundColor White
Write-Host ""
Write-Host "Management Commands:" -ForegroundColor Yellow
Write-Host "  Disable: Disable-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
Write-Host "  Enable:  Enable-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
Write-Host "  Remove:  Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor Gray
Write-Host "  Status:  Get-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
Write-Host ""
Write-Host "Test now? (Y/N): " -ForegroundColor Yellow -NoNewline
$test = Read-Host

if ($test -eq 'Y' -or $test -eq 'y') {
    Write-Host ""
    Write-Host "🚀 Starting RevNova..." -ForegroundColor Cyan
    Start-ScheduledTask -TaskName $taskName
    Write-Host "✅ Started! Check for new PowerShell windows..." -ForegroundColor Green
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Done! Press Enter to close..." -ForegroundColor Gray
Read-Host
