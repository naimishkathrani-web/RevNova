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
    
    # Week 2: Salesforce Integration (Days 6-10) - COMPLETED ABOVE
    
    # Week 3: Field Mapping & AI (Days 11-15)
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
    
    # Week 3: Field Mapping & AI (Days 11-15) continued
    'dev1-day11': [
        ('Step 1', '# Create field_mappings database table\n# Columns: id, project_id, source_object, source_field, target_object, target_field, mapping_type, transform_rule\n# Add UNIQUE constraint on (project_id, source_field_id, target_field_id)'),
        ('Step 2', '# Create POST /api/v1/mappings endpoint\n# Accept: sourceFieldId, targetFieldId, mappingType (direct, formula, lookup)\n# Validate required fields and foreign key relationships\n# Return created mapping with 201 status'),
        ('Step 3', '# Implement GET /api/v1/mappings/:projectId endpoint\n# Return all mappings for a project\n# Include source/target field metadata with JOINs\n# Order by: source object, then source field'),
        ('Step 4', '# Add transformation rule validation\n# Validate formula syntax for formula mappings\n# Check type compatibility (text→number validation)\n# Return validation errors with specific messages'),
        ('Step 5', '# Test manual mapping creation\n# Map Product2.Name to OrderProduct__c.ProductName__c\n# Map SBQQ__Quote__c.Amount__c to Order.TotalAmount\n# Verify mappings stored correctly in database')
    ],
    'dev2-day11': [
        ('Step 1', '# Create MappingCanvas component with drag-and-drop\n# Use @dnd-kit/core for DnD functionality\n# Layout: source fields (left), target fields (right), connection lines (center)\n# Implement DndContext wrapper'),
        ('Step 2', '# Create FieldSourceList component\n# Display draggable source fields\n# Show field icon, name, type badge\n# Group by object with collapsible sections'),
        ('Step 3', '# Create FieldTargetList component\n# Display droppable target fields\n# Show field icon, name, type badge, mapped status\n# Highlight compatible fields on drag hover'),
        ('Step 4', '# Implement handleDragEnd function\n# Extract source and target field IDs from drag event\n# Call POST /api/v1/mappings API\n# Update UI with new mapping and connection line'),
        ('Step 5', '# Test drag-and-drop mapping\n# Drag source field to target field\n# Verify API call made correctly\n# Check connection line appears between mapped fields')
    ],
    'dev3-day11': [
        ('Step 1', '# Create integration tests for mappings API\n# Test POST /api/v1/mappings with valid data\n# Test GET /api/v1/mappings/:projectId returns all mappings\n# Verify response includes field metadata'),
        ('Step 2', '# Test mapping validation rules\n# Test duplicate mapping rejection (unique constraint)\n# Test invalid field ID rejection (foreign key)\n# Verify error messages clear and helpful'),
        ('Step 3', '# Test frontend ConnectionForm component\n# Write unit test: form renders all fields\n# Test: required field validation triggers\n# Test: form submission calls API correctly'),
        ('Step 4', '# Test ObjectList search functionality\n# Test: search filters objects correctly\n# Test: custom vs standard filter works\n# Test: object count updates on filter'),
        ('Step 5', '# Document Day 11 completion\n# Screenshot mapping canvas with DnD\n# Verify mappings persist in database\n# Note any UX improvements needed')
    ],
    
    'dev1-day12': [
        ('Step 1', '# Implement bulk operations endpoint\n# POST /api/v1/mappings/bulk accepts array of mappings\n# Use transaction for atomicity\n# INSERT with ON CONFLICT DO UPDATE'),
        ('Step 2', '# Create PUT /api/v1/mappings/:id endpoint\n# Accept: mapping_type, transform_rule updates\n# Validate changes before updating\n# Return updated mapping'),
        ('Step 3', '# Create DELETE /api/v1/mappings/:id endpoint\n# Soft delete: set deleted_at timestamp\n# Or hard delete based on requirements\n# Return 204 No Content on success'),
        ('Step 4', '# Test bulk operations\n# Create 20 mappings in single request\n# Test ON CONFLICT update behavior\n# Verify transaction rollback on error'),
        ('Step 5', '# Test update and delete operations\n# Update mapping transform rule\n# Delete mapping and verify removed\n# Test 404 for non-existent mapping')
    ],
    'dev2-day12': [
        ('Step 1', '# Create ConnectionLines component\n# Use SVG to draw lines between mapped fields\n# Calculate positions: offsetLeft, offsetTop\n# Draw line from source to target'),
        ('Step 2', '# Style connection lines\n# Color: #0176d3 (Salesforce blue)\n# Stroke width: 2px\n# Add arrow marker at target end'),
        ('Step 3', '# Implement save/load mappings\n# Button: "Save All Mappings"\n# Call bulk API with all current mappings\n# Load mappings on page load'),
        ('Step 4', '# Add edit and delete actions\n# Show icons on mapping row hover\n# Edit opens dialog with current values\n# Delete shows confirmation'),
        ('Step 5', '# Test mapping UI complete flow\n# Create mapping via DnD\n# Edit mapping transform rule\n# Delete mapping\n# Verify all actions work')
    ],
    'dev3-day12': [
        ('Step 1', '# Set up Playwright for E2E testing\n# Install: @playwright/test\n# Run: npx playwright install\n# Create playwright.config.ts'),
        ('Step 2', '# Write connection flow E2E test\n# Test: fill connection form\n# Test: test connection button\n# Test: save connection\n# Verify connection card appears'),
        ('Step 3', '# Test bulk operations API\n# Mock multiple mappings\n# Send bulk create request\n# Verify all mappings created'),
        ('Step 4', '# Test ConnectionLines rendering\n# Verify SVG lines appear\n# Test line positions correct\n# Check updates when mappings change'),
        ('Step 5', '# Document Day 12 completion\n# Screenshot connection lines\n# Note E2E test results\n# List any issues found')
    ],
    
    'dev1-day13': [
        ('Step 1', '# Create mapping validation service\n# Function: validateMapping(sourceField, targetField, transformRule)\n# Check type compatibility matrix\n# Return validation result with errors array'),
        ('Step 2', '# Implement type compatibility rules\n# Compatible: Text→Text, Number→Number, Date→Date\n# Compatible with conversion: Text→Number (if numeric), Number→Text\n# Incompatible: Date→Number, Picklist→Boolean'),
        ('Step 3', '# Create POST /api/v1/mappings/validate endpoint\n# Accept: source_field_id, target_field_id, transform_rule\n# Run validation checks\n# Return: { valid: boolean, errors: [], warnings: [] }'),
        ('Step 4', '# Add formula syntax validation\n# Parse formula using expression parser\n# Validate function names: CONCAT, UPPER, DATEVALUE\n# Check field references exist\n# Return syntax errors with line/column'),
        ('Step 5', '# Test validation rules\n# Test: Text→Number fails without conversion formula\n# Test: CONCAT(Field1__c, Field2__c) validates successfully\n# Test: invalid field reference rejected')
    ],
    'dev2-day13': [
        ('Step 1', '# Create MappingValidationIndicator component\n# Show validation status icon: checkmark (valid), warning, error\n# Color-code: green (valid), yellow (warning), red (error)\n# Display on each mapping row'),
        ('Step 2', '# Implement inline validation feedback\n# Call /api/v1/mappings/validate on field selection\n# Show validation errors below mapping dropdown\n# Highlight incompatible types in red'),
        ('Step 3', '# Create validation error tooltip\n# Hover over error icon to show details\n# Display: error message, suggested fix, documentation link\n# Style with Salesforce Lightning design'),
        ('Step 4', '# Disable Save button for invalid mappings\n# Check all mappings validated before enabling Save\n# Show count: "X invalid mappings - fix before saving"\n# Add "View Errors" button to jump to first error'),
        ('Step 5', '# Test validation feedback\n# Map incompatible types (Date→Number)\n# Verify error message displays\n# Check Save button disabled until fixed')
    ],
    'dev3-day13': [
        ('Step 1', '# Write tests for validation service\n# Test type compatibility matrix\n# Test formula syntax validation\n# Test required field validation'),
        ('Step 2', '# Test validation API endpoint\n# Test: POST /api/v1/mappings/validate with valid mapping\n# Test: invalid type combination returns error\n# Test: invalid formula syntax returns detailed error'),
        ('Step 3', '# Write UI tests for validation indicators\n# Test: valid mapping shows green checkmark\n# Test: invalid mapping shows red error icon\n# Test: tooltip displays error details'),
        ('Step 4', '# Test Save button enable/disable logic\n# Test: Save disabled with invalid mappings\n# Test: Save enabled when all valid\n# Test: error count displays correctly'),
        ('Step 5', '# Document validation rules\n# Create type compatibility table\n# List all supported formula functions\n# Document error messages and solutions')
    ],
    
    'dev1-day14': [
        ('Step 1', '# Implement confidence scoring algorithm\n# Calculate name similarity using Levenshtein distance\n# Normalize score to 0-1 range\n# Weight: name similarity 40%, type match 30%, AI confidence 30%'),
        ('Step 2', '# Add confidence_score column to field_mappings table\n# Type: DECIMAL(3,2) - stores 0.00 to 1.00\n# Update all mapping endpoints to include score\n# Default score: 1.0 for manual mappings'),
        ('Step 3', '# Create confidence calculation service\n# Function: calculateConfidence(sourceField, targetField, aiScore)\n# Implement name similarity algorithm\n# Combine scores with weighted average'),
        ('Step 4', '# Update POST /api/v1/mappings endpoint\n# Calculate confidence score before saving\n# Store score in database\n# Return score in response'),
        ('Step 5', '# Test confidence scoring\n# Test: identical names (Amount__c → Amount) = high score (>0.9)\n# Test: similar names (ProductName__c → Product_Name__c) = medium (0.7-0.8)\n# Test: different names (Quantity__c → TotalAmount__c) = low (<0.5)')
    ],
    'dev2-day14': [
        ('Step 1', '# Create ConfidenceScoreBadge component\n# Display score as percentage with color\n# Green (>80%), Yellow (50-80%), Red (<50%)\n# Show score bar and numeric value'),
        ('Step 2', '# Add confidence score to mapping list\n# Show badge next to each mapping\n# Sort mappings by confidence (high to low)\n# Add filter: "Show only high confidence (>80%)"'),
        ('Step 3', '# Create confidence score legend\n# Explain scoring factors\n# Show: name similarity, type match, AI confidence\n# Add info icon with tooltip'),
        ('Step 4', '# Implement "Map All High Confidence" action\n# Button: auto-accept all suggestions >80% confidence\n# Show confirmation dialog with count\n# Display progress during bulk mapping'),
        ('Step 5', '# Test confidence score display\n# Verify scores display correctly (percentage and bar)\n# Test color coding works\n# Test bulk high-confidence mapping')
    ],
    'dev3-day14': [
        ('Step 1', '# Write tests for confidence calculation\n# Test: identical names return high score\n# Test: type mismatch lowers score\n# Test: weighted average calculation correct'),
        ('Step 2', '# Test confidence score storage\n# Verify score saved in database\n# Test: GET /api/v1/mappings returns scores\n# Check score precision (2 decimal places)'),
        ('Step 3', '# Write E2E test for mapping workflow\n# Test: create connection → analyze → map fields → validate → save\n# Verify each step completes successfully\n# Check database state after each step'),
        ('Step 4', '# Test bulk high-confidence mapping\n# Create 10 test suggestions with varying confidence\n# Trigger "Map All High Confidence"\n# Verify only >80% confidence mapped'),
        ('Step 5', '# Document Week 3 completion\n# Screenshot mapping interface with confidence scores\n# Document AI integration and validation\n# List all features completed')
    ],
    
    'dev1-day15': [
        ('Step 1', '# Create PUT /api/v1/mappings/:id endpoint\n# Accept: mapping_type, transform_rule, confidence_score updates\n# Validate changes before updating\n# Return updated mapping'),
        ('Step 2', '# Create DELETE /api/v1/mappings/:id endpoint\n# Soft delete: set deleted_at timestamp\n# Or hard delete: remove from database\n# Return 204 No Content on success'),
        ('Step 3', '# Implement bulk update endpoint\n# POST /api/v1/mappings/bulk\n# Accept array of mappings to create/update\n# Use transaction for atomicity\n# Return: created count, updated count, errors'),
        ('Step 4', '# Create mapping export functionality\n# GET /api/v1/mappings/:projectId/export\n# Export as JSON with all metadata\n# Include: source/target field details, confidence scores\n# Return JSON file for download'),
        ('Step 5', '# Test full CRUD workflow\n# Create mapping, read it, update transform rule, delete it\n# Test bulk update with 20 mappings\n# Test export and verify JSON format')
    ],
    'dev2-day15': [
        ('Step 1', '# Add Edit action to mapping rows\n# Show edit icon on hover\n# Open mapping dialog pre-filled with current values\n# Allow updating target field and transform rule'),
        ('Step 2', '# Add Delete action to mapping rows\n# Show delete icon on hover\n# Confirmation dialog: "Delete mapping for {sourceField}?"\n# Remove mapping and connection line on confirm'),
        ('Step 3', '# Implement "Clear All Mappings" action\n# Button with confirmation dialog\n# Warning: "This will delete all X mappings. Continue?"\n# Bulk delete via API, clear UI'),
        ('Step 4', '# Add Export Mappings button\n# Button: "Export Mappings" with download icon\n# Trigger download of JSON file\n# Filename: "project-{name}-mappings-{date}.json"'),
        ('Step 5', '# Polish mapping interface\n# Add keyboard shortcuts (Del to delete, Enter to save)\n# Improve connection lines rendering\n# Test full mapping workflow')
    ],
    'dev3-day15': [
        ('Step 1', '# Test update endpoint\n# Test: PUT /api/v1/mappings/:id updates mapping\n# Test: validation still applies on update\n# Test: 404 if mapping not found'),
        ('Step 2', '# Test delete endpoint\n# Test: DELETE /api/v1/mappings/:id removes mapping\n# Test: 404 if already deleted\n# Test: mapping removed from GET response'),
        ('Step 3', '# Test bulk operations\n# Test: bulk create 20 mappings at once\n# Test: transaction rollback on error\n# Test: partial success handling'),
        ('Step 4', '# Test export functionality\n# Test: export returns valid JSON\n# Test: includes all mapping metadata\n# Test: file download triggers correctly'),
        ('Step 5', '# Performance testing\n# Test with 1000 fields (500 source, 500 target)\n# Measure mapping suggestion time\n# Measure UI rendering performance\n# Document any bottlenecks')
    ],
    
    # Week 4: Transformation & Validation (Days 16-20)
    'dev1-day16': [
        ('Step 1', '# Create transformation engine service\n# Implement type conversion functions: stringToNumber, numberToString, dateFormat\n# Handle null/undefined values safely'),
        ('Step 2', '# Implement formula evaluator\n# Parse formula syntax: CONCAT, UPPER, LOWER, SUBSTRING, DATEVALUE\n# Evaluate with source data context'),
        ('Step 3', '# Create POST /api/v1/transform/preview endpoint\n# Accept: mapping_id, sample_data\n# Apply transformation to sample\n# Return transformed result'),
        ('Step 4', '# Test transformations\n# Test: CONCAT(FirstName__c, " ", LastName__c)\n# Test: type conversions\n# Test: error handling'),
        ('Step 5', '# Create transformation test suite\n# Test all formula functions\n# Test edge cases: null, empty, overflow')
    ],
    'dev2-day16': [
        ('Step 1', '# Create TransformationPreview component\n# Two-column layout: source data | transformed data'),
        ('Step 2', '# Display sample records table\n# Show: original value, arrow, transformed value\n# Highlight changes'),
        ('Step 3', '# Add "Refresh Sample" button\n# Fetch new sample from Salesforce\n# Re-apply transformations'),
        ('Step 4', '# Show transformation formula\n# Display formula above preview\n# Add edit button to modify'),
        ('Step 5', '# Test preview workflow\n# View source data, see transformed result\n# Verify transformations correct')
    ],
    'dev3-day16': [
        ('Step 1', '# Write transformation engine tests\n# Test each formula function\n# Test type conversions'),
        ('Step 2', '# Test error handling\n# Test: invalid formula syntax\n# Test: type conversion failures\n# Test: null value handling'),
        ('Step 3', '# Integration tests for preview endpoint\n# Test: POST /api/v1/transform/preview\n# Verify transformed data correct'),
        ('Step 4', '# Test preview UI\n# Verify data displays correctly\n# Test refresh functionality'),
        ('Step 5', '# Document transformation functions\n# List all supported formulas\n# Provide examples for each')
    ],
    
    'dev1-day17': [
        ('Step 1', '# Create data sampling service\n# Use jsforce to query sample records (LIMIT 10)\n# Function: fetchSampleData(objectName, fieldNames)'),
        ('Step 2', '# Create POST /api/v1/data/sample endpoint\n# Accept: object_name, field_ids\n# Query Salesforce and return records'),
        ('Step 3', '# Apply transformations to sample\n# For each record, apply all field mappings\n# Return source and transformed data'),
        ('Step 4', '# Cache sample data\n# Store in Redis for 5 minutes\n# Avoid repeated Salesforce queries'),
        ('Step 5', '# Test sampling with CPQ objects\n# Sample SBQQ__Quote__c records\n# Verify all fields retrieved\n# Test transformation applied')
    ],
    'dev2-day17': [
        ('Step 1', '# Create DataTable component\n# Reusable table with sorting and pagination\n# Props: columns, data, onSort, onPageChange'),
        ('Step 2', '# Add column sorting\n# Click header to sort ascending/descending\n# Show sort indicator arrow'),
        ('Step 3', '# Implement pagination\n# Show: rows per page selector (10, 25, 50, 100)\n# Display: "Showing 1-25 of 247"'),
        ('Step 4', '# Add filtering\n# Search box filters all columns\n# Highlight matching text'),
        ('Step 5', '# Test DataTable\n# Verify sorting works\n# Test pagination\n# Test filtering')
    ],
    'dev3-day17': [
        ('Step 1', '# Test data sampling service\n# Mock jsforce query responses\n# Verify LIMIT applied correctly'),
        ('Step 2', '# Test sample endpoint\n# POST /api/v1/data/sample\n# Verify returns sample records'),
        ('Step 3', '# Test transformation application\n# Verify formulas applied to sample\n# Check transformed values correct'),
        ('Step 4', '# Test DataTable component\n# Test sorting functionality\n# Test pagination\n# Test filtering'),
        ('Step 5', '# Document sampling approach\n# Note sample size limits\n# Document cache duration')
    ],
    
    'dev1-day18': [
        ('Step 1', '# Create validation service\n# Function: validateRecord(record, targetObject, mappings)\n# Check required fields populated'),
        ('Step 2', '# Implement validation rules\n# Required field validation\n# Data type validation\n# Value range validation (min/max)'),
        ('Step 3', '# Create POST /api/v1/validate endpoint\n# Accept: sample_data, mappings\n# Run validation on each record\n# Return errors by record and field'),
        ('Step 4', '# Store validation errors in database\n# Table: validation_errors(id, project_id, record_id, field, severity, message)'),
        ('Step 5', '# Test validation\n# Test: missing required field detected\n# Test: invalid data type detected\n# Test: value out of range detected')
    ],
    'dev2-day18': [
        ('Step 1', '# Create ValidationSummary component\n# Card showing: total records, errors, warnings'),
        ('Step 2', '# Display error breakdown by type\n# Chart: required field errors, type errors, range errors'),
        ('Step 3', '# Create ValidationErrors table\n# Columns: record ID, field, error message, severity'),
        ('Step 4', '# Add severity badges\n# Red (error), yellow (warning), blue (info)'),
        ('Step 5', '# Test validation display\n# View errors after validation\n# Verify error details shown')
    ],
    'dev3-day18': [
        ('Step 1', '# Test validation service\n# Test all validation rule types\n# Verify errors detected correctly'),
        ('Step 2', '# Test validation endpoint\n# POST /api/v1/validate\n# Verify returns all errors'),
        ('Step 3', '# Test error storage\n# Verify errors saved in database\n# Test query by severity'),
        ('Step 4', '# Test validation UI\n# Verify summary displays correctly\n# Test error table functionality'),
        ('Step 5', '# Document validation rules\n# List all validation types\n# Provide error message examples')
    ],
    
    'dev1-day19': [
        ('Step 1', '# Create GET /api/v1/errors/:projectId endpoint\n# Return all validation errors\n# Filter by severity: error, warning, info'),
        ('Step 2', '# Add error statistics endpoint\n# GET /api/v1/errors/:projectId/stats\n# Return: total errors, errors by type, errors by object'),
        ('Step 3', '# Implement error grouping\n# Group by: field, error type, severity\n# Return counts per group'),
        ('Step 4', '# Add error resolution tracking\n# Column: resolved (boolean), resolved_at (timestamp)\n# Endpoint: PUT /api/v1/errors/:id/resolve'),
        ('Step 5', '# Test error reporting\n# Generate validation errors\n# Query errors by project\n# Test resolution marking')
    ],
    'dev2-day19': [
        ('Step 1', '# Add error navigation\n# Click error to highlight record/field\n# Scroll to problematic data'),
        ('Step 2', '# Create "Fix" action buttons\n# Button opens edit dialog for record\n# Pre-fill with current value\n# Allow correction'),
        ('Step 3', '# Show error history\n# Display: error occurred, error resolved timestamps\n# Show who resolved'),
        ('Step 4', '# Add bulk error resolution\n# Checkbox to select multiple errors\n# "Mark as Resolved" button'),
        ('Step 5', '# Test error navigation\n# Click error, verify highlights correctly\n# Test fix action\n# Test bulk resolution')
    ],
    'dev3-day19': [
        ('Step 1', '# Test error endpoints\n# GET /api/v1/errors/:projectId\n# Test filtering by severity'),
        ('Step 2', '# Test error statistics\n# Verify counts correct\n# Test grouping logic'),
        ('Step 3', '# Test error resolution\n# Mark error resolved\n# Verify resolved flag set'),
        ('Step 4', '# Write E2E test for validation flow\n# Transform → Validate → View errors → Fix → Re-validate'),
        ('Step 5', '# Document error handling\n# List error types and severities\n# Document resolution workflow')
    ],
    
    'dev1-day20': [
        ('Step 1', '# Add caching for transformations\n# Cache formula evaluation results in Redis\n# Key: mapping_id + source_value hash'),
        ('Step 2', '# Optimize formula evaluation\n# Parse formula once, cache AST\n# Reuse parsed formula for all records'),
        ('Step 3', '# Add retry logic for Salesforce API\n# Implement exponential backoff\n# Max retries: 3, timeout: 30s'),
        ('Step 4', '# Performance profiling\n# Measure: query time, transformation time, validation time\n# Log slow operations (>1s)'),
        ('Step 5', '# Test optimizations\n# Measure before/after performance\n# Test with 1000 records\n# Document improvements')
    ],
    'dev2-day20': [
        ('Step 1', '# Add loading states everywhere\n# Show skeleton loaders during data fetch\n# Display spinner for long operations'),
        ('Step 2', '# Implement error boundaries\n# Catch React errors gracefully\n# Show friendly error message with retry'),
        ('Step 3', '# Add keyboard shortcuts\n# Cmd/Ctrl+S: Save\n# Cmd/Ctrl+Enter: Submit\n# Esc: Close dialog'),
        ('Step 4', '# Polish animations\n# Smooth transitions for all state changes\n# Add fade-in for new content'),
        ('Step 5', '# Full UI testing\n# Test all pages and interactions\n# Verify no console errors\n# Check responsive design')
    ],
    'dev3-day20': [
        ('Step 1', '# Load testing setup\n# Install k6 or Artillery\n# Create load test scripts'),
        ('Step 2', '# Test with concurrent users\n# Simulate 100 concurrent users\n# Test key operations: connect, analyze, map'),
        ('Step 3', '# Measure performance metrics\n# Response times, error rates, throughput\n# Identify bottlenecks'),
        ('Step 4', '# Stress testing\n# Test with large datasets (10k+ records)\n# Test API limits'),
        ('Step 5', '# Document Week 4 completion\n# Performance test results\n# List all features completed')
    ],
    
    # Week 5: Execution & Polish (Days 21-25)
    'dev1-day21': [
        ('Step 1', '# Create migration execution service\n# Function: executeMigration(projectId, batchSize)\n# Use jsforce to insert/update records'),
        ('Step 2', '# Create POST /api/v1/execute endpoint\n# Accept: project_id, execution_mode (insert/upsert)\n# Start migration job\n# Return: job_id'),
        ('Step 3', '# Implement progress tracking\n# Table: migration_jobs(id, project_id, status, processed, total, start_time)\n# Update progress after each batch'),
        ('Step 4', '# Create GET /api/v1/execute/:jobId/status endpoint\n# Return: status, progress percentage, records processed, errors'),
        ('Step 5', '# Test execution with 10 records\n# Execute migration to sandbox\n# Verify records created in Salesforce\n# Check progress tracking')
    ],
    'dev2-day21': [
        ('Step 1', '# Create ExecutionPage component\n# Show: project summary, execution settings\n# Button: "Start Migration"'),
        ('Step 2', '# Display execution progress\n# Progress bar with percentage\n# Show: X of Y records processed\n# Display elapsed time'),
        ('Step 3', '# Real-time status updates\n# Poll /api/v1/execute/:jobId/status every 2s\n# Update progress bar and counts'),
        ('Step 4', '# Show execution log\n# Display: timestamp, action, record, result\n# Auto-scroll to latest'),
        ('Step 5', '# Test execution UI\n# Start migration, watch progress\n# Verify updates in real-time')
    ],
    'dev3-day21': [
        ('Step 1', '# Test execution service\n# Mock jsforce insert operations\n# Verify batching logic'),
        ('Step 2', '# Test execute endpoint\n# POST /api/v1/execute\n# Verify job created\n# Check status endpoint returns progress'),
        ('Step 3', '# Test progress tracking\n# Verify progress updates correctly\n# Test percentage calculation'),
        ('Step 4', '# Test error handling during execution\n# Simulate Salesforce API errors\n# Verify job doesn\'t crash'),
        ('Step 5', '# Document execution flow\n# Diagram showing steps\n# Document batch size recommendations')
    ],
    
    'dev1-day22': [
        ('Step 1', '# Install Bull queue: npm install bull\n# Configure Redis connection\n# Create migration job queue'),
        ('Step 2', '# Implement batch processing\n# Process 200 records per batch\n# Add jobs to queue for each batch'),
        ('Step 3', '# Create job processor\n# Worker: process batch, insert to Salesforce\n# Handle errors, update job status'),
        ('Step 4', '# Add job monitoring endpoints\n# GET /api/v1/jobs - list all jobs\n# GET /api/v1/jobs/:id - job details\n# DELETE /api/v1/jobs/:id - cancel job'),
        ('Step 5', '# Test batch processing\n# Queue 1000 records (5 batches of 200)\n# Verify all batches processed\n# Check completion time')
    ],
    'dev2-day22': [
        ('Step 1', '# Implement WebSocket for real-time updates\n# Or use polling (simpler): every 2 seconds\n# Update progress automatically'),
        ('Step 2', '# Show batch progress\n# Display: "Processing batch 3 of 5"\n# Show records per batch'),
        ('Step 3', '# Add notifications\n# Toast: "Batch 1 completed successfully"\n# Error notification if batch fails'),
        ('Step 4', '# Show queue position\n# Display: "Job queued, position #2"\n# Estimate time remaining'),
        ('Step 5', '# Test real-time updates\n# Start migration with 1000 records\n# Verify progress updates automatically\n# Check notifications appear')
    ],
    'dev3-day22': [
        ('Step 1', '# Test Bull queue setup\n# Verify jobs added to queue\n# Test worker processes jobs'),
        ('Step 2', '# Test batch processing\n# Test with multiple batches\n# Verify parallel processing\n# Check error handling per batch'),
        ('Step 3', '# Write E2E test for full migration\n# Test: connection → analyze → map → execute\n# Verify records in target Salesforce org'),
        ('Step 4', '# Test job cancellation\n# Start job, cancel mid-execution\n# Verify stops gracefully'),
        ('Step 5', '# Document batch processing\n# Document queue configuration\n# Note performance characteristics')
    ],
    
    'dev1-day23': [
        ('Step 1', '# Design rollback strategy\n# Store original record IDs in rollback table\n# Table: rollback_records(migration_job_id, source_id, target_id)'),
        ('Step 2', '# Implement rollback service\n# Function: rollback(jobId)\n# Delete records using stored target IDs'),
        ('Step 3', '# Create POST /api/v1/rollback endpoint\n# Accept: job_id\n# Execute rollback\n# Return: rollback_job_id'),
        ('Step 4', '# Track rollback progress\n# Same progress tracking as migration\n# Status: rollback_in_progress, rollback_completed'),
        ('Step 5', '# Test rollback\n# Execute migration, then rollback\n# Verify records deleted from target\n# Check source untouched')
    ],
    'dev2-day23': [
        ('Step 1', '# Add Rollback button to results page\n# Button: "Rollback Migration" with warning icon\n# Show confirmation dialog'),
        ('Step 2', '# Confirmation dialog\n# Warning: "This will delete X records from target org"\n# Require typing "ROLLBACK" to confirm'),
        ('Step 3', '# Display rollback progress\n# Same progress UI as execution\n# Show: X of Y records deleted'),
        ('Step 4', '# Create ResultsPage component\n# Show: success count, failures, rollback option\n# Add "Download Report" button'),
        ('Step 5', '# Test rollback UI\n# Execute migration, then rollback\n# Verify confirmation required\n# Check progress displayed')
    ],
    'dev3-day23': [
        ('Step 1', '# Test rollback service\n# Mock Salesforce delete operations\n# Verify all target records deleted'),
        ('Step 2', '# Test rollback endpoint\n# POST /api/v1/rollback\n# Verify rollback job created'),
        ('Step 3', '# Test rollback tracking\n# Verify progress updates\n# Test rollback completion detection'),
        ('Step 4', '# Test production deployment setup\n# Create production environment config\n# Document deployment process'),
        ('Step 5', '# Deploy to staging\n# Test full flow in staging\n# Document any issues')
    ],
    
    'dev1-day24': [
        ('Step 1', '# Add rate limiting middleware\n# Use express-rate-limit\n# Limit: 100 requests per minute per IP'),
        ('Step 2', '# Improve error handling\n# Centralized error handler middleware\n# Consistent error response format'),
        ('Step 3', '# Set up Swagger/OpenAPI\n# Install: npm install swagger-jsdoc swagger-ui-express\n# Document all endpoints\n# Serve docs at /api-docs'),
        ('Step 4', '# Add request logging\n# Log all requests with winston\n# Include: timestamp, method, path, status, duration'),
        ('Step 5', '# Final API testing\n# Test all endpoints documented\n# Verify rate limiting works\n# Check error responses consistent')
    ],
    'dev2-day24': [
        ('Step 1', '# Responsive design review\n# Test all pages on mobile, tablet, desktop\n# Fix any layout issues'),
        ('Step 2', '# Add animations\n# Page transitions fade-in\n# Button hover effects\n# Loading state animations'),
        ('Step 3', '# Dark mode implementation (optional)\n# Add theme toggle\n# Define dark color scheme\n# Test all components in dark mode'),
        ('Step 4', '# Accessibility improvements\n# Add ARIA labels\n# Test keyboard navigation\n# Check color contrast ratios'),
        ('Step 5', '# Final UI polish\n# Fix any visual bugs\n# Ensure consistent styling\n# Test cross-browser')
    ],
    'dev3-day24': [
        ('Step 1', '# Run full test suite\n# Backend: npm run test\n# Frontend: npm run test\n# E2E: npm run test:e2e'),
        ('Step 2', '# Fix any failing tests\n# Debug failures\n# Update tests if needed\n# Verify all pass'),
        ('Step 3', '# Code coverage check\n# Verify >80% coverage\n# Identify untested code\n# Add missing tests'),
        ('Step 4', '# Manual exploratory testing\n# Test edge cases\n# Try to break the app\n# Document any bugs'),
        ('Step 5', '# Create bug report\n# List all issues found\n# Prioritize: critical, high, medium, low\n# Assign for fixes')
    ],
    
    'dev1-day25': [
        ('Step 1', '# Code cleanup and refactoring\n# Remove commented code\n# Fix linting errors\n# Improve code organization'),
        ('Step 2', '# Write backend README\n# Document: setup, configuration, running, testing\n# List all environment variables\n# Include troubleshooting section'),
        ('Step 3', '# Document API endpoints\n# Complete API documentation in Swagger\n# Add request/response examples\n# Document authentication'),
        ('Step 4', '# Create deployment guide\n# Document: build process, environment setup, deployment steps\n# Include rollback procedure'),
        ('Step 5', '# Prepare demo\n# Create demo script\n# Set up demo data\n# Practice full presentation')
    ],
    'dev2-day25': [
        ('Step 1', '# Code cleanup\n# Remove unused components\n# Fix ESLint warnings\n# Organize imports'),
        ('Step 2', '# Write frontend README\n# Document: setup, development, building, deployment\n# List all environment variables\n# Include component documentation'),
        ('Step 3', '# Create user guide\n# Step-by-step walkthrough with screenshots\n# Cover: connection, analysis, mapping, execution\n# Include tips and best practices'),
        ('Step 4', '# Document component architecture\n# Create component tree diagram\n# Document state management\n# List reusable components'),
        ('Step 5', '# Final demo preparation\n# Take screenshots of all pages\n# Create demo video\n# Prepare handoff materials')
    ],
    'dev3-day25': [
        ('Step 1', '# Write deployment documentation\n# Document: server requirements, deployment steps, monitoring\n# Include database migration procedure'),
        ('Step 2', '# Create testing procedures document\n# Document: running tests, interpreting results, adding tests\n# Include CI/CD pipeline documentation'),
        ('Step 3', '# Write troubleshooting guide\n# Common issues and solutions\n# Error messages and fixes\n# Performance tuning tips'),
        ('Step 4', '# Create stakeholder presentation\n# Slides: project overview, features, architecture, demo, next steps\n# Include screenshots and metrics'),
        ('Step 5', '# Week 5 completion and handoff\n# Final documentation review\n# Archive all deliverables\n# Celebrate successful MVP completion!')
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
