"""
Comprehensive audit script for RevNova onboarding materials.
Checks:
1. Navigation consistency (sidebar should not be disturbed when clicking day links)
2. Task content alignment with RevNova requirements
3. Week/Day consistency across all developers
"""

import os
import re
from pathlib import Path

# RevNova Core Requirements
REVNOVA_CORE = {
    "7_step_wizard": [
        "OAuth Connection",
        "Schema Analysis",
        "AI Field Mapping",
        "Drag-Drop Customization",
        "Preview Transformations",
        "Async ETL",
        "Migration Execution & Reports"
    ],
    "backend": ["Node.js", "Express", "TypeScript", "PostgreSQL", "Redis", "Bull", "jsforce", "OpenAI"],
    "frontend": ["React 18", "TypeScript", "TailwindCSS", "Vite", "@dnd-kit", "SSE"],
    "devops": ["Docker", "docker-compose", "GitHub Actions", "Prometheus", "Grafana", "k6"]
}

def get_all_day_files():
    """Get all day files from Week 2 onwards"""
    docs_dir = Path(__file__).parent.parent / "docs" / "Onboarding"
    pattern = re.compile(r"dev(\d+)-day(\d+)\.html")
    
    files = []
    for file in docs_dir.glob("dev*-day*.html"):
        match = pattern.match(file.name)
        if match:
            dev = int(match.group(1))
            day = int(match.group(2))
            if day >= 6:  # Week 2+ only (Day 6 onwards)
                files.append({
                    'path': file,
                    'dev': dev,
                    'day': day,
                    'week': ((day - 1) // 5) + 1,
                    'name': file.name
                })
    
    return sorted(files, key=lambda x: (x['dev'], x['day']))

def check_navigation_structure(file_info):
    """Check navigation structure for consistency"""
    with open(file_info['path'], 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    
    # Check for collapsible sidebar (has-children class)
    if 'has-children' not in content:
        issues.append("Missing collapsible navigation structure")
    
    # Check for week groupings (should have multiple week sections)
    week_pattern = r'<li class="has-children">'
    week_count = len(re.findall(week_pattern, content))
    
    if file_info['dev'] in [1, 2]:
        expected_min = 4  # Should have at least 4-5 week groupings
        if week_count < expected_min:
            issues.append(f"Expected {expected_min}+ week groupings, found {week_count}")
    else:  # Dev3 has condensed structure
        expected_min = 2
        if week_count < expected_min:
            issues.append(f"Expected {expected_min}+ week groupings, found {week_count}")
    
    # Check for proper non-clickable week headers (cursor:default)
    if 'cursor:default' in content or 'cursor: default' in content:
        # Good - week headers are non-clickable
        pass
    else:
        # Check if older format without inline styles
        if '<span style="font-weight:600' in content:
            issues.append("Week headers may be missing cursor:default style")
    
    # Check for day links
    day_link_pattern = r'href="dev\d+-day\d+\.html"'
    day_links = len(re.findall(day_link_pattern, content))
    
    if day_links < 15:  # Should have links to at least 15+ days
        issues.append(f"Expected 15+ day links, found {day_links}")
    
    # Check for sidebar navigation
    if '<nav' not in content or 'sidebar' not in content.lower():
        issues.append("Missing sidebar navigation structure")
    
    return {
        'file': file_info['name'],
        'issues': issues,
        'week_count': week_count,
        'day_links': day_links,
        'status': '✅ PASS' if not issues else '⚠️ ISSUES'
    }

def check_task_content(file_info):
    """Check if tasks are present and comprehensive"""
    with open(file_info['path'], 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove header and navigation to focus on main content
    main_content = content
    if '<main' in content:
        main_start = content.find('<main')
        main_end = content.find('</main>')
        if main_start != -1 and main_end != -1:
            main_content = content[main_start:main_end]
    
    metrics = {
        'has_copilot_prompt': 'RevNova' in main_content and 'Copilot' in main_content,
        'has_tasks': bool(re.search(r'<li>.*?</li>', main_content, re.DOTALL)),
        'has_code': '<code>' in main_content or '<pre>' in main_content,
        'has_acceptance_criteria': 'Acceptance Criteria' in main_content or 'acceptance criteria' in main_content,
        'content_length': len(main_content.strip()),
        'has_implementation_steps': 'Step 1' in main_content or 'Step 2' in main_content
    }
    
    # Extract task count
    task_matches = re.findall(r'<li[^>]*>(.+?)</li>', main_content, re.DOTALL)
    metrics['task_count'] = len([t for t in task_matches if len(t.strip()) > 10])
    
    # Quality score (0-100)
    score = 0
    if metrics['has_copilot_prompt']: score += 20
    if metrics['has_tasks']: score += 20
    if metrics['has_code']: score += 20
    if metrics['has_acceptance_criteria']: score += 20
    if metrics['has_implementation_steps']: score += 20
    
    metrics['quality_score'] = score
    metrics['status'] = '✅' if score >= 60 else '⚠️'
    
    return metrics

def check_tech_alignment(file_info):
    """Check if content aligns with RevNova tech stack"""
    with open(file_info['path'], 'r', encoding='utf-8') as f:
        content = f.read().lower()
    
    dev = file_info['dev']
    week = file_info['week']
    
    # Define expected technologies per developer per week
    expected = []
    
    if dev == 1:  # Backend Developer
        if week == 2:
            expected = ['jsforce', 'oauth', 'salesforce', 'connection']
        elif week == 3:
            expected = ['gpt-4', 'openai', 'mapping', 'confidence']
        elif week == 4:
            expected = ['bull', 'queue', 'redis', 'transformation']
        elif week == 5:
            expected = ['migration', 'execution', 'rollback', 'report']
    
    elif dev == 2:  # Frontend Developer
        if week == 2:
            expected = ['react', 'oauth', 'connection', 'wizard']
        elif week == 3:
            expected = ['dnd-kit', 'drag', 'drop', 'mapping']
        elif week == 4:
            expected = ['transformation', 'preview', 'validation']
        elif week == 5:
            expected = ['sse', 'progress', 'report', 'execution']
    
    elif dev == 3:  # DevOps Developer
        if week == 2:
            expected = ['docker', 'compose', 'environment']
        elif week in [3, 4]:
            expected = ['test', 'integration', 'playwright', 'e2e']
        elif week == 5:
            expected = ['prometheus', 'grafana', 'monitoring', 'deployment']
    
    found = [tech for tech in expected if tech in content]
    missing = [tech for tech in expected if tech not in content]
    
    alignment = (len(found) / len(expected) * 100) if expected else 100
    
    return {
        'expected': expected,
        'found': found,
        'missing': missing,
        'alignment_percent': alignment,
        'status': '✅' if alignment >= 50 else '⚠️'
    }

def print_report():
    """Generate and print comprehensive audit report"""
    print("\n" + "=" * 90)
    print("REVNOVA ONBOARDING MATERIALS - COMPREHENSIVE AUDIT REPORT")
    print("Checking: Navigation consistency, Task quality, Tech alignment")
    print("=" * 90 + "\n")
    
    files = get_all_day_files()
    print(f"📁 Auditing {len(files)} files (Week 2 onwards - Days 6-25)\n")
    
    # Navigation Audit
    print("🔍 NAVIGATION STRUCTURE AUDIT")
    print("-" * 90)
    nav_pass = 0
    nav_issues = []
    
    for file_info in files:
        result = check_navigation_structure(file_info)
        if not result['issues']:
            nav_pass += 1
        else:
            nav_issues.append(result)
    
    print(f"✅ Passed: {nav_pass}/{len(files)} files")
    
    if nav_issues:
        print(f"\n⚠️  Issues found in {len(nav_issues)} files:")
        for issue in nav_issues[:10]:  # Show first 10
            print(f"   {issue['file']}: {len(issue['issues'])} issues")
            for i in issue['issues'][:3]:
                print(f"      - {i}")
    else:
        print("✅ ALL NAVIGATION STRUCTURES CONSISTENT - Left panel will not be disturbed!")
    
    print()
    
    # Task Content Audit
    print("📝 TASK CONTENT QUALITY AUDIT")
    print("-" * 90)
    
    content_by_dev = {1: [], 2: [], 3: []}
    for file_info in files:
        metrics = check_task_content(file_info)
        metrics['file'] = file_info['name']
        content_by_dev[file_info['dev']].append(metrics)
    
    for dev in [1, 2, 3]:
        files_dev = content_by_dev[dev]
        avg_score = sum(f['quality_score'] for f in files_dev) / len(files_dev) if files_dev else 0
        
        with_copilot = sum(1 for f in files_dev if f['has_copilot_prompt'])
        with_code = sum(1 for f in files_dev if f['has_code'])
        with_acceptance = sum(1 for f in files_dev if f['has_acceptance_criteria'])
        
        print(f"\nDeveloper {dev}:")
        print(f"  📊 Average Quality Score: {avg_score:.0f}/100")
        print(f"  🤖 Enhanced Copilot Prompts: {with_copilot}/{len(files_dev)}")
        print(f"  💻 Code Examples: {with_code}/{len(files_dev)}")
        print(f"  ✓  Acceptance Criteria: {with_acceptance}/{len(files_dev)}")
        
        # Show low-quality files
        low_quality = [f for f in files_dev if f['quality_score'] < 60]
        if low_quality:
            print(f"  ⚠️  Low quality files ({len(low_quality)}):")
            for lq in low_quality[:3]:
                print(f"      - {lq['file']}: {lq['quality_score']}/100")
    
    print()
    
    # Tech Alignment Audit
    print("🔧 TECHNOLOGY ALIGNMENT AUDIT")
    print("-" * 90)
    
    alignment_by_dev = {1: [], 2: [], 3: []}
    for file_info in files:
        alignment = check_tech_alignment(file_info)
        alignment['file'] = file_info['name']
        alignment['week'] = file_info['week']
        alignment_by_dev[file_info['dev']].append(alignment)
    
    for dev in [1, 2, 3]:
        files_dev = alignment_by_dev[dev]
        avg_alignment = sum(f['alignment_percent'] for f in files_dev) / len(files_dev) if files_dev else 0
        
        print(f"\nDeveloper {dev}:")
        print(f"  📊 Average Alignment: {avg_alignment:.0f}%")
        
        # Show misalignment issues
        misaligned = [f for f in files_dev if f['alignment_percent'] < 50]
        if misaligned:
            print(f"  ⚠️  Files needing review ({len(misaligned)}):")
            for ma in misaligned[:3]:
                print(f"      - {ma['file']} (Week {ma['week']}): {ma['alignment_percent']:.0f}% aligned")
                if ma['missing']:
                    print(f"        Missing: {', '.join(ma['missing'][:4])}")
        else:
            print(f"  ✅ All tasks aligned with RevNova requirements!")
    
    print()
    
    # Final Summary
    print("=" * 90)
    print("📊 FINAL SUMMARY")
    print("=" * 90)
    
    total_files = len(files)
    nav_pass_rate = (nav_pass / total_files * 100)
    
    all_content = []
    all_alignment = []
    for dev in [1, 2, 3]:
        all_content.extend(content_by_dev[dev])
        all_alignment.extend(alignment_by_dev[dev])
    
    high_quality = sum(1 for c in all_content if c['quality_score'] >= 60)
    content_pass_rate = (high_quality / total_files * 100)
    
    well_aligned = sum(1 for a in all_alignment if a['alignment_percent'] >= 50)
    alignment_pass_rate = (well_aligned / total_files * 100)
    
    print(f"\n✅ Navigation Consistency: {nav_pass_rate:.0f}% ({nav_pass}/{total_files})")
    print(f"✅ Content Quality: {content_pass_rate:.0f}% ({high_quality}/{total_files})")
    print(f"✅ Tech Alignment: {alignment_pass_rate:.0f}% ({well_aligned}/{total_files})")
    
    overall_score = (nav_pass_rate + content_pass_rate + alignment_pass_rate) / 3
    print(f"\n📈 OVERALL SCORE: {overall_score:.0f}%")
    
    if overall_score >= 90:
        print("\n🎉 EXCELLENT! All onboarding materials are MVP-ready!")
        print("✅ Left panel navigation is consistent")
        print("✅ Tasks are comprehensive and well-documented")
        print("✅ Content aligns with RevNova platform requirements")
    elif overall_score >= 75:
        print("\n✅ GOOD! Materials are ready with minor improvements recommended")
    else:
        print("\n⚠️  NEEDS ATTENTION - Review recommended before MVP launch")
    
    print("\n" + "=" * 90 + "\n")

if __name__ == "__main__":
    print_report()
