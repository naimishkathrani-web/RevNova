#!/usr/bin/env python3
"""
Fix requirements page issues:
1. Convert static h3/ul sidebar to collapsible sections like onboarding
2. Remove extra space between header and content (reduce margin-top)
"""

import os
import re
from pathlib import Path

# Get the docs/RevNovaRequirements directory
requirements_dir = Path(__file__).parent.parent / 'docs' / 'RevNovaRequirements'

# New collapsible sidebar styles
NEW_SIDEBAR_STYLES = """    .requirements-layout{display:flex;min-height:calc(100vh - 80px);margin-top:80px}
    .sidebar{width:280px;background:#f4f6f9;border-right:1px solid #c9c9c9;padding:0;position:fixed;height:calc(100vh - 80px);overflow-y:auto;top:80px;left:0;z-index:100}
    .sidebar::-webkit-scrollbar{width:8px}
    .sidebar::-webkit-scrollbar-track{background:#f4f6f9}
    .sidebar::-webkit-scrollbar-thumb{background:#c9c9c9;border-radius:4px}
    .sidebar::-webkit-scrollbar-thumb:hover{background:#a8a8a8}
    .sidebar-nav{padding:1rem 0}
    .nav-section{margin-bottom:0.25rem}
    .nav-section-header{display:flex;align-items:center;padding:0.5rem 1rem;font-size:13px;font-weight:600;color:#181818;background:none;border:none;width:100%;text-align:left;cursor:pointer;transition:background 0.15s}
    .nav-section-header:hover{background:#e5e5e5}
    .nav-section-header.expanded{background:#e5e5e5}
    .nav-section-icon{width:16px;height:16px;margin-right:0.5rem;transition:transform 0.2s;flex-shrink:0}
    .nav-section-header.expanded .nav-section-icon{transform:rotate(90deg)}
    .nav-section-content{max-height:0;overflow:hidden;transition:max-height 0.3s ease-out}
    .nav-section-content.expanded{max-height:2000px}
    .nav-link{display:block;padding:0.5rem 1rem 0.5rem 2.5rem;color:#006dcc;text-decoration:none;font-size:13px;transition:background 0.15s}
    .nav-link:hover{background:#e5e5e5;text-decoration:underline}
    .nav-link.active{background:#1589ee;color:#fff;font-weight:600}
    .nav-link.active:hover{background:#0b5cab;text-decoration:none}
    .nav-subsection{margin:0.25rem 0}
    .nav-subsection-header{display:flex;align-items:center;padding:0.5rem 1rem 0.5rem 2.5rem;font-size:13px;font-weight:500;color:#181818;background:none;border:none;width:100%;text-align:left;cursor:pointer;transition:background 0.15s}
    .nav-subsection-header:hover{background:#e5e5e5}
    .nav-subsection-header.expanded{background:#e5e5e5}
    .nav-subsection-icon{width:12px;height:12px;margin-right:0.5rem;transition:transform 0.2s;flex-shrink:0}
    .nav-subsection-header.expanded .nav-subsection-icon{transform:rotate(90deg)}
    .nav-subsection-content{max-height:0;overflow:hidden;transition:max-height 0.3s ease-out}
    .nav-subsection-content.expanded{max-height:1000px}
    .nav-subsection-link{display:block;padding:0.4rem 1rem 0.4rem 3.5rem;color:#006dcc;text-decoration:none;font-size:13px;transition:background 0.15s}
    .nav-subsection-link:hover{background:#e5e5e5;text-decoration:underline}
    .nav-subsection-link.active{background:#1589ee;color:#fff;font-weight:600}
    .nav-subsection-link.active:hover{background:#0b5cab;text-decoration:none}
    .main-content{flex:1;margin-left:280px;padding:2rem 3rem;background:#fff}
    .mapping-table{width:100%;border-collapse:collapse;margin-bottom:1.5rem}
    .mapping-table th,.mapping-table td{border:1px solid #ddd;padding:8px;font-size:13px}
    .mapping-table th{background:#f0f6fb}
    .sheet-title{margin-top:1.5rem;color:#11998e;border-bottom:2px solid #38ef7d;padding-bottom:0.5rem}
    @media (max-width:768px){.sidebar{position:relative;width:100%;height:auto;top:0}.main-content{margin-left:0}.requirements-layout{flex-direction:column}}"""

