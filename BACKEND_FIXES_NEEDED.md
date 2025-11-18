# Backend Code Fixes Needed

## Critical Misalignments Found (Nov 18, 2025)

### 1. Authentication System - MISSING (Day 4 skipped)
**Files to Create:**
- `backend/src/database/migrations/010_create_users.sql`
- `backend/src/services/auth.service.ts`
- `backend/src/routes/auth.routes.ts`
- `backend/src/middleware/auth.middleware.ts`

**Required Functionality:**
- JWT token generation and verification
- Password hashing with bcrypt
- User registration endpoint: `POST /api/v1/auth/register`
- User login endpoint: `POST /api/v1/auth/login`
- Get current user: `GET /api/v1/auth/me`
- Protect routes with auth middleware

**Why Critical:** Without authentication, there's no user security, session management, or access control.

---

### 2. Connection Management - INCOMPLETE
**Files to Create:**
- `backend/src/routes/connection.routes.ts`
- `backend/src/services/oauth.service.ts`

**Missing Endpoints:**
- `POST /api/v1/connections` - Save Salesforce connection
- `GET /api/v1/connections` - List user's connections
- `PUT /api/v1/connections/:id` - Update connection
- `DELETE /api/v1/connections/:id` - Delete connection
- `POST /api/v1/connections/:id/test` - Test connection validity

**OAuth Flow Missing:**
- Salesforce OAuth 2.0 redirect handling
- Token refresh logic
- Secure credential storage

---

### 3. CORS Configuration - TOO PERMISSIVE
**File:** `backend/src/index.ts`

**Current Issue:**
```typescript
app.use(cors()); // Allows ALL origins
```

**Should Be:**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

### 4. Field Mapping API - NOT STARTED (Days 11-14)
**Files Needed:**
- `backend/src/database/migrations/011_create_field_mappings.sql`
- `backend/src/services/openai.service.ts`
- `backend/src/routes/mapping.routes.ts`

**Missing Endpoints:**
- `POST /api/v1/projects/:id/mappings/suggest` - AI field mapping suggestions
- `GET /api/v1/projects/:id/mappings` - Get saved mappings
- `PUT /api/v1/projects/:id/mappings/:mappingId` - Update mapping
- `POST /api/v1/projects/:id/mappings/validate` - Validate mappings

---

### 5. Transformation & Validation - NOT STARTED (Days 16-18)
**Files Needed:**
- `backend/src/services/transform.service.ts`
- `backend/src/services/validation.service.ts`
- `backend/src/routes/transform.routes.ts`

**Missing Endpoints:**
- `POST /api/v1/projects/:id/transform/preview` - Preview transformations
- `POST /api/v1/projects/:id/validate` - Validate data before migration

---

### 6. Migration Execution - NOT STARTED (Days 19-25)
**Files Needed:**
- `backend/src/services/migration.service.ts`
- `backend/src/routes/migration.routes.ts`
- Bull queue processors for async execution

**Missing Endpoints:**
- `POST /api/v1/projects/:id/execute` - Start migration
- `GET /api/v1/projects/:id/execution/status` - Check progress
- `POST /api/v1/projects/:id/rollback` - Rollback migration

---

## Priority Order for Fixes

### **Immediate (Days 19-20):**
1. **Authentication System** - Required for security
2. **CORS Fix** - Required for production
3. **Connection Management** - Required for Step 1 of wizard

### **Week 4 (Days 21-23):**
4. **Field Mapping API** - Required for Step 3 of wizard
5. **OpenAI Integration** - Required for AI suggestions

### **Week 5 (Days 24-25):**
6. **Transformation Service** - Required for Step 4
7. **Validation Service** - Required for Step 5
8. **Migration Execution** - Required for Step 6

---

## Impact Assessment

**Current State:**
- ✅ Basic Express server running
- ✅ PostgreSQL connected
- ✅ Schema analysis API working
- ✅ Redis connected
- ❌ No user authentication
- ❌ No connection saving
- ❌ No field mapping
- ❌ No transformation
- ❌ No migration execution

**Completion:** ~25% of backend functionality implemented

**Days Behind Schedule:** 10+ days

---

## GitHub Copilot Prompts for Fixes

### Auth System:
```
@workspace create JWT authentication system with:
- User registration with bcrypt password hashing
- Login with JWT token generation
- Auth middleware to protect routes
- Refresh token support
```

### Connection Routes:
```
@workspace create connection management endpoints:
- CRUD operations for Salesforce connections
- OAuth 2.0 flow with token refresh
- Test connection endpoint
- Secure credential encryption
```

### CORS Fix:
```
@workspace update CORS configuration to:
- Only allow frontend origin from environment variable
- Enable credentials for cookie support
- Add proper preflight handling
```
