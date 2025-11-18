"""
Regenerate all onboarding pages with Salesforce-style template
"""
import os
import re
from pathlib import Path

# Define the structure
DEVELOPERS = [
    {
        'name': 'Developer 1: Backend & Database',
        'prefix': 'dev1',
        'weeks': [
            {'title': 'Week 1: Backend Setup', 'days': [
                (1, 'Workstation Setup'),
                (2, 'Database Tables (STG1)'),
                (3, 'Database Tables (STG2)'),
                (4, 'Database Tables (EAV)'),
                (5, 'First API Endpoint')
            ]},
            {'title': 'Week 2: Schema Analysis APIs', 'days': [
                (6, 'Schema Analysis API (Part 1)'),
                (7, 'Schema Analysis API (Part 2)'),
                (8, 'Metadata Extraction'),
                (9, 'Relationship Detection'),
                (10, 'Week 2 Testing & PR')
            ]},
            {'title': 'Week 3: Field Mapping & AI', 'days': [
                (11, 'Field Mapping API (Part 1)'),
                (12, 'Field Mapping API (Part 2)'),
                (13, 'AI Integration Setup'),
                (14, 'Confidence Scoring'),
                (15, 'Week 3 Testing & PR')
            ]},
            {'title': 'Week 4: Transformation & Queue', 'days': [
                (16, 'Data Transformation Engine'),
                (17, 'Queue System Setup'),
                (18, 'Job Management'),
                (19, 'Error Handling'),
                (20, 'Week 4 Testing & PR')
            ]},
            {'title': 'Week 5: Execution & Testing', 'days': [
                (21, 'Migration Execution'),
                (22, 'Validation & Rollback'),
                (23, 'Performance Optimization'),
                (24, 'Integration Testing'),
                (25, 'Final Review & Handoff')
            ]}
        ]
    },
    {
        'name': 'Developer 2: Frontend & React',
        'prefix': 'dev2',
        'weeks': [
            {'title': 'Week 1: React Setup', 'days': [
                (1, 'React & Vite Setup'),
                (2, 'Project Structure'),
                (3, 'Routing & Navigation'),
                (4, 'State Management'),
                (5, 'UI Component Library')
            ]},
            {'title': 'Week 2: Core Pages', 'days': [
                (6, 'Dashboard Page'),
                (7, 'Project Creation'),
                (8, 'Connection Setup UI'),
                (9, 'Schema Analysis UI'),
                (10, 'Week 2 Testing & PR')
            ]},
            {'title': 'Week 3: Mapping Interface', 'days': [
                (11, 'Field Mapping UI (Part 1)'),
                (12, 'Field Mapping UI (Part 2)'),
                (13, 'Drag & Drop Interface'),
                (14, 'AI Suggestions UI'),
                (15, 'Week 3 Testing & PR')
            ]},
            {'title': 'Week 4: Transformation UI', 'days': [
                (16, 'Transformation Rules UI'),
                (17, 'Preview & Validation'),
                (18, 'Queue Status Dashboard'),
                (19, 'Error Display & Retry'),
                (20, 'Week 4 Testing & PR')
            ]},
            {'title': 'Week 5: Testing & Polish', 'days': [
                (21, 'Execution Progress UI'),
                (22, 'Results & Reports'),
                (23, 'Responsive Design'),
                (24, 'E2E Testing'),
                (25, 'Final Polish & Handoff')
            ]}
        ]
    },
    {
        'name': 'Developer 3: DevOps & QA',
        'prefix': 'dev3',
        'weeks': [
            {'title': 'Week 1: DevOps Setup', 'days': [
                (1, 'AWS & Infrastructure'),
                (2, 'Docker Setup'),
                (3, 'CI/CD Pipeline'),
                (4, 'Monitoring Setup'),
                (5, 'Security Configuration')
            ]},
            {'title': 'Week 2: Testing Framework', 'days': [
                (6, 'Unit Testing Setup'),
                (7, 'Backend Tests'),
                (8, 'Integration Tests'),
                (9, 'API Tests'),
                (10, 'Week 2 Testing & PR')
            ]},
            {'title': 'Week 3: QA & Testing', 'days': [
                (11, 'Frontend Testing'),
                (12, 'E2E Test Setup'),
                (13, 'Test Automation'),
                (14, 'Load Testing'),
                (15, 'Week 3 Testing & PR')
            ]},
            {'title': 'Week 4: Performance', 'days': [
                (16, 'Performance Monitoring'),
                (17, 'Database Optimization'),
                (18, 'Caching Strategy'),
                (19, 'Load Balancing'),
                (20, 'Week 4 Testing & PR')
            ]},
            {'title': 'Week 5: Production', 'days': [
                (21, 'Production Deployment'),
                (22, 'Backup & Recovery'),
                (23, 'Documentation'),
                (24, 'Final QA'),
                (25, 'Production Handoff')
            ]}
        ]
    }
]

def generate_sidebar_weeks_html(dev_prefix, weeks):
    """Generate the sidebar weeks HTML for a developer"""
    html_parts = []
    
    for week_num, week in enumerate(weeks, 1):
        week_title = week['title']
        
        # Generate days HTML
        days_html = []
        for day_num, day_title in week['days']:
            day_file = f"{dev_prefix}-day{day_num:02d}.html"
            days_html.append(f'                                <a href="{day_file}" class="nav-subsection-link">Day {day_num}: {day_title}</a>')
        
        week_html = f'''                        <!-- Week {week_num} Subsection -->
                        <div class="nav-subsection">
                            <button class="nav-subsection-header">
                                <svg class="nav-subsection-icon" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6 6L14 10L6 14V6Z"/>
                                </svg>
                                {week_title}
                            </button>
                            <div class="nav-subsection-content">
{chr(10).join(days_html)}
                            </div>
                        </div>
                        '''
        html_parts.append(week_html)
    
    return '\n'.join(html_parts)

