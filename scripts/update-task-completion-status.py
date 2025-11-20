"""
Update developer onboarding task completion status based on code audit.
Marks tasks as COMPLETE, PARTIAL, or NOT STARTED based on actual implementation.
"""

import os
import re
from pathlib import Path

# Task completion status based on comprehensive code audit
TASK_STATUS = {
    # Developer 1 (Backend) - 25 days total
    'dev1': {
        1: 'COMPLETE',   # Workstation Setup - Git configured, tools installed
        2: 'PARTIAL',    # Express API - Basic routes exist but incomplete
        3: 'NOT STARTED',  # Database Schema - Schema exists but not from Day 3 work
        4: 'NOT STARTED',  # Project Model - No full CRUD implementation
        5: 'PARTIAL',    # Connection Model - Salesforce service exists (70% done)
        6: 'COMPLETE',   # Schema Analysis Part 1 - analyze.routes.ts exists
        7: 'COMPLETE',   # Schema Analysis Part 2 - RelationshipService implemented
        8: 'COMPLETE',   # Metadata Extraction - CatalogService implemented
        9: 'COMPLETE',   # Relationship Detection - relationship.service.ts done
        10: 'NOT STARTED', # Week 2 Testing - No comprehensive tests
        11: 'NOT STARTED', # Field Mapping Part 1 - No mapping API
        12: 'NOT STARTED', # Field Mapping Part 2
        13: 'NOT STARTED', # AI Integration
        14: 'NOT STARTED', # Confidence Scoring
        15: 'NOT STARTED', # Week 3 Testing
        16: 'NOT STARTED', # Data Transformation Engine
        17: 'NOT STARTED', # Queue System
        18: 'NOT STARTED', # Job Management
        19: 'NOT STARTED', # Error Handling
        20: 'NOT STARTED', # Week 4 Testing
        21: 'NOT STARTED', # Validation Rules
        22: 'NOT STARTED', # Validation API
        23: 'NOT STARTED', # Rollback System
        24: 'NOT STARTED', # Final Integration
        25: 'NOT STARTED', # Week 5 Final Testing
    },
    # Developer 2 (Frontend) - 25 days total
    'dev2': {
        1: 'COMPLETE',   # React Setup - Vite configured, React app running
        2: 'COMPLETE',   # Component Library - Button, Input, Card exist
        3: 'COMPLETE',   # Store Setup - Zustand stores implemented
        4: 'PARTIAL',    # Connection UI - ConnectionForm exists but incomplete
        5: 'COMPLETE',   # Form Validation - Basic validation in components
        6: 'NOT STARTED', # Schema Analysis UI - No real implementation
        7: 'NOT STARTED', # Object Tree View - Missing component
        8: 'PARTIAL',    # API Integration - apiClient exists, minimal usage
        9: 'NOT STARTED', # Field Mapping UI - Missing component
        10: 'NOT STARTED', # Week 2 Testing
        11: 'NOT STARTED', # AI Suggestions UI
        12: 'NOT STARTED', # Confidence Display
        13: 'NOT STARTED', # Bulk Mapping
        14: 'NOT STARTED', # Preview Mode
        15: 'NOT STARTED', # Week 3 Testing
        16: 'NOT STARTED', # Transform UI
        17: 'NOT STARTED', # Rule Builder
        18: 'NOT STARTED', # Validation UI
        19: 'NOT STARTED', # Error Display
        20: 'NOT STARTED', # Week 4 Testing
        21: 'NOT STARTED', # Execution UI
        22: 'NOT STARTED', # Progress Dashboard
        23: 'NOT STARTED', # Report View
        24: 'NOT STARTED', # Final Polish
        25: 'NOT STARTED', # Week 5 Testing
    },
    # Developer 3 (DevOps) - 25 days total
    'dev3': {
        1: 'UNKNOWN',    # AWS Setup - Cannot verify without AWS access
        2: 'COMPLETE',   # Docker Setup - docker-compose.yml exists and works
        3: 'UNKNOWN',    # Database Setup - RDS cannot be verified
        4: 'UNKNOWN',    # Redis Setup - ElastiCache cannot be verified
        5: 'UNKNOWN',    # S3 Setup - Cannot verify
        6: 'UNKNOWN',    # Network Config - Cannot verify
        7: 'UNKNOWN',    # Security Groups - Cannot verify
        8: 'UNKNOWN',    # IAM Setup - Cannot verify
        9: 'UNKNOWN',    # Secrets Manager - Cannot verify
        10: 'UNKNOWN',   # Week 2 Review - Cannot verify
        11: 'UNKNOWN',   # CI/CD Part 1 - Cannot verify without GitHub Actions access
        12: 'UNKNOWN',   # CI/CD Part 2
        13: 'UNKNOWN',   # Testing Pipeline
        14: 'UNKNOWN',   # Staging Deploy
        15: 'UNKNOWN',   # Week 3 Review
        16: 'UNKNOWN',   # Monitoring Setup
        17: 'UNKNOWN',   # Logging
        18: 'UNKNOWN',   # Alerts
        19: 'UNKNOWN',   # Performance
        20: 'UNKNOWN',   # Week 4 Review
        21: 'UNKNOWN',   # Backup Strategy
        22: 'UNKNOWN',   # DR Plan
        23: 'UNKNOWN',   # Security Audit
        24: 'UNKNOWN',   # Production Deploy
        25: 'UNKNOWN',   # Week 5 Final Review
    }
}

