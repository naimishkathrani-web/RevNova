#!/usr/bin/env python3
"""
Script to update sidebar navigation across all Requirements and Onboarding pages
to ensure consistent static navigation matching the respective home pages.
"""

import os
import re
from pathlib import Path

# Define the standard sidebar HTML for Requirements pages
REQUIREMENTS_SIDEBAR = '''        <aside class="sidebar">
            <h3>Platform Vision</h3>
            <ul>
                <li><a href="requirements-home.html">RevNova Vision & Strategy</a></li>
                <li><a href="business-requirements.html">High Level Business Requirements</a></li>
                <li><a href="high-level-functional.html">High Level Functional Design</a></li>
            </ul>
            
            <h3>Phase 1 - SFDC CPQ → RCA Migration (MVP)</h3>
            <ul>
                <li><a href="#">Functional Requirements</a>
                    <ul>
                        <li><a href="requirements-phase1-connect.html">1. Connection Wizard</a></li>
                        <li><a href="requirements-phase1-analyze.html">2. Schema Analysis</a></li>
                        <li><a href="requirements-phase1-mapping.html">3. Field Mapping</a></li>
                        <li><a href="requirements-phase1-transform.html">4. Data Transformation</a></li>
                        <li><a href="requirements-phase1-validate.html">5. Validation</a></li>
                        <li><a href="requirements-phase1-execute.html">6. Migration Execution</a></li>
                        <li><a href="requirements-phase1-test.html">7. Post-Migration Testing</a></li>
                    </ul>
                </li>
                <li><a href="requirements-phase1-technical.html">Technical Requirements</a>
                    <ul>
                        <li><a href="requirements-phase1-technical.html#architecture">Migration Architecture</a></li>
                        <li><a href="requirements-phase1-technical.html#api">API Specifications</a></li>
                        <li><a href="requirements-phase1-technical.html#database">Database Schema</a></li>
                        <li><a href="requirements-phase1-technical.html#orchestration">Orchestration Engine</a></li>
                    </ul>
                </li>
                <li><a href="requirements-mapping.html">Complete Field Mapping (70+ Fields)</a></li>
            </ul>
            
            <h3>Phase 2 - AI Product Configuration</h3>
            <ul>
                <li><a href="#">Functional Requirements</a>
                    <ul>
                        <li><a href="requirements-phase2-generate.html">Generate with AI</a></li>
                        <li><a href="requirements-phase2-modify.html">Modify with AI</a></li>
                        <li><a href="requirements-phase2-adopt.html">Adopt AI Suggestions</a></li>
                        <li><a href="requirements-phase2-planning.html">Planning Generators</a></li>
                        <li><a href="requirements-phase2-impact.html">Impact Analyzer</a></li>
                        <li><a href="requirements-phase2-budget.html">Budget Calculator</a></li>
                    </ul>
                </li>
                <li><a href="requirements-phase2-technical.html">Technical Requirements</a>
                    <ul>
                        <li><a href="requirements-phase2-technical.html#ai-engine">AI Engine Architecture</a></li>
                        <li><a href="requirements-phase2-technical.html#impact">Impact Analyzer Engine</a></li>
                        <li><a href="requirements-phase2-technical.html#budget">Budget Calculator Engine</a></li>
                        <li><a href="requirements-phase2-technical.html#api">API Specifications</a></li>
                    </ul>
                </li>
            </ul>
            
            <h3>Phase 3 - Multi-CPQ Support</h3>
            <ul>
                <li><a href="requirements-phase3-functional.html">Functional Requirements</a>
                    <ul>
                        <li><a href="requirements-phase3-functional.html#oracle">Oracle CPQ Connector</a></li>
                        <li><a href="requirements-phase3-functional.html#apttus">Apttus/Conga Connector</a></li>
                        <li><a href="requirements-phase3-functional.html#sap">SAP CPQ Connector</a></li>
                        <li><a href="requirements-phase3-functional.html#custom">Custom CPQ Connector</a></li>
                    </ul>
                </li>
                <li><a href="requirements-phase3-technical.html">Technical Requirements</a>
                    <ul>
                        <li><a href="requirements-phase3-technical.html#framework">Universal Connector Framework</a></li>
                        <li><a href="requirements-phase3-technical.html#mapping">Cross-Platform Mapping Engine</a></li>
                        <li><a href="requirements-phase3-technical.html#api">API Specifications</a></li>
                    </ul>
                </li>
            </ul>
            
            <h3>Phase 4 - CRM + CPQ Integration</h3>
            <ul>
                <li><a href="requirements-phase4-functional.html">Functional Requirements</a>
                    <ul>
                        <li><a href="requirements-phase4-functional.html#dynamics">Dynamics CRM+CPQ</a></li>
                        <li><a href="requirements-phase4-functional.html#sugar">Sugar CRM+CPQ</a></li>
                        <li><a href="requirements-phase4-functional.html#hubspot">HubSpot CRM+CPQ</a></li>
                        <li><a href="requirements-phase4-functional.html#zoho">Zoho CRM+CPQ</a></li>
                    </ul>
                </li>
                <li><a href="requirements-phase4-technical.html">Technical Requirements</a>
                    <ul>
                        <li><a href="requirements-phase4-technical.html#crm-architecture">CRM Migration Architecture</a></li>
                        <li><a href="requirements-phase4-technical.html#hierarchy">Account Hierarchy Engine</a></li>
                        <li><a href="requirements-phase4-technical.html#api">API Specifications</a></li>
                    </ul>
                </li>
            </ul>
            
            <h3>Phase 5 - ERP Integration</h3>
            <ul>
                <li><a href="requirements-phase5-functional.html">Functional Requirements</a>
                    <ul>
                        <li><a href="requirements-phase5-functional.html#sap">SAP ERP Connector</a></li>
                        <li><a href="requirements-phase5-functional.html#oracle">Oracle ERP Connector</a></li>
                        <li><a href="requirements-phase5-functional.html#dynamics">Dynamics 365 ERP</a></li>
                        <li><a href="requirements-phase5-functional.html#netsuite">NetSuite Connector</a></li>
                    </ul>
                </li>
                <li><a href="requirements-phase5-technical.html">Technical Requirements</a>
                    <ul>
                        <li><a href="requirements-phase5-technical.html#erp-architecture">ERP Integration Architecture</a></li>
                        <li><a href="requirements-phase5-technical.html#sync">Real-Time Sync Engine</a></li>
                        <li><a href="requirements-phase5-technical.html#api">API Specifications</a></li>
                    </ul>
                </li>
            </ul>
        </aside>'''

