#!/usr/bin/env python3
"""
Add header and sidebar to all remaining onboarding day pages that don't have them.
This covers Week 3-5 for all developers.
"""

import re
from pathlib import Path

# Sidebar templates for each developer
SIDEBARS = {
    'dev1': '''<body>
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
        <aside class="sidebar">
            <h3>Getting Started</h3>
            <ul>
                <li><a href="onboarding-home.html">Onboarding Home</a></li>
                <li><a href="onboarding-overview.html">Project Overview</a></li>
            </ul>
            
            <h3>Developer 1: Daily Tasks</h3>
            <ul>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 1: Backend Setup</span>
                    <ul>
                        <li><a href="dev1-day01.html">Day 1</a></li>
                        <li><a href="dev1-day02.html">Day 2</a></li>
                        <li><a href="dev1-day03.html">Day 3</a></li>
                        <li><a href="dev1-day04.html">Day 4</a></li>
                        <li><a href="dev1-day05.html">Day 5</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 2: Salesforce Integration</span>
                    <ul>
                        <li><a href="dev1-day06.html">Day 6</a></li>
                        <li><a href="dev1-day07.html">Day 7</a></li>
                        <li><a href="dev1-day08.html">Day 8</a></li>
                        <li><a href="dev1-day09.html">Day 9</a></li>
                        <li><a href="dev1-day10.html">Day 10</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 3: Field Mapping API</span>
                    <ul>
                        <li><a href="dev1-day11.html">Day 11</a></li>
                        <li><a href="dev1-day12.html">Day 12</a></li>
                        <li><a href="dev1-day13.html">Day 13</a></li>
                        <li><a href="dev1-day14.html">Day 14</a></li>
                        <li><a href="dev1-day15.html">Day 15</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 4: Transformation & Queue</span>
                    <ul>
                        <li><a href="dev1-day16.html">Day 16</a></li>
                        <li><a href="dev1-day17.html">Day 17</a></li>
                        <li><a href="dev1-day18.html">Day 18</a></li>
                        <li><a href="dev1-day19.html">Day 19</a></li>
                        <li><a href="dev1-day20.html">Day 20</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 5: Execution & Testing</span>
                    <ul>
                        <li><a href="dev1-day21.html">Day 21</a></li>
                        <li><a href="dev1-day22.html">Day 22</a></li>
                        <li><a href="dev1-day23.html">Day 23</a></li>
                        <li><a href="dev1-day24.html">Day 24</a></li>
                        <li><a href="dev1-day25.html">Day 25</a></li>
                    </ul>
                </li>
            </ul>
        </aside>

        <main class="main-content">''',
    
    'dev2': '''<body>
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
        <aside class="sidebar">
            <h3>Getting Started</h3>
            <ul>
                <li><a href="onboarding-home.html">Onboarding Home</a></li>
                <li><a href="onboarding-overview.html">Project Overview</a></li>
            </ul>
            
            <h3>Developer 2: Daily Tasks</h3>
            <ul>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 1-2</span>
                    <ul>
                        <li><a href="dev2-day01.html">Day 1</a></li>
                        <li><a href="dev2-day02.html">Day 2</a></li>
                        <li><a href="dev2-day03.html">Day 3</a></li>
                        <li><a href="dev2-day04.html">Day 4</a></li>
                        <li><a href="dev2-day05.html">Day 5</a></li>
                        <li><a href="dev2-day06.html">Day 6</a></li>
                        <li><a href="dev2-day07.html">Day 7</a></li>
                        <li><a href="dev2-day08.html">Day 8</a></li>
                        <li><a href="dev2-day09.html">Day 9</a></li>
                        <li><a href="dev2-day10.html">Day 10</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 3-4</span>
                    <ul>
                        <li><a href="dev2-day11.html">Day 11</a></li>
                        <li><a href="dev2-day12.html">Day 12</a></li>
                        <li><a href="dev2-day13.html">Day 13</a></li>
                        <li><a href="dev2-day14.html">Day 14</a></li>
                        <li><a href="dev2-day15.html">Day 15</a></li>
                        <li><a href="dev2-day16.html">Day 16</a></li>
                        <li><a href="dev2-day17.html">Day 17</a></li>
                        <li><a href="dev2-day18.html">Day 18</a></li>
                        <li><a href="dev2-day19.html">Day 19</a></li>
                        <li><a href="dev2-day20.html">Day 20</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 5</span>
                    <ul>
                        <li><a href="dev2-day21.html">Day 21</a></li>
                        <li><a href="dev2-day22.html">Day 22</a></li>
                        <li><a href="dev2-day23.html">Day 23</a></li>
                        <li><a href="dev2-day24.html">Day 24</a></li>
                        <li><a href="dev2-day25.html">Day 25</a></li>
                    </ul>
                </li>
            </ul>
        </aside>

        <main class="main-content">''',
    
    'dev3': '''<body>
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
        <aside class="sidebar">
            <h3>Getting Started</h3>
            <ul>
                <li><a href="onboarding-home.html">Onboarding Home</a></li>
                <li><a href="onboarding-overview.html">Project Overview</a></li>
            </ul>
            
            <h3>Developer 3: Daily Tasks</h3>
            <ul>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 1-2</span>
                    <ul>
                        <li><a href="dev3-day01.html">Day 1</a></li>
                        <li><a href="dev3-day02.html">Day 2</a></li>
                        <li><a href="dev3-day03.html">Day 3</a></li>
                        <li><a href="dev3-day04.html">Day 4</a></li>
                        <li><a href="dev3-day05.html">Day 5</a></li>
                        <li><a href="dev3-day06.html">Day 6</a></li>
                        <li><a href="dev3-day07.html">Day 7</a></li>
                        <li><a href="dev3-day08.html">Day 8</a></li>
                        <li><a href="dev3-day09.html">Day 9</a></li>
                        <li><a href="dev3-day10.html">Day 10</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 3-4</span>
                    <ul>
                        <li><a href="dev3-day11.html">Day 11</a></li>
                        <li><a href="dev3-day12.html">Day 12</a></li>
                        <li><a href="dev3-day13.html">Day 13</a></li>
                        <li><a href="dev3-day14.html">Day 14</a></li>
                        <li><a href="dev3-day15.html">Day 15</a></li>
                        <li><a href="dev3-day16.html">Day 16</a></li>
                        <li><a href="dev3-day17.html">Day 17</a></li>
                        <li><a href="dev3-day18.html">Day 18</a></li>
                        <li><a href="dev3-day19.html">Day 19</a></li>
                        <li><a href="dev3-day20.html">Day 20</a></li>
                    </ul>
                </li>
                <li class="has-children"><span style="font-weight:600;color:#333;">Week 5</span>
                    <ul>
                        <li><a href="dev3-day21.html">Day 21</a></li>
                        <li><a href="dev3-day22.html">Day 22</a></li>
                        <li><a href="dev3-day23.html">Day 23</a></li>
                        <li><a href="dev3-day24.html">Day 24</a></li>
                        <li><a href="dev3-day25.html">Day 25</a></li>
                    </ul>
                </li>
            </ul>
        </aside>

        <main class="main-content">'''
}