def add_status_badge_to_page(file_path, status):
    """Add or update a status badge at the top of the page content."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Define status badge HTML
        if status == 'COMPLETE':
            badge_html = '''
            <div class="status-banner" style="background: #d4edda; border-left: 4px solid #28a745; padding: 1rem; margin: 1rem 0; border-radius: 4px;">
                <strong style="color: #155724;">✅ STATUS: COMPLETE</strong> - This task has been implemented and committed to the repository.
            </div>'''
        elif status == 'PARTIAL':
            badge_html = '''
            <div class="status-banner" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; margin: 1rem 0; border-radius: 4px;">
                <strong style="color: #856404;">⚠️ STATUS: PARTIALLY COMPLETE</strong> - Some components implemented, but core functionality incomplete.
            </div>'''
        elif status == 'UNKNOWN':
            badge_html = '''
            <div class="status-banner" style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 1rem; margin: 1rem 0; border-radius: 4px;">
                <strong style="color: #0c5460;">ℹ️ STATUS: CANNOT VERIFY</strong> - Infrastructure tasks require AWS/cloud access to verify completion.
            </div>'''
        else:  # NOT STARTED
            badge_html = '''
            <div class="status-banner" style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 1rem; margin: 1rem 0; border-radius: 4px;">
                <strong style="color: #721c24;">❌ STATUS: NOT STARTED</strong> - This task has not been completed yet. Implementation needed.
            </div>'''
        
        # Remove existing status banner if present
        content = re.sub(
            r'<div class="status-banner".*?</div>',
            '',
            content,
            flags=re.DOTALL
        )
        
        # Insert status banner after page title (h1 tag)
        pattern = r'(<h1[^>]*>.*?</h1>)'
        replacement = r'\1' + badge_html
        
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content, count=1)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    onboarding_dir = repo_root / 'docs' / 'Onboarding'
    
    updated_count = 0
    total_count = 0
    
    print("Updating developer task completion status...")
    print("=" * 60)
    
    for dev, tasks in TASK_STATUS.items():
        print(f"\n{dev.upper()} ({len(tasks)} tasks):")
        print("-" * 60)
        
        for day, status in tasks.items():
            total_count += 1
            file_path = onboarding_dir / f"{dev}-day{day:02d}.html"
            
            if file_path.exists():
                if add_status_badge_to_page(file_path, status):
                    updated_count += 1
                    symbol = "✅" if status == "COMPLETE" else "⚠️" if status == "PARTIAL" else "ℹ️" if status == "UNKNOWN" else "❌"
                    print(f"  {symbol} Day {day:02d}: {status} - Updated")
                else:
                    print(f"  ⚠️ Day {day:02d}: {status} - Failed to update")
            else:
                print(f"  ⚠️ Day {day:02d}: File not found - {file_path.name}")
    
    print("\n" + "=" * 60)
    print(f"Updated {updated_count} out of {total_count} task pages")
    
    # Print summary statistics
    complete = sum(1 for dev in TASK_STATUS.values() for status in dev.values() if status == 'COMPLETE')
    partial = sum(1 for dev in TASK_STATUS.values() for status in dev.values() if status == 'PARTIAL')
    not_started = sum(1 for dev in TASK_STATUS.values() for status in dev.values() if status == 'NOT STARTED')
    unknown = sum(1 for dev in TASK_STATUS.values() for status in dev.values() if status == 'UNKNOWN')
    
    print("\nOverall Progress:")
    print(f"  ✅ Complete: {complete} tasks ({complete/total_count*100:.1f}%)")
    print(f"  ⚠️ Partial: {partial} tasks ({partial/total_count*100:.1f}%)")
    print(f"  ❌ Not Started: {not_started} tasks ({not_started/total_count*100:.1f}%)")
    print(f"  ℹ️ Cannot Verify: {unknown} tasks ({unknown/total_count*100:.1f}%)")

if __name__ == '__main__':
    main()
