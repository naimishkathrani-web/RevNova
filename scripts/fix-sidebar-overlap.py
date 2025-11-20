"""
Fix sidebar overlap issue in all requirements and onboarding pages.
Updates the .main-content CSS to ensure content doesn't go behind the fixed sidebar.
"""

import os
import re
from pathlib import Path

def fix_sidebar_overlap(file_path):
    """Fix the main-content CSS to prevent overlap with fixed sidebar."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern 1: Fix onboarding pages with margin-left, max-width, flex
        # Match: .main-content { margin-left: 280px; padding: ...; max-width: 1200px; flex: 1; }
        pattern1 = r'(\.main-content\s*{\s*)margin-left:\s*280px;\s*padding:\s*([^;]+);\s*max-width:\s*1200px;\s*flex:\s*1;\s*}'
        replacement1 = r'\1margin-left: 280px;\n            padding: \2;\n            width: calc(100% - 280px);\n            max-width: calc(1200px + 280px);\n            box-sizing: border-box;\n        }'
        content = re.sub(pattern1, replacement1, content)
        
        # Pattern 2: Fix requirements pages with flex: 1 and margin-left
        pattern2 = r'(\.main-content\s*{)\s*(flex:\s*1;)\s*(margin-left:\s*280px;)\s*(padding:\s*[^;]+;)\s*(background:\s*[^;]+;)\s*(min-width:\s*0;)\s*}'
        replacement2 = r'\1\n            width: calc(100% - 280px);\n            \3\n            \4\n            \5\n            box-sizing: border-box;\n        }'
        content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)
        
        # Pattern 3: Simpler case - just margin-left with flex
        if content == original_content:
            pattern3 = r'(\.main-content\s*{\s*)(flex:\s*1;\s*)(margin-left:\s*280px;)'
            replacement3 = r'\1width: calc(100% - 280px);\n            \3box-sizing: border-box;\n            '
            content = re.sub(pattern3, replacement3, content)
        
        # Pattern 4: Remove max-width that's too restrictive when sidebar is present
        if '.main-content' in content and 'margin-left: 280px' in content:
            # If there's a max-width without proper calc adjustment
            content = re.sub(
                r'(\.main-content\s*{[^}]*?margin-left:\s*280px[^}]*?)max-width:\s*1200px;',
                r'\1',
                content,
                flags=re.DOTALL
            )
        
        # Write back if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # Get the repository root
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    # Process requirements pages
    requirements_dir = repo_root / 'docs' / 'RevNovaRequirements'
    onboarding_dir = repo_root / 'docs' / 'Onboarding'
    
    fixed_count = 0
    total_count = 0
    
    print("Fixing sidebar overlap issues...")
    print("=" * 60)
    
    # Process requirements files
    if requirements_dir.exists():
        for html_file in requirements_dir.glob('*.html'):
            total_count += 1
            if fix_sidebar_overlap(html_file):
                fixed_count += 1
                print(f"✓ Fixed: {html_file.name}")
    
    # Process onboarding files
    if onboarding_dir.exists():
        for html_file in onboarding_dir.glob('*.html'):
            total_count += 1
            if fix_sidebar_overlap(html_file):
                fixed_count += 1
                print(f"✓ Fixed: {html_file.name}")
    
    print("=" * 60)
    print(f"Fixed {fixed_count} out of {total_count} files")

if __name__ == '__main__':
    main()
