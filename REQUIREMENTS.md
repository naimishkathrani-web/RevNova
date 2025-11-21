# RevNova Platform Requirements Document
**Version:** 1.0  
**Last Updated:** November 21, 2025  
**Maintained By:** GitHub Copilot (AI Development Agent)

---

## 1. AUTHENTICATION & USER MANAGEMENT

### 1.1 Super Admin Accounts (Development Team)
**Status:** ✅ Required - Not Yet Implemented

**Development Team (Super Admin Access):**
1. naimish@rootshellinc.com
2. ashishs.b@rootshellinc.com
3. saikumar.u@rootshellinc.com
4. vinay.g@rootshellinc.com
5. yamineesh.k@rootshellinc.com

**Default Password:** RevNova#1324  
**Access Level:** Super Admin (Full platform access)

**Capabilities:**
- Access to Admin Module
- User Management (create, modify, delete users)
- Access control management
- System configuration
- All migration project features

### 1.2 User Registration & Authentication
**Status:** ✅ Required - Not Yet Implemented

**Free Trial Signup:**
- Any user can sign up with official email address
- Automatic free trial activation
- Limited platform access (see Access Levels below)
- Email verification required
- Trial duration: 14 days

**Authentication Flow:**
1. User visits `/signup` or `/login`
2. Email + Password authentication
3. JWT token issued on successful login
4. Token stored in localStorage
5. Token validated on each API request
6. Auto-logout on token expiration

### 1.3 Access Levels & Permissions
**Status:** ✅ Required - Not Yet Implemented

| Role | Access Level | Capabilities |
|------|--------------|--------------|
| **Super Admin** | Full Access | All features + Admin Module + User Management |
| **Admin** | High Access | All migration features + Team management |
| **Premium User** | Standard Access | All migration features (unlimited projects) |
| **Free Trial User** | Limited Access | 1 migration project, limited API calls |
| **Read-Only User** | View Only | View projects and reports only |

**Free Trial Limitations:**
- Maximum 1 active migration project
- Maximum 100 field mappings per project
- Maximum 10,000 records per migration
- No access to AI auto-mapping (manual only)
- No access to bulk operations
- Report export limited to PDF (no Excel)

### 1.4 Admin Module
**Status:** ✅ Required - Not Yet Implemented

**Location:** `/admin` route (Super Admin only)

**Features:**
1. **User Management Dashboard**
   - List all users (paginated table)
   - Search/filter users by email, role, status
   - View user details
   - Create new user
   - Edit user (email, role, access level)
   - Delete/deactivate user
   - Reset user password
   - View user activity logs

2. **Access Control**
   - Assign/revoke roles
   - Set trial expiration dates
   - Grant/remove premium access
   - Feature flag toggles per user

3. **System Analytics**
   - Total users count
   - Active users (last 30 days)
   - Trial conversions rate
   - Migration projects statistics
   - API usage metrics

---

## 2. PROJECT TYPES & MIGRATION WORKFLOWS

### 2.1 Project Types
**Status:** ✅ Implemented (Backend), 🔄 Frontend Pending

Four distinct project types with specific workflows:

#### Type 1: Migrate Master Data Only
**Purpose:** Products, pricing, rules migration without in-flight data  
**Phases:** 8 (Connect → Analyze → Mapping → Transform → Validate → Execute → Test → Report)  
**Duration:** 2-4 weeks  
**Use Case:** Organizations testing RCA configuration before live transactions

#### Type 2: Migrate Master Data + In-Flight Data
**Purpose:** Complete migration with option to skip in-flight import  
**Phases:** 9 (adds Import Transactions phase)  
**Duration:** 3-6 weeks  
**Use Case:** Full CPQ to RCA migration (default recommended)  
**Special Feature:** User can skip Phase 8 (Import Transactions) and complete later

#### Type 3: Migrate In-Flight Data Only
**Purpose:** Import quotes/orders/contracts after master data complete  
**Phases:** 6 (Connect → Analyze → Mapping → Transform → Execute → Report)  
**Duration:** 1-2 weeks  
**Use Case:** Incremental sync or post-master-migration transaction import

#### Type 4: Design Product with AI (Phase 2)
**Purpose:** AI-powered product catalog design in RCA  
**Status:** Future feature (specifications TBD)

### 2.2 Migration Phases (Common)
**Status:** ✅ Backend Implemented, 🔄 Frontend Pending

