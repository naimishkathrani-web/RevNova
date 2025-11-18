@echo off
REM RevNova Auto-Startup Batch File
REM This runs the PowerShell startup script

echo Starting RevNova Development Environment...
echo.

REM Change to repository directory
cd /d "C:\Dev\RevNovaRepository"

REM Run PowerShell script with execution policy bypass
PowerShell.exe -ExecutionPolicy Bypass -File "C:\Dev\RevNovaRepository\scripts\startup-revnova.ps1"

exit