def main():
    # Read template
    template_path = Path('docs/Onboarding/dev1-day07-new.html')
    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()
    
    total_pages = sum(len(week['days']) for dev in DEVELOPERS for week in dev['weeks'])
    processed = 0
    
    print(f"Regenerating {total_pages} pages with Salesforce-style template...")
    print()
    
    for dev in DEVELOPERS:
        dev_name = dev['name']
        dev_prefix = dev['prefix']
        weeks = dev['weeks']
        
        print(f"Processing {dev_name}...")
        
        # Generate sidebar weeks HTML for this developer
        sidebar_weeks_html = generate_sidebar_weeks_html(dev_prefix, weeks)
        
        # Process each day
        for week_num, week in enumerate(weeks, 1):
            for day_num, day_title in week['days']:
                # Create new page from template
                page = template
                
                # Replace title
                page = page.replace(
                    '<title>Day 7: Schema Analysis API (Part 2) - RevNova Developer Onboarding</title>',
                    f'<title>Day {day_num}: {day_title} - RevNova Developer Onboarding</title>'
                )
                
                # Replace breadcrumb
                dev_short = {
                    'dev1': 'Developer 1',
                    'dev2': 'Developer 2',
                    'dev3': 'Developer 3'
                }[dev_prefix]
                page = page.replace(
                    '<a href="onboarding-dev1.html">Developer 1</a> › \n                Week 2 › Day 7',
                    f'<a href="onboarding-{dev_prefix}.html">{dev_short}</a> › Week {week_num} › Day {day_num}'
                )
                
                # Replace page title
                page = page.replace(
                    '<h1 class="page-title">Day 7: Schema Analysis API (Part 2)</h1>',
                    f'<h1 class="page-title">Day {day_num}: {day_title}</h1>'
                )
                
                # Replace subtitle
                page = page.replace(
                    '<p class="page-subtitle">Developer 1 — Backend & Database | Duration: ~6-8 hours</p>',
                    f'<p class="page-subtitle">{dev_name} | Duration: ~6-8 hours</p>'
                )
                
                # Replace sidebar section title
                page = page.replace(
                    'Developer 1: Daily Tasks',
                    f'{dev_short}: Daily Tasks'
                )
                
                # Replace the weeks subsection HTML
                # Find the pattern between first <!-- Week and last </div> of weeks
                pattern = r'<!-- Week 1 Subsection -->.*?</div>\s+</div>\s+</div>\s+</nav>'
                replacement = sidebar_weeks_html + '\n                    </div>\n                </div>\n            </nav>'
                page = re.sub(pattern, replacement, page, flags=re.DOTALL)
                
                # Mark current page as active
                day_file = f"{dev_prefix}-day{day_num:02d}.html"
                page = page.replace(
                    f'<a href="{day_file}" class="nav-subsection-link">',
                    f'<a href="{day_file}" class="nav-subsection-link active">'
                )
                
                # Auto-expand current week
                current_week_title = week['title']
                # Expand the week header
                page = page.replace(
                    f'<button class="nav-subsection-header">\n                                <svg class="nav-subsection-icon" fill="currentColor" viewBox="0 0 20 20">\n                                    <path d="M6 6L14 10L6 14V6Z"/>\n                                </svg>\n                                {current_week_title}',
                    f'<button class="nav-subsection-header expanded">\n                                <svg class="nav-subsection-icon" fill="currentColor" viewBox="0 0 20 20">\n                                    <path d="M6 6L14 10L6 14V6Z"/>\n                                </svg>\n                                {current_week_title}'
                )
                # Find and expand the content div after this week's button
                page = re.sub(
                    f'({re.escape(current_week_title)}.*?</button>\\s+<div class="nav-subsection-content")>',
                    r'\1 expanded>',
                    page,
                    flags=re.DOTALL
                )
                
                # Update navigation buttons
                prev_day = day_num - 1
                next_day = day_num + 1
                prev_file = f"{dev_prefix}-day{prev_day:02d}.html" if prev_day > 0 else f"onboarding-{dev_prefix}.html"
                next_file = f"{dev_prefix}-day{next_day:02d}.html" if next_day <= 25 else "onboarding-home.html"
                prev_text = f"Previous: Day {prev_day}" if prev_day > 0 else "Back to Overview"
                next_text = f"Next: Day {next_day}" if next_day <= 25 else "Back to Home"
                
                page = re.sub(
                    r'<a href="dev1-day\d+\.html" class="btn btn-secondary">[^<]+</a>',
                    f'<a href="{prev_file}" class="btn btn-secondary">{prev_text}</a>',
                    page
                )
                page = re.sub(
                    r'<a href="dev1-day\d+\.html" class="btn">[^<]+</a>',
                    f'<a href="{next_file}" class="btn">{next_text}</a>',
                    page
                )
                
                # Write file
                output_path = Path(f'docs/Onboarding/{day_file}')
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(page)
                
                processed += 1
                print(f"  ✓ Generated {day_file} ({processed}/{total_pages})")
        
        print()
    
    print("=" * 50)
    print(f"Complete! Regenerated {processed} pages")
    print("=" * 50)
    print()
    print("All pages now have:")
    print("  - Salesforce-style look and feel")
    print("  - Collapsible Getting Started section")
    print("  - Collapsible Developer Guides section")
    print("  - Collapsible week subsections")
    print("  - Static sidebar that never moves")
    print("  - Auto-expand current week and highlight current page")

if __name__ == '__main__':
    main()
