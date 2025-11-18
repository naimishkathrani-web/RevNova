# COMPLETE SIDEBAR FIX - Structure + CSS
# Converts span-based weeks to collapsible buttons AND updates CSS

$onboardingDir = "docs\Onboarding"
$files = Get-ChildItem -Path $onboardingDir -Filter "dev*-day*.html"

Write-Host "`n=== COMPLETE SIDEBAR FIX ===" -ForegroundColor Cyan
Write-Host "Found $($files.Count) files to process`n" -ForegroundColor White

# Complete CSS with collapsible week styles
$completeSidebarCSS = @'
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.onboarding-layout {
    display: flex;
    min-height: calc(100vh - 80px);
    margin-top: 80px;
}

/* SIDEBAR - FIXED POSITION, NEVER MOVES */
.sidebar {
    width: 280px;
    background: #f8f9fa;
    border-right: 1px solid #e0e0e0;
    padding: 2rem 0;
    position: fixed;
    left: 0;
    top: 80px;
    height: calc(100vh - 80px);
    overflow-y: auto;
    z-index: 100;
}

.sidebar h3 {
    padding: 0 1.5rem;
    font-size: 0.85rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 1.5rem 0 0.5rem;
}

.sidebar h3:first-child {
    margin-top: 0;
}

/* Base list styles */
.sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar ul li a {
    display: block;
    padding: 0.6rem 1.5rem;
    color: #333;
    text-decoration: none;
    font-size: 0.95rem;
    transition: all 0.2s;
}

.sidebar ul li a:hover {
    background: #e9ecef;
    color: #11998e;
}

.sidebar ul li a.active {
    background: #667eea;
    color: #fff;
    font-weight: 500;
}

/* Week Section Styles */
.sidebar .week-list {
    padding: 0;
    margin: 0;
}

.sidebar .week-section {
    list-style: none;
    margin: 0;
}

.sidebar .week-toggle {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.6rem 1.5rem;
    background: none;
    border: none;
    color: #333;
    font-weight: 600;
    font-size: 0.95rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
}

.sidebar .week-toggle:hover {
    background: #e9ecef;
    color: #11998e;
}

.sidebar .week-toggle .chevron {
    display: inline-block;
    margin-right: 0.5rem;
    font-size: 0.7rem;
    transition: transform 0.2s;
    transform: rotate(0deg);
}

.sidebar .week-section.expanded .week-toggle .chevron {
    transform: rotate(90deg);
}

.sidebar .week-toggle .week-title {
    flex: 1;
}

/* Hide day lists by default */
.sidebar .week-section > ul {
    display: none;
    padding-left: 0;
    margin: 0;
}

/* Show day lists when expanded */
.sidebar .week-section.expanded > ul {
    display: block;
}

/* Day link styles (nested under weeks) */
.sidebar .week-section > ul li {
    list-style: none;
}

.sidebar .week-section > ul li a {
    padding-left: 3rem;
    font-size: 0.9rem;
    font-weight: normal;
}

/* Main content area */
.main-content {
    flex: 1;
    margin-left: 280px;
    padding: 3rem;
    background: #fff;
    min-width: 0;
}

.day-header {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: #fff;
    padding: 1.5rem;
    border-radius: 10px;
    margin-bottom: 1rem;
}

.step-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.nav-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
    .sidebar {
        position: relative;
        width: 100%;
        height: auto;
        top: 0;
    }
    
    .main-content {
        margin-left: 0;
    }
    
    .onboarding-layout {
        flex-direction: column;
    }
}
'@

$count = 0
$structureFixed = 0
$cssUpdated = 0

foreach ($file in $files) {
    $filePath = $file.FullName
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $originalContent = $content
    $changes = @()
    
    # FIX 1: Convert span-based week headers to button structure
    if ($content -match '<li class="has-children"><span style="font-weight:600') {
        $content = $content -replace '<li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0\.6rem 0;">Week (\d+): ([^<]+)</span>', '<li class="week-section"><button class="week-toggle" aria-expanded="false"><span class="chevron">▶</span><span class="week-title">Week $1: $2</span></button>'
        $changes += "  ✓ Fixed week header structure"
        $structureFixed++
    }
    
    # FIX 2: Update class name for ul containing weeks
    if ($content -match '<h3>Developer [123]: Daily Tasks</h3>\s*<ul>') {
        $content = $content -replace '(<h3>Developer [123]: Daily Tasks</h3>\s*)<ul>', '$1<ul class="week-list">'
        $changes += "  ✓ Added week-list class"
    }
    
    # FIX 3: Replace old CSS with complete collapsible CSS
    if ($content -match '<style>.*?\.sidebar.*?</style>') {
        $content = $content -replace '<style>.*?</style>', "<style>`n$completeSidebarCSS`n    </style>"
        $changes += "  ✓ Updated CSS with collapsible styles"
        $cssUpdated++
    }
    
    # Save if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host ($changes -join "`n") -ForegroundColor Green
        $count++
    } else {
        Write-Host "  - No changes needed" -ForegroundColor Gray
    }
    
    Write-Host ""
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total files processed: $($files.Count)" -ForegroundColor White
Write-Host "Files updated: $count" -ForegroundColor Green
Write-Host "Structure fixes: $structureFixed" -ForegroundColor Green
Write-Host "CSS updates: $cssUpdated" -ForegroundColor Green
Write-Host "`n✓ Complete! Sidebar is now collapsible and fixed." -ForegroundColor Green