CLOSING_HTML = '''        </main>
    </div>
    <script src="../script.js"></script>
</body>'''

def add_sidebar_to_file(filepath):
    """Add header and sidebar to a day file if it doesn't have one."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if sidebar already exists
    if '<aside class="sidebar">' in content:
        return False
    
    # Determine developer
    dev = filepath.stem[:4]  # dev1, dev2, or dev3
    
    # Replace <body> variations with header + sidebar
    patterns = [
        (r'<body>\s*<header></header>\s*<div class="main-content">', SIDEBARS[dev]),
        (r'<body>\s*<div class="main-content">', SIDEBARS[dev])
    ]
    
    for pattern, replacement in patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content, count=1)
            break
    
    # Replace closing </div></body>
    content = re.sub(r'</div>\s*</body>', CLOSING_HTML, content, count=1)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    docs_dir = Path(__file__).parent.parent / 'docs' / 'Onboarding'
    
    # Get all day files for all developers
    all_files = sorted(docs_dir.glob('dev*-day*.html'))
    
    print(f"Checking {len(all_files)} onboarding files...")
    print("=" * 60)
    
    updated_count = 0
    for filepath in all_files:
        if add_sidebar_to_file(filepath):
            print(f"  ✅ {filepath.name}")
            updated_count += 1
    
    print("=" * 60)
    print(f"\n✨ Complete! Updated {updated_count} files")
    print(f"Skipped {len(all_files) - updated_count} files (already had sidebars)")

if __name__ == '__main__':
    main()
