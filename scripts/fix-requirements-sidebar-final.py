#!/usr/bin/env python3
"""
FINAL FIX: Replace ALL sidebar CSS and HTML in requirements pages to match Salesforce style exactly.
This script will properly replace the entire <style> block keeping only page-specific styles.
"""

import os
import re
from pathlib import Path

# Standard Salesforce-style CSS for requirements pages
STANDARD_SIDEBAR_CSS = """    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
        
        .requirements-layout {
            display: flex;
            min-height: calc(100vh - 80px);
            margin-top: 80px;
        }
        
        /* Salesforce-style sidebar */
        .sidebar {
            width: 280px;
            background: #f4f6f9;
            border-right: 1px solid #c9c9c9;
            position: fixed;
            height: calc(100vh - 80px);
            overflow-y: auto;
            top: 80px;
            left: 0;
            z-index: 100;
        }
        
        .sidebar::-webkit-scrollbar { width: 8px; }
        .sidebar::-webkit-scrollbar-track { background: #f4f6f9; }
        .sidebar::-webkit-scrollbar-thumb { background: #c9c9c9; border-radius: 4px; }
        .sidebar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        
        .sidebar-nav { padding: 1rem 0; }
        
        .nav-section { margin-bottom: 0.25rem; }
        
        .nav-section-header {
            display: flex;
            align-items: center;
            padding: 0.5rem 1rem;
            font-size: 13px;
            font-weight: 600;
            color: #181818;
            background: none;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            transition: background 0.15s;
        }
        
        .nav-section-header:hover { background: #e5e5e5; }
        .nav-section-header.expanded { background: #e5e5e5; }
        
        .nav-section-icon {
            width: 16px;
            height: 16px;
            margin-right: 0.5rem;
            transition: transform 0.2s;
            flex-shrink: 0;
        }
        
        .nav-section-header.expanded .nav-section-icon { transform: rotate(90deg); }
        
        .nav-section-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }
        
        .nav-section-content.expanded { max-height: 2000px; }
        
        .nav-link {
            display: block;
            padding: 0.5rem 1rem 0.5rem 2.5rem;
            color: #006dcc;
            text-decoration: none;
            font-size: 13px;
            transition: background 0.15s;
        }
        
        .nav-link:hover {
            background: #e5e5e5;
            text-decoration: underline;
        }
        
        .nav-link.active {
            background: #1589ee;
            color: #fff;
            font-weight: 600;
        }
        
        .nav-link.active:hover {
            background: #0b5cab;
            text-decoration: none;
        }
        
        .nav-subsection { margin: 0.25rem 0; }
        
        .nav-subsection-header {
            display: flex;
            align-items: center;
            padding: 0.5rem 1rem 0.5rem 2.5rem;
            font-size: 13px;
            font-weight: 500;
            color: #181818;
            background: none;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            transition: background 0.15s;
        }
        
        .nav-subsection-header:hover { background: #e5e5e5; }
        .nav-subsection-header.expanded { background: #e5e5e5; }
        
        .nav-subsection-icon {
            width: 12px;
            height: 12px;
            margin-right: 0.5rem;
            transition: transform 0.2s;
            flex-shrink: 0;
        }
        
        .nav-subsection-header.expanded .nav-subsection-icon { transform: rotate(90deg); }
        
        .nav-subsection-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }
        
        .nav-subsection-content.expanded { max-height: 1000px; }
        
        .nav-subsection-link {
            display: block;
            padding: 0.4rem 1rem 0.4rem 3.5rem;
            color: #006dcc;
            text-decoration: none;
            font-size: 13px;
            transition: background 0.15s;
        }
        
        .nav-subsection-link:hover {
            background: #e5e5e5;
            text-decoration: underline;
        }
        
        .nav-subsection-link.active {
            background: #1589ee;
            color: #fff;
            font-weight: 600;
        }
        
        .nav-subsection-link.active:hover {
            background: #0b5cab;
            text-decoration: none;
        }
        
        /* Main content */
        .main-content {
            flex: 1;
            margin-left: 280px;
            padding: 2rem 3rem;
            background: #fff;
            min-width: 0;
        }
"""

