"""
Complete Days 13-25 with correct content based on MVP_CONTENT_STRATEGY.md
Batch updates all remaining onboarding pages.
"""

import re
from pathlib import Path

# Content templates for each day (Week 3-5)
# Format: (day, dev, title, objective, steps_summary)

WEEK3_CONTENT = {
    # Day 13: Mapping Validation
    ('dev1', 13): {
        'title': 'Mapping Validation Service',
        'objective': 'Implement validation rules for field mappings to ensure type compatibility and formula correctness.',
        'endpoints': ['POST /api/v1/mappings/validate'],
        'tasks': ['Type compatibility validation', 'Formula syntax checking', 'Required field validation']
    },
    ('dev2', 13): {
        'title': 'Validation Feedback UI',
        'objective': 'Display inline validation errors and warnings for field mappings in the UI.',
        'components': ['ValidationIndicator', 'ValidationTooltip', 'ErrorList'],
        'tasks': ['Inline error display', 'Validation status icons', 'Disable save on errors']
    },
    ('dev3', 13): {
        'title': 'Mapping UI Tests',
        'objective': 'Write comprehensive tests for mapping page components and validation logic.',
        'tests': ['Component tests', 'Validation tests', 'Integration tests'],
        'tasks': ['Test mapping table', 'Test validation feedback', 'Test error states']
    },
    
    # Day 14: Confidence Scoring
    ('dev1', 14): {
        'title': 'Confidence Scoring Algorithm',
        'objective': 'Calculate and store confidence scores for field mappings based on name similarity and type match.',
        'endpoints': ['PUT /api/v1/mappings (with confidence score)'],
        'tasks': ['Name similarity algorithm', 'Type match scoring', 'Combined confidence calculation']
    },
    ('dev2', 14): {
        'title': 'Confidence Score Display',
        'objective': 'Show confidence scores with color-coded badges and enable high-confidence bulk mapping.',
        'components': ['ConfidenceScoreBadge', 'ScoreLegend'],
        'tasks': ['Score visualization', 'Color coding', 'Bulk high-confidence mapping']
    },
    ('dev3', 14): {
        'title': 'E2E Mapping Test',
        'objective': 'Write end-to-end test for complete mapping workflow from connection to validation.',
        'tests': ['E2E workflow test', 'Confidence score tests'],
        'tasks': ['Full mapping flow', 'Confidence calculation', 'Database verification']
    },
    
    # Day 15: Mapping CRUD & Export
    ('dev1', 15): {
        'title': 'Mappings CRUD Operations',
        'objective': 'Complete CRUD operations for mappings with bulk update and export functionality.',
        'endpoints': ['PUT /api/v1/mappings/:id', 'DELETE /api/v1/mappings/:id', 'POST /api/v1/mappings/bulk', 'GET /api/v1/mappings/:projectId/export'],
        'tasks': ['Update mapping', 'Delete mapping', 'Bulk operations', 'JSON export']
    },
    ('dev2', 15): {
        'title': 'Bulk Mapping Actions',
        'objective': 'Add bulk mapping actions and export functionality to the mapping interface.',
        'components': ['BulkActionsToolbar', 'ExportDialog'],
        'tasks': ['Clear all mappings', 'Map all high confidence', 'Export to JSON', 'Keyboard shortcuts']
    },
    ('dev3', 15): {
        'title': 'Performance Testing',
        'objective': 'Test mapping performance with large schemas and identify bottlenecks.',
        'tests': ['Load tests', 'Performance benchmarks'],
        'tasks': ['Test with 1000+ fields', 'Measure response times', 'UI rendering performance']
    },
}

