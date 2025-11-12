"""
Fix navigation consistency issues across all onboarding files.
Adds cursor:default style to week headers to prevent accidental clicks.
"""

import re
from pathlib import Path

def fix_week_header_styles(file_path):
    """Add cursor:default to week headers that are missing it"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: <span style="font-weight:600;color:#333;"> without cursor
    pattern1 = r'(<li class="has-children"><span style="font-weight:600;color:#333;)(">[^<]+</span>)'
    replacement1 = r'\1;cursor:default;display:block;padding:0.6rem 0;\2'
    
    # Only replace if cursor:default is not already present
    if 'cursor:default' not in content or 'cursor: default' not in content:
        content = re.sub(pattern1, replacement1, content)
    
    # Pattern 2: <span style="font-weight:600;color:#333;cursor:default;"> but missing display and padding
    pattern2 = r'(<li class="has-children"><span style="font-weight:600;color:#333;cursor:default;)(">[^<]+</span>)'
    replacement2 = r'\1;display:block;padding:0.6rem 0.\2'
    
    # Check if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    """Fix all dev files from Days 6-25"""
    docs_dir = Path(__file__).parent.parent / "docs" / "Onboarding"
    
    pattern = re.compile(r"dev(\d+)-day(\d+)\.html")
    files_to_fix = []
    
    for file in docs_dir.glob("dev*-day*.html"):
        match = pattern.match(file.name)
        if match:
            dev = int(match.group(1))
            day = int(match.group(2))
            if day >= 6:  # Week 2+ only
                files_to_fix.append(file)
    
    print("=" * 80)
    print("FIXING NAVIGATION CONSISTENCY")
    print("=" * 80)
    print(f"\nProcessing {len(files_to_fix)} files...\n")
    
    fixed_count = 0
    for file_path in sorted(files_to_fix):
        was_fixed = fix_week_header_styles(file_path)
        if was_fixed:
            print(f"✅ Fixed: {file_path.name}")
            fixed_count += 1
    
    print("\n" + "=" * 80)
    print(f"✅ Complete! Fixed {fixed_count}/{len(files_to_fix)} files")
    print("=" * 80)

if __name__ == "__main__":
    main()
