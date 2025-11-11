#!/usr/bin/env python3
"""
Add header and sidebar to all Dev2 onboarding day pages.
"""

import re
import os
from pathlib import Path

# Header HTML template
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
            
            <h3>Developer 2: Daily Tasks</h3>
            <ul>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 1: React Setup</span>
                    <ul>
                        <li><a href="dev2-day01.html">Day 1: React Setup</a></li>
                        <li><a href="dev2-day02.html">Day 2: Component Library</a></li>
                        <li><a href="dev2-day03.html">Day 3: Wizard Layout & Routing</a></li>
                        <li><a href="dev2-day04.html">Day 4: State Management</a></li>
                        <li><a href="dev2-day05.html">Day 5: API Client & Week 1 PR</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 2: Connection Wizard</span>
                    <ul>
                        <li><a href="dev2-day06.html">Day 6: Connection Form UI</a></li>
                        <li><a href="dev2-day07.html">Day 7: OAuth Integration</a></li>
                        <li><a href="dev2-day08.html">Day 8: Connection Testing</a></li>
                        <li><a href="dev2-day09.html">Day 9: Error Handling</a></li>
                        <li><a href="dev2-day10.html">Day 10: Week 2 Testing & PR</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 3: Field Mapping UI</span>
                    <ul>
                        <li><a href="dev2-day11.html">Day 11: Mapping Table UI</a></li>
                        <li><a href="dev2-day12.html">Day 12: AI Suggestions Display</a></li>
                        <li><a href="dev2-day13.html">Day 13: Drag & Drop Mapping</a></li>
                        <li><a href="dev2-day14.html">Day 14: Bulk Operations</a></li>
                        <li><a href="dev2-day15.html">Day 15: Week 3 Testing & PR</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 4: Transformation & Validation</span>
                    <ul>
                        <li><a href="dev2-day16.html">Day 16: Transformation Preview UI</a></li>
                        <li><a href="dev2-day17.html">Day 17: Data Tables & Pagination</a></li>
                        <li><a href="dev2-day18.html">Day 18: Validation Results Display</a></li>
                        <li><a href="dev2-day19.html">Day 19: Error Display</a></li>
                        <li><a href="dev2-day20.html">Day 20: Week 4 Testing & PR</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;cursor:default;display:block;padding:0.6rem 0;">Week 5: Execution & Reports</span>
                    <ul>
                        <li><a href="dev2-day21.html">Day 21: Execution Progress UI</a></li>
                        <li><a href="dev2-day22.html">Day 22: Real-time Updates</a></li>
                        <li><a href="dev2-day23.html">Day 23: Test Reports & Comparison</a></li>
                        <li><a href="dev2-day24.html">Day 24: Export & UI Testing</a></li>
                        <li><a href="dev2-day25.html">Day 25: Final Polish & Documentation</a></li>
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
    """Add header and sidebar to a single Dev2 day file."""
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
    
    # Get all dev2-day*.html files
    dev2_files = sorted(docs_dir.glob('dev2-day*.html'))
    
    print(f"Found {len(dev2_files)} Dev2 day files")
    print("\nAdding header and sidebar to all files...")
    print("=" * 60)
    
    updated_count = 0
    for filepath in dev2_files:
        if add_sidebar_to_file(filepath):
            updated_count += 1
    
    print("=" * 60)
    print(f"\n✨ Complete! Updated {updated_count} files")
    print(f"Skipped {len(dev2_files) - updated_count} files (already had sidebars)")

if __name__ == '__main__':
    main()
