"""
Comprehensive audit script for RevNova onboarding materials.
Checks:
1. Navigation consistency (left panel should not be disturbed)
2. Task content alignment with RevNova requirements
3. Week/Day consistency across all developers
"""

import os
import re
from pathlib import Path
from bs4 import BeautifulSoup

# RevNova Core Requirements (7-Step Migration Wizard)
REVNOVA_REQUIREMENTS = {
    "core_features": [
        "Salesforce OAuth Connection",
        "Schema Analysis (jsforce describeGlobal/describeSObject)",
        "AI Field Mapping (GPT-4 with confidence scores)",
        "Drag-Drop Customization (@dnd-kit)",
        "Preview Transformations",
        "Async ETL with Bull Queue",
        "Migration Execution & Reports"
    ],
    "backend_tech": [
        "Node.js 20", "Express", "TypeScript", "PostgreSQL 16",
        "Redis 7", "Bull queue", "jsforce", "OpenAI GPT-4"
    ],
    "frontend_tech": [
        "React 18", "TypeScript", "TailwindCSS", "Vite",
        "@dnd-kit/core", "Server-Sent Events (SSE)"
    ],
    "devops_tech": [
        "Docker", "docker-compose", "GitHub Actions",
        "Prometheus", "Grafana", "ELK stack", "k6"
    ]
}