1. **Connect Phase**
   - OAuth authentication to source CPQ org
   - OAuth authentication to target RCA org
   - Permission validation
   - Connection testing

2. **Analyze Phase**
   - Schema discovery (all objects and fields)
   - Identify vanilla vs custom objects/fields
   - Extract data from CPQ to Staging 1
   - Extract test quotes (1+ completed per product)
   - Extract transaction data (if applicable)
   - Calculate record counts and data volumes

3. **Mapping Phase**
   - AI auto-suggest vanilla-to-vanilla mappings
   - For custom CPQ fields:
     * AI suggests RCA vanilla field match
     * If no match: default to "Create New Custom Field"
     * User can override any suggestion
   - Conflict identification and tracking
   - Confidence scoring for each mapping
   - User review and approval workflow

4. **Transform Phase**
   - Apply transformation rules to Staging 1 data
   - Execute value maps (picklist translations)
   - Execute formulas and calculated fields
   - Execute lookup relationships
   - Generate Staging 2 (RCA-ready data)
   - Flag new custom objects/fields for RCA creation

5. **Validate Phase**
   - Data quality checks on Staging 2
   - Required field validation
   - Relationship integrity checks
   - Duplicate detection
   - Format and type validation
   - 15 validation checks across 6 categories

6. **Execute Phase**
   - Create new custom objects in RCA (Metadata API)
   - Create new custom fields in RCA (Metadata API)
   - Bulk import products (Bulk API)
   - Bulk import pricebooks and pricing
   - Import rules, discounts, configuration
   - Real-time progress tracking

7. **Test Phase (Automated)**
   - For each completed test quote in Staging 1:
     * Create equivalent quote in RCA via API
     * Add same products and quantities
     * Trigger pricing rules
     * Trigger validation rules
     * Compare results (prices, discounts, totals)
   - Record pass/fail for each test
   - **Rollback if major errors:** > 5% failure rate → return to Mapping
   - Minor warnings: allow proceed or fix

8. **Import Transactions Phase** (Type 2 only)
   - Import in-flight quotes from Staging 2 to RCA
   - Import orders and contracts
   - Move subscriptions to RCA assets
   - Import other transactional data
   - Validate transaction integrity

9. **Report Phase**
   - Migration summary (all objects, records, duration)
   - Test results with pass/fail breakdown
   - Error analysis and recommendations
   - Export detailed report (PDF/Excel)

---

## 3. STAGING ARCHITECTURE

### 3.1 Two-Stage Migration Architecture
**Status:** ✅ Designed, 🔄 Implementation Pending

#### Staging 1: Source Data Layer
**Purpose:** Exact replica of SFDC CPQ data structure

**Contents:**
- All vanilla CPQ objects (Product2, PricebookEntry, SBQQ__Quote__c, etc.)
- All custom objects (org namespace prefixed)
- All vanilla fields on standard objects
- All custom fields (org-specific + CPQ-specific)
- Transaction data (in-flight quotes, orders, contracts, subscriptions)
- Completed test quotes (minimum 1 per product)

**Schema Creation:** Automatic during Analyze phase  
**Data Import:** One-time load + incremental updates before go-live

**Database Tables:**
- `stg1_{object_name}` - Dynamic table creation per CPQ object
- Example: `stg1_product2`, `stg1_sbqq_quote_c`
- Columns match CPQ object fields exactly

#### Staging 2: Target-Ready Data Layer
**Purpose:** RCA-compatible data structure ready for import

**Contents:**
- Mapped vanilla fields (CPQ → RCA)
- Transformed custom data mapped to:
  * Existing RCA vanilla fields
  * New RCA custom fields (flagged for creation)
  * New RCA custom objects (flagged for creation)
- Import-ready structure for Salesforce Bulk API
- Metadata for objects/fields to create

**Metadata Columns:**
- `_needs_custom_field` (boolean)
- `_custom_field_name` (text)
- `_custom_field_type` (text)
- `_needs_custom_object` (boolean)

**Database Tables:**
- `stg2_{object_name}` - RCA-compatible structure
- Example: `stg2_product2`, `stg2_quote`
- Created during Transform phase

### 3.2 RCA Custom Configuration Tracking
**Status:** ✅ Implemented

**Database Table:** `rca_custom_configurations`

**Purpose:** Track custom RCA objects/fields that need to be created before data import

