# Phase 1 MVP - Days 19-22 Task Distribution
## Inflight Data Migration Features

**Date:** November 18, 2025  
**Status:** Planning Complete - Ready for Implementation  
**Target:** Complete by November 25, 2025 (Days 19-22)

---

## Overview

Days 1-18 completed **core product catalog migration** (products, price books, pricing rules, basic migration wizard).

Days 19-22 add **4 critical inflight business data migration features** to Phase 1 MVP:
1. **Inflight Quotes** (Draft, Pending, Negotiating status)
2. **Inflight Orders** (Pending, Fulfillment, Activation status)
3. **Contracts** (Convert to Revenue Cloud Assets)
4. **Subscriptions** (Recurring billing, MRR/ARR tracking)

---

## Resources Created

### Mockup Pages (docs/Mockup/)
- ✅ `migration-inflight-quotes.html` - Shows 247 draft, 89 pending, 56 negotiating quotes
- ✅ `migration-inflight-orders.html` - Shows 143 pending, 67 fulfillment, 34 activation orders
- ✅ `migration-contracts.html` - Shows 892 active, 234 expiring contracts → Asset conversion
- ✅ `migration-subscriptions.html` - Shows 1,456 active subscriptions (final Phase 1 step)
- ✅ `migration-final-report.html` - Complete Phase 1 summary with all migration metrics
- ✅ `migration-test.html` (updated) - Added "View Full Report" button
- ✅ `migration-report.html` (updated) - Added "Continue with Inflight Data" section

### Requirements Documents (docs/RevNovaRequirements/)
- ✅ `requirements-phase1-inflight.html` - BR-IQ-001 to BR-IO-004 (quotes & orders)
- ✅ `requirements-phase1-contracts.html` - BR-CT-001 to BR-CT-006 (contract migration)
- ✅ `requirements-phase1-subscriptions.html` - BR-SB-001 to BR-SB-006 (subscriptions)

Each requirements doc includes:
- Functional business requirements with BR codes
- Technical specifications (APIs, database schema)
- UI specifications (colors, layouts, grids matching mockups)
- API endpoint definitions (analyze/execute pattern)
- Database table schemas with indexes

---

## Day 19: Inflight Quotes Migration

### Dev1 (Backend) - Day 19
**Task:** Build Inflight Quotes API

**Requirements:** BR-IQ-001 to BR-IQ-004  
**Mockup:** `docs/Mockup/migration-inflight-quotes.html`

