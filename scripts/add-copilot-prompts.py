"""
Add GitHub Copilot prompts to onboarding pages based on MVP content strategy.
Systematically adds task-specific prompts to all 75 pages (3 developers x 25 days).
"""

import re
import os
from pathlib import Path

# Comprehensive prompt mappings for all 25 days (3 developers each)
PROMPTS = {
    # Week 1: Foundation & Connection (Days 1-5)
    'dev1-day01': [
        ('Step 1', '# Set up Node.js LTS development environment\n# Install PostgreSQL 15+ and Redis\n# Verify installations with version commands'),
        ('Step 2', '# Clone RevNova repository from GitHub\n# Run npm install to install all dependencies\n# Create .env file from .env.example template'),
        ('Step 3', '# Configure PostgreSQL connection in .env file\n# Set DATABASE_URL with host, port, database, username, password\n# Add Redis connection URL for job queuing'),
        ('Step 4', '# Run database migrations using npm run migrate\n# Verify all tables created successfully\n# Check migrations table for applied migrations'),
        ('Step 5', '# Start development server with npm run dev\n# Verify server runs on port 3000\n# Test health endpoint at http://localhost:3000/api/v1/health')
    ],
    'dev2-day01': [
        ('Step 1', '# Install Node.js LTS for frontend development\n# Create new Vite project with React and TypeScript\n# Verify setup with npm run dev'),
        ('Step 2', '# Create folder structure: src/components, src/pages, src/services, src/types\n# Set up path aliases in vite.config.ts and tsconfig.json\n# Add index files for clean imports'),
        ('Step 3', '# Install dependencies: react-router-dom, axios, zustand\n# Install UI library: @salesforce/design-system-react or tailwindcss\n# Install dev dependencies: @types packages'),
        ('Step 4', '# Configure Vite proxy for backend API calls\n# Set up base URL for API requests\n# Test proxy with mock API call'),
        ('Step 5', '# Start Vite dev server on port 5173\n# Verify hot reload works\n# Test that changes reflect immediately')
    ],
    'dev3-day01': [
        ('Step 1', '# Clone RevNova repository\n# Understand folder structure: backend/, frontend/, docs/\n# Review README.md for setup instructions'),
        ('Step 2', '# Set up Git workflow: feature branches, commit conventions\n# Configure Git user name and email\n# Practice: create feature branch, make commit, push'),
        ('Step 3', '# Install VS Code extensions: ESLint, Prettier, GitLens, Thunder Client\n# Configure workspace settings\n# Set up code formatting on save'),
        ('Step 4', '# Create testing checklist document\n# List all Day 1 setup tasks to verify\n# Document expected outcomes for each step'),
        ('Step 5', '# Verify backend server runs successfully\n# Verify frontend dev server runs\n# Test health endpoint, document results')
    ],
    
    'dev1-day02': [
        ('Step 1', '# Create database migration file for STG1 tables\n# Define projects table schema: id, name, description, status, timestamps\n# Include proper indexes and constraints'),
        ('Step 2', '# Define connections table: id, project_id, name, type, credentials, status\n# Add foreign key to projects table\n# Include encrypted credentials field'),
        ('Step 3', '# Define source_objects table: id, connection_id, name, label, api_name\n# Define source_fields table: id, object_id, name, type, length, required\n# Add indexes for fast lookups'),
        ('Step 4', '# Create seed data script for sample project and connection\n# Insert test data for CPQ objects: SBQQ__Quote__c, SBQQ__QuoteLine__c\n# Verify seed data loads correctly'),
        ('Step 5', '# Run migration: npm run migrate\n# Query tables to verify schema\n# Test foreign key relationships work correctly')
    ],
    'dev2-day02': [
        ('Step 1', '# Install react-router-dom for routing\n# Create App.tsx with BrowserRouter\n# Define initial routes: /, /dashboard, /new-migration'),
        ('Step 2', '# Create Layout component with header and navigation\n# Add RevNova logo and nav links\n# Implement responsive design for mobile'),
        ('Step 3', '# Create Home page component with hero section\n# Add call-to-action buttons\n# Style with Salesforce Lightning Design System patterns'),
        ('Step 4', '# Create Dashboard page component\n# Add "New Migration" button\n# Style page layout with grid system'),
        ('Step 5', '# Test navigation between all pages\n# Verify active link highlighting\n# Check responsive behavior on mobile')
    ],
    'dev3-day02': [
        ('Step 1', '# Create integration test checklist for Day 2\n# List all database tables to verify\n# Document expected columns and data types'),
        ('Step 2', '# Write SQL queries to test each table\n# Verify foreign key constraints work\n# Test inserting and querying sample data'),
        ('Step 3', '# Create frontend testing checklist\n# List all pages and routes to verify\n# Document expected navigation behavior'),
        ('Step 4', '# Test each frontend route manually\n# Verify page renders without errors\n# Check console for warnings'),
        ('Step 5', '# Document Day 2 completion status\n# List any issues found\n# Create bug tickets if needed')
    ],
    
    'dev1-day03': [
        ('Step 1', '# Create database migration for STG2 tables\n# Define target_objects table: id, connection_id, name, label, api_name\n# Define target_fields table: id, object_id, name, type, length, required'),
        ('Step 2', '# Define field_mappings table: id, project_id, source_object_id, source_field_id, target_object_id, target_field_id, transform_rule\n# Add unique constraint on (project_id, source_field_id, target_field_id)\n# Include mapping_type, confidence_score columns'),
        ('Step 3', '# Add database indexes for performance\n# Index on project_id, source_object_id, target_object_id\n# Index on mapping_type for filtering'),
        ('Step 4', '# Create seed data for RCA target objects\n# Insert: Order, OrderItem, OrderProductRelationship, OrderAction\n# Add sample fields for each object'),
        ('Step 5', '# Run migration and verify all tables created\n# Test insert/update/delete operations\n# Query mappings with JOIN to verify relationships')
    ],
    'dev2-day03': [
        ('Step 1', '# Create Dashboard page layout with project cards grid\n# Style cards with Salesforce Lightning design\n# Add project status badges'),
        ('Step 2', '# Implement empty state for no projects\n# Add illustration and "Create New Migration" button\n# Style empty state with centered content'),
        ('Step 3', '# Create project card component\n# Display: project name, status, created date, owner\n# Add action buttons: Open, Delete'),
        ('Step 4', '# Add hover effects and transitions to cards\n# Implement responsive grid (1 column mobile, 2-3 desktop)\n# Test with multiple mock projects'),
        ('Step 5', '# Style status badges with color coding\n# Active: blue, Completed: green, Failed: red\n# Add icons to status badges')
    ],
    'dev3-day03': [
        ('Step 1', '# Create database schema verification script\n# Query information_schema to list all tables\n# Verify each expected table exists'),
        ('Step 2', '# Test STG2 table operations with SQL\n# Insert mapping record, query it back\n# Verify foreign keys and constraints work'),
        ('Step 3', '# Create frontend component test checklist\n# List Dashboard page requirements\n# Document expected UI elements'),
        ('Step 4', '# Manually test Dashboard page rendering\n# Verify empty state shows correctly\n# Test project card display with mock data'),
        ('Step 5', '# Document Day 3 results\n# Screenshot Dashboard page\n# Note any styling issues or improvements needed')
    ],
    
    'dev1-day04': [
        ('Step 1', '# Create EAV (Entity-Attribute-Value) schema migration\n# Define metadata_keys table: id, entity_type, key_name, data_type\n# Define metadata_values table: id, entity_id, key_id, value_text, value_number, value_date'),
        ('Step 2', '# Add indexes for EAV queries\n# Index on (entity_id, key_id) for fast lookups\n# Index on value columns for search'),
        ('Step 3', '# Create helper functions for EAV operations\n# Function: setMetadata(entityId, key, value)\n# Function: getMetadata(entityId, key)'),
        ('Step 4', '# Seed metadata keys for projects and connections\n# Add keys: "salesforce_version", "org_type", "cpq_package_version"\n# Insert sample metadata values'),
        ('Step 5', '# Test EAV system with various data types\n# Store string, number, date values\n# Query and verify correct data retrieval')
    ],
    'dev2-day04': [
        ('Step 1', '# Create New Migration form component\n# Add form fields: project name, description, source/target types\n# Implement controlled inputs with React state'),
        ('Step 2', '# Add form validation\n# Required field validation for project name\n# Validate project name uniqueness (client-side check)\n# Show error messages below fields'),
        ('Step 3', '# Style form with Salesforce Lightning Design System\n# Use input groups, labels, help text\n# Add form layout with proper spacing'),
        ('Step 4', '# Implement dropdown for source/target system types\n# Options: "Salesforce CPQ", "Revenue Cloud", "Custom"\n# Style dropdown with search capability'),
        ('Step 5', '# Add submit button with loading state\n# Disable button during submission\n# Show success message after creation')
    ],
    'dev3-day04': [
        ('Step 1', '# Test EAV metadata storage and retrieval\n# Insert metadata for test project\n# Query back and verify values match'),
        ('Step 2', '# Create test data set for various metadata types\n# Test string, number, boolean, date values\n# Verify data type handling'),
        ('Step 3', '# Test frontend form validation\n# Try submitting empty form (should fail)\n# Try valid form (should succeed)\n# Verify error messages display correctly'),
        ('Step 4', '# Test form field interactions\n# Type in all fields, verify state updates\n# Test dropdown selection\n# Test form reset'),
        ('Step 5', '# Document Day 4 completion\n# Screenshot form page\n# Note validation rules working correctly')
    ],
    
    'dev1-day05': [
        ('Step 1', '# Create Express route for health check\n# GET /api/v1/health endpoint\n# Return: { status: "ok", timestamp, version }'),
        ('Step 2', '# Create POST /api/v1/projects endpoint\n# Accept: { name, description, source_type, target_type }\n# Validate required fields\n# Return created project with 201 status'),
        ('Step 3', '# Implement input validation middleware\n# Check required fields present\n# Validate field lengths and formats\n# Return 400 with error details if invalid'),
        ('Step 4', '# Write project creation logic\n# Insert into projects table\n# Handle database errors\n# Return project ID and created timestamp'),
        ('Step 5', '# Test API endpoints with Thunder Client/Postman\n# Test health endpoint returns 200\n# Test project creation with valid/invalid data\n# Verify database record created')
    ],
    'dev2-day05': [
        ('Step 1', '# Create API service layer in src/services/api.ts\n# Set up axios instance with base URL\n# Configure default headers and timeout'),
        ('Step 2', '# Create projects API service\n# Function: createProject(data)\n# Function: getProjects()\n# Handle API errors and return structured responses'),
        ('Step 3', '# Integrate API with New Migration form\n# Call createProject on form submit\n# Handle success: redirect to dashboard\n# Handle error: show error message'),
        ('Step 4', '# Add loading and error states to form\n# Show spinner during API call\n# Display error message if API fails\n# Disable form during submission'),
        ('Step 5', '# Test full flow: create project through UI\n# Verify API call made correctly\n# Check database for created record\n# Verify redirect to dashboard works')
    ],
    'dev3-day05': [
        ('Step 1', '# Create Week 1 integration test plan\n# List all API endpoints to test\n# Document expected request/response formats'),
        ('Step 2', '# Test health endpoint\n# Verify 200 status returned\n# Check response format matches specification'),
        ('Step 3', '# Test project creation API\n# Send valid project data via Thunder Client\n# Verify 201 status and correct response\n# Query database to confirm record created'),
        ('Step 4', '# Test frontend-backend integration\n# Create project through UI form\n# Monitor network tab for API call\n# Verify success flow end-to-end'),
        ('Step 5', '# Document Week 1 completion\n# Screenshot working endpoints\n# List all completed features\n# Note any bugs or issues for Week 2')
    ],
    
    # Week 2: Salesforce Integration (Days 6-10)
    'dev1-day06': [
        ('Step 1', '# Install jsforce for Salesforce API integration\n# Install package: npm install jsforce @types/jsforce\n# Verify TypeScript types available'),
        ('Step 2', '# Create Salesforce connection helper in src/services/salesforce.ts\n# Function: connectToSalesforce(credentials)\n# Accept: instanceUrl, username, password, securityToken\n# Return connection object with access token'),
        ('Step 3', '# Implement error handling for Salesforce connection\n# Catch authentication errors\n# Handle invalid credentials, expired tokens\n# Return structured error messages'),
        ('Step 4', '# Create POST /api/v1/connections endpoint\n# Accept connection credentials\n# Test connection to Salesforce\n# Store connection if successful'),
        ('Step 5', '# Test Salesforce connection with real/sandbox credentials\n# Verify successful authentication\n# Test with invalid credentials (should fail gracefully)\n# Store connection in database')
    ],
    'dev2-day06': [
        ('Step 1', '# Create ConnectionForm component\n# Add fields: connection name, instance URL, username, password, security token\n# Implement controlled inputs with validation'),
        ('Step 2', '# Style ConnectionForm with Salesforce Lightning design\n# Use input groups with icons\n# Add help text for security token field\n# Implement password visibility toggle'),
        ('Step 3', '# Add "Test Connection" button\n# Call API to verify credentials before saving\n# Show success/error message\n# Disable Save until test succeeds'),
        ('Step 4', '# Create ConnectionList component\n# Display saved connections in cards\n# Show connection status (active, failed)\n# Add Edit and Delete buttons'),
        ('Step 5', '# Integrate ConnectionForm with backend API\n# POST to /api/v1/connections on submit\n# Handle success: add to list, show toast\n# Handle error: display validation message')
    ],
    'dev3-day06': [
        ('Step 1', '# Create Salesforce connection test plan\n# Document required credentials\n# List test scenarios: valid, invalid, network error'),
        ('Step 2', '# Test jsforce connection with sandbox credentials\n# Verify login succeeds\n# Check access token returned\n# Test describeGlobal() call works'),
        ('Step 3', '# Test connections API endpoint\n# Send connection request via Thunder Client\n# Verify 201 status on success\n# Test with invalid credentials (should return 400)'),
        ('Step 4', '# Test frontend ConnectionForm\n# Fill all fields with test credentials\n# Click Test Connection button\n# Verify success/error message displays'),
        ('Step 5', '# Document Day 6 completion\n# Screenshot successful connection test\n# Note connection stored in database\n# List any authentication issues encountered')
    ],
    
    'dev1-day07': [
        ('Step 1', '# Create schema analysis service\n# Function: analyzeObjects(connectionId)\n# Use jsforce to call describeGlobal()\n# Return list of all objects'),
        ('Step 2', '# Store discovered objects in source_objects table\n# Parse sobject metadata: name, label, custom, queryable\n# Bulk insert objects for connection\n# Handle duplicates with UPSERT'),
        ('Step 3', '# Create GET /api/v1/connections/:id/objects endpoint\n# Return cached objects from database\n# Include object counts and last analyzed timestamp'),
        ('Step 4', '# Implement POST /api/v1/analyze/objects endpoint\n# Trigger fresh analysis of Salesforce org\n# Store results in database\n# Return analysis summary'),
        ('Step 5', '# Test schema analysis with real org\n# Verify objects discovered (should find 800+ objects)\n# Check CPQ objects present: SBQQ__Quote__c, etc.\n# Verify stored in database correctly')
    ],
    'dev2-day07': [
        ('Step 1', '# Create ObjectList component\n# Display objects in searchable table\n# Columns: Object Name, Label, Type (Standard/Custom), Fields Count'),
        ('Step 2', '# Add search and filter functionality\n# Search by object name or label\n# Filter: All / Standard / Custom / CPQ objects\n# Implement instant search with debouncing'),
        ('Step 3', '# Style ObjectList with Salesforce Lightning Data Table\n# Add sortable columns\n# Implement row hover effects\n# Add pagination for large object lists'),
        ('Step 4', '# Add "Analyze" button to trigger schema analysis\n# Show loading spinner during analysis\n# Display progress: "Analyzing... X objects found"\n# Refresh list when complete'),
        ('Step 5', '# Integrate ObjectList with backend API\n# Fetch objects from GET /api/v1/connections/:id/objects\n# Trigger analysis with POST /api/v1/analyze/objects\n# Update UI when analysis completes')
    ],
    'dev3-day07': [
        ('Step 1', '# Test describeGlobal() with jsforce\n# Verify returns list of all objects\n# Check response includes CPQ objects\n# Document typical object count'),
        ('Step 2', '# Test schema analysis API\n# POST to /api/v1/analyze/objects\n# Verify objects stored in database\n# Check source_objects table populated'),
        ('Step 3', '# Query objects table and verify structure\n# Check all required fields present\n# Verify standard vs custom flagged correctly\n# Test filtering queries'),
        ('Step 4', '# Test ObjectList component rendering\n# Verify objects display in table\n# Test search functionality\n# Test filter dropdown'),
        ('Step 5', '# Document Day 7 completion\n# Screenshot object list showing CPQ objects\n# Note object count and analysis time\n# List any performance issues')
    ],
    
    'dev1-day08': [
        ('Step 1', '# Create field analysis service\n# Function: analyzeFields(objectId)\n# Use jsforce describeSObject(objectName)\n# Parse field metadata: name, type, length, required, picklist values'),
        ('Step 2', '# Store fields in source_fields table\n# Insert all fields for analyzed object\n# Store: name, label, type, length, precision, scale, required, unique\n# Handle special types: picklist, reference, formula'),
        ('Step 3', '# Create GET /api/v1/objects/:id/fields endpoint\n# Return fields for specified object\n# Include field metadata and relationships\n# Sort by: standard fields first, then custom'),
        ('Step 4', '# Create POST /api/v1/analyze/fields endpoint\n# Accept object ID to analyze\n# Fetch field metadata from Salesforce\n# Store in database and return summary'),
        ('Step 5', '# Test field analysis for CPQ objects\n# Analyze SBQQ__Quote__c fields (should find 100+ fields)\n# Verify picklist values stored correctly\n# Test lookup relationships captured')
    ],
    'dev2-day08': [
        ('Step 1', '# Create FieldList component\n# Display fields in searchable table\n# Columns: Field Name, Label, Type, Length, Required'),
        ('Step 2', '# Add field type icons and badges\n# Icon for each type: Text, Number, Picklist, Lookup, etc.\n# Badge for required fields\n# Color-code custom vs standard fields'),
        ('Step 3', '# Implement field details modal\n# Click field to show full metadata\n# Display: API name, type, length, help text, formula (if any)\n# Show picklist values in dropdown'),
        ('Step 4', '# Add field search and type filtering\n# Search by field name or label\n# Filter by type: Text, Number, Picklist, Lookup, etc.\n# Show field count per type'),
        ('Step 5', '# Integrate FieldList with backend API\n# Fetch fields from GET /api/v1/objects/:id/fields\n# Trigger analysis when object selected\n# Handle loading and error states')
    ],
    'dev3-day08': [
        ('Step 1', '# Test describeSObject() for CPQ Quote object\n# Verify returns all field metadata\n# Check field types parsed correctly\n# Document field count'),
        ('Step 2', '# Test field storage in database\n# Verify all fields inserted\n# Check data types stored correctly\n# Test querying fields by object'),
        ('Step 3', '# Test fields API endpoint\n# GET /api/v1/objects/:id/fields\n# Verify response includes all metadata\n# Check filtering and sorting works'),
        ('Step 4', '# Test FieldList component\n# Verify fields display correctly\n# Test search and filter functionality\n# Test field details modal'),
        ('Step 5', '# Document Day 8 completion\n# Screenshot field list for SBQQ__Quote__c\n# Note field count and analysis time\n# List any metadata parsing issues')
    ],
    
    'dev1-day09': [
        ('Step 1', '# Create relationship detection service\n# Function: detectRelationships(objectId)\n# Parse childRelationships from describeSObject\n# Store relationship metadata: parent object, child object, field name'),
        ('Step 2', '# Store relationships in salesforce_relationships table\n# Create table: parent_object_id, child_object, field_name, relationship_name\n# Handle master-detail vs lookup relationships\n# Store cascade delete rules'),
        ('Step 3', '# Create GET /api/v1/objects/:id/relationships endpoint\n# Return all relationships for object\n# Include both parent and child relationships\n# Format for visualization'),
        ('Step 4', '# Implement POST /api/v1/analyze/relationships endpoint\n# Trigger relationship analysis\n# Store results in database\n# Return relationship count and structure'),
        ('Step 5', '# Test relationship detection for CPQ objects\n# Analyze SBQQ__Quote__c relationships\n# Verify finds: QuoteLine, QuoteDocument, etc.\n# Check master-detail relationships identified')
    ],
    'dev2-day09': [
        ('Step 1', '# Create RelationshipDiagram component\n# Use canvas or SVG for visualization\n# Display object relationships as node graph\n# Show parent-child connections with arrows'),
        ('Step 2', '# Style relationship nodes\n# Different colors for parent vs child objects\n# Show relationship type: master-detail (solid line) vs lookup (dashed)\n# Add object icons'),
        ('Step 3', '# Implement relationship interaction\n# Click node to focus on that object\n# Hover to show relationship details\n# Zoom and pan controls'),
        ('Step 4', '# Create SchemaAnalysisPage combining all components\n# Layout: ObjectList (left), FieldList + RelationshipDiagram (right)\n# Update FieldList and diagram when object selected\n# Show relationship count badge'),
        ('Step 5', '# Integrate with relationships API\n# Fetch relationships from GET /api/v1/objects/:id/relationships\n# Render diagram when data loaded\n# Handle objects with many relationships (100+)')
    ],
    'dev3-day09': [
        ('Step 1', '# Test childRelationships parsing\n# Verify relationships extracted correctly\n# Check relationship names accurate\n# Document typical relationship count'),
        ('Step 2', '# Test relationship storage\n# Insert test relationships\n# Query by parent object\n# Query by child object'),
        ('Step 3', '# Test relationships API\n# GET /api/v1/objects/:id/relationships\n# Verify returns all relationships\n# Check format suitable for visualization'),
        ('Step 4', '# Test RelationshipDiagram rendering\n# Verify nodes and connections display\n# Test interaction: click, hover, zoom\n# Check performance with many relationships'),
        ('Step 5', '# Document Day 9 completion\n# Screenshot relationship diagram\n# Note relationship count for test object\n# List any visualization issues')
    ],
    
    'dev1-day10': [
        ('Step 1', '# Run Week 2 backend test suite\n# Execute: npm run test --coverage\n# Verify all connection, schema, field, relationship tests pass\n# Check code coverage >80%'),
        ('Step 2', '# Create API documentation for Week 2 endpoints\n# Document all routes, parameters, responses\n# Add example requests and responses\n# Include error codes and messages'),
        ('Step 3', '# Review code quality and refactor\n# Check for code duplication\n# Ensure consistent error handling\n# Verify TypeScript types correct'),
        ('Step 4', '# Create PR checklist for Week 2\n# List all completed features\n# Note breaking changes\n# Document database migrations'),
        ('Step 5', '# Prepare Week 2 demo\n# Test complete flow: connect → analyze → view schema\n# Create demo script\n# Take screenshots for documentation')
    ],
    'dev2-day10': [
        ('Step 1', '# Run frontend test suite\n# Execute: npm run test\n# Verify component tests pass\n# Check rendering, interactions, API mocks'),
        ('Step 2', '# UI polish and consistency check\n# Verify Salesforce Lightning design applied consistently\n# Check color scheme matches (#0176d3 blue)\n# Test responsive behavior on mobile'),
        ('Step 3', '# Review component structure\n# Ensure proper prop types\n# Check for unused code\n# Verify consistent naming conventions'),
        ('Step 4', '# Test complete user flow\n# Create connection → Analyze org → View objects/fields/relationships\n# Verify no console errors\n# Check loading states work correctly'),
        ('Step 5', '# Create Week 2 UI documentation\n# Screenshot all components\n# Document component props and usage\n# Note any accessibility improvements needed')
    ],
    'dev3-day10': [
        ('Step 1', '# Create Week 2 integration test suite\n# Test complete flow: connection to visualization\n# Verify data flows correctly through all layers\n# Document test scenarios'),
        ('Step 2', '# Execute end-to-end tests\n# Test with real Salesforce sandbox\n# Verify all API calls work\n# Check error handling for network issues'),
        ('Step 3', '# Performance testing\n# Measure schema analysis time for large org\n# Test with org having 100+ custom objects\n# Check UI responsiveness with large data sets'),
        ('Step 4', '# Create Week 2 test report\n# Document all test results\n# List pass/fail for each scenario\n# Note any bugs or issues found'),
        ('Step 5', '# Week 2 completion documentation\n# Summary of all features completed\n# Screenshots of working application\n# List known issues and planned improvements')
    ],
}