WEEK4_CONTENT = {
    # Day 16: Transformation Engine
    ('dev1', 16): {
        'title': 'Transformation Engine',
        'objective': 'Build transformation engine with type conversion and formula evaluation capabilities.',
        'endpoints': ['POST /api/v1/transform/preview'],
        'tasks': ['Type conversion functions', 'Formula evaluator', 'Null handling', 'Test transformations']
    },
    ('dev2', 16): {
        'title': 'Transformation Preview UI',
        'objective': 'Create UI to preview source data and transformed results side-by-side.',
        'components': ['TransformationPreview', 'DataComparison'],
        'tasks': ['Two-column layout', 'Sample data display', 'Highlight changes', 'Refresh sample']
    },
    ('dev3', 16): {
        'title': 'Transformation Tests',
        'objective': 'Write comprehensive tests for transformation engine and formula functions.',
        'tests': ['Formula function tests', 'Type conversion tests', 'Edge case tests'],
        'tasks': ['Test all formulas', 'Test conversions', 'Test error handling']
    },
    
    # Day 17: Data Sampling
    ('dev1', 17): {
        'title': 'Data Sampling Service',
        'objective': 'Fetch sample records from Salesforce and apply transformations for preview.',
        'endpoints': ['POST /api/v1/data/sample'],
        'tasks': ['jsforce query for samples', 'Apply transformations', 'Cache results', 'Return sample data']
    },
    ('dev2', 17): {
        'title': 'Data Table Component',
        'objective': 'Build reusable data table with sorting, filtering, and pagination.',
        'components': ['DataTable', 'ColumnHeader', 'Pagination'],
        'tasks': ['Sortable columns', 'Search/filter', 'Pagination', 'Row selection']
    },
    ('dev3', 17): {
        'title': 'Sampling Tests',
        'objective': 'Test data sampling service and DataTable component functionality.',
        'tests': ['Sampling service tests', 'DataTable tests'],
        'tasks': ['Test jsforce queries', 'Test transformation application', 'Test table features']
    },
    
    # Day 18: Validation Rules
    ('dev1', 18): {
        'title': 'Validation Rules Engine',
        'objective': 'Implement data validation rules for required fields, types, and value ranges.',
        'endpoints': ['POST /api/v1/validate'],
        'tasks': ['Required field validation', 'Type validation', 'Range validation', 'Store errors']
    },
    ('dev2', 18): {
        'title': 'Validation Results Display',
        'objective': 'Create UI to display validation summary and error details.',
        'components': ['ValidationSummary', 'ValidationErrorsTable'],
        'tasks': ['Error summary card', 'Error breakdown chart', 'Error details table', 'Severity badges']
    },
    ('dev3', 18): {
        'title': 'Validation Tests',
        'objective': 'Test validation rules and error reporting functionality.',
        'tests': ['Validation rule tests', 'Error storage tests', 'UI display tests'],
        'tasks': ['Test all validation types', 'Test error detection', 'Test UI rendering']
    },
    
    # Day 19: Error Reporting
    ('dev1', 19): {
        'title': 'Error Reporting System',
        'objective': 'Build error tracking and reporting with statistics and resolution tracking.',
        'endpoints': ['GET /api/v1/errors/:projectId', 'GET /api/v1/errors/:projectId/stats', 'PUT /api/v1/errors/:id/resolve'],
        'tasks': ['Error query endpoint', 'Error statistics', 'Error grouping', 'Resolution tracking']
    },
    ('dev2', 19): {
        'title': 'Error Navigation & Fixing',
        'objective': 'Enable error navigation, highlighting, and fixing actions.',
        'components': ['ErrorNavigator', 'FixDialog', 'ErrorHistory'],
        'tasks': ['Click to navigate', 'Highlight errors', 'Fix action', 'Bulk resolution']
    },
    ('dev3', 19): {
        'title': 'E2E Validation Flow',
        'objective': 'Write end-to-end test for transformation, validation, and error fixing workflow.',
        'tests': ['E2E validation test', 'Error workflow test'],
        'tasks': ['Transform → Validate → Fix', 'Test error resolution', 'Verify database state']
    },
    
    # Day 20: Performance Optimization
    ('dev1', 20): {
        'title': 'Transformation Optimization',
        'objective': 'Optimize transformation performance with caching and retry logic.',
        'tasks': ['Cache formula results', 'Optimize formula parsing', 'Add retry logic', 'Performance profiling']
    },
    ('dev2', 20): {
        'title': 'UI Polish & Testing',
        'objective': 'Add loading states, error boundaries, and keyboard shortcuts throughout the UI.',
        'tasks': ['Loading skeletons', 'Error boundaries', 'Keyboard shortcuts', 'Animation polish']
    },
    ('dev3', 20): {
        'title': 'Load Testing',
        'objective': 'Perform load testing with concurrent users and measure performance metrics.',
        'tests': ['Load tests', 'Stress tests', 'Performance benchmarks'],
        'tasks': ['Test 100 concurrent users', 'Test large datasets', 'Measure response times']
    },
}