# Standard sidebar HTML
STANDARD_SIDEBAR_HTML = """        <aside class="sidebar">
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
                                <a href="requirements-phase1-quotes.html" class="nav-subsection-link">8. Quotes</a>
                                <a href="requirements-phase1-contracts.html" class="nav-subsection-link">9. Contracts</a>
                                <a href="requirements-phase1-subscriptions.html" class="nav-subsection-link">10. Subscriptions</a>
                                <a href="requirements-phase1-inflight.html" class="nav-subsection-link">11. In-Flight Orders</a>
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
                        Phase 2 - AI-Powered Configuration
                    </button>
                    <div class="nav-section-content">
                        <a href="requirements-phase2-functional.html" class="nav-link">Functional Requirements</a>
                        <a href="requirements-phase2-technical.html" class="nav-link">Technical Requirements</a>
                        <a href="ai-product-configuration.html" class="nav-link">AI Product Configuration Engine</a>
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
                        Phase 4 - CRM Integration
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
                        Phase 5 - ERP Connector
                    </button>
                    <div class="nav-section-content">
                        <a href="requirements-phase5-functional.html" class="nav-link">Functional Requirements</a>
                        <a href="requirements-phase5-technical.html" class="nav-link">Technical Requirements</a>
                    </div>
                </div>
                
                <!-- Additional Resources -->
                <div class="nav-section">
                    <button class="nav-section-header">
                        <svg class="nav-section-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6 6L14 10L6 14V6Z"/>
                        </svg>
                        Additional Resources
                    </button>
                    <div class="nav-section-content">
                        <a href="security-compliance.html" class="nav-link">Security & Compliance</a>
                        <a href="performance-scalability.html" class="nav-link">Performance & Scalability</a>
                    </div>
                </div>
            </nav>
        </aside>"""

# Collapsible JavaScript
COLLAPSIBLE_SCRIPT = """
    <script>
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', function() {
            // Clone all section headers to remove any duplicate event listeners
            const sectionHeaders = document.querySelectorAll('.nav-section-header');
            sectionHeaders.forEach(header => {
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);
            });
            
            // Clone all subsection headers
            const subsectionHeaders = document.querySelectorAll('.nav-subsection-header');
            subsectionHeaders.forEach(header => {
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);
            });
            
            // Add click handlers to main section headers
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
            
            // Add click handlers to subsection headers
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
            const activeLink = document.querySelector('.nav-link.active, .nav-subsection-link.active');
            if (activeLink) {
                let parent = activeLink.parentElement;
                while (parent && !parent.classList.contains('sidebar')) {
                    if (parent.classList.contains('nav-section-content') || parent.classList.contains('nav-subsection-content')) {
                        parent.classList.add('expanded');
                        const header = parent.previousElementSibling;
                        if (header) {
                            header.classList.add('expanded');
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        });
    </script>"""


def fix_requirements_file(file_path):
    """Fix a single requirements HTML file with proper CSS and HTML replacement."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Step 1: Replace everything from <style> to .main-content{...} with standard CSS
        # Then preserve everything after .main-content style
        style_pattern = r'(<style>.*?)(\.main-content\s*\{[^}]*\})(.*?)(</style>)'
        match = re.search(style_pattern, content, re.DOTALL)
        
        if match:
            # Get the page-specific styles that come after .main-content
            page_specific_styles = match.group(3)
            closing_tag = match.group(4)
            
            # Replace with standard sidebar CSS + page-specific styles
            new_style_block = STANDARD_SIDEBAR_CSS + page_specific_styles + closing_tag
            content = re.sub(style_pattern, new_style_block, content, flags=re.DOTALL)
        
        # Step 2: Replace sidebar HTML (from <aside class="sidebar"> to </aside>)
        sidebar_pattern = r'<aside class="sidebar">.*?</aside>'
        content = re.sub(sidebar_pattern, STANDARD_SIDEBAR_HTML, content, flags=re.DOTALL)
        
        # Step 3: Ensure collapsible script exists before </body>
        if COLLAPSIBLE_SCRIPT.strip() not in content:
            # Remove any old script
            old_script_pattern = r'<script>.*?DOMContentLoaded.*?</script>'
            content = re.sub(old_script_pattern, '', content, flags=re.DOTALL)
            
            # Add new script before </body>
            if '</body>' in content:
                content = content.replace('</body>', f'{COLLAPSIBLE_SCRIPT}\n</body>')
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False


def main():
    """Process all requirements HTML files."""
    requirements_dir = Path(__file__).parent.parent / 'docs' / 'RevNovaRequirements'
    
    if not requirements_dir.exists():
        print(f"Requirements directory not found: {requirements_dir}")
        return
    
    html_files = sorted(requirements_dir.glob('*.html'))
    
    if not html_files:
        print("No HTML files found in requirements directory")
        return
    
    print(f"Processing {len(html_files)} requirements files...")
    print("-" * 60)
    
    fixed_count = 0
    unchanged_count = 0
    
    for html_file in html_files:
        if fix_requirements_file(html_file):
            print(f"✅ Fixed: {html_file.name}")
            fixed_count += 1
        else:
            print(f"⏭  No changes: {html_file.name}")
            unchanged_count += 1
    
    print("-" * 60)
    print(f"📊 Summary: {fixed_count} files updated, {unchanged_count} files unchanged")


if __name__ == '__main__':
    main()
