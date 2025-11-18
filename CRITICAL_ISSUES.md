# Critical Issues to Address - RevNova Onboarding & Development Setup

## Date: November 18, 2025

## Issues Identified:

### 1. SIDEBAR NAVIGATION - MISSING DEV2 & DEV3 DAILY TASKS
**Problem:** Current sidebar only shows "Developer 1: Daily Tasks". Missing Developer 2 and Developer 3 daily task navigation.

**Impact:** Developers 2 and 3 cannot easily navigate between their daily tasks.

**Solution Required:**
- Add "Developer 2: Daily Tasks" section with all 5 weeks (25 days)
- Add "Developer 3: Daily Tasks" section with all 5 weeks (25 days)
- Each developer should see ALL THREE developers' tasks in sidebar
- Sidebar HTML must be 100% identical across all pages to prevent refresh

### 2. BACKEND NOT RUNNING
**Problem:** Node.js is not installed on the system. Developer 2 cannot test connection page.

**Error:** `TypeError: Failed to fetch` when testing SFDC connection

**Root Cause:**
- Backend API at http://localhost:3000 is not running
- `npm` command not recognized
- POST request to `/api/v1/connections/test` fails

**Solution Required:**
1. Install Node.js (v20.x LTS recommended)
2. Navigate to `backend/` directory
3. Run `npm install` to install dependencies
4. Start backend: `npm run dev`
5. Verify backend runs on port 3000
6. Start PostgreSQL on port 5432
7. Start Redis on port 6379

### 3. FRONTEND CONFIGURATION
**Problem:** Frontend trying to call backend but URL/CORS not configured

**Solution Required:**
- Check frontend API baseURL configuration
- Ensure CORS is enabled in backend
- Verify API endpoints match between frontend and backend
- Test connection page should call: `POST http://localhost:3000/api/v1/connections/test`

### 4. TASKS NOT ALIGNED WITH REQUIREMENTS
**Problem:** Developer 2's connection page doesn't match mockup. Tasks may not align with platform vision.

**Concerns:**
- STG1 and STG2 database tables design
- Mapping engine architecture
- UI mockups vs actual implementation
- Requirements documents vs onboarding tasks

**Action Required:**
1. Review `docs/RevNovaRequirements/` documents
2. Cross-reference with onboarding tasks for all 3 developers
3. Validate:
   - Database schema matches requirements
   - API endpoints match requirements
   - UI components match mockups in `mockup/` folder
   - Mapping strategy aligns with STG1/STG2 vision

### 5. SIDEBAR REFRESH ISSUE
**Problem:** User reports left panel refreshing when clicking day links

**Root Cause:** Sidebar HTML is not identical across pages
- Different `expanded` states on different pages
- Different `active` classes on different pages
- Browser treats each page load as new content

**Solution:** Make sidebar HTML 100% identical on EVERY page:
- Same expanded/collapsed state for all sections
- Only mark current page as `active`
- Use JavaScript to handle expand/collapse client-side
- Browser will cache identical HTML and not re-render

## IMMEDIATE ACTION PLAN:

### Step 1: Install Development Environment (CRITICAL)
```powershell
# Install Node.js from https://nodejs.org/
# Download and install PostgreSQL
# Download and install Redis

# Then:
cd c:\Dev\RevNovaRepository\backend
npm install
npm run dev
```

### Step 2: Update Sidebar Navigation (CRITICAL)
Add these sections to EVERY page:

```html
<!-- Developer 2: Daily Tasks Section -->
<div class="nav-section">
    <button class="nav-section-header">
        <svg class="nav-section-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 6L14 10L6 14V6Z"/>
        </svg>
        Developer 2: Daily Tasks
    </button>
    <div class="nav-section-content">
        <!-- 5 weeks with 25 days -->
    </div>
</div>

<!-- Developer 3: Daily Tasks Section -->
<div class="nav-section">
    <button class="nav-section-header">
        <svg class="nav-section-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 6L14 10L6 14V6Z"/>
        </svg>
        Developer 3: Daily Tasks
    </button>
    <div class="nav-section-content">
        <!-- 5 weeks with 25 days -->
    </div>
</div>
```

### Step 3: Requirements Validation
Review these files:
- `docs/RevNovaRequirements/requirements-home.html`
- `docs/RevNovaRequirements/requirements-phase1-*.html`
- `mockup/*.html` - UI mockups
- Cross-reference with:
  - `docs/Onboarding/dev1-day*.html` - Backend tasks
  - `docs/Onboarding/dev2-day*.html` - Frontend tasks
  - `docs/Onboarding/dev3-day*.html` - DevOps tasks

### Step 4: Frontend Configuration
Check and fix:
1. Frontend API base URL (should be `http://localhost:3000`)
2. CORS configuration in backend
3. Connection test endpoint implementation
4. Error handling for network failures

## FILES TO UPDATE:

1. **All 75 onboarding pages** - Add dev2 and dev3 navigation
2. **Backend configuration** - Ensure proper startup
3. **Frontend API config** - Fix connection endpoints
4. **Requirements docs** - Validate alignment

## QUESTIONS FOR TEAM:

1. **For Developer 2:**
   - What mockup file are you following for connection page?
   - What does your current connection page look like vs mockup?
   - Have you configured API baseURL in your frontend?

2. **For Developer 1:**
   - Is backend code implementing the requirements correctly?
   - Are STG1/STG2 tables designed per requirements?
   - Have you tested APIs locally?

3. **For Developer 3:**
   - What testing environment is set up?
   - Are Docker containers configured?
   - Is CI/CD pipeline working?

## NEXT STEPS:

1. ✅ Create Python script to add dev2/dev3 navigation to all pages
2. ✅ Document Node.js installation steps
3. ✅ Create backend startup guide
4. ✅ Create requirements validation checklist
5. ✅ Test connection page with backend running

---

**Note:** The sidebar refresh issue is because the HTML content differs between pages. To prevent refresh, ALL pages must have IDENTICAL sidebar HTML structure, with only the `active` class marking the current page.
