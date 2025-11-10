# Detailed Week 2-5 Implementation Tasks Based on Requirements

## Week 2: Core API Layer (Days 6-10)

### Developer 1 (Backend) - Week 2
**Day 6: Schema Analysis API (Part 1)**
- Implement `POST /api/v1/projects/{id}/analyze` endpoint
- Create jsforce integration for SFDC schema discovery
- Query Salesforce `describeGlobal()` and `describeSObjects()` for Product2, Pricebook2, PricebookEntry
- Return object metadata: fields, types, custom fields, relationships
- Store results in PostgreSQL schema_analysis table

**Day 7: Schema Analysis API (Part 2)**
- Implement `GET /api/v1/projects/{id}/analyze/{job_id}` status endpoint
- Add field-level metadata extraction (picklist values, lookup relationships)
- Calculate readiness score based on custom field compatibility
- Implement caching with Redis for schema results

**Day 8: Metadata Extraction & Catalog**
- Create schema catalog tables in PostgreSQL
- Build `GET /api/v1/projects/{id}/analyze/summary` endpoint
- Parse custom fields and detect incompatibilities
- Generate warnings for unsupported field types

**Day 9: Relationship Detection & Foreign Keys**
- Detect Product2 → PricebookEntry relationships
- Identify lookup and master-detail relationships
- Build relationship graph for dependency mapping
- Store relationship metadata in catalog

**Day 10: Week 2 Testing & PR**
- Unit tests for all schema analysis endpoints
- Integration tests with jsforce mock
- API documentation (Swagger/OpenAPI spec)
- Create PR with code review checklist

### Developer 2 (Frontend) - Week 2
**Day 6: Connection Form UI**
- Build Connection Wizard page (Step 1 of 7)
- Create form components: environment dropdown, instance URL input, OAuth button
- Implement client-side validation (URL format, required fields)
- Wire up `POST /api/v1/projects/{id}/connections/source` API call

**Day 7: OAuth Integration**
- Implement OAuth 2.0 flow with Salesforce
- Handle redirect callback and token storage
- Display connection status and org info (org name, org ID)
- Add "Test Connection" button calling `/connections/source/test`

**Day 8: Connection Testing UI**
- Build connection test results display
- Show success/error messages with details
- Display org permissions check results
- Add progress spinner during async connection test

**Day 9: Target Connection & Error Handling**
- Duplicate source connection UI for target (Revenue Cloud)
- Implement comprehensive error handling (network errors, auth failures)
- Add retry logic for transient failures
- Display user-friendly error messages

**Day 10: Week 2 Testing & PR**
- Unit tests for connection components (Vitest)
- E2E tests for OAuth flow (Playwright)
- Accessibility testing (ARIA labels, keyboard navigation)
- Create PR with screenshots

### Developer 3 (DevOps) - Week 2
**Day 6: Docker Compose for Local Dev**
- Create `docker-compose.yml` with backend, frontend, postgres, redis services
- Configure volumes for persistent data
- Set up network bridge for service communication
- Document `docker-compose up` workflow

**Day 7: PostgreSQL & Redis Configuration**
- Configure PostgreSQL with init scripts for schema creation
- Set up Redis with persistence enabled
- Create `.env.example` with all required environment variables
- Document connection strings and ports

**Day 8: Database Migrations Tool**
- Set up node-pg-migrate or similar migration tool
- Create initial migration for schema_analysis, projects, connections tables
- Add migration runner script to package.json
- Document migration workflow (up/down)

**Day 9: Seed Data Scripts**
- Create seed scripts for sample projects and connections
- Add sample schema analysis results for testing
- Create script to reset dev database
- Document how to run seeds

**Day 10: Bull Queue Setup & Week 2 PR**
- Configure Bull queue with Redis backend
- Create sample worker for schema analysis jobs
- Add queue monitoring dashboard (Bull Board)
- Create PR with runbook

---

## Week 3: Field Mapping & AI (Days 11-15)

### Developer 1 (Backend) - Week 3
**Day 11: Field Mapping API (Part 1)**
- Implement `POST /api/v1/projects/{id}/mappings` bulk save endpoint
- Create mappings table (source_field, target_field, mapping_type, transform_logic)
- Validate mapping completeness (all required fields mapped)
- Handle conflict resolution (merge vs replace mode)

**Day 12: Field Mapping API (Part 2)**
- Implement `GET /api/v1/projects/{id}/mappings` retrieval endpoint
- Add `PUT /api/v1/projects/{id}/mappings/{mapping_id}` update endpoint
- Build validation rules (data type compatibility, required field checks)
- Return validation errors/warnings

**Day 13: AI Mapping Integration (OpenAI)**
- Implement `POST /api/v1/projects/{id}/mappings/suggest` AI endpoint
- Integrate OpenAI GPT-4 API for field similarity detection
- Use embeddings to calculate semantic similarity scores
- Return confidence scores (0.0-1.0) for each suggestion

**Day 14: Mapping Validation Engine**
- Build `POST /api/v1/projects/{id}/mappings/validate` endpoint
- Check all required fields are mapped (Product2.Name → Product__c.Name)
- Validate data type compatibility (Text → Text, Number → Currency)
- Generate warnings for risky transformations