# Define the standard sidebar HTML for Onboarding pages
ONBOARDING_SIDEBAR = '''        <aside class="sidebar">
            <h3>Getting Started</h3>
            <ul>
                <li><a href="onboarding-home.html">Onboarding Home</a></li>
                <li><a href="onboarding-overview.html">Project Overview</a></li>
                <li><a href="manual-repo-setup.html">Manual Repository Setup</a></li>
                <li><a href="repo-setup-guide.html">Automated Setup Guide</a></li>
            </ul>
            
            <h3>Developer Guides</h3>
            <ul>
                <li><a href="onboarding-dev1-phase1.html">Developer 1: Backend & Database</a></li>
                <li><a href="onboarding-dev2-phase1.html">Developer 2: Frontend & React</a></li>
                <li><a href="onboarding-dev3-phase1.html">Developer 3: DevOps & QA</a></li>
            </ul>
            
            <h3>8-Week Timeline</h3>
            <ul>
                <li><a href="onboarding-home.html#timeline">Project Timeline</a></li>
                <li><a href="onboarding-home.html#phase1">Phase 1: SFDC CPQ Migration (Weeks 1-5)</a></li>
                <li><a href="onboarding-home.html#phase2">Phase 2: AI Configuration (Weeks 6-8)</a></li>
            </ul>
            
            <h3>Development Workflows</h3>
            <ul>
                <li><a href="onboarding-home.html#vscode">VS Code Setup & Extensions</a></li>
                <li><a href="onboarding-home.html#copilot">GitHub Copilot Usage</a></li>
                <li><a href="onboarding-home.html#git">Git Workflow & PRs</a></li>
                <li><a href="onboarding-home.html#testing">Unit & Integration Testing</a></li>
            </ul>
            
            <h3>Page Assignments</h3>
            <ul>
                <li><a href="onboarding-home.html#page-assignments">Phase 1 Pages</a></li>
                <li><a href="phase2-tasks.html">Phase 2 Pages</a></li>
            </ul>
        </aside>'''


def update_sidebar(filepath, new_sidebar):
    """Replace the sidebar in an HTML file with the new standard sidebar."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match the entire <aside class="sidebar">...</aside> block
        pattern = r'<aside class="sidebar">.*?</aside>'
        
        # Replace with new sidebar (preserve indentation)
        updated_content = re.sub(pattern, new_sidebar.strip(), content, flags=re.DOTALL)
        
        # Write back if changed
        if updated_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False


def main():
    """Main function to update all sidebar navigations."""
    repo_root = Path(__file__).parent.parent
    
    # Update Requirements pages
    requirements_dir = repo_root / 'docs' / 'RevNovaRequirements'
    req_count = 0
    if requirements_dir.exists():
        print("Updating Requirements pages...")
        for html_file in requirements_dir.glob('*.html'):
            # Skip requirements-home.html (it's the source)
            if html_file.name == 'requirements-home.html':
                continue
            
            if update_sidebar(html_file, REQUIREMENTS_SIDEBAR):
                print(f"  ✓ Updated {html_file.name}")
                req_count += 1
            else:
                print(f"  - Skipped {html_file.name} (no changes)")
    
    # Update Onboarding pages
    onboarding_dir = repo_root / 'docs' / 'Onboarding'
    onb_count = 0
    if onboarding_dir.exists():
        print("\nUpdating Onboarding pages...")
        for html_file in onboarding_dir.glob('*.html'):
            # Skip onboarding-home.html (it's the source)
            if html_file.name == 'onboarding-home.html':
                continue
            
            if update_sidebar(html_file, ONBOARDING_SIDEBAR):
                print(f"  ✓ Updated {html_file.name}")
                onb_count += 1
            else:
                print(f"  - Skipped {html_file.name} (no changes)")
    
    print(f"\n✓ Complete! Updated {req_count} Requirements pages and {onb_count} Onboarding pages")


if __name__ == '__main__':
    main()
