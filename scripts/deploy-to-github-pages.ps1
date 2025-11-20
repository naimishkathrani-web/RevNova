# Deploy React App to GitHub Pages (docs/app/)
# This script builds the React app and copies it to docs/app/ for GitHub Pages hosting

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RevNova - GitHub Pages Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location -Path "$PSScriptRoot\..\frontend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Dependency installation failed!" -ForegroundColor Red
        exit 1
    }
}

# Set base path for GitHub Pages subdirectory
$env:VITE_BASE_PATH = "/RevNova/app/"

Write-Host "Building React app for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""

# Navigate to repository root
Set-Location -Path "$PSScriptRoot\.."

# Create docs/app directory if it doesn't exist
$appDir = "docs\app"
if (Test-Path $appDir) {
    Write-Host "Removing old app directory..." -ForegroundColor Yellow
    Remove-Item -Path $appDir -Recurse -Force
}

Write-Host "Creating app directory..." -ForegroundColor Yellow
New-Item -Path $appDir -ItemType Directory -Force | Out-Null

# Copy build files to docs/app
Write-Host "Copying build files to docs/app/..." -ForegroundColor Yellow
Copy-Item -Path "frontend\dist\*" -Destination $appDir -Recurse -Force

Write-Host "✅ Files copied successfully!" -ForegroundColor Green
Write-Host ""

# Create .nojekyll file if it doesn't exist (prevents GitHub Pages from ignoring _files)
$nojekyllPath = "docs\.nojekyll"
if (-not (Test-Path $nojekyllPath)) {
    Write-Host "Creating .nojekyll file..." -ForegroundColor Yellow
    New-Item -Path $nojekyllPath -ItemType File -Force | Out-Null
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Preparation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review changes: git status" -ForegroundColor White
Write-Host "2. Commit changes: git add docs/app && git commit -m 'Deploy React app'" -ForegroundColor White
Write-Host "3. Push to GitHub: git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "Your app will be available at:" -ForegroundColor Yellow
Write-Host "https://naimishkathrani-web.github.io/RevNova/app/" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to commit and push automatically
$response = Read-Host "Do you want to commit and push now? (y/N)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Committing changes..." -ForegroundColor Yellow
    
    git add docs/app docs/.nojekyll
    git commit -m "Deploy React app to GitHub Pages"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Changes committed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
        git push origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Your app will be live in 1-2 minutes at:" -ForegroundColor Yellow
            Write-Host "https://naimishkathrani-web.github.io/RevNova/app/" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Push failed. Please push manually." -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Commit failed. Please review and commit manually." -ForegroundColor Red
    }
} else {
    Write-Host "Deployment files are ready. Commit and push when ready!" -ForegroundColor Yellow
}

Write-Host ""
