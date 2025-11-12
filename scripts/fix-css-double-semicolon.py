#!/usr/bin/env python3
"""
Fix CSS Double Semicolon Bug
Removes double semicolons (;;) from style attributes in onboarding HTML files.

The bug was introduced by the previous fix-navigation-consistency.py script
which added ';cursor:default' to styles that already ended with semicolons,
creating invalid CSS like 'color:#333;;cursor:default'.

This script corrects it to 'color:#333;cursor:default'.
"""

import os
import re
from pathlib import Path

def fix_css_double_semicolon(file_path):
    """Fix double semicolon in CSS style attributes."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Replace double semicolons with single semicolon
    # Pattern: #333;;cursor -> #333;cursor
    content = re.sub(r'#333;;cursor', r'#333;cursor', content)
    
    # Check if any changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Process all affected HTML files."""
    script_dir = Path(__file__).parent
    docs_dir = script_dir.parent / 'docs' / 'Onboarding'
    
    # Files with double semicolon issues (from grep search)
    affected_files = []
    
    # Dev1 days 7-25
    for day in range(7, 26):
        affected_files.append(f'dev1-day{day:02d}.html')
    
    # Dev3 days 11-25
    for day in range(11, 26):
        affected_files.append(f'dev3-day{day:02d}.html')
    
    print(f"🔧 Fixing CSS double semicolon bug in {len(affected_files)} files...\n")
    
    fixed_count = 0
    for filename in affected_files:
        file_path = docs_dir / filename
        if file_path.exists():
            if fix_css_double_semicolon(file_path):
                print(f"✅ Fixed: {filename}")
                fixed_count += 1
            else:
                print(f"⚠️  No changes: {filename}")
        else:
            print(f"❌ Not found: {filename}")
    
    print(f"\n✨ Complete! Fixed {fixed_count} out of {len(affected_files)} files.")
    print(f"📝 Bug: color:#333;;cursor -> color:#333;cursor")

if __name__ == '__main__':
    main()
