<#
Enable installed VS Code extensions via the `code` CLI.

Usage (PowerShell):
  # enable all installed extensions
  powershell -ExecutionPolicy Bypass -File .\scripts\enable-extensions.ps1

  # enable only workspace-recommended extensions
  powershell -ExecutionPolicy Bypass -File .\scripts\enable-extensions.ps1 -UseRecommendations

Notes:
  - Requires the `code` CLI in PATH (the VS Code command-line). If not found, run the 'Install Workspace Recommended Extensions'
    command inside VS Code or add the VS Code bin folder to PATH.
  - This will run `code --enable-extension <id>` for each extension. No extensions are uninstalled.
#>

param(
    [switch]$UseRecommendations,
    [string]$RepoRoot = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

Push-Location $RepoRoot
try {
    if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
        Write-Warning "'code' CLI not found in PATH. Please add VS Code's bin to PATH or run the 'Install Workspace Recommended Extensions' command inside VS Code."
        exit 1
    }

    if ($UseRecommendations) {
        $extFile = Join-Path $RepoRoot ".vscode\extensions.json"
        if (-not (Test-Path $extFile)) {
            Write-Error "Workspace recommendations file not found: $extFile"
            exit 1
        }
        $json = Get-Content $extFile -Raw | ConvertFrom-Json
        $toEnable = $json.recommendations
        if (-not $toEnable -or $toEnable.Count -eq 0) {
            Write-Host "No recommendations found in $extFile"
            exit 0
        }
    }
    else {
        $toEnable = & code --list-extensions
    }

    if (-not $toEnable -or $toEnable.Count -eq 0) {
        Write-Host "No extensions to enable."
        exit 0
    }

    foreach ($ext in $toEnable) {
        $id = $ext.Trim()
        if ($id -eq '') { continue }
        Write-Host "Enabling: $id"
        & code --enable-extension $id 2>&1 | ForEach-Object { Write-Host $_ }
    }

    Write-Host "All requested extensions processed."
}
finally {
    Pop-Location
}