# New collapsible sidebar HTML structure
NEW_SIDEBAR_HTML = """    <aside class="sidebar">
        <nav class="sidebar-nav">
            <!-- Platform Vision Section -->
            <div class="nav-section">
                <button class="nav-section-header">
                    <svg class="nav-section-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 6L14 10L6 14V6Z"/>
                    </svg>
                    Platform Vision
                </button>
                <div class="nav-section-content">
                    <a href="requirements-home.html" class="nav-link">RevNova Vision & Strategy</a>
                    <a href="business-requirements.html" class="nav-link">High Level Business Requirements</a>
                    <a href="high-level-functional.html" class="nav-link">High Level Functional Design</a>
                </div>
            </div>
            
            <!-- Phase 1 Section -->
            <div class="nav-section">
                <button class="nav-section-header expanded">
                    <svg class="nav-section-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 6L14 10L6 14V6Z"/>
                    </svg>
                    Phase 1 - SFDC CPQ → RCA Migration (MVP)
                </button>
                <div class="nav-section-content expanded">
                    <!-- Functional Requirements Subsection -->
                    <div class="nav-subsection">
                        <button class="nav-subsection-header">
                            <svg class="nav-subsection-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6 6L14 10L6 14V6Z"/>
                            </svg>
                            Functional Requirements
                        </button>
                        <div class="nav-subsection-content">
                            <a href="requirements-phase1-connect.html" class="nav-subsection-link">1. Connection Wizard</a>
                            <a href="requirements-phase1-analyze.html" class="nav-subsection-link">2. Schema Analysis</a>
                            <a href="requirements-phase1-mapping.html" class="nav-subsection-link">3. Field Mapping</a>
                            <a href="requirements-phase1-transform.html" class="nav-subsection-link">4. Data Transformation</a>
                            <a href="requirements-phase1-validate.html" class="nav-subsection-link">5. Validation</a>
                            <a href="requirements-phase1-execute.html" class="nav-subsection-link">6. Migration Execution</a>
                            <a href="requirements-phase1-test.html" class="nav-subsection-link">7. Post-Migration Testing</a>
                        </div>
                    </div>
                    
                    <!-- Technical Requirements Subsection -->
                    <div class="nav-subsection">
                        <button class="nav-subsection-header">
                            <svg class="nav-subsection-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6 6L14 10L6 14V6Z"/>
                            </svg>
                            Technical Requirements
                        </button>
                        <div class="nav-subsection-content">
                            <a href="requirements-phase1-technical.html" class="nav-subsection-link">Migration Architecture</a>
                            <a href="requirements-phase1-technical.html#api" class="nav-subsection-link">API Specifications</a>
                            <a href="requirements-phase1-technical.html#database" class="nav-subsection-link">Database Schema</a>
                            <a href="requirements-phase1-technical.html#orchestration" class="nav-subsection-link">Orchestration Engine</a>
                        </div>
                    </div>
                    
                    <a href="requirements-mapping.html" class="nav-link">Complete Field Mapping</a>
                </div>
            </div>
            
            <!-- Phase 2 Section -->
            <div class="nav-section">
                <button class="nav-section-header">
                    <svg class="nav-section-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 6L14 10L6 14V6Z"/>
                    </svg>
                    Phase 2 - AI Product Configuration
                </button>
                <div class="nav-section-content">
                    <a href="requirements-phase2-generate.html" class="nav-link">Generate with AI</a>
                    <a href="requirements-phase2-modify.html" class="nav-link">Modify with AI</a>
                    <a href="requirements-phase2-adopt.html" class="nav-link">Adopt AI Suggestions</a>
                    <a href="requirements-phase2-planning.html" class="nav-link">Planning Generators</a>
                    <a href="requirements-phase2-impact.html" class="nav-link">Impact Analyzer</a>
                    <a href="requirements-phase2-budget.html" class="nav-link">Budget Calculator</a>
                    <a href="requirements-phase2-technical.html" class="nav-link">Technical Requirements</a>
                </div>
            </div>
            
            <!-- Phase 3 Section -->
            <div class="nav-section">
                <button class="nav-section-header">
                    <svg class="nav-section-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 6L14 10L6 14V6Z"/>
                    </svg>
                    Phase 3 - Multi-CPQ Support
                </button>
                <div class="nav-section-content">
                    <a href="requirements-phase3-functional.html" class="nav-link">Functional Requirements</a>
                    <a href="requirements-phase3-technical.html" class="nav-link">Technical Requirements</a>
                </div>
            </div>
            
            <!-- Phase 4 Section -->
            <div class="nav-section">
                <button class="nav-section-header">
                    <svg class="nav-section-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 6L14 10L6 14V6Z"/>
                    </svg>
                    Phase 4 - CRM + CPQ Integration
                </button>
                <div class="nav-section-content">
                    <a href="requirements-phase4-functional.html" class="nav-link">Functional Requirements</a>
                    <a href="requirements-phase4-technical.html" class="nav-link">Technical Requirements</a>
                </div>
            </div>
            
            <!-- Phase 5 Section -->
            <div class="nav-section">
                <button class="nav-section-header">
                    <svg class="nav-section-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 6L14 10L6 14V6Z"/>
                    </svg>
                    Phase 5 - ERP Integration
                </button>
                <div class="nav-section-content">
                    <a href="requirements-phase5-functional.html" class="nav-link">Functional Requirements</a>
                    <a href="requirements-phase5-technical.html" class="nav-link">Technical Requirements</a>
                </div>
            </div>
        </nav>
    </aside>"""