**Day 15: Week 3 Testing & PR**
- Unit tests for mapping APIs
- Integration tests with AI mock responses
- Performance tests (handle 70+ field mappings)
- Create PR with API docs

### Developer 2 (Frontend) - Week 3
**Day 11: Mapping Table UI**
- Build Field Mapping page (Step 3 of 7)
- Create data table with source/target columns
- Add drag-and-drop interface for mapping fields
- Implement search/filter for large field lists

**Day 12: AI Suggestions Display**
- Add "Get AI Suggestions" button
- Display confidence scores with color coding (green >90%, yellow 70-90%, red <70%)
- Show preview of suggested mappings
- Allow one-click accept/reject of suggestions

**Day 13: Drag & Drop Mapping**
- Implement drag-and-drop field mapping
- Visual indicators for mapped/unmapped fields
- Validation feedback (red border for incompatible types)
- Auto-save mappings on change

**Day 14: Bulk Operations**
- Add "Accept All AI Suggestions" button
- Implement "Clear All Mappings" with confirmation
- Export/import mappings as JSON
- Show mapping progress (X of Y fields mapped)

**Day 15: Week 3 Testing & PR**
- Unit tests for mapping components
- E2E tests for drag-and-drop
- Test AI suggestion acceptance flow
- Create PR

### Developer 3 (DevOps) - Week 3
**Day 11: Integration Tests (Part 1)**
- Set up supertest for API testing
- Write integration tests for connection APIs
- Test schema analysis job flow (create → poll → complete)
- Mock Salesforce API responses

**Day 12: Integration Tests (Part 2)**
- Write integration tests for mapping APIs
- Test AI suggestion endpoint (mock OpenAI)
- Validate error handling paths
- Add test coverage reporting

**Day 13: Test Database Setup**
- Create separate test database in docker-compose
- Add database reset script for test isolation
- Configure test environment variables
- Document test database workflow

**Day 14: Playwright E2E Setup**
- Install and configure Playwright
- Write first E2E test (login → create project)
- Test connection wizard flow
- Add screenshots on failure

**Day 15: E2E Tests & Week 3 PR**
- Write E2E tests for mapping wizard
- Test AI suggestion acceptance flow
- Add CI integration for E2E tests
- Create PR

---

## Week 4: Data Transformation & Queue (Days 16-20)

### Developer 1 (Backend) - Week 4
**Day 16: Transformation API (Part 1)**
- Implement `POST /api/v1/projects/{id}/transforms` create endpoint
- Support transform types: Direct, ValueMap, Formula, Concatenate, Lookup
- Parse and validate transformation logic (JavaScript expressions)
- Store transforms in database

**Day 17: Transformation API (Part 2)**
- Implement `GET /api/v1/projects/{id}/transforms` retrieval
- Add `PUT /api/v1/projects/{id}/transforms/{id}` update endpoint
- Build preview endpoint to test transforms on sample data
- Return transformed values for validation

**Day 18: Bull Queue Integration**
- Create queue for ETL jobs (extract, transform, load)
- Build worker to process transformation jobs
- Implement job progress tracking
- Add retry logic for failed jobs

**Day 19: ETL Job Processing**
- Implement extract phase (pull data from Salesforce via Bulk API)
- Transform phase (apply mapping and transformation rules)
- Store in STG1 table (vanilla PostgreSQL schema)
- Update job status and progress percentage

**Day 20: Week 4 Testing & PR**
- Unit tests for transformation engine
- Integration tests for ETL pipeline
- Test queue worker with sample jobs
- Create PR

### Developer 2 (Frontend) - Week 4
**Day 16: Transformation Preview UI**
- Build Transformation page (Step 4 of 7)
- Display transformation rules for each field
- Add "Preview" button to test transforms
- Show before/after values for sample records

**Day 17: Data Tables & Pagination**
- Build data preview table component
- Implement pagination for large datasets
- Add sorting and filtering
- Show transformation errors inline

**Day 18: Validation Results Display**
- Build Validation page (Step 5 of 7)
- Display validation summary (X passed, Y warnings, Z errors)
- Show validation details table (record ID, field, error message)
- Add filters (show only errors, show only warnings)

**Day 19: Error Display & Export**
- Build error detail modal
- Show field-level validation errors
- Add "Export Errors" button (download CSV)
- Implement error grouping by field

**Day 20: Week 4 Testing & PR**
- Unit tests for transformation components
- Test data table pagination
- Test validation error display
- Create PR

### Developer 3 (DevOps) - Week 4
**Day 16: Deploy to Dev Workflow**
- Create GitHub Actions workflow for dev deployment
- Build Docker images and push to registry
- Deploy to dev environment (AWS/Azure/GCP)
- Add deployment status notifications

**Day 17: Secrets Management**
- Set up GitHub Secrets for API keys
- Configure environment-specific secrets (dev, test, prod)
- Document secret rotation process
- Test secret injection in workflows

