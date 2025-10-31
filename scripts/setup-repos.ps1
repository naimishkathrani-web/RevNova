# RevNova Repository Setup Script
# This script creates the Dev and Test repositories and configures branch protection
# Run this from the RevNovaRepository directory

param(
    [string]$Owner = "naimishkathrani-web",
    [switch]$DryRun = $false
)

Write-Host "🚀 RevNova Repository Setup Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if gh CLI is installed
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if authenticated
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated with GitHub CLI." -ForegroundColor Red
    Write-Host "Please run: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ GitHub CLI is installed and authenticated" -ForegroundColor Green
Write-Host ""

# Function to create repository
function New-Repository {
    param(
        [string]$RepoName,
        [string]$Description
    )
    
    Write-Host "📦 Creating repository: $Owner/$RepoName" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "[DRY RUN] Would create: $Owner/$RepoName" -ForegroundColor Yellow
        return $true
    }
    
    # Check if repo already exists
    $existingRepo = gh repo view "$Owner/$RepoName" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⚠️  Repository $Owner/$RepoName already exists" -ForegroundColor Yellow
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne 'y') {
            return $false
        }
    } else {
        # Create the repository
        gh repo create "$Owner/$RepoName" --public --description "$Description"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Created $Owner/$RepoName" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create $Owner/$RepoName" -ForegroundColor Red
            return $false
        }
    }
    
    return $true
}

# Function to add remote
function Add-GitRemote {
    param(
        [string]$RemoteName,
        [string]$RepoName
    )
    
    Write-Host "🔗 Adding remote: $RemoteName -> $Owner/$RepoName" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "[DRY RUN] Would add remote: $RemoteName" -ForegroundColor Yellow
        return
    }
    
    # Check if remote already exists
    $existingRemote = git remote get-url $RemoteName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⚠️  Remote '$RemoteName' already exists: $existingRemote" -ForegroundColor Yellow
    } else {
        git remote add $RemoteName "https://github.com/$Owner/$RepoName.git"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Added remote: $RemoteName" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to add remote: $RemoteName" -ForegroundColor Red
        }
    }
}

# Function to push to remote
function Push-ToRemote {
    param(
        [string]$RemoteName
    )
    
    Write-Host "📤 Pushing to remote: $RemoteName" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "[DRY RUN] Would push to: $RemoteName" -ForegroundColor Yellow
        return
    }
    
    git push $RemoteName main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Pushed to $RemoteName" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push to $RemoteName" -ForegroundColor Red
    }
}

# Function to configure branch protection
function Set-BranchProtection {
    param(
        [string]$RepoName,
        [bool]$EnforceAdmins = $false
    )
    
    Write-Host "🛡️  Configuring branch protection for: $Owner/$RepoName" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "[DRY RUN] Would configure branch protection" -ForegroundColor Yellow
        return
    }
    
    $enforceAdminsStr = if ($EnforceAdmins) { "true" } else { "false" }
    
    # Note: This is a simplified version. Full configuration may need to be done via web UI
    Write-Host "Branch protection must be configured manually via GitHub UI" -ForegroundColor Yellow
    Write-Host "   Go to: https://github.com/$Owner/$RepoName/settings/branches" -ForegroundColor Yellow
}

# Main execution
Write-Host "This script will:" -ForegroundColor White
Write-Host "  1. Create RevNova-Dev repository" -ForegroundColor White
Write-Host "  2. Create RevNova-Test repository" -ForegroundColor White
Write-Host "  3. Add git remotes dev and test" -ForegroundColor White
Write-Host "  4. Push current code to both repos" -ForegroundColor White
Write-Host "  5. Guide you through branch protection setup" -ForegroundColor White
Write-Host ""

if (!$DryRun) {
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne 'y') {
        Write-Host "Setup cancelled" -ForegroundColor Red
        exit 0
    }
}

Write-Host ""
Write-Host "Starting setup..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Create RevNova-Dev
if (New-Repository -RepoName "RevNova-Dev" -Description "RevNova Development Repository") {
    Add-GitRemote -RemoteName "dev" -RepoName "RevNova-Dev"
    Push-ToRemote -RemoteName "dev"
}

Write-Host ""

# Step 2: Create RevNova-Test
if (New-Repository -RepoName "RevNova-Test" -Description "RevNova Testing/Staging Repository") {
    Add-GitRemote -RemoteName "test" -RepoName "RevNova-Test"
    Push-ToRemote -RemoteName "test"
}

Write-Host ""

# Step 3: Configure branch protection (manual step)
Write-Host "Branch Protection Setup" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please configure branch protection manually for each repository:" -ForegroundColor Yellow
Write-Host ""
Write-Host "For RevNova-Dev:" -ForegroundColor White
Write-Host "  1. Go to: https://github.com/$Owner/RevNova-Dev/settings/branches" -ForegroundColor Cyan
Write-Host "  2. Click 'Add branch protection rule'" -ForegroundColor White
Write-Host "  3. Branch name pattern: main" -ForegroundColor White
Write-Host "  4. Enable: Require pull request reviews with 1 approval" -ForegroundColor White
Write-Host "  5. Enable: Require status checks ci/test and ci/lint" -ForegroundColor White
Write-Host ""
Write-Host "For RevNova-Test:" -ForegroundColor White
Write-Host "  1. Go to: https://github.com/$Owner/RevNova-Test/settings/branches" -ForegroundColor Cyan
Write-Host "  2. Same settings as RevNova-Dev" -ForegroundColor White
Write-Host ""
Write-Host "For RevNova (Production):" -ForegroundColor White
Write-Host "  1. Go to: https://github.com/$Owner/RevNova/settings/branches" -ForegroundColor Cyan
Write-Host "  2. Same settings as above" -ForegroundColor White
Write-Host "  3. Additionally enable: Do not allow bypassing settings - enforce for admins" -ForegroundColor White
Write-Host ""

# Step 4: Add collaborators
Write-Host "Adding Collaborators" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To add developers to RevNova-Dev:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://github.com/$Owner/RevNova-Dev/settings/access" -ForegroundColor Cyan
Write-Host "  2. Click Add people" -ForegroundColor White
Write-Host "  3. Add each developer with Write permission" -ForegroundColor White
Write-Host ""
Write-Host "Or use gh CLI:" -ForegroundColor Yellow
Write-Host "  gh api repos/$Owner/RevNova-Dev/collaborators/USERNAME -X PUT -f permission=push" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Configure branch protection (see above)" -ForegroundColor White
Write-Host "  2. Add collaborators to RevNova-Dev" -ForegroundColor White
Write-Host "  3. Share onboarding docs with developers" -ForegroundColor White
Write-Host "  4. Verify remotes with: git remote -v" -ForegroundColor White
Write-Host ""
Write-Host "Your developers should clone: https://github.com/$Owner/RevNova-Dev" -ForegroundColor Cyan
Write-Host ""
