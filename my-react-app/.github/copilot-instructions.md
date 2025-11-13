# ESG Dashboard Copilot Instructions

An AI agent guide for the Environmental, Social & Governance (ESG) data management and reporting platform.

## 🏗 Architecture Overview

**Full-stack ESG platform:** React 18 frontend + Node/Express backend with Sequelize ORM, supporting both SQLite (dev) and PostgreSQL (prod).

### Key Data Flow
1. **User (Frontend)** → Login (`src/Login.jsx`) → Dashboard (`src/Dashboard.js`)
2. **Data Entry** → `DataEntry.js` (multi-step form with validation) → API (`/api/esg/*`)
3. **Backend Processing** → Routes (`esg-backend/routes/*`) → Models (Sequelize) → SQLite/Postgres DB
4. **Integrations** → ERPConnector / HRConnector fetch external data → transformed & merged with ESG records
5. **Reporting** → Reports.js normalizes data → Charts (Chart.js / Recharts) → PDF export (jsPDF)

### Critical Files by Responsibility
- **Server Bootstrap:** `esg-backend/server.js` (Express setup, middleware chain, route mounting)
- **Data Models:** `esg-backend/models/{ESGModel.js, AuditTrail.js, EmissionsData.js}` (Sequelize ORM)
- **Backend DB:** `esg-backend/database/db.js` (raw SQLite) + `esg-backend/config/database.js` (Sequelize config)
- **Routes (RESTful):** `esg-backend/routes/{esgRoutes.js, enhancedEsgRoutes.js, integrations.js, authRoutes.js}`
- **Frontend Router:** `src/App.js` (React Router v6 with ProtectedRoute guard)
- **API Client:** `src/utils/api.js` (fetch wrapper) and `src/services/apiService.js` (abstraction layer)

## 🔑 Project-Specific Patterns

### Middleware Stack Order Matters
In `server.js`, middleware **must** be applied in this order:
1. Security headers (`securityHeaders`)
2. Rate limiting (`createRateLimit`)
3. CORS (with frontend URL check)
4. JSON body parsing (10MB limit enforced)
5. Query sanitization (`sanitizeQuery`)
6. Request logging (`requestLogger`)
7. **Routes** (esg, auth, integrations, health)
8. Error handling (`errorLogger` **must be last**)