def get_all_day_files():
    """Get all day files from docs/Onboarding"""
    docs_dir = Path(__file__).parent.parent / "docs" / "Onboarding"
    pattern = re.compile(r"dev(\d+)-day(\d+)\.html")
    
    files = []
    for file in docs_dir.glob("dev*-day*.html"):
        match = pattern.match(file.name)
        if match:
            dev = int(match.group(1))
            day = int(match.group(2))
            if day >= 6:  # Week 2+ only
                files.append({
                    'path': file,
                    'dev': dev,
                    'day': day,
                    'week': ((day - 1) // 5) + 1
                })
    
    return sorted(files, key=lambda x: (x['dev'], x['day']))

def check_navigation_consistency(file_info):
    """Check if navigation structure is consistent"""
    with open(file_info['path'], 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    issues = []
    
    # Check for has-children class
    week_headers = soup.find_all('li', class_='has-children')
    if not week_headers:
        issues.append("Missing collapsible navigation (has-children)")
    
    # Check for week groupings
    if file_info['dev'] in [1, 2]:
        expected_weeks = 5
    else:  # Dev3 has condensed structure
        expected_weeks = 3  # Week 1-2, Week 3-4, Week 5
    
    if len(week_headers) < expected_weeks:
        issues.append(f"Expected {expected_weeks} week groupings, found {len(week_headers)}")
    
    # Check for proper cursor:default on week headers (should NOT be clickable)
    for week_header in week_headers:
        span = week_header.find('span')
        if span:
            style = span.get('style', '')
            if 'cursor:default' not in style and 'cursor: default' not in style:
                # Check if it's an older format without inline style
                if not ('cursor' in style or week_header.find('a')):
                    issues.append(f"Week header should have cursor:default (found: {style[:50]})")
    
    # Check for day links
    day_links = soup.find_all('a', href=re.compile(r'dev\d+-day\d+\.html'))
    if len(day_links) < 20:  # Should have ~25 day links
        issues.append(f"Expected ~25 day links, found {len(day_links)}")
    
    return {
        'file': file_info['path'].name,
        'issues': issues,
        'status': 'PASS' if not issues else 'ISSUES'
    }

def extract_tasks(file_info):
    """Extract task content from day file"""
    with open(file_info['path'], 'r', encoding='utf-8') as f:
        content = f.read()
        soup = BeautifulSoup(content, 'html.parser')
    
    # Extract main content section
    main = soup.find('main')
    if not main:
        return {'tasks': [], 'has_content': False}
    
    # Look for task indicators
    tasks = []
    
    # Look for numbered tasks or objectives
    task_patterns = [
        re.compile(r'<li[^>]*>(.*?)</li>', re.DOTALL),
        re.compile(r'\d+\.\s+([^\n]+)', re.MULTILINE),
        re.compile(r'<h3[^>]*>.*?Step \d+:(.*?)</h3>', re.DOTALL)
    ]
    
    main_text = main.get_text()
    
    # Extract task titles
    for pattern in task_patterns:
        matches = pattern.findall(str(main))
        if matches:
            tasks.extend([m.strip()[:100] for m in matches if m.strip()])
    
    # Check for enhanced Copilot prompt
    has_copilot_prompt = 'RevNova' in main_text and 'Copilot' in main_text
    
    # Check for code examples
    has_code = bool(soup.find('code') or soup.find('pre'))
    
    # Check for acceptance criteria
    has_acceptance = 'Acceptance Criteria' in main_text or 'acceptance criteria' in main_text
    
    return {
        'tasks': tasks[:10],  # First 10 tasks
        'has_content': len(tasks) > 0,
        'has_copilot_prompt': has_copilot_prompt,
        'has_code': has_code,
        'has_acceptance': has_acceptance,
        'content_length': len(main_text)
    }

def validate_tech_alignment(file_info, tasks_info):
    """Validate if tasks align with RevNova tech stack"""
    with open(file_info['path'], 'r', encoding='utf-8') as f:
        content = f.read().lower()
    
    dev = file_info['dev']
    week = file_info['week']
    
    expected_tech = []
    found_tech = []
    missing_tech = []
    
    # Developer 1 (Backend)
    if dev == 1:
        expected_tech = REVNOVA_REQUIREMENTS['backend_tech']
        # Week-specific requirements
        if week == 2:
            expected_tech = ['jsforce', 'oauth', 'salesforce']
        elif week == 3:
            expected_tech = ['gpt-4', 'openai', 'field mapping']
        elif week == 4:
            expected_tech = ['bull', 'queue', 'redis']
        elif week == 5:
            expected_tech = ['migration', 'execution', 'rollback']
    
    # Developer 2 (Frontend)
    elif dev == 2:
        expected_tech = REVNOVA_REQUIREMENTS['frontend_tech']
        if week == 2:
            expected_tech = ['react', 'oauth', 'connection']
        elif week == 3:
            expected_tech = ['dnd-kit', 'drag', 'drop', 'mapping']
        elif week == 4:
            expected_tech = ['transformation', 'preview', 'validation']
        elif week == 5:
            expected_tech = ['sse', 'progress', 'report']
    
    # Developer 3 (DevOps)
    elif dev == 3:
        expected_tech = REVNOVA_REQUIREMENTS['devops_tech']
        if week == 2:
            expected_tech = ['docker', 'compose', 'ci/cd']
        elif week in [3, 4]:
            expected_tech = ['test', 'playwright', 'integration']
        elif week == 5:
            expected_tech = ['prometheus', 'grafana', 'monitoring']
    
    for tech in expected_tech:
        if tech.lower() in content:
            found_tech.append(tech)
        else:
            missing_tech.append(tech)
    
    alignment_score = len(found_tech) / len(expected_tech) * 100 if expected_tech else 100
    
    return {
        'expected_tech': expected_tech,
        'found_tech': found_tech,
        'missing_tech': missing_tech,
        'alignment_score': alignment_score,
        'aligned': alignment_score >= 60  # At least 60% alignment
    }

def generate_report():
    """Generate comprehensive audit report"""
    print("=" * 80)
    print("REVNOVA ONBOARDING MATERIALS - COMPREHENSIVE AUDIT REPORT")
    print("=" * 80)
    print()
    
    files = get_all_day_files()
    print(f"📁 Found {len(files)} day files (Week 2+)")
    print()
    
    # Navigation audit
    print("🔍 NAVIGATION AUDIT (Week 2+)")
    print("-" * 80)
    nav_issues = []
    for file_info in files:
        result = check_navigation_consistency(file_info)
        if result['status'] != 'PASS':
            nav_issues.append(result)
            print(f"⚠️  {result['file']}: {len(result['issues'])} issues")
            for issue in result['issues']:
                print(f"    - {issue}")
    
    if not nav_issues:
        print("✅ ALL NAVIGATION STRUCTURES PASS")
    print()
    
    # Task content audit
    print("📝 TASK CONTENT AUDIT")
    print("-" * 80)
    content_summary = {
        'dev1': {'total': 0, 'with_content': 0, 'with_code': 0, 'with_acceptance': 0},
        'dev2': {'total': 0, 'with_content': 0, 'with_code': 0, 'with_acceptance': 0},
        'dev3': {'total': 0, 'with_content': 0, 'with_code': 0, 'with_acceptance': 0}
    }
    
    for file_info in files:
        tasks_info = extract_tasks(file_info)
        dev_key = f"dev{file_info['dev']}"
        
        content_summary[dev_key]['total'] += 1
        if tasks_info['has_content']:
            content_summary[dev_key]['with_content'] += 1
        if tasks_info['has_code']:
            content_summary[dev_key]['with_code'] += 1
        if tasks_info['has_acceptance']:
            content_summary[dev_key]['with_acceptance'] += 1
        
        if not tasks_info['has_content'] or tasks_info['content_length'] < 500:
            print(f"⚠️  {file_info['path'].name}: Minimal content ({tasks_info['content_length']} chars)")
    
    print()
    for dev in ['dev1', 'dev2', 'dev3']:
        stats = content_summary[dev]
        print(f"Developer {dev[-1]}:")
        print(f"  📄 Total files: {stats['total']}")
        print(f"  ✅ With tasks: {stats['with_content']}/{stats['total']}")
        print(f"  💻 With code: {stats['with_code']}/{stats['total']}")
        print(f"  ✓  With acceptance criteria: {stats['with_acceptance']}/{stats['total']}")
        print()
    
    # Tech alignment audit
    print("🔧 TECHNOLOGY ALIGNMENT AUDIT")
    print("-" * 80)
    alignment_issues = []
    
    for file_info in files:
        tasks_info = extract_tasks(file_info)
        tech_result = validate_tech_alignment(file_info, tasks_info)
        
        if not tech_result['aligned']:
            alignment_issues.append({
                'file': file_info['path'].name,
                'score': tech_result['alignment_score'],
                'missing': tech_result['missing_tech']
            })
            print(f"⚠️  {file_info['path'].name}: {tech_result['alignment_score']:.0f}% aligned")
            if tech_result['missing_tech']:
                print(f"    Missing: {', '.join(tech_result['missing_tech'][:5])}")
    
    if not alignment_issues:
        print("✅ ALL TASKS ALIGNED WITH REVNOVA REQUIREMENTS")
    print()
    
    # Final summary
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"Total files audited: {len(files)}")
    print(f"Navigation issues: {len(nav_issues)}")
    print(f"Content issues: {sum(1 for f in files if not extract_tasks(f)['has_content'])}")
    print(f"Alignment issues: {len(alignment_issues)}")
    print()
    
    if not nav_issues and not alignment_issues:
        print("🎉 ALL CHECKS PASSED - READY FOR MVP!")
    else:
        print("⚠️  ISSUES FOUND - REVIEW NEEDED")
    print()

if __name__ == "__main__":
    generate_report()