WEEK5_CONTENT = {
    # Day 21: Migration Execution
    ('dev1', 21): {
        'title': 'Migration Execution API',
        'objective': 'Build migration execution service that inserts/updates records in Salesforce with progress tracking.',
        'endpoints': ['POST /api/v1/execute', 'GET /api/v1/execute/:jobId/status'],
        'tasks': ['jsforce insert/update', 'Progress tracking', 'Job status endpoint', 'Test with 10 records']
    },
    ('dev2', 21): {
        'title': 'Execution Progress UI',
        'objective': 'Create execution page with real-time progress display and status updates.',
        'components': ['ExecutionPage', 'ProgressBar', 'ExecutionLog'],
        'tasks': ['Progress bar', 'Status polling', 'Execution log', 'Time elapsed']
    },
    ('dev3', 21): {
        'title': 'Execution Tests',
        'objective': 'Test migration execution service with mocked Salesforce API calls.',
        'tests': ['Execution service tests', 'Progress tracking tests'],
        'tasks': ['Mock jsforce operations', 'Test job creation', 'Test progress updates']
    },
    
    # Day 22: Batch Processing
    ('dev1', 22): {
        'title': 'Batch Processing with Bull',
        'objective': 'Implement batch processing using Bull queue with Redis for large migrations.',
        'endpoints': ['GET /api/v1/jobs', 'GET /api/v1/jobs/:id', 'DELETE /api/v1/jobs/:id'],
        'tasks': ['Install Bull', 'Create job queue', 'Batch processor', 'Job monitoring']
    },
    ('dev2', 22): {
        'title': 'Real-time Updates',
        'objective': 'Implement real-time progress updates using polling or WebSocket.',
        'components': ['RealtimeProgress', 'NotificationToast'],
        'tasks': ['Polling implementation', 'Batch progress display', 'Notifications', 'Queue position']
    },
    ('dev3', 22): {
        'title': 'E2E Migration Test',
        'objective': 'Write comprehensive end-to-end test for complete migration workflow.',
        'tests': ['Full E2E test', 'Batch processing tests'],
        'tasks': ['Connection → Execute', 'Test multiple batches', 'Verify target org']
    },
    
    # Day 23: Rollback Functionality
    ('dev1', 23): {
        'title': 'Rollback Implementation',
        'objective': 'Build rollback functionality to delete migrated records from target org.',
        'endpoints': ['POST /api/v1/rollback'],
        'tasks': ['Store target IDs', 'Rollback service', 'Rollback endpoint', 'Test rollback']
    },
    ('dev2', 23): {
        'title': 'Results & Reports',
        'objective': 'Create results summary page with download report capability.',
        'components': ['ResultsPage', 'RollbackDialog', 'ReportDownload'],
        'tasks': ['Results summary', 'Rollback button', 'Download report', 'Confirmation dialog']
    },
    ('dev3', 23): {
        'title': 'Production Deployment Setup',
        'objective': 'Set up production environment configuration and deployment process.',
        'tasks': ['Production config', 'Environment variables', 'Deployment scripts', 'Staging deployment']
    },
    
    # Day 24: Final Polish
    ('dev1', 24): {
        'title': 'API Final Polish',
        'objective': 'Add rate limiting, improve error handling, and create API documentation.',
        'tasks': ['Rate limiting middleware', 'Centralized error handler', 'Swagger/OpenAPI docs', 'Request logging']
    },
    ('dev2', 24): {
        'title': 'UI Final Polish',
        'objective': 'Complete responsive design, animations, and accessibility improvements.',
        'tasks': ['Responsive design review', 'Animations', 'Dark mode (optional)', 'Accessibility']
    },
    ('dev3', 24): {
        'title': 'Final Testing & Fixes',
        'objective': 'Run full test suite, fix failures, and perform exploratory testing.',
        'tests': ['Full test suite', 'Coverage check', 'Exploratory testing'],
        'tasks': ['Fix failing tests', 'Check coverage >80%', 'Manual testing', 'Bug report']
    },
    
    # Day 25: Documentation & Handoff
    ('dev1', 25): {
        'title': 'Backend Documentation',
        'objective': 'Complete backend documentation including README, API docs, and deployment guide.',
        'tasks': ['Backend README', 'API documentation', 'Deployment guide', 'Demo preparation']
    },
    ('dev2', 25): {
        'title': 'Frontend Documentation',
        'objective': 'Complete frontend documentation with user guide and component architecture.',
        'tasks': ['Frontend README', 'User guide with screenshots', 'Component documentation', 'Demo materials']
    },
    ('dev3', 25): {
        'title': 'Final Handoff',
        'objective': 'Finalize all documentation, testing procedures, and stakeholder presentation.',
        'tasks': ['Deployment documentation', 'Testing procedures', 'Troubleshooting guide', 'Stakeholder presentation']
    },
}