Breaking this order breaks feature cascades (e.g., auth middleware won't see sanitized query if applied after).

### Route Mounting Pattern
Routes mounted on same base path accumulate handlers, e.g.:
```javascript
app.use("/api/esg", esgRoutes);        // /api/esg/*
app.use("/api/esg", esgKpiRoutes);     // /api/esg/kpis, /api/esg/kpis/:id
app.use("/api/v2/esg", enhancedRoutes); // /api/v2/esg/assessment
```
**Common mistake:** double-path mounting (e.g., `app.use("/api/esg/live", esgLiveRoute)` + `router.get("/live")` → `/api/esg/live/live`).

### ESG Data Model Consolidation
- **One canonical model per table** (`ESGModel.js` → `esg_data` table with timestamps enabled)
- Fields: `companyName, year, environmentalScore, socialScore, governanceScore, esgScore, complianceRate, sustainabilityIndex, createdAt, updatedAt`
- Multiple legacy models (`EsgData.js`, old `ESGModel.js`) exist but **consolidate to `ESGModel`** in new code
- Always use `timestamps: true` for automatic `createdAt`/`updatedAt` management (queries expect these fields)

### Authentication & Authorization
- Routes use `authenticateToken` middleware + optional `requireRole(['admin', 'esg_manager'])` 
- JWT token stored in `localStorage.getItem('authToken')` on frontend
- User object in `localStorage.getItem('currentUser')` drives `ProtectedRoute` guard in React Router
- Backend validates via Bearer token in Authorization header

### Cache Pattern
Routes decorated with `cacheMiddleware(ttl)` (e.g., 300 sec for `/api/esg` GET). 
Cache invalidated by `invalidateCache('/path')` on POST/PUT.
Example:
```javascript
router.get("/", cacheMiddleware(300), async (req, res) => { ... });
router.post("/", invalidateCache('/api/esg'), async (req, res) => { ... });
```

### Data Validation & Error Responses
- Input validation happens in route handlers before model calls (schema NOT enforced at DB layer)
- Errors returned as `{ error: "message" }` (404, 400, 500 status codes)
- Validation middleware `validateESGData` queried rules from DB for numeric bounds checks
- **Logging pattern:** `console.error("Context:", error)` for debugging (not structured logging yet)

### Frontend Component Patterns
- **Page components** (`Dashboard.js`, `DataEntry.js`, `Reports.js`) are large, stateful (100s–1000s LOC)
- **Dumb components** in `src/components/{ProfessionalCard.js, ProfessionalHeader.js, etc.}` for reuse
- **API calls** via `APIService` (singleton wrapper) or direct `fetch` with fallback mock data
- **Storage:** `src/utils/storage.js` abstracts localStorage + ESG Database API (IndexedDB-like, but uses `localStorage.setItem`)
- **Theme:** `src/contexts/ThemeContext.js` provides minimal dark/light toggle (not fully implemented in all components)

### UI Library Stack
- **Charts:** Chart.js (via react-chartjs-2) for bar/line/pie; Recharts for advanced charts
- **Icons:** react-icons + Font Awesome CDN
- **Styling:** Tailwind CSS (config in `tailwind.config.js`, preprocessed via PostCSS)
- **Export:** jsPDF + html2canvas for PDF reports; xlsx for Excel sheets
- **No component library** (no MUI, Chakra) — custom styled divs with Tailwind

### Integration Pattern (ERP/HR Connectors)
Connectors are **classes** with fallback mock data:
```javascript
const connector = new ERPConnector({ baseURL, apiKey, type: 'SAP'|'Oracle'|'NetSuite' });
const energyData = await connector.getEnergyData(startDate, endDate);
// Returns transformed data or mock data if API fails
```
Routes in `esg-backend/routes/integrations.js` instantiate connectors and save fetched data to ESG model.

### Testing Approach
- **No unit test framework** (Jest/Mocha not in package.json)
- Tests are **Node scripts** (`test-existing.js`, `test-full-flow.js`, etc.) using axios for API calls
- Run via `npm run test:phase1` (runs `node test-existing.js`)
- Tests make real HTTP calls to `http://localhost:3001` — server must be running
- **Test pattern:** assert status codes + response JSON shape

## 🚀 Essential Developer Commands

### Local Dev Setup
```bash
# Root of project (my-react-app/)
npm install                    # Frontend deps
cd esg-backend && npm install  # Backend deps

# Terminal 1: Backend
cd esg-backend
npm run dev                    # Runs on http://localhost:3001 with nodemon

# Terminal 2: Frontend  
npm start                      # Runs on http://localhost:3000 (CRA default)

# Or use monorepo script
npm run dev                    # Starts both concurrently (if concurrently installed)
```

### Backend Debugging
```bash
# Check server is listening
curl http://localhost:3001/api/health

# Run integration tests
cd esg-backend
npm run test:all              # Runs all test phases
npm run test:phase1           # Just existing features
npm run test:phase2           # New ESG features
npm run test:phase3           # Advanced integrations

# Check DB state (SQLite)
npm run check-database        # View tables and schema (if script exists)
```

### Database
- **Dev:** In-memory SQLite (data lost on restart) — override via `db.js` storage path
- **Production:** Postgres (set `USE_SQLITE=false` in `.env` + provide PG credentials)
- **Schema:** `esg-backend/database/{schema.sql, enhanced-schema.sql, enhanced-integration-schema.sql}`
- **Migrations:** Manual SQL (no ORM migration tool currently)

## ⚠️ Known Issues & Tech Debt

### 1. **Multiple ESG Models & Table Collisions**
- `ESGModel.js`, `EsgData.js`, and legacy models all map to `esg_data` table
- New code should **always use `ESGModel`**; deprecate others or consolidate schemas
- Risk: schema mismatches on queries expecting different field sets

### 2. **Dual DB Layers** (Sequelize + Raw SQLite)
- Backend uses both Sequelize ORM (`models/*`) and raw SQLite (`database/db.js`)
- Raw SQLite used by validation middleware; Sequelize used by routes
- Pick one path going forward; if using raw SQLite, drop ORM; if using ORM, migrate all queries

### 3. **API Base URL Hardcoded**
- Frontend `src/utils/api.js` hardcodes `http://localhost:3004/api` (should be `3001` or env-based)
- Frontend `src/services/apiService.js` uses different base or environment variable — inconsistency
- Fix: centralize in `.env.local` or context provider

### 4. **Frontend/Backend Port Mismatch**
- Backend default is 3001; frontend default is 3000; some test scripts expect 3004
- Ensure `FRONTEND_URL` env var in backend matches frontend actual URL (CORS whitelist)

### 5. **Security Concerns**
- `.env` file checked into repo with real credentials exposed (DB password visible)
- JWT secret is placeholder: `"your-super-secret-jwt-key-change-in-production"`
- Should use `.env.example` in repo; add `.env` to `.gitignore`

### 6. **Missing Error Handling in Integrations**
- ERP/HR connector classes catch errors and return mock data silently
- No audit trail or alerts when real API fails — operators may not know data is stale

### 7. **Frontend State Management is Ad-hoc**
- Heavy use of `useState` in page components; no Redux/Context for app-wide state
- Each page re-fetches data; no shared data cache (frontend cache middleware exists but underused)
- Leads to prop drilling and hard-to-trace re-renders

## 🎯 Naming Conventions & Code Style

### Files
- **Route files:** `{feature}Routes.js` (e.g., `esgRoutes.js`, `authRoutes.js`)
- **Models:** PascalCase (`ESGModel.js`, `AuditTrail.js`)
- **Utilities:** camelCase (`dataValidation.js`, `errorHandler.js`)
- **React components:** PascalCase (`Dashboard.js`, `DataEntry.js`)
- **Hooks/utilities:** camelCase + prefix `use` if hook (`useTheme`, `storage.js`)

### Variables & Functions
- API responses: `{ data, success, error, message }`
- ESG metric objects: `{ environmentalScore, socialScore, governanceScore, esgScore }`
- Error shape: `{ error: "string message" }` (no `code` field yet)
- Async functions use `async/await` (no promise chains)

### Comments
- **Section headers:** `// ✅ Validated`, `// 🔁 Fetching data`, `// ❌ Error handling`
- **TODOs:** `// TODO: Add caching for large datasets` (searchable)
- **Warnings:** `// ⚠️ This mutates state — use spread operator`

## 🔄 Data Model Reference

### ESGModel (Canonical)
```javascript
{
  companyName: STRING,        // e.g., "Acme Corp"
  year: INTEGER,              // 2024
  environmentalScore: FLOAT,  // 0–100
  socialScore: FLOAT,
  governanceScore: FLOAT,
  esgScore: FLOAT,            // Computed or provided
  co2Reduction: FLOAT,        // Optional, for reporting
  complianceRate: FLOAT,      // 0–100
  sustainabilityIndex: STRING, // e.g., "High", "Medium"
  createdAt: DATE,            // Auto-set by Sequelize
  updatedAt: DATE             // Auto-updated by Sequelize
}
```

### AuditTrail Model
```javascript
{
  action: STRING,             // "CREATE", "UPDATE", "DELETE"
  entity: STRING,             // "ESGData", "Compliance"
  entityId: INTEGER,
  userId: INTEGER,
  changes: JSON,              // { before: {...}, after: {...} }
  timestamp: DATE
}
```

## 📋 Before You Code

### Checklist for New Features
- [ ] Endpoint added to appropriate route file in `esg-backend/routes/`
- [ ] Middleware (auth, cache, validation) applied in correct order
- [ ] Model used consistently (prefer `ESGModel` over legacy models)
- [ ] Timestamps automatically managed (`timestamps: true`)
- [ ] Input validation before model call
- [ ] Error response shape matches `{ error: "message" }` pattern
- [ ] Frontend route added in `src/App.js` with `ProtectedRoute` guard (if private)
- [ ] API call via `APIService` or centralized `api.js` wrapper (not raw fetch)
- [ ] Fallback mock data for offline/failed API scenarios
- [ ] Test script added to `esg-backend/test-*.js` (run via `npm run test:*`)
- [ ] No hardcoded URLs or credentials; use `.env` variables

### Red Flags 🚩
- Routes mounted on same base path without verifying handler order
- Queries on `ESGModel` without checking `timestamps: true` (will fail on `createdAt` sort)
- New ESG-related imports from old models instead of `ESGModel`
- API calls without Bearer token or auth context check
- Frontend forms without input validation before API call
- No error logging when API fails (silent failures hide bugs)
- Cached routes not invalidated on data mutation

## 🤝 Integration Points for AI Agents

### Common Tasks
1. **Add new ESG metric:** Update `ESGModel.js` schema → add route handler → add frontend form field → add export to Reports.js
2. **Add new integration:** Create connector class in `integrations/` → add route in `integrations.js` → expose via admin panel (`AdminPanel.js`)
3. **Add compliance requirement:** Add to `models/ComplianceDoc.js` → add form field in `Compliance.js` → add route handler
4. **Improve reporting:** Normalize data in `Reports.js`, add chart in `Analytics.js`, export via PDF utility

### API Debugging
- Verify middleware order in server.js before adding new middleware
- Check `CORS` origin whitelist if frontend can't reach backend
- Inspect `console` for Sequelize SQL (enable logging via `sequelize: new Sequelize(..., { logging: console.log })`)
- Test routes with `curl` or Postman before integrating into React

---

**Last Updated:** Nov 12, 2025 | **Stack:** Node 16+, React 18, Sequelize 6, SQLite3/PostgreSQL
