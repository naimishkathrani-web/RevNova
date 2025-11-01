#!/usr/bin/env python3
"""
Generate Week 1 onboarding pages for all 3 developers
Simple, step-by-step format for junior developers
"""

import os
from pathlib import Path

# Base directory
ONBOARDING_DIR = Path(__file__).parent.parent / 'docs' / 'Onboarding'

# Sidebar template for each developer (will be customized per dev)
def get_sidebar(dev_num, active_day):
    """Generate sidebar HTML for a developer with weekly hierarchy"""
    
    if dev_num == 1:
        dev_name = "Developer 1: Backend & Database"
        weeks = {
            1: ("Week 1: Setup & Database Foundation", [
                ("Day 1: Workstation Setup", "dev1-day01.html"),
                ("Day 2: Database Tables (STG1)", "dev1-day02.html"),
                ("Day 3: Database Tables (STG2)", "dev1-day03.html"),
                ("Day 4: Database Tables (EAV)", "dev1-day04.html"),
                ("Day 5: First API Endpoint", "dev1-day05.html"),
            ]),
            2: ("Week 2: Schema Analysis APIs", []),
            3: ("Week 3: Field Mapping & AI", []),
            4: ("Week 4: Data Transformation & Queue", []),
            5: ("Week 5: Migration Execution & Testing", []),
        }
        gradient = "4facfe, #00f2fe"
    elif dev_num == 2:
        dev_name = "Developer 2: Frontend & React"
        weeks = {
            1: ("Week 1: React Setup & Components", [
                ("Day 1: React Setup", "dev2-day01.html"),
                ("Day 2: Component Library", "dev2-day02.html"),
                ("Day 3: Wizard Layout & Routing", "dev2-day03.html"),
                ("Day 4: State Management", "dev2-day04.html"),
                ("Day 5: API Client & Week 1 PR", "dev2-day05.html"),
            ]),
            2: ("Week 2: Connection Wizard Page", []),
            3: ("Week 3: Field Mapping UI", []),
            4: ("Week 4: Transformation & Validation UI", []),
            5: ("Week 5: Execution & Test Reports", []),
        }
        gradient = "43e97b, #38f9d7"
    else:  # dev_num == 3
        dev_name = "Developer 3: DevOps & QA"
        weeks = {
            1: ("Week 1: CI/CD Pipeline & Docker", [
                ("Day 1: GitHub Actions Setup", "dev3-day01.html"),
                ("Day 2: CI Pipeline (Lint & Test)", "dev3-day02.html"),
                ("Day 3: Docker for Backend", "dev3-day03.html"),
                ("Day 4: Docker for Frontend", "dev3-day04.html"),
                ("Day 5: Code Coverage & Week 1 PR", "dev3-day05.html"),
            ]),
            2: ("Week 2: Local Dev Environment", []),
            3: ("Week 3: Integration & E2E Testing", []),
            4: ("Week 4: Deployment Automation", []),
            5: ("Week 5: Production Ready & Testing", []),
        }
        gradient = "fa709a, #fee140"
    
    sidebar_html = f'''            <h3>{dev_name}</h3>
            <ul>'''
    
    for week_num, (week_title, days) in weeks.items():
        week_file = f"dev{dev_num}-week{week_num}.html"
        
        if days:  # Week 1 with expanded days
            sidebar_html += f'''
                <li><a href="{week_file}">{week_title}</a>
                    <ul>'''
            for day_title, day_file in days:
                active_class = ' class="active"' if day_file == active_day else ''
                sidebar_html += f'''
                        <li><a href="{day_file}"{active_class}>{day_title}</a></li>'''
            sidebar_html += '''
                    </ul>
                </li>'''
        else:  # Collapsed weeks
            sidebar_html += f'''
                <li><a href="{week_file}">{week_title}</a></li>'''
    
    sidebar_html += '''
            </ul>'''
    
    return sidebar_html, gradient