**Day 18: Health Checks**
- Add `/health` endpoint to backend
- Implement database connection check
- Add Redis connection check
- Configure container health checks in docker-compose

**Day 19: Deploy to Test Workflow**
- Create deployment workflow for test environment
- Add manual approval step for test deployments
- Configure test environment variables
- Document deployment process

**Day 20: Week 4 Testing & PR**
- Test deploy to dev workflow end-to-end
- Verify health checks work correctly
- Document runbook for deployments
- Create PR

---

## Week 5: Migration Execution & Testing (Days 21-25)

### Developer 1 (Backend) - Week 5
**Day 21: Migration Execution API**
- Implement `POST /api/v1/projects/{id}/execute` migration endpoint
- Create execution job in queue
- Build STG2 → Target upsert logic
- Handle bulk API limits and batching

**Day 22: Error Handling & Rollback**
- Implement transaction rollback for failed migrations
- Log all errors with stack traces
- Build retry mechanism for transient failures
- Create rollback endpoint to revert changes

**Day 23: Testing Reports API**
- Implement `POST /api/v1/projects/{id}/test` endpoint
- Run data integrity checks (record counts, field values)
- Generate comparison report (source vs target)
- Store test results in database

**Day 24: Integration Testing**
- End-to-end integration test (connect → analyze → map → transform → execute)
- Test with sample Salesforce sandbox
- Verify data integrity after migration
- Test error scenarios

**Day 25: Final Testing & Documentation**
- Performance testing (large datasets, 10K+ records)
- Security testing (SQL injection, XSS)
- API documentation finalization
- Create comprehensive README

### Developer 2 (Frontend) - Week 5
**Day 21: Execution Progress UI**
- Build Execution page (Step 6 of 7)
- Display progress bar (% complete)
- Show real-time job status (queued, running, completed)
- Add "Start Migration" button with confirmation

**Day 22: Real-time Updates**
- Implement WebSocket connection for live updates
- Update progress bar in real-time
- Show records processed / total records
- Display current step (extracting, transforming, loading)

**Day 23: Test Reports & Comparison**
- Build Test Reports page (Step 7 of 7)
- Display data comparison table (source vs target)
- Show validation test results
- Add "Download Report" button (PDF export)

**Day 24: Export & UI Testing**
- Implement report export (CSV, PDF)
- Add final success/failure summary page
- Test all 7 wizard steps end-to-end
- Fix UI bugs and polish

**Day 25: Final Polish & Documentation**
- Implement responsive design (mobile/tablet)
- Add loading states and spinners
- Accessibility audit (WCAG 2.1 AA)
- Create user guide with screenshots

### Developer 3 (DevOps) - Week 5
**Day 21: Smoke Tests**
- Write smoke tests for production readiness
- Test critical paths (create project, run migration)
- Add smoke test to CI pipeline
- Configure alerts for smoke test failures

**Day 22: Environment Promotion**
- Create promotion workflow (dev → test → prod)
- Add approval gates for prod deployments
- Configure blue-green deployment strategy
- Document promotion process

**Day 23: Rollback Procedures**
- Document rollback steps for failed deployments
- Create rollback workflow in GitHub Actions
- Test rollback scenario
- Update runbook with rollback instructions

**Day 24: Full System Testing**
- Run full system test (all 7 wizard steps)
- Load testing (100 concurrent users)
- Stress testing (10K+ records)
- Security scan (OWASP ZAP)

**Day 25: Documentation & Handoff**
- Create operations runbook
- Document monitoring and alerting setup
- Write incident response playbook
- Final system architecture diagram

---

## Key Technical Stack References

### Backend APIs (Node.js + Express)
```
POST   /api/v1/projects
GET    /api/v1/projects
POST   /api/v1/projects/{id}/connections/source
POST   /api/v1/projects/{id}/connections/source/test
POST   /api/v1/projects/{id}/analyze
GET    /api/v1/projects/{id}/analyze/{job_id}
GET    /api/v1/projects/{id}/mappings
POST   /api/v1/projects/{id}/mappings
POST   /api/v1/projects/{id}/mappings/suggest
POST   /api/v1/projects/{id}/transforms
POST   /api/v1/projects/{id}/execute
POST   /api/v1/projects/{id}/test
```

### Database Schema (PostgreSQL)
- `projects` - migration projects
- `connections` - source/target credentials (encrypted)
- `schema_analysis` - discovered objects/fields
- `field_mappings` - source→target field mappings
- `transformation_rules` - data transformation logic
- `stg1_products` - staging table (vanilla schema)
- `stg2_products` - staging table (EAV model for custom fields)
- `migration_jobs` - execution tracking
- `validation_results` - test results

### Frontend Components (React + TypeScript)
- ConnectionWizard (Step 1)
- SchemaAnalysis (Step 2)
- FieldMapping (Step 3)
- Transformation (Step 4)
- Validation (Step 5)
- Execution (Step 6)
- TestReports (Step 7)

### External Integrations
- jsforce - Salesforce API client
- OpenAI API - AI-powered field mapping
- Bull + Redis - job queue
- Playwright - E2E testing
- Docker + docker-compose - containerization
