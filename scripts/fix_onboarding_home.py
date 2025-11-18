"""
Fix onboarding-home.html to have Salesforce-style sidebar
"""
from pathlib import Path

# Read the template (dev1-day01.html has the correct structure)
template_path = Path('docs/Onboarding/dev1-day01.html')
with open(template_path, 'r', encoding='utf-8') as f:
    template = f.read()

# Extract header and sidebar from template
# Find where main content starts
main_content_marker = '<main class="main-content">'
header_and_sidebar = template.split(main_content_marker)[0] + main_content_marker

# Update title in header
header_and_sidebar = header_and_sidebar.replace(
    '<title>Day 1: Workstation Setup - RevNova Developer Onboarding</title>',
    '<title>RevNova Developer Onboarding - Home</title>'
)

# Create the main content for onboarding home
main_content = '''
            <div class="breadcrumb">
                <a href="../index.html">Home</a> › <a href="onboarding-home.html">Onboarding</a>
            </div>
            
            <h1 class="page-title">Welcome to RevNova!</h1>
            <p class="page-subtitle">Your step-by-step guide to building the RevNova migration platform</p>
            
            <div class="content-section">
                <h2>Getting Started</h2>
                <p>Welcome to the team! This onboarding guide will take you through <strong>everything you need to do, day by day</strong>, to build the RevNova platform.</p>
                
                <div class="info-box">
                    <strong>📅 Project Duration:</strong> 25 working days (5 weeks)<br>
                    <strong>🎯 Goal:</strong> Build Phase 1 - SFDC CPQ Migration wizard<br>
                    <strong>👥 Team:</strong> 3 developers working together<br>
                    <strong>📚 Approach:</strong> Follow daily step-by-step instructions
                </div>
                
                <h3>How to Use This Guide</h3>
                <ol>
                    <li><strong>Pick your role:</strong> Backend, Frontend, or DevOps</li>
                    <li><strong>Follow the days:</strong> Start with Day 1 and work through each day in order</li>
                    <li><strong>Complete each step:</strong> Every day has clear tasks - just follow them</li>
                    <li><strong>Click Next:</strong> Use the navigation buttons at the bottom to continue</li>
                    <li><strong>Ask for help:</strong> If you're stuck, ask your team or team lead</li>
                </ol>
            </div>

            <div class="content-section">
                <h2>Choose Your Role</h2>
                <p>Select your developer role to start your onboarding journey:</p>
                <br>
                
                <table style="width: 100%; border-collapse: separate; border-spacing: 1rem 0;">
                    <tr>
                        <td style="width: 33%; vertical-align: top; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 8px; color: white;">
                            <h3 style="margin-top: 0; color: white;">Developer 1</h3>
                            <p style="color: rgba(255,255,255,0.95);"><strong>Backend & Database</strong></p>
                            <p style="color: rgba(255,255,255,0.9);">Build APIs, database schemas, and business logic</p>
                            <p style="color: rgba(255,255,255,0.9); font-size: 0.9em;">Technologies: Node.js, PostgreSQL, TypeScript</p>
                            <a href="dev1-day01.html" class="btn" style="background: rgba(255,255,255,0.2); color: white; display: inline-block; margin-top: 1rem;">Start Day 1 →</a>
                        </td>
                        <td style="width: 33%; vertical-align: top; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 8px; color: white;">
                            <h3 style="margin-top: 0; color: white;">Developer 2</h3>
                            <p style="color: rgba(255,255,255,0.95);"><strong>Frontend & React</strong></p>
                            <p style="color: rgba(255,255,255,0.9);">Build user interfaces and wizard pages</p>
                            <p style="color: rgba(255,255,255,0.9); font-size: 0.9em;">Technologies: React, TypeScript, TailwindCSS</p>
                            <a href="dev2-day01.html" class="btn" style="background: rgba(255,255,255,0.2); color: white; display: inline-block; margin-top: 1rem;">Start Day 1 →</a>
                        </td>
                        <td style="width: 33%; vertical-align: top; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 8px; color: white;">
                            <h3 style="margin-top: 0; color: white;">Developer 3</h3>
                            <p style="color: rgba(255,255,255,0.95);"><strong>DevOps & QA</strong></p>
                            <p style="color: rgba(255,255,255,0.9);">Set up CI/CD, Docker, and testing automation</p>
                            <p style="color: rgba(255,255,255,0.9); font-size: 0.9em;">Technologies: GitHub Actions, Docker, Playwright</p>
                            <a href="dev3-day01.html" class="btn" style="background: rgba(255,255,255,0.2); color: white; display: inline-block; margin-top: 1rem;">Start Day 1 →</a>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="content-section">
                <h2>Before You Start</h2>
                <p>Make sure you have completed these setup steps:</p>
                <ul>
                    <li>✅ Read the <a href="onboarding-overview.html">Project Overview</a></li>
                    <li>✅ Set up your GitHub account and access</li>
                    <li>✅ Follow either the <a href="manual-repo-setup.html">Manual Repository Setup</a> or <a href="repo-setup-guide.html">Automated Setup Guide</a></li>
                    <li>✅ Install required software (listed in your Day 1 guide)</li>
                </ul>
            </div>

            <div class="nav-buttons">
                <a href="onboarding-overview.html" class="btn">Read Project Overview →</a>
            </div>
        </main>
    </div>
    
    <script>
        // Collapsible navigation functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Handle section headers
            const sectionHeaders = document.querySelectorAll('.nav-section-header');
            sectionHeaders.forEach(header => {
                header.addEventListener('click', function() {
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
            
            // Handle subsection headers
            const subsectionHeaders = document.querySelectorAll('.nav-subsection-header');
            subsectionHeaders.forEach(header => {
                header.addEventListener('click', function() {
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
            
            // Auto-expand Getting Started section for home page
            const gettingStartedSection = document.querySelector('.nav-section:first-of-type');
            if (gettingStartedSection) {
                const header = gettingStartedSection.querySelector('.nav-section-header');
                const content = gettingStartedSection.querySelector('.nav-section-content');
                header.classList.add('expanded');
                content.classList.add('expanded');
                
                // Mark Onboarding Home as active
                const homeLink = content.querySelector('a[href="onboarding-home.html"]');
                if (homeLink) {
                    homeLink.classList.add('active');
                }
            }
        });
    </script>
</body>
</html>
'''

# Combine
full_html = header_and_sidebar + main_content

# Write the new onboarding-home.html
output_path = Path('docs/Onboarding/onboarding-home.html')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(full_html)

print("✅ onboarding-home.html updated with Salesforce-style sidebar!")
print(f"   File: {output_path}")