# Week 1 content for each developer
WEEK1_CONTENT = {
    1: {  # Developer 1
        2: {
            "title": "Day 2: Database Tables (STG1)",
            "description": "Developer 1 - Backend & Database | Duration: ~6-8 hours",
            "steps": [
                {
                    "title": "Understand the Database Strategy",
                    "what": "Learn why we have 3 types of tables",
                    "content": """<p><strong>RevNova uses 3 table types:</strong></p>
                <ol>
                    <li><strong>STG1 Tables</strong> - Stores raw data exactly as it comes from Salesforce (what you'll build today)</li>
                    <li><strong>STG2 Tables</strong> - Stores normalized/cleaned data (Day 3)</li>
                    <li><strong>EAV Tables</strong> - Stores custom fields that users add (Day 4)</li>
                </ol>
                
                <div class="tip-box">
                    <strong>💡 Why 3 tables?</strong> STG1 keeps original data safe. STG2 has cleaned data for migration. EAV handles custom fields dynamically.
                </div>""",
                },
                {
                    "title": "Install PostgreSQL",
                    "what": "Install the database on your computer",
                    "content": """<ol>
                    <li>Go to <a href="https://www.postgresql.org/download/windows/" target="_blank">https://www.postgresql.org/download/windows/</a></li>
                    <li>Download PostgreSQL 15 or 16</li>
                    <li>Run the installer</li>
                    <li>Set password as: <code>postgres</code> (write this down!)</li>
                    <li>Keep default port: <code>5432</code></li>
                    <li>Click "Next" through remaining steps</li>
                </ol>
                
                <p><strong>Check if it installed:</strong></p>
                <div class="command-box">psql --version</div>
                
                <p>You should see:</p>
                <div class="command-box">psql (PostgreSQL) 15.x</div>""",
                },
                {
                    "title": "Create RevNova Database",
                    "what": "Create a new database for our project",
                    "content": """<p>Open terminal in VS Code and type:</p>
                <div class="command-box">psql -U postgres</div>
                
                <p>When it asks for password, type: <code>postgres</code></p>
                
                <p>Now create the database:</p>
                <div class="command-box">CREATE DATABASE revnova_dev;<br>\\l</div>
                
                <p>You should see <code>revnova_dev</code> in the list. Type <code>\\q</code> to exit.</p>""",
                },
                {
                    "title": "Create Migration File for STG1 Table",
                    "what": "Create a file that will build the STG1 table",
                    "content": """<p>In VS Code, create this file:</p>
                <p><strong>Location:</strong> <code>backend/src/database/migrations/001_create_stg1_table.sql</code></p>
                
                <p>Copy and paste this code:</p>
                <div class="command-box">-- STG1: Raw data staging table with dynamic columns
CREATE TABLE IF NOT EXISTS stg1_raw_data (
    id SERIAL PRIMARY KEY,
    migration_id VARCHAR(50) NOT NULL,
    source_system VARCHAR(50) NOT NULL,
    object_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    raw_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX idx_stg1_migration ON stg1_raw_data(migration_id);
CREATE INDEX idx_stg1_object ON stg1_raw_data(object_name);
CREATE INDEX idx_stg1_record ON stg1_raw_data(record_id);</div>
                
                <div class="tip-box">
                    <strong>💡 What does this do?</strong> Creates a table that stores raw Salesforce data in JSON format. The indexes make searching faster.
                </div>""",
                },
                {
                    "title": "Run the Migration",
                    "what": "Execute the SQL file to create the table",
                    "content": """<p>Run this command in terminal:</p>
                <div class="command-box">psql -U postgres -d revnova_dev -f backend/src/database/migrations/001_create_stg1_table.sql</div>
                
                <p><strong>Check if it worked:</strong></p>
                <div class="command-box">psql -U postgres -d revnova_dev -c "\\dt"</div>
                
                <p>You should see <code>stg1_raw_data</code> table in the list!</p>""",
                },
                {
                    "title": "Test the Table",
                    "what": "Insert sample data to verify table works",
                    "content": """<p>Connect to database:</p>
                <div class="command-box">psql -U postgres -d revnova_dev</div>
                
                <p>Insert test data:</p>
                <div class="command-box">INSERT INTO stg1_raw_data (migration_id, source_system, object_name, record_id, raw_data) 
VALUES ('TEST001', 'SFDC', 'Quote', 'Q001', '{"name": "Test Quote", "amount": 5000}');</div>
                
                <p>Query the data:</p>
                <div class="command-box">SELECT * FROM stg1_raw_data;</div>
                
                <p>You should see your test record! Type <code>\\q</code> to exit.</p>""",
                },
            ],
            "checklist": [
                "PostgreSQL installed and running",
                "revnova_dev database created",
                "Migration file created (001_create_stg1_table.sql)",
                "STG1 table created successfully",
                "Test data inserted and queried",
            ],
            "tomorrow": "You'll create STG2 tables for normalized data!",
        },
        # Days 3-5 will be added in next batch
    },
    # Dev 2 and 3 will be added
}