**Deliverables:**
1. Database table: `inflight_quote_migrations`
   ```sql
   CREATE TABLE inflight_quote_migrations (
     id UUID PRIMARY KEY,
     migration_id UUID REFERENCES migrations(id),
     source_quote_id VARCHAR(18) NOT NULL,
     target_quote_id VARCHAR(18),
     quote_status VARCHAR(50),  -- Draft | Pending | Negotiating
     line_item_count INTEGER DEFAULT 0,
     approval_steps INTEGER DEFAULT 0,
     migrated_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. API Endpoints:
   - `POST /api/v1/migration/inflight-quotes/analyze`
     - Query CPQ org: `SELECT Id, Name, SBQQ__Status__c FROM SBQQ__Quote__c WHERE SBQQ__Status__c IN ('Draft', 'Pending Approval', 'In Negotiation')`
     - Return: `{ draftCount, pendingCount, negotiatingCount, quotes: Quote[] }`
   
   - `POST /api/v1/migration/inflight-quotes/execute`
     - Options: `{ preserveLineItems, preserveApprovalHistory, linkOpportunities, convertPricingRules }`
     - Query related: `SBQQ__QuoteLine__c` (line items), `ProcessInstance` (approval history)
     - Insert to Revenue Cloud using jsforce bulk API
     - Return: `{ jobId, status: 'queued', quotesProcessed }`

3. Service Layer: `backend/src/services/inflightQuotesService.ts`
   - `analyzeInflightQuotes(migrationId)` - Count quotes by status
   - `executeInflightQuotesMigration(migrationId, options)` - Queue migration job
   - `migrateQuote(quote, options)` - Transform and insert single quote

**Test Criteria:**
- ✅ curl POST /analyze returns counts: `{ draftCount: 247, pendingCount: 89, negotiatingCount: 56 }`
- ✅ curl POST /execute returns jobId
- ✅ Database shows migrated quotes in `inflight_quote_migrations` table
- ✅ Revenue Cloud org has quotes with correct status and line items

**PR Title:** `feat(backend): add inflight quotes migration API (BR-IQ-001 to BR-IQ-004)`

---

### Dev2 (Frontend) - Day 19
**Task:** Build Inflight Quotes UI Page

**Requirements:** UI-IQ-001 from `requirements-phase1-inflight.html`  
**Mockup:** `docs/Mockup/migration-inflight-quotes.html` (design source of truth)

**Deliverables:**
1. React Component: `frontend/src/pages/wizard/InflightQuotesStep.tsx`
   - 3-column summary grid:
     - Draft (blue #11998e) - count
     - Pending Approval (orange #FE9339) - count  
     - In Negotiation (purple #667eea) - count
   - Migration options (4 checkboxes):
     - [ ] Preserve quote line items
     - [ ] Preserve approval history
     - [ ] Link to opportunities
     - [ ] Convert pricing rules to Revenue Cloud format
   - Navigation buttons:
     - "Back to Report" (secondary)
     - "Start Quote Migration" (primary green gradient)

2. API Integration:
   ```typescript
   const { data } = await axios.post('/api/v1/migration/inflight-quotes/analyze', {
     migrationId: currentMigrationId
   });
   // Display: draftCount, pendingCount, negotiatingCount
   ```

3. Styling (MUST match mockup exactly):
   - Summary cards: `grid-template-columns: repeat(3, 1fr)`
   - Colors: blue #11998e, orange #FE9339, purple #667eea
   - Card padding: `2rem`, border-radius: `8px`
   - Button: primary = green gradient (#11998e → #38ef7d)

**Test Criteria:**
- ✅ Page displays quote counts from API
- ✅ Checkboxes toggle migration options
- ✅ "Start Migration" button calls /execute endpoint
- ✅ Design matches mockup pixel-perfect (colors, spacing, grid)
- ✅ Navigates to Inflight Orders page after completion

**PR Title:** `feat(frontend): add inflight quotes UI page matching mockup design (UI-IQ-001)`

---

### Dev3 (Testing) - Day 19
**Task:** Build Inflight Quotes Tests

**Requirements:** Test coverage for BR-IQ-001 to BR-IQ-004

**Deliverables:**
1. Backend API Tests: `backend/src/__tests__/inflightQuotes.test.ts`
   ```typescript
   describe('Inflight Quotes API', () => {
     test('POST /analyze returns quote counts by status', async () => {
       const response = await request(app)
         .post('/api/v1/migration/inflight-quotes/analyze')
         .send({ migrationId: 'test-123' });
       
       expect(response.status).toBe(200);
       expect(response.body).toHaveProperty('draftCount');
       expect(response.body).toHaveProperty('pendingCount');
       expect(response.body).toHaveProperty('negotiatingCount');
     });

     test('POST /execute queues migration job', async () => {
       const response = await request(app)
         .post('/api/v1/migration/inflight-quotes/execute')
         .send({
           migrationId: 'test-123',
           options: { preserveLineItems: true }
         });
       
       expect(response.status).toBe(200);
       expect(response.body).toHaveProperty('jobId');
       expect(response.body.status).toBe('queued');
     });
   });
   ```

2. Frontend Component Tests: `frontend/src/pages/wizard/__tests__/InflightQuotesStep.test.tsx`
   - Test quote counts display correctly
   - Test checkbox toggles
   - Test migration button click calls API
   - Test navigation to next step

3. End-to-End Test: `frontend/cypress/e2e/inflight-quotes.cy.ts`
   - Complete flow: Report → Inflight Quotes → Start Migration → Orders

**Test Criteria:**
- ✅ All backend API tests pass (analyze, execute endpoints)
- ✅ All frontend component tests pass (UI rendering, interactions)
- ✅ E2E test completes full quote migration flow
- ✅ Code coverage >80% for inflightQuotesService.ts

**PR Title:** `test: add comprehensive tests for inflight quotes migration (BR-IQ-001 to BR-IQ-004)`

---

## Day 20: Inflight Orders Migration

### Dev1 (Backend) - Day 20
**Task:** Build Inflight Orders API

**Requirements:** BR-IO-001 to BR-IO-004  
**Mockup:** `docs/Mockup/migration-inflight-orders.html`

**Deliverables:**
1. Database table: `inflight_order_migrations`
2. API Endpoints:
   - `POST /api/v1/migration/inflight-orders/analyze` → `{ pendingCount, fulfillmentCount, activationCount }`
   - `POST /api/v1/migration/inflight-orders/execute` → `{ jobId, ordersProcessed }`
3. Query: `Order WHERE Status IN ('Pending', 'In Fulfillment', 'Activation Pending')`
4. Migrate: OrderProducts, fulfillment status, shipping addresses

**PR Title:** `feat(backend): add inflight orders migration API (BR-IO-001 to BR-IO-004)`

### Dev2 (Frontend) - Day 20
**Task:** Build Inflight Orders UI Page

**Mockup:** `docs/Mockup/migration-inflight-orders.html`

**Deliverables:**
1. Component: `frontend/src/pages/wizard/InflightOrdersStep.tsx`
2. 3-column grid: Pending (blue), In Fulfillment (orange), Activation (green)
3. Options: Migrate order products, fulfillment status, shipping addresses, link accounts
4. Navigation: Back → Quotes, Start → Contracts

**PR Title:** `feat(frontend): add inflight orders UI page (UI-IO-001)`

### Dev3 (Testing) - Day 20
**Task:** Build Inflight Orders Tests

**Deliverables:**
1. Backend tests: `backend/src/__tests__/inflightOrders.test.ts`
2. Frontend tests: `frontend/src/pages/wizard/__tests__/InflightOrdersStep.test.tsx`
3. E2E test: Quotes → Orders → Contracts flow

**PR Title:** `test: add inflight orders migration tests (BR-IO-001 to BR-IO-004)`

---

## Day 21: Contracts Migration

### Dev1 (Backend) - Day 21
**Task:** Build Contracts API (Contract → Asset Conversion)

**Requirements:** BR-CT-001 to BR-CT-006  
**Mockup:** `docs/Mockup/migration-contracts.html`

**Deliverables:**
1. Database table: `contract_asset_migrations`
2. API Endpoints:
   - `POST /api/v1/migration/contracts/analyze` → `{ activeCount, expiringCount, autoRenewCount, historicalCount, totalTCV }`
   - `POST /api/v1/migration/contracts/execute` → `{ jobId, contractsProcessed, assetsCreated }`
3. Transform: CPQ Contract → Revenue Cloud Asset (one-to-one)
4. Migrate: Contract line items → Asset line items, renewal terms, amendment history

**Critical Business Logic:**
- Each Contract becomes one Asset record
- Asset Status = Registered (if active) | Obsolete (if expired)
- Preserve renewal dates, auto-renew flags
- Link Asset to Account from Contract

**PR Title:** `feat(backend): add contracts-to-assets migration API (BR-CT-001 to BR-CT-006)`

### Dev2 (Frontend) - Day 21
**Task:** Build Contracts UI Page

**Mockup:** `docs/Mockup/migration-contracts.html`

**Deliverables:**
1. Component: `frontend/src/pages/wizard/ContractsStep.tsx`
2. 4-column grid: Active (green #2e844a), Expiring Soon (orange), Auto-Renew (blue), Historical (gray)
3. Warning box (orange #FED7AA): "Contract migration will create corresponding Asset records in Revenue Cloud."
4. Options: Convert to assets, preserve line items, maintain renewal terms, link subscriptions, preserve amendments
5. Navigation: Back → Orders, Start → Subscriptions

**PR Title:** `feat(frontend): add contracts migration UI with asset conversion warning (UI-CT-001)`

### Dev3 (Testing) - Day 21
**Task:** Build Contracts Tests

**Deliverables:**
1. Backend tests: Verify contract-to-asset transformation logic
2. Frontend tests: Test warning box display, TCV calculations
3. E2E test: Orders → Contracts → Subscriptions flow

**PR Title:** `test: add contracts migration tests with asset conversion validation (BR-CT-001 to BR-CT-006)`

---

## Day 22: Subscriptions Migration (Final Phase 1 Step)

### Dev1 (Backend) - Day 22
**Task:** Build Subscriptions API

**Requirements:** BR-SB-001 to BR-SB-006  
**Mockup:** `docs/Mockup/migration-subscriptions.html`

**Deliverables:**
1. Database table: `subscription_migrations`
2. API Endpoints:
   - `POST /api/v1/migration/subscriptions/analyze` → `{ activeCount, pendingChangesCount, recurringRevenueCount, cancelledCount, totalMRR, totalARR }`
   - `POST /api/v1/migration/subscriptions/execute` → `{ jobId, subscriptionsProcessed, phase1Complete: true }`
   - `GET /api/v1/migration/{id}/final-report` → Complete Phase 1 summary
3. Migrate: Subscription products, billing schedules, usage-based pricing models
4. Link: Subscriptions → Assets (from Day 21 contracts)

**Critical Business Logic:**
- MRR/ARR calculations for dashboard
- Preserve billing frequency (monthly/quarterly/annual)
- Maintain renewal terms and pending amendments
- Mark Phase 1 migration as COMPLETE

**PR Title:** `feat(backend): add subscriptions migration API - completes Phase 1 MVP (BR-SB-001 to BR-SB-006)`

### Dev2 (Frontend) - Day 22
**Task:** Build Subscriptions UI Page + Final Report

**Mockup:** `docs/Mockup/migration-subscriptions.html`, `migration-final-report.html`

**Deliverables:**
1. Component: `frontend/src/pages/wizard/SubscriptionsStep.tsx`
   - 4-column grid: Active, Pending Changes, Recurring Revenue, Cancelled
   - Warning box: "This is the final step of Phase 1 migration."
   - Options: 6 checkboxes (billing schedules, usage-based pricing, etc.)
   - Navigation: Back → Contracts, Start → Final Report

2. Component: `frontend/src/pages/wizard/FinalReportStep.tsx`
   - Complete Phase 1 summary (all migration counts)
   - Success box (green): "Phase 1 Migration Complete!"
   - Total metrics: Products, quotes, orders, contracts, subscriptions
   - Buttons: Download PDF, Go to Dashboard, Start New Migration

**PR Title:** `feat(frontend): add subscriptions UI and final report page - Phase 1 complete (UI-SB-001)`

### Dev3 (Testing) - Day 22
**Task:** Build Subscriptions Tests + End-to-End Phase 1 Test

**Deliverables:**
1. Backend tests: MRR/ARR calculation tests, billing schedule preservation
2. Frontend tests: Final report displays all metrics correctly
3. **Master E2E Test:** Complete Phase 1 migration flow
   - Connect → Analyze → Map → Transform → Validate → Execute → Test → Report
   - Inflight Quotes → Orders → Contracts → Subscriptions → Final Report
   - Verify all data in Revenue Cloud org

**PR Title:** `test: add subscriptions tests and complete Phase 1 end-to-end test suite (BR-SB-001 to BR-SB-006)`

---

## Implementation Guidelines

### Git Workflow
1. Each developer creates feature branch: `dev1/day-19-inflight-quotes`, `dev2/day-19-ui`, `dev3/day-19-tests`
2. Daily PRs merged to `main` after code review
3. Always pull before starting: `git pull origin main`
4. Commit messages follow format: `feat(scope): description (BR-XX-00X)`

### Testing Standards
- Backend: Jest with supertest for API testing
- Frontend: React Testing Library + Jest
- E2E: Cypress for full user flows
- Target: >80% code coverage

### Code Review Checklist
- ✅ Matches requirements (BR codes)
- ✅ UI matches mockup design (Dev2 only)
- ✅ Tests pass and coverage >80%
- ✅ TypeScript types defined
- ✅ No console.log in production code
- ✅ Database migrations run successfully
- ✅ API documentation updated (Swagger/OpenAPI)

### Communication
- Daily standup: 9 AM (async in Slack)
- Blockers posted immediately in #dev-blockers channel
- PRs reviewed within 4 hours
- Demo to stakeholders: Friday Nov 22, 2025 3 PM

---

## Success Criteria - End of Day 22

### Backend (Dev1)
- ✅ 4 new database tables created
- ✅ 8 new API endpoints working (2 per feature: analyze + execute)
- ✅ All migrations tracked in database
- ✅ jsforce integration queries correct CPQ objects
- ✅ Data inserted to Revenue Cloud successfully
- ✅ Final report API returns complete Phase 1 summary

### Frontend (Dev2)
- ✅ 5 new wizard pages created (quotes, orders, contracts, subscriptions, final report)
- ✅ All pages match mockup designs pixel-perfect
- ✅ Navigation flow works: Report → Quotes → Orders → Contracts → Subscriptions → Final
- ✅ API integrations display real data
- ✅ Success/warning boxes styled correctly

### Testing (Dev3)
- ✅ 40+ unit tests (10 per feature)
- ✅ 20+ integration tests
- ✅ 5+ E2E tests
- ✅ Master E2E test completes full Phase 1 migration
- ✅ Code coverage >80%
- ✅ All tests pass in CI/CD pipeline

### Phase 1 MVP Complete
- ✅ 11-step migration wizard functional
- ✅ Core product catalog migration (Days 1-18)
- ✅ Inflight business data migration (Days 19-22)
- ✅ All mockups and requirements documented
- ✅ Zero data loss validation passed
- ✅ Ready for user acceptance testing (UAT)

---

## Next Steps (Days 23-25)

**Day 23:** Bug fixes, performance optimization, documentation  
**Day 24:** User acceptance testing (UAT), stakeholder demo  
**Day 25:** Production deployment preparation, monitoring setup

---

**Document Created:** November 18, 2025  
**Last Updated:** November 18, 2025  
**Owner:** RevNova Development Team  
**Status:** ✅ APPROVED - Ready for Implementation
