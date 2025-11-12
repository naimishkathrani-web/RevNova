# PowerShell script to add git pull instruction to all Week 2-5 onboarding pages

$gitPullSection = @'
        <div class="step-card" style="background:#fffbea;border-left:4px solid #f59e0b;">
            <h2>⚠️ IMPORTANT: Start of Day Checklist</h2>
            <p><strong>Before starting today's work, run these commands:</strong></p>
            <div style="background:#2d2d2d;color:#f8f8f2;padding:1rem;border-radius:6px;font-family:monospace;margin:1rem 0;">
cd C:\Dev\RevNovaRepository<br>
git pull origin main
            </div>
            <p>This ensures you have the latest code from your teammates. Always pull before starting work!</p>
        </div>

'@

$onboardingPath = "c:\Dev\RevNovaRepository\docs\Onboarding"

# Days 7-25 for all 3 developers
$days = 7..25
$devs = 1..3

foreach ($dev in $devs) {
    foreach ($day in $days) {
        $dayFile = Join-Path $onboardingPath "dev$dev-day$('{0:D2}' -f $day).html"
        
        if (Test-Path $dayFile) {
            Write-Host "Processing $dayFile..."
            
            $content = Get-Content $dayFile -Raw
            
            # Find the day-header closing tag and insert the git pull section after it
            $pattern = '(<div class="day-header">.*?</div>)\s*(<div class="step-card">)'
            if ($content -match $pattern) {
                $newContent = $content -replace $pattern, "`$1`n`n$gitPullSection`$2"
                Set-Content -Path $dayFile -Value $newContent -NoNewline
                Write-Host "  Updated $dayFile"
            }
        }
    }
}

Write-Host ""
Write-Host "Done! Updated all Day 7-25 files for all 3 developers."