# JavaScript for collapsible functionality
COLLAPSIBLE_SCRIPT = """    <script>
        // Collapsible navigation functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Handle section headers - single click toggle
            const sectionHeaders = document.querySelectorAll('.nav-section-header');
            sectionHeaders.forEach(header => {
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);
            });
            
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
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);
            });
            
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
            
            // Auto-expand section containing active link
            const activeLinks = document.querySelectorAll('.nav-link.active, .nav-subsection-link.active');
            activeLinks.forEach(link => {
                // Expand parent section
                let section = link.closest('.nav-section-content');
                if (section) {
                    section.classList.add('expanded');
                    section.previousElementSibling.classList.add('expanded');
                }
                
                // Expand parent subsection if exists
                let subsection = link.closest('.nav-subsection-content');
                if (subsection) {
                    subsection.classList.add('expanded');
                    subsection.previousElementSibling.classList.add('expanded');
                }
            });
        });
    </script>"""

def fix_requirements_file(file_path):
    """Fix issues in a single requirements HTML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Issue 1: Replace old sidebar styles with new collapsible styles
    # Find the style block and replace it
    style_pattern = r'<style>.*?\.requirements-layout\{.*?@media.*?\}</style>'
    if re.search(style_pattern, content, re.DOTALL):
        new_style_block = f"<style>\n{NEW_SIDEBAR_STYLES}\n  </style>"
        content = re.sub(style_pattern, new_style_block, content, flags=re.DOTALL)
    
    # Issue 2: Replace old sidebar HTML with new collapsible structure
    sidebar_pattern = r'<aside class="sidebar">.*?</aside>'
    if re.search(sidebar_pattern, content, re.DOTALL):
        content = re.sub(sidebar_pattern, NEW_SIDEBAR_HTML, content, flags=re.DOTALL)
    
    # Issue 3: Add collapsible JavaScript if not present
    if '<script>' not in content or 'Collapsible navigation' not in content:
        # Insert before closing </body> tag
        content = content.replace('</body>', f'{COLLAPSIBLE_SCRIPT}\n</body>')
    
    # Only write if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Process all requirements HTML files."""
    if not requirements_dir.exists():
        print(f"❌ Requirements directory not found: {requirements_dir}")
        return
    
    # Find all HTML files in requirements directory
    html_files = sorted(requirements_dir.glob('*.html'))
    
    if not html_files:
        print(f"❌ No HTML files found in {requirements_dir}")
        return
    
    print(f"🔧 Processing {len(html_files)} requirements files...\n")
    
    updated_count = 0
    for file_path in html_files:
        try:
            if fix_requirements_file(file_path):
                print(f"✅ Fixed: {file_path.name}")
                updated_count += 1
            else:
                print(f"⏭  No changes: {file_path.name}")
        except Exception as e:
            print(f"❌ Error processing {file_path.name}: {e}")
    
    print(f"\n📊 Summary: {updated_count} files updated, {len(html_files) - updated_count} files unchanged")

if __name__ == '__main__':
    main()