def generate_day_page(dev_num, day_num, content):
    """Generate a complete HTML page for a specific day"""
    
    sidebar_html, gradient = get_sidebar(dev_num, f"dev{dev_num}-day{day_num:02d}.html")
    
    # Previous and next navigation
    prev_day = f"dev{dev_num}-day{day_num-1:02d}.html" if day_num > 1 else "onboarding-home.html"
    prev_text = f"← Day {day_num-1}" if day_num > 1 else "← Back to Home"
    next_day = f"dev{dev_num}-day{day_num+1:02d}.html"
    next_text = f"Next: Day {day_num+1} →"
    
    # Generate steps HTML
    steps_html = ""
    for i, step in enumerate(content["steps"], 1):
        steps_html += f'''
            <div class="step-card">
                <h2><span class="step-number">{i}</span> {step["title"]}</h2>
                <p><strong>What you need to do:</strong> {step["what"]}</p>
                {step["content"]}
            </div>'''
    
    # Generate checklist HTML
    checklist_html = "\n".join([f"<li>{item}</li>" for item in content["checklist"]])
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{content["title"]} - RevNova Onboarding</title>
    <link rel="stylesheet" href="../styles.css">
    <style>
        body {{ margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }}
        
        .onboarding-layout {{
            display: flex;
            min-height: calc(100vh - 80px);
            margin-top: 80px;
        }}
        
        .sidebar {{
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
        }}
        
        .sidebar h3 {{
            padding: 0 1.5rem;
            font-size: 0.85rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 1.5rem 0 0.5rem;
        }}
        
        .sidebar h3:first-child {{ margin-top: 0; }}
        
        .sidebar ul {{
            list-style: none;
            padding: 0;
            margin: 0;
        }}
        
        .sidebar ul li a {{
            display: block;
            padding: 0.6rem 1.5rem;
            color: #333;
            text-decoration: none;
            font-size: 0.95rem;
            transition: all 0.2s;
        }}
        
        .sidebar ul li a:hover {{
            background: #e9ecef;
            color: #667eea;
        }}
        
        .sidebar ul li a.active {{
            background: #667eea;
            color: #fff;
            font-weight: 500;
        }}
        
        .sidebar ul ul {{
            padding-left: 0;
        }}
        
        .sidebar ul ul li a {{
            padding-left: 2.5rem;
            font-size: 0.9rem;
        }}
        
        .main-content {{
            flex: 1;
            margin-left: 280px;
            padding: 3rem;
            background: #fff;
            min-width: 0;
        }}
        
        .day-header {{
            background: linear-gradient(135deg, #{gradient});
            color: #fff;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
        }}
        
        .day-header h1 {{
            margin: 0 0 0.5rem 0;
            font-size: 2rem;
        }}
        
        .day-header p {{
            margin: 0;
            font-size: 1.1rem;
            opacity: 0.95;
        }}
        
        .step-card {{
            background: #fff;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 1.5rem;
        }}
        
        .step-number {{
            display: inline-block;
            background: #{gradient.split(',')[0]};
            color: #fff;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            text-align: center;
            line-height: 36px;
            font-weight: bold;
            margin-right: 1rem;
        }}
        
        .step-card h2 {{
            color: #{gradient.split(',')[0]};
            margin: 0 0 1rem 0;
            display: flex;
            align-items: center;
        }}
        
        .command-box {{
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.95rem;
            overflow-x: auto;
        }}
        
        .tip-box {{
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 4px;
        }}
        
        .tip-box strong {{
            color: #856404;
        }}
        
        .checklist {{
            list-style: none;
            padding: 0;
        }}
        
        .checklist li {{
            padding: 0.5rem 0;
            position: relative;
            padding-left: 2rem;
        }}
        
        .checklist li:before {{
            content: "☐";
            position: absolute;
            left: 0;
            font-size: 1.5rem;
            color: #{gradient.split(',')[0]};
        }}
        
        .nav-buttons {{
            display: flex;
            justify-content: space-between;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 2px solid #e0e0e0;
        }}
        
        .nav-btn {{
            display: inline-block;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s;
        }}
        
        .nav-btn.back {{
            background: #f0f0f0;
            color: #333;
        }}
        
        .nav-btn.back:hover {{
            background: #e0e0e0;
        }}
        
        .nav-btn.next {{
            background: #{gradient.split(',')[0]};
            color: #fff;
        }}
        
        .nav-btn.next:hover {{
            background: #{gradient.split(',')[1].strip()};
        }}
        
        @media (max-width: 768px) {{
            .sidebar {{
                display: none;
            }}
            
            .main-content {{
                margin-left: 0;
            }}
        }}
    </style>
</head>
<body>
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
                <li><a href="manual-repo-setup.html">Manual Repository Setup</a></li>
                <li><a href="repo-setup-guide.html">Automated Setup Guide</a></li>
            </ul>
            
{sidebar_html}
        </aside>

        <main class="main-content">
            <div class="day-header">
                <h1>{content["title"]}</h1>
                <p>{content["description"]}</p>
            </div>
{steps_html}
            
            <div class="step-card">
                <h2>✅ {content["title"].split(":")[0]} Complete!</h2>
                <p>Great job! You now have:</p>
                <ul class="checklist">
{checklist_html}
                </ul>
                
                <p><strong>Tomorrow:</strong> {content["tomorrow"]}</p>
            </div>

            <div class="nav-buttons">
                <a href="{prev_day}" class="nav-btn back">{prev_text}</a>
                <a href="{next_day}" class="nav-btn next">{next_text}</a>
            </div>
        </main>
    </div>
</body>
</html>'''
    
    return html


def main():
    """Generate Week 1 pages for Developer 1"""
    print("Generating Week 1 pages for Developer 1...")
    
    for day_num, content in WEEK1_CONTENT[1].items():
        filename = f"dev1-day{day_num:02d}.html"
        filepath = ONBOARDING_DIR / filename
        
        html = generate_day_page(1, day_num, content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"  ✓ Created {filename}")
    
    print("✓ Week 1 pages created for Developer 1!")


if __name__ == '__main__':
    main()