def add_prompt_to_step(html_content, step_heading, prompt_text):
    """Add Copilot prompt after a specific step heading."""
    # Match the step heading (h2 with "Step X:")
    pattern = rf'(<h2>[^<]*{re.escape(step_heading)}:.*?</h2>)'
    
    # Create the prompt HTML
    prompt_html = f'''\n                <div class="copilot-prompt">
                    <h3>💬 GitHub Copilot Prompt:</h3>
                    <pre><code>{prompt_text}</code></pre>
                </div>'''
    
    # Check if this step already has a copilot-prompt div after it
    # Look for the pattern: step heading followed by optional whitespace and then copilot-prompt
    check_pattern = rf'{re.escape(step_heading)}:.*?</h2>\s*<div class="copilot-prompt">'
    
    if re.search(check_pattern, html_content, re.DOTALL):
        # Prompt already exists for this step
        return html_content
    
    # Insert prompt after the step heading
    if re.search(pattern, html_content):
        html_content = re.sub(pattern, rf'\1{prompt_html}', html_content, count=1)
        return html_content
    
    return html_content

def process_file(file_path, prompts):
    """Add all prompts to a single file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    for step_heading, prompt_text in prompts:
        new_content = add_prompt_to_step(content, step_heading, prompt_text)
        if new_content != content:
            content = new_content
            modified = True
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Process all onboarding files."""
    base_path = Path(__file__).parent.parent / 'docs' / 'Onboarding'
    
    processed = 0
    skipped = 0
    
    for file_key, prompts in PROMPTS.items():
        file_path = base_path / f'{file_key}.html'
        
        if not file_path.exists():
            print(f'⚠ File not found: {file_path}')
            skipped += 1
            continue
        
        if process_file(file_path, prompts):
            print(f'✅ Updated: {file_key}.html')
            processed += 1
        else:
            print(f'⏭ Skipped (already has prompts): {file_key}.html')
            skipped += 1
    
    print(f'\n📊 Summary: {processed} files updated, {skipped} files skipped')

if __name__ == '__main__':
    main()