**Fields:**
- config_type: 'custom_object' | 'custom_field'
- source_object_name, source_field_name (CPQ source)
- rca_object_name, rca_field_name (RCA target)
- rca_field_type, rca_field_length, rca_field_required
- rca_picklist_values (array)
- config_api_endpoint (Metadata API endpoint)
- config_payload (JSON for API call)
- status: 'pending' | 'in_progress' | 'completed' | 'failed'
- created_in_rca (boolean)
- rca_api_id (after creation)

---

## 4. MAPPING CONFLICTS & RESOLUTION

### 4.1 Conflict Types
**Status:** ✅ Implemented

**Database Table:** `mapping_conflicts`

**Conflict Categories:**
1. **create_new_field** - No RCA vanilla match, needs custom field
2. **create_new_object** - No RCA object equivalent, needs custom object
3. **data_type_mismatch** - CPQ and RCA field types incompatible
4. **required_field_missing** - Required RCA field has no CPQ source
5. **duplicate_mapping** - Multiple CPQ fields mapped to same RCA field

**Severity Levels:**
- **blocker** - Must resolve before proceeding
- **error** - Should resolve before proceeding
- **warning** - Recommended to resolve
- **info** - Informational only

### 4.2 Resolution Workflow
**Status:** ✅ Designed, 🔄 Frontend Pending

**Resolution Actions:**
1. **create_custom_field** - Create new custom field in RCA
2. **map_to_existing** - Override AI and map to different RCA field
3. **skip_field** - Don't migrate this field (data loss)
4. **transform_data** - Apply transformation to make compatible

**Process:**
1. Conflict detected during Mapping phase
2. User reviews conflict details
3. User selects resolution action
4. If create_custom_field: add to `rca_custom_configurations`
5. If map_to_existing: update field mapping
6. Mark conflict as resolved
7. Continue to Transform phase

---

## 5. ROLLBACK & ERROR HANDLING

### 5.1 Test Failure Rollback
**Status:** ✅ Implemented

**Trigger Conditions:**
- Quote calculation errors > 5%
- Pricing rule execution failures
- Missing required data in RCA
- Relationship integrity failures

**Rollback Process:**
1. Detect failure in Test phase
2. Automatic rollback to Mapping phase
3. Highlight problematic mappings
4. User corrects mappings/transformations
5. Re-run Transform → Validate → Execute → Test
6. Repeat until tests pass

**API Endpoint:** `POST /api/v1/projects/:id/phases/rollback`

---

## 6. DATABASE SCHEMA

### 6.1 Core Tables
**Status:** ✅ Implemented

#### projects
- id (serial primary key)
- name, description
- project_type (enum: migrate_master_data, migrate_master_with_inflight, migrate_inflight_data, design_product_ai)
- current_phase (enum: connect, analyze, mapping, transform, validate, execute, test, import_transactions, report)
- completed_phases (text array)
- include_inflight_data (boolean)
- skip_inflight_import (boolean)
- status (varchar)
- created_at, updated_at

#### connections
- id (serial primary key)
- project_id (foreign key)
- provider (text: 'salesforce_cpq' | 'salesforce_rca')
- username, status
- created_at

#### rca_custom_configurations
- id (serial primary key)
- project_id (foreign key)
- config_type ('custom_object' | 'custom_field')
- source_object_name, source_field_name
- rca_object_name, rca_field_name, rca_field_type
- rca_field_length, rca_field_required, rca_picklist_values
- config_api_endpoint, config_payload (jsonb)
- status, created_in_rca, rca_api_id
- stg2_table_name, stg2_column_name
- created_at, executed_at

#### mapping_conflicts
- id (serial primary key)
- project_id (foreign key)
- field_mapping_id (optional foreign key)
- conflict_type, severity
- source_object, source_field, source_data_type
- target_object, target_field, target_data_type
- resolution_status, resolution_action, resolution_details
- resolved_by, resolved_at
- rca_config_id (foreign key)
- conflict_description, user_notes
- created_at, updated_at

### 6.2 Tables to Implement
**Status:** 🔄 Required - Not Yet Implemented

#### users
- id (serial primary key)
- email (unique, not null)
- password_hash (text)
- first_name, last_name
- role ('super_admin' | 'admin' | 'premium_user' | 'trial_user' | 'read_only')
- status ('active' | 'inactive' | 'suspended')
- email_verified (boolean)
- trial_start_date, trial_end_date
- last_login_at
- created_at, updated_at

#### user_permissions
- id (serial primary key)
- user_id (foreign key)
- permission_key (text: 'create_project', 'ai_mapping', 'bulk_operations', etc.)
- granted (boolean)
- created_at

