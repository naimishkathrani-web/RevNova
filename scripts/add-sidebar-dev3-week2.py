#!/usr/bin/env python3
"""
Add header and sidebar to Dev3 Week 2 day pages (Days 6-10).
"""

import re
import os
from pathlib import Path

# Header HTML template for Dev3
HEADER_HTML = '''<body>
    <header>
        <div class="container header-container">
            <div class="nav-left">
                <a href="../index.html" class="logo"><div class="logo-box">RevNova</div></a>
                <nav class="main-nav">
                    <ul>
                        <li><a href="onboarding-home.html" class="active">Onboarding</a></li>
                        <li><a href="../about-revnova.html">About RevNova</a></li>
                        <li><a href="../features.html">Features</a></li>
                        <li><a href="../pricing.html">Pricing</a></li>
                        <li><a href="../RevNovaRequirements/requirements-home.html">RevNova Requirements</a></li>
                        <li><a href="../contact.html">Contact</a></li>
                    </ul>
                </nav>
            </div>
            <div class="header-right">
                <div class="country-selector"><span class="fi fi-us"></span></div>
                <a href="../login.html" class="btn btn-login">Login</a>
            </div>
        </div>
    </header>

    <div class="onboarding-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
            <h3>Getting Started</h3>
            <ul>
                <li><a href="onboarding-home.html">Onboarding Home</a></li>
                <li><a href="onboarding-overview.html">Project Overview</a></li>
                <li><a href="manual-repo-setup.html">Manual Repository Setup</a></li>
                <li><a href="repo-setup-guide.html">Automated Setup Guide</a></li>
            </ul>
            
            <h3>Developer Guides</h3>
            <ul>
                <li><a href="onboarding-dev1-phase1.html">Developer 1: Backend & Database</a></li>
                <li><a href="onboarding-dev2-phase1.html">Developer 2: Frontend & React</a></li>
                <li><a href="onboarding-dev3-phase1.html">Developer 3: DevOps & QA</a></li>
            </ul>
            
            <h3>Developer 3: Daily Tasks</h3>
            <ul>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 1: CI/CD & Docker</span>
                    <ul>
                        <li><a href="dev3-day01.html">Day 1: GitHub Actions Setup</a></li>
                        <li><a href="dev3-day02.html">Day 2: CI Pipeline (Lint & Test)</a></li>
                        <li><a href="dev3-day03.html">Day 3: Docker for Backend</a></li>
                        <li><a href="dev3-day04.html">Day 4: Docker for Frontend</a></li>
                        <li><a href="dev3-day05.html">Day 5: Code Coverage & Week 1 PR</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 2: Local Dev Environment</span>
                    <ul>
                        <li><a href="dev3-day06.html">Day 6: Docker Compose Setup</a></li>
                        <li><a href="dev3-day07.html">Day 7: PostgreSQL & Redis</a></li>
                        <li><a href="dev3-day08.html">Day 8: Database Migrations</a></li>
                        <li><a href="dev3-day09.html">Day 9: Seed Data Scripts</a></li>
                        <li><a href="dev3-day10.html">Day 10: Bull Queue & Week 2 PR</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 3: Integration & E2E Testing</span>
                    <ul>
                        <li><a href="dev3-day11.html">Day 11: API Integration Tests (Part 1)</a></li>
                        <li><a href="dev3-day12.html">Day 12: API Integration Tests (Part 2)</a></li>
                        <li><a href="dev3-day13.html">Day 13: Test Database Setup</a></li>
                        <li><a href="dev3-day14.html">Day 14: Playwright Setup</a></li>
                        <li><a href="dev3-day15.html">Day 15: E2E Tests & Week 3 PR</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 4: Deployment Automation</span>
                    <ul>
                        <li><a href="dev3-day16.html">Day 16: GitHub Actions Deploy (Part 1)</a></li>
                        <li><a href="dev3-day17.html">Day 17: GitHub Actions Deploy (Part 2)</a></li>
                        <li><a href="dev3-day18.html">Day 18: Health Checks</a></li>
                        <li><a href="dev3-day19.html">Day 19: Deploy to Test Workflow</a></li>
                        <li><a href="dev3-day20.html">Day 20: Week 4 Testing & PR</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 5: Production & Monitoring</span>
                    <ul>
                        <li><a href="dev3-day21.html">Day 21: Production Deployment</a></li>
                        <li><a href="dev3-day22.html">Day 22: Monitoring Setup</a></li>
                        <li><a href="dev3-day23.html">Day 23: Backup & Restore</a></li>
                        <li><a href="dev3-day24.html">Day 24: Load Testing</a></li>
                        <li><a href="dev3-day25.html">Day 25: Documentation & Runbooks</a></li>
                    </ul>
                </li>
            </ul>
        </aside>

        <!-- Main Content -->
        <main class="main-content">'''

CLOSING_HTML = '''        </main>
    </div>
    <script src="../script.js"></script>
</body>'''

def add_sidebar_to_file(filepath):
    """Add header and sidebar to a Dev3 day file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if sidebar already exists
    if '<aside class="sidebar">' in content:
        print(f"  ⏭️  {filepath.name} - Already has sidebar, skipping")
        return False
    
    # Replace <body> with header + sidebar
    content = re.sub(
        r'<body>\s*<div class="main-content">',
        HEADER_HTML,
        content,
        count=1
    )
    
    # Replace closing </div></body> with closing structure
    content = re.sub(
        r'</div>\s*</body>',
        CLOSING_HTML,
        content,
        count=1
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✅ {filepath.name} - Added sidebar")
    return True

def main():
    docs_dir = Path(__file__).parent.parent / 'docs' / 'Onboarding'
    
    # Get Dev3 Week 2 files (Days 6-10)
    files_to_update = [
        docs_dir / f'dev3-day{day:02d}.html'
        for day in range(6, 11)
    ]
    
    files_to_update = [f for f in files_to_update if f.exists()]
    
    print(f"Found {len(files_to_update)} Dev3 Week 2 files")
    print("\nAdding header and sidebar...")
    print("=" * 60)
    
    updated_count = 0
    for filepath in files_to_update:
        if add_sidebar_to_file(filepath):
            updated_count += 1
    
    print("=" * 60)
    print(f"\n✨ Complete! Updated {updated_count} files")

if __name__ == '__main__':
    main()
