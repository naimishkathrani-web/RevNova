# One-Click Repository Setup Script
# Creates RevNova-Dev and RevNova-Test repositories and configures remotes
# Run: .\scripts\create-repos.ps1

param(
    [string]$Owner = "naimishkathrani-web",
    [switch]$DryRun
)

Write-Host ""
Write-Host "RevNova Repository Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check for gh CLI (skip in DryRun)
if (-not $DryRun) {
    $ghCmd = Get-Command gh -ErrorAction SilentlyContinue
    if (-not $ghCmd) {
        Write-Host "ERROR: GitHub CLI (gh) is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Install from: https://cli.github.com/ (Windows MSI)" -ForegroundColor Yellow
        Write-Host "Or via winget: winget install --id GitHub.cli -e" -ForegroundColor Yellow
        exit 1
    }

    $ghVersion = gh --version 2>&1
    Write-Host "GitHub CLI found: $($ghVersion | Select-Object -First 1)" -ForegroundColor Green
    Write-Host ""

    # Check gh authentication
    gh auth status *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Not authenticated with GitHub CLI" -ForegroundColor Red
        Write-Host "Please run: gh auth login (use HTTPS + browser login)" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "GitHub authentication OK" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[DRY RUN] Skipping GitHub CLI checks" -ForegroundColor Yellow
}

# Display plan
Write-Host "This script will:" -ForegroundColor White
Write-Host "  1. Create repository: $Owner/RevNova-Dev" -ForegroundColor White
Write-Host "  2. Create repository: $Owner/RevNova-Test" -ForegroundColor White
Write-Host "  3. Add git remote 'dev' pointing to RevNova-Dev" -ForegroundColor White
Write-Host "  4. Add git remote 'test' pointing to RevNova-Test" -ForegroundColor White
Write-Host "  5. Push current code to both repositories" -ForegroundColor White
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN MODE - No changes will be made]" -ForegroundColor Yellow
    Write-Host ""
} else {
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne 'y') {
        Write-Host "Setup cancelled" -ForegroundColor Red
        exit 0
    }
    Write-Host ""
}

# Step 1: Create RevNova-Dev
Write-Host "Step 1: Creating RevNova-Dev..." -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "[DRY RUN] Would create: $Owner/RevNova-Dev" -ForegroundColor Yellow
} else {
    $devExists = gh repo view "$Owner/RevNova-Dev" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Repository $Owner/RevNova-Dev already exists" -ForegroundColor Yellow
    } else {
        gh repo create "$Owner/RevNova-Dev" --public --description "RevNova Development Repository"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Created $Owner/RevNova-Dev" -ForegroundColor Green
        } else {
            Write-Host "Failed to create $Owner/RevNova-Dev" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""

# Step 2: Create RevNova-Test
Write-Host "Step 2: Creating RevNova-Test..." -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "[DRY RUN] Would create: $Owner/RevNova-Test" -ForegroundColor Yellow
} else {
    $testExists = gh repo view "$Owner/RevNova-Test" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Repository $Owner/RevNova-Test already exists" -ForegroundColor Yellow
    } else {
        gh repo create "$Owner/RevNova-Test" --public --description "RevNova Testing Repository"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Created $Owner/RevNova-Test" -ForegroundColor Green
        } else {
            Write-Host "Failed to create $Owner/RevNova-Test" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""

# Step 3: Add dev remote
Write-Host "Step 3: Adding git remote 'dev'..." -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "[DRY RUN] Would add remote: dev" -ForegroundColor Yellow
} else {
    $devRemote = git remote get-url dev 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Remote 'dev' already exists: $devRemote" -ForegroundColor Yellow
    } else {
        git remote add dev "https://github.com/$Owner/RevNova-Dev.git"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Added remote 'dev'" -ForegroundColor Green
        } else {
            Write-Host "Failed to add remote 'dev'" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Step 4: Add test remote
Write-Host "Step 4: Adding git remote 'test'..." -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "[DRY RUN] Would add remote: test" -ForegroundColor Yellow
} else {
    $testRemote = git remote get-url test 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Remote 'test' already exists: $testRemote" -ForegroundColor Yellow
    } else {
        git remote add test "https://github.com/$Owner/RevNova-Test.git"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Added remote 'test'" -ForegroundColor Green
        } else {
            Write-Host "Failed to add remote 'test'" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Step 5: Push to dev
Write-Host "Step 5: Pushing code to dev remote..." -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "[DRY RUN] Would push to: dev" -ForegroundColor Yellow
} else {
    git push dev main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Pushed to dev" -ForegroundColor Green
    } else {
        Write-Host "Failed to push to dev - this is OK if it's the first push" -ForegroundColor Yellow
        Write-Host "You may need to run: git push -u dev main" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 6: Push to test
Write-Host "Step 6: Pushing code to test remote..." -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "[DRY RUN] Would push to: test" -ForegroundColor Yellow
} else {
    git push test main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Pushed to test" -ForegroundColor Green
    } else {
        Write-Host "Failed to push to test - this is OK if it's the first push" -ForegroundColor Yellow
        Write-Host "You may need to run: git push -u test main" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Configure branch protection for main branch in each repo" -ForegroundColor White
Write-Host "     - Go to: https://github.com/$Owner/RevNova-Dev/settings/branches" -ForegroundColor Cyan
Write-Host "     - Go to: https://github.com/$Owner/RevNova-Test/settings/branches" -ForegroundColor Cyan
Write-Host "     - Enable: Require pull request reviews (1 approval)" -ForegroundColor White
Write-Host "     - Enable: Require status checks to pass before merging" -ForegroundColor White
Write-Host ""
Write-Host "  2. Add collaborators to RevNova-Dev" -ForegroundColor White
Write-Host "     - Go to: https://github.com/$Owner/RevNova-Dev/settings/access" -ForegroundColor Cyan
Write-Host "     - Click 'Add people' and give them Write permission" -ForegroundColor White
Write-Host ""
Write-Host "  3. Verify remotes:" -ForegroundColor White
Write-Host "     git remote -v" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your developers should clone: https://github.com/$Owner/RevNova-Dev" -ForegroundColor Cyan
Write-Host ""
