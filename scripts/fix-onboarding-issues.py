#!/usr/bin/env python3
"""
Fix onboarding page issues:
1. Remove 8-Week Timeline section from sidebar
2. Fix double-click issue in JavaScript (event listeners being attached multiple times)
3. Ensure proper content spacing
"""

import os
import re
from pathlib import Path

# Get the docs/Onboarding directory
onboarding_dir = Path(__file__).parent.parent / 'docs' / 'Onboarding'

def fix_onboarding_file(file_path):
    """Fix issues in a single onboarding HTML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Issue 1: Remove the entire 8-Week Timeline section
    # Pattern: from <!-- 8-Week Timeline Section --> to the closing </div> before Developer 1
    timeline_pattern = r'<!-- 8-Week Timeline Section -->.*?</div>\s*</div>\s*(?=<!-- Developer 1: Daily Tasks Section -->|<div class="nav-section">[\s\S]*?Developer 1: Daily Tasks)'
    content = re.sub(timeline_pattern, '', content, flags=re.DOTALL)
    
    # Also remove if pattern is slightly different
    timeline_pattern2 = r'<div class="nav-section">\s*<button class="nav-section-header">[\s\S]*?8-Week Timeline[\s\S]*?</button>\s*<div class="nav-section-content">[\s\S]*?</div>\s*</div>\s*(?=<div class="nav-section">)'
    content = re.sub(timeline_pattern2, '', content, flags=re.DOTALL)
    
    # Issue 2: Fix JavaScript event listeners - ensure they're only added once
    # The current code might be calling addEventListener multiple times due to the DOMContentLoaded
    # Replace the entire script section with fixed version
    script_pattern = r'<script>[\s\S]*?// Collapsible navigation functionality[\s\S]*?</script>'
    
    fixed_script = """    <script>
        // Collapsible navigation functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Handle section headers - single click toggle
            const sectionHeaders = document.querySelectorAll('.nav-section-header');
            sectionHeaders.forEach(header => {
                // Remove any existing listeners by cloning
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);
            });
            
            // Now add listeners to fresh elements
            document.querySelectorAll('.nav-section-header').forEach(header => {
                header.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const content = this.nextElementSibling;
                    const isExpanded = this.classList.contains('expanded');
                    
                    if (isExpanded) {
                        this.classList.remove('expanded');
                        content.classList.remove('expanded');
                    } else {
                        this.classList.add('expanded');
                        content.classList.add('expanded');
                    }
                });
            });
            
            // Handle subsection headers - single click toggle
            const subsectionHeaders = document.querySelectorAll('.nav-subsection-header');
            subsectionHeaders.forEach(header => {
                // Remove any existing listeners by cloning
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);
            });
            
            // Now add listeners to fresh elements
            document.querySelectorAll('.nav-subsection-header').forEach(header => {
                header.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const content = this.nextElementSibling;
                    const isExpanded = this.classList.contains('expanded');
                    
                    if (isExpanded) {
                        this.classList.remove('expanded');
                        content.classList.remove('expanded');
                    } else {
                        this.classList.add('expanded');
                        content.classList.add('expanded');
                    }
                });
            });
            
            // Auto-expand ONLY the current developer section and week
            const activeLinks = document.querySelectorAll('.nav-subsection-link.active');
            activeLinks.forEach(link => {
                // Expand parent developer section (only if it contains "Daily Tasks")
                let devSection = link.closest('.nav-section-content');
                if (devSection) {
                    const header = devSection.previousElementSibling;
                    if (header && header.textContent.includes('Daily Tasks')) {
                        devSection.classList.add('expanded');
                        header.classList.add('expanded');
                    }
                }
                
                // Expand parent week subsection
                let weekSubsection = link.closest('.nav-subsection-content');
                if (weekSubsection) {
                    weekSubsection.classList.add('expanded');
                    weekSubsection.previousElementSibling.classList.add('expanded');
                }
            });
        });
    </script>"""
    
    content = re.sub(script_pattern, fixed_script, content, flags=re.DOTALL)
    
    # Only write if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Process all onboarding HTML files."""
    if not onboarding_dir.exists():
        print(f"❌ Onboarding directory not found: {onboarding_dir}")
        return
    
    # Find all HTML files in onboarding directory
    html_files = sorted(onboarding_dir.glob('dev*.html'))
    
    if not html_files:
        print(f"❌ No HTML files found in {onboarding_dir}")
        return
    
    print(f"🔧 Processing {len(html_files)} onboarding files...\n")
    
    updated_count = 0
    for file_path in html_files:
        try:
            if fix_onboarding_file(file_path):
                print(f"✅ Fixed: {file_path.name}")
                updated_count += 1
            else:
                print(f"⏭  No changes: {file_path.name}")
        except Exception as e:
            print(f"❌ Error processing {file_path.name}: {e}")
    
    print(f"\n📊 Summary: {updated_count} files updated, {len(html_files) - updated_count} files unchanged")

if __name__ == '__main__':
    main()
