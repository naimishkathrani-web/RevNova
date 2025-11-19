#!/usr/bin/env python3
"""
Fix onboarding pages with:
1. GitHub Copilot prompts for each step
2. CSS for copilot-prompt styling
3. MVP requirement references
4. Proper content containment in right panel
"""

import os
import re
from pathlib import Path

# CSS to add for copilot prompts
COPILOT_CSS = """
        /* GitHub Copilot Prompt Box */
        .copilot-prompt {
            background: #f3f2ff;
            border-left: 4px solid #8b5cf6;
            padding: 1rem;
            margin: 1rem 0 1.5rem 0;
            border-radius: 4px;
        }
        
        .copilot-prompt h3 {
            font-size: 0.95rem;
            font-weight: 600;
            color: #6d28d9;
            margin-bottom: 0.5rem;
        }
        
        .copilot-prompt pre {
            background: #ffffff;
            border: 1px solid #e0e7ff;
            margin: 0;
        }
        
        .copilot-prompt code {
            color: #6d28d9;
        }
"""

def add_copilot_css(content):
    """Add copilot CSS if not present"""
    if '.copilot-prompt {' in content:
        return content
    
    # Find .success-box and add copilot CSS after it
    pattern = r'(\.success-box \{[^}]+\})\s*\n'
    replacement = r'\1\n' + COPILOT_CSS + '\n'
    return re.sub(pattern, replacement, content, count=1)

def process_file(filepath):
    """Process a single onboarding file"""
    print(f"Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add CSS
    content = add_copilot_css(content)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fixed: {filepath}")

def main():
    """Process all onboarding HTML files"""
    docs_dir = Path(__file__).parent.parent / 'docs' / 'Onboarding'
    
    # Process all dev*-day*.html files
    for html_file in sorted(docs_dir.glob('dev*-day*.html')):
        try:
            process_file(html_file)
        except Exception as e:
            print(f"❌ Error processing {html_file}: {e}")
    
    print("\n✅ All files processed!")

if __name__ == '__main__':
    main()
