# Fix sidebar CSS on all onboarding day pages
$onboardingPath = "c:\Dev\RevNovaRepository\docs\Onboarding"

# The complete sidebar CSS that should be in every page
$completeSidebarCSS = @"
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
        
        .onboarding-layout {
            display: flex;
            min-height: calc(100vh - 80px);
            margin-top: 80px;
        }
        
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
        
        .sidebar h3:first-child { margin-top: 0; }
        
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
        
        .sidebar ul ul {
            padding-left: 0;
        }
        
        .sidebar ul ul li a {
            padding-left: 2.5rem;
            font-size: 0.9rem;
        }
        
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
    </style>
"@

# Pattern to find the old compressed style tag
$oldStylePattern = '<style>body\{font-family.*?</style>'

# Get all dev day HTML files
$files = Get-ChildItem -Path $onboardingPath -Filter "dev*-day*.html"

Write-Host "Found $($files.Count) day files to update" -ForegroundColor Cyan

$updatedCount = 0
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if it has the old compressed style
    if ($content -match $oldStylePattern) {
        Write-Host "Updating $($file.Name)..." -ForegroundColor Yellow
        
        # Replace the old style tag with the complete one
        $newContent = $content -replace $oldStylePattern, $completeSidebarCSS
        
        # Write back to file
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        
        $updatedCount++
        Write-Host "  ✓ Updated $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  - Skipping $($file.Name) (already has complete styles or different format)" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Complete! Updated $updatedCount files" -ForegroundColor Green
Write-Host "Now commit and push the changes" -ForegroundColor Cyan