#### audit_logs
- id (serial primary key)
- user_id (foreign key)
- action (text: 'login', 'create_project', 'delete_user', etc.)
- resource_type, resource_id
- details (jsonb)
- ip_address
- created_at

---

## 7. API ENDPOINTS

### 7.1 Authentication (To Implement)
**Status:** 🔄 Required - Not Yet Implemented

- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login (returns JWT)
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset confirmation
- `GET /api/v1/auth/me` - Get current user info

### 7.2 User Management (To Implement)
**Status:** 🔄 Required - Not Yet Implemented

- `GET /api/v1/admin/users` - List all users (Super Admin only)
- `POST /api/v1/admin/users` - Create user (Super Admin only)
- `GET /api/v1/admin/users/:id` - Get user details
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user
- `PATCH /api/v1/admin/users/:id/role` - Change user role
- `PATCH /api/v1/admin/users/:id/status` - Activate/deactivate user
- `POST /api/v1/admin/users/:id/reset-password` - Admin reset user password

### 7.3 Projects (Implemented)
**Status:** ✅ Implemented

- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### 7.4 Project Phases (Implemented)
**Status:** ✅ Implemented

- `GET /api/v1/projects/:id/phases` - Get available phases
- `POST /api/v1/projects/:id/phases/complete` - Complete current phase
- `POST /api/v1/projects/:id/phases/skip-inflight` - Skip in-flight import
- `POST /api/v1/projects/:id/phases/rollback` - Rollback to mapping

### 7.5 RCA Configuration (Implemented)
**Status:** ✅ Implemented

- `GET /api/v1/projects/:id/rca-configurations` - List configs
- `POST /api/v1/projects/:id/rca-configurations` - Create config
- `POST /api/v1/projects/:id/rca-configurations/execute` - Execute configs in RCA

### 7.6 Mapping Conflicts (Implemented)
**Status:** ✅ Implemented

- `GET /api/v1/projects/:id/mapping-conflicts` - List conflicts
- `POST /api/v1/projects/:id/mapping-conflicts` - Create conflict
- `PATCH /api/v1/mapping-conflicts/:id/resolve` - Resolve conflict

---

## 8. FRONTEND COMPONENTS & PAGES

### 8.1 Implemented
**Status:** ✅ Complete

- Dashboard (project listing, statistics)
- 7 Migration Wizard Steps:
  1. ConnectionStep
  2. AnalyzeStep
  3. MappingStep
  4. TransformStep
  5. ValidateStep
  6. ExecuteStep
  7. ReportStep

### 8.2 To Implement
**Status:** 🔄 Required - Not Yet Implemented

#### Authentication Pages:
- `/signup` - User registration form
- `/login` - Login form (already exists but needs backend integration)
- `/verify-email` - Email verification page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form

#### Admin Module:
- `/admin` - Admin dashboard (Super Admin only)
- `/admin/users` - User management table
- `/admin/users/new` - Create user form
- `/admin/users/:id/edit` - Edit user form
- `/admin/analytics` - System analytics dashboard

#### Project Creation:
- Project type selection (4 radio buttons)
- Project configuration form
- Phase selection UI

---

## 9. UI/UX DESIGN PRINCIPLES

### 9.1 Visual Consistency
**Status:** ⚠️ Partially Implemented

**Requirement:** React app must match HTML mockup design exactly

**Issues:**
- React app uses Tailwind CSS
- Mockups use custom CSS (styles.css)
- Colors and spacing don't match yet

**Solution:**
- Extract CSS from mockup `styles.css`
- Apply to React components via global CSS or Tailwind config
- Ensure identical visual appearance
- Only difference: Mockups have dummy data, React has real API data

### 9.2 Design System
**Colors:**
- Primary: #667eea (purple-blue gradient)
- Secondary: #764ba2 (purple)
- Success: #48bb78 (green)
- Warning: #ed8936 (orange)
- Error: #f56565 (red)
- Background: #f7fafc (light gray)

**Typography:**
- Font: System fonts (sans-serif)
- Headers: Bold, large
- Body: Regular, 1rem
- Code: Monospace

---

## 10. DEPLOYMENT & INFRASTRUCTURE

### 10.1 Frontend Deployment
**Status:** ✅ Deployed (GitHub Pages)

**URL:** https://naimishkathrani-web.github.io/RevNova/app/  
**Issue:** Currently showing blank page (base path configuration issue)

