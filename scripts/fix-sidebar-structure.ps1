# Fix Sidebar Structure for All Onboarding Pages
# This script converts span-based week headers to proper collapsible structure

$onboardingDir = "docs\Onboarding"
$files = Get-ChildItem -Path $onboardingDir -Filter "dev*-day*.html"

Write-Host "Found $($files.Count) files to process" -ForegroundColor Cyan

$pattern = @'
            <h3>Developer 1: Daily Tasks</h3>
            <ul>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 1: Backend Setup</span>
'@

$replacement = @'
            <h3>Developer 1: Daily Tasks</h3>
            <ul class="week-list">
                <li class="week-section">
                    <button class="week-toggle" aria-expanded="false">
                        <span class="chevron">▶</span>
                        <span class="week-title">Week 1: Backend Setup</span>
                    </button>
'@

$count = 0
foreach ($file in $files) {
    $filePath = $file.FullName
    Write-Host "Processing $($file.Name)..." -ForegroundColor Yellow
    
    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    # Replace all week headers with button-based structure
    $newContent = $content -replace '<li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0\.6rem 0;">Week (\d+): ([^<]+)</span>', '<li class="week-section"><button class="week-toggle" aria-expanded="false"><span class="chevron">▶</span><span class="week-title">Week $1: $2</span></button>'
    
    if ($content -ne $newContent) {
        Set-Content -Path $filePath -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Updated $($file.Name)" -ForegroundColor Green
        $count++
    } else {
        Write-Host "  - No changes needed" -ForegroundColor Gray
    }
}

Write-Host "`nComplete! Updated $count files" -ForegroundColor Green