def generate_simple_content(day, dev, info):
    """Generate simplified content HTML for a day."""
    dev_role = {
        'dev1': 'Backend & Database',
        'dev2': 'Frontend & React', 
        'dev3': 'DevOps & QA'
    }[dev]
    
    steps_html = ""
    for i in range(1, 6):
        steps_html += f'''
            <div class="content-section">
                <h2>📦 Step {i}: {info['tasks'][min(i-1, len(info['tasks'])-1)] if 'tasks' in info else f'Task {i}'}</h2>
                <p>Complete this step according to the MVP strategy.</p>
                <div class="success-box">
                    <strong>✅ Completion Checklist:</strong>
                    <ul>
                        <li>Code implemented and tested</li>
                        <li>Unit tests passing</li>
                        <li>Documentation updated</li>
                    </ul>
                </div>
            </div>
'''
    
    content = f'''            <h1 class="page-title">Day {day}: {info['title']}</h1>
            <p class="page-subtitle">Developer {dev[-1]}: {dev_role} | Duration: ~6-8 hours</p>
            
            <div class="content-section">
                <h2>📋 Objective</h2>
                <p>{info['objective']}</p>
                
                {'<p><strong>API Endpoints:</strong></p><ul>' + ''.join(f'<li><code>{ep}</code></li>' for ep in info.get('endpoints', [])) + '</ul>' if 'endpoints' in info else ''}
                {'<p><strong>Components:</strong></p><ul>' + ''.join(f'<li>{comp}</li>' for comp in info.get('components', [])) + '</ul>' if 'components' in info else ''}
                {'<p><strong>Tests:</strong></p><ul>' + ''.join(f'<li>{test}</li>' for test in info.get('tests', [])) + '</ul>' if 'tests' in info else ''}
            </div>
{steps_html}'''
    
    return content

def update_day_content(file_path, day, dev):
    """Update a single day file with correct content."""
    all_content = {**WEEK3_CONTENT, **WEEK4_CONTENT, **WEEK5_CONTENT}
    
    if (dev, day) not in all_content:
        print(f'⚠️  No content defined for {dev}-day{day:02d}')
        return False
    
    info = all_content[(dev, day)]
    new_content = generate_simple_content(day, dev, info)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Find and replace content between page-title and the next major section or script
    pattern = r'(<h1 class="page-title">.*?</h1>.*?)((?=<script>)|(?=</body>))'
    
    if not re.search(pattern, html, re.DOTALL):
        print(f'⚠️  Pattern not found in {file_path.name}')
        return False
    
    # Replace content
    html = re.sub(
        r'<h1 class="page-title">Day \d+:.*?(?=<script>|</body>)',
        new_content + '\n            ',
        html,
        flags=re.DOTALL
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    return True

def main():
    """Update all Days 13-25."""
    base_path = Path(__file__).parent.parent / 'docs' / 'Onboarding'
    
    updated = 0
    skipped = 0
    
    for day in range(13, 26):
        for dev in ['dev1', 'dev2', 'dev3']:
            file_path = base_path / f'{dev}-day{day:02d}.html'
            
            if not file_path.exists():
                print(f'⚠️  File not found: {file_path.name}')
                skipped += 1
                continue
            
            if update_day_content(file_path, day, dev):
                print(f'✅ Updated: {dev}-day{day:02d}.html')
                updated += 1
            else:
                print(f'❌ Failed: {dev}-day{day:02d}.html')
                skipped += 1
    
    print(f'\n📊 Summary: {updated} files updated, {skipped} files skipped/failed')

if __name__ == '__main__':
    main()