### 10.2 Backend Deployment
**Status:** 🔄 Configured, Not Yet Live

**Target:** dev.revnova.in (development server)  
**Tech Stack:**
- Node.js + Express + TypeScript
- PostgreSQL 14+
- Redis (optional)
- PM2 process manager
- Nginx reverse proxy

**Status:**
- ✅ Scripts created (setup-dev-environment.ps1, deploy-production.ps1)
- ✅ Nginx config created
- ✅ Environment configured
- ✅ Database migrations complete
- ✅ Backend running locally (localhost:3000)
- 🔄 DNS configuration pending
- 🔄 SSL certificate pending
- 🔄 PM2 deployment pending

---

## 11. SECURITY & COMPLIANCE

### 11.1 Authentication Security
**Status:** 🔄 Required - To Implement

**Requirements:**
- JWT tokens with 24-hour expiration
- Refresh tokens with 30-day expiration
- Password hashing with bcrypt (12 rounds minimum)
- Password requirements:
  * Minimum 8 characters
  * At least 1 uppercase letter
  * At least 1 lowercase letter
  * At least 1 number
  * At least 1 special character
- Email verification required
- Rate limiting on login attempts (5 attempts per 15 minutes)
- Account lockout after 10 failed attempts

### 11.2 API Security
**Status:** ⚠️ Partially Implemented

**Implemented:**
- CORS configuration
- Express JSON body parser

**To Implement:**
- JWT middleware for protected routes
- Role-based access control (RBAC)
- API rate limiting
- Request validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention

### 11.3 Data Protection
**Status:** 🔄 To Implement

**Requirements:**
- Salesforce OAuth credentials encrypted at rest
- PII data encryption
- Audit logging for sensitive operations
- GDPR compliance (data export, data deletion)
- SOC 2 compliance considerations

---

## 12. TESTING & QUALITY ASSURANCE

### 12.1 Backend Tests
**Status:** ✅ Implemented (150+ tests)

- Unit tests for all services
- Integration tests for API endpoints
- Database migration tests

### 12.2 Frontend Tests
**Status:** 🔄 To Implement

**Required:**
- Component unit tests (Jest + React Testing Library)
- Integration tests for wizard flow
- E2E tests (Playwright or Cypress)
- Visual regression tests

---

## 13. DOCUMENTATION

### 13.1 Implemented Documentation
**Status:** ✅ Complete

**Files:**
1. `migration-architecture.html` - Complete staging architecture (400+ lines)
2. `project-types.html` - Project types & workflows (600+ lines)
3. `README-DEV-SETUP.md` - Backend setup guide (400+ lines)
4. `SETUP-STATUS.md` - Current setup status
5. This file: `REQUIREMENTS.md` - Comprehensive platform requirements

### 13.2 Documentation Standards
**Rules:**
1. ✅ **Always review this requirements document before making changes**
2. ✅ **Add new requirements when user requests features not documented**
3. ✅ **Ask user for confirmation if request contradicts existing requirement**
4. ✅ **Update this document after implementing new features**
5. ✅ **Maintain version history and last updated date**

---

## 14. IMMEDIATE PRIORITIES

### Phase 1: Authentication & User Management (CURRENT)
**Status:** 🔄 In Progress

**Tasks:**
1. Create users table migration
2. Create user_permissions table migration
3. Create audit_logs table migration
4. Seed 5 super admin accounts
5. Implement authentication API endpoints
6. Implement JWT middleware
7. Implement user management API endpoints
8. Build login/signup pages in React
9. Build admin module UI
10. Integrate authentication with existing features

### Phase 2: Fix React App Deployment
**Status:** 🔄 Pending

**Tasks:**
1. Fix GitHub Pages base path issue
2. Rebuild and redeploy React app
3. Test all routes on GitHub Pages
4. Ensure styling matches mockups

### Phase 3: Complete Migration Wizard
**Status:** 🔄 Pending

**Tasks:**
1. Add project type selection to project creation
2. Implement phase progression UI
3. Connect all wizard steps to backend APIs
4. Implement conflict resolution UI
5. Implement RCA configuration UI

---

## VERSION HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-21 | Initial requirements document created | GitHub Copilot |

---

## NOTES

- This document is the single source of truth for RevNova platform requirements
- AI agent must reference this document before all development work
- All new features must be documented here before implementation
- Any conflicts between requirements must be resolved with user confirmation
- This document must be kept up to date with all platform changes

---

**END OF REQUIREMENTS DOCUMENT**
