<#
Install workspace recommended extensions listed in .vscode/extensions.json

Usage (PowerShell):
  # from repo root
  powershell -ExecutionPolicy Bypass -File .\scripts\install-extensions.ps1

This script requires the `code` CLI available in PATH. On Windows, if `code` is not found
open VS Code and enable the 'code' command in PATH or reinstall VS Code with the option
to add it to PATH. Alternatively use the 'Extensions: Install Workspace Recommended Extensions'
command inside VS Code (Ctrl+Shift+P).
#>

Param(
    [string]$RepoRoot = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

Push-Location $RepoRoot
try {
    $extFile = Join-Path $RepoRoot ".vscode\extensions.json"
    if (-not (Test-Path $extFile)) {
        Write-Error "File not found: $extFile"
        exit 1
    }

    $json = Get-Content $extFile -Raw | ConvertFrom-Json
    $recs = $json.recommendations
    if (-not $recs -or $recs.Count -eq 0) {
        Write-Host "No recommended extensions found in $extFile"
        exit 0
    }

    if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
        Write-Warning "'code' CLI not found in PATH. Install it or run the 'Install Workspace Recommended Extensions' command inside VS Code."
    }

    foreach ($ext in $recs) {
        Write-Host "Installing extension: $ext"
        & code --install-extension $ext --force 2>&1
    }

    Write-Host "Done installing recommended extensions."
}
finally {
    Pop-Location
}
