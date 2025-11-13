# ESG Dashboard - Quick Reference & Action Items

**Last Updated:** November 12, 2025

---

## 🎯 Quick Start (5 minutes)

### Run Locally
```bash
# Backend
cd esg-backend
npm install
npm run dev                 # Listens on http://localhost:3001

# Frontend (new terminal)
npm install
npm start                   # Opens http://localhost:3000
```

### Test It
```bash
# Terminal 3
curl http://localhost:3001/api/health

cd esg-backend
npm run test:phase1        # Basic tests
npm run test:all           # Full integration tests
```

---

## 📋 Architecture in 60 Seconds

```
User Browser (React 18)
    ↓ (Fetch + JWT)
Express API (Port 3001)
    ├─ Routes: esgRoutes, authRoutes, integrations, etc.
    ├─ Middleware: auth, cache, validation (order matters!)
    └─ Models: Sequelize ORM → ESGModel (canonical)
        ↓
SQLite / PostgreSQL
    ├─ esg_data table (companyName, year, scores, metrics)
    ├─ audit_trail (compliance logging)
    └─ validation_rules (metric bounds)

Integrations:
    ERPConnector (SAP/Oracle/NetSuite) → fetch energy data
    HRConnector (HR systems) → fetch diversity, turnover
```

---

## 🔑 Critical Patterns

### 1. Middleware Order (in server.js)
```javascript
app.use(securityHeaders);           // 1️⃣ First
app.use(createRateLimit());         // 2️⃣
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use(sanitizeQuery);
app.use(requestLogger);
// Routes here
app.use(errorLogger);               // 🔴 LAST (must be last!)
```

**Why?** Middleware runs top-to-bottom. Error logger must catch all errors.

### 2. Route Mounting (Same Base Path)
```javascript
app.use("/api/esg", esgRoutes);      // POST /api/esg, GET /api/esg/:id
app.use("/api/esg", esgKpiRoutes);   // GET /api/esg/kpis
// Both work! Routes accumulate on same base path
```

### 3. ESG Model (Use This Only)
```javascript
// ✅ Good
const ESGModel = require('../models/ESGModel');
await ESGModel.create({ companyName, year, environmentalScore, ... });

// ❌ Bad (legacy, deprecated)
const EsgData = require('../models/EsgData');  // Don't use!
```

### 4. Cache Pattern
```javascript
// On GET: cache for 300 seconds
router.get("/", cacheMiddleware(300), async (req, res) => { ... });

// On POST: invalidate cache
router.post("/", invalidateCache('/api/esg'), async (req, res) => { ... });
```

### 5. Auth Pattern
```javascript
router.post("/submit", 
  authenticateToken,              // Check JWT token
  requireRole(['esg_manager']),   // Check user role
  async (req, res) => { ... }
);
```

---

## ⚠️ Top 5 Issues to Fix (Priority Order)

### 1. 🔴 Data Not Persistent (Dev) — BREAKS EVERYTHING
**Problem:** `.env` sets `USE_SQLITE=true` with `:memory:` → data lost on restart.

**Fix (esg-backend/database/db.js):**
```javascript
// Change from
const dbPath = ':memory:';

// To (persistent file)
const dbPath = path.join(__dirname, '../data/dev.sqlite');
// Create data/ folder first, add to .gitignore
```

### 2. 🔴 Multiple ESG Models — CAUSES QUERY FAILURES
**Problem:** `ESGModel.js`, `EsgData.js`, `EnhancedESGData.js` all map to `esg_data` table.

**Fix:**
- In new code: **always use `ESGModel`**
- In esgRoutes.js: `const ESGModel = require('../models/ESGModel');`
- Deprecate/remove old models after refactor

### 3. 🔴 Credentials Exposed — SECURITY RISK
**Problem:** `.env` with password `Es@2025` checked into repo.

**Fix:**
```bash
# Add to .gitignore
echo ".env" >> .gitignore

# Create .env.example with placeholders
PORT=3001
DB_PASSWORD=<CHANGE_ME>

# Rotate the exposed credential immediately!
```

### 4. 🟠 Frontend API Port Wrong — API CALLS FAIL
**Problem:** `src/utils/api.js` hardcodes `http://localhost:3004` (should be 3001).

**Fix:**
```javascript
// Change from
const API_BASE = 'http://localhost:3004/api';

// To
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

Create `.env.local` in root:
```
REACT_APP_API_URL=http://localhost:3001/api
```

### 5. 🟠 No Tests — REGRESSIONS UNDETECTED
**Problem:** Test scripts exist but no Jest/unit tests.

**Fix:** Add Jest (quick start)
```bash
cd esg-backend
npm install --save-dev jest supertest
# Create __tests__/ folder with .test.js files
```

---

## 📊 File Reference Quick Map

| Task | File(s) |
|------|---------|
| **Add new ESG metric** | ESGModel.js + esgRoutes.js + DataEntry.js + Reports.js |
| **Add authentication** | authRoutes.js + middleware/auth.js + Login.jsx |
| **Add integration** | integrations/{newConnector}.js + routes/integrations.js |
| **Add report type** | Reports.js + analytics routes |
| **Fix styling** | src/index.css + tailwind.config.js |
| **Change DB schema** | database/{schema,enhanced-schema}.sql + migrations |
| **Add middleware** | middleware/{newFile}.js + server.js |
| **Add route** | routes/{featureRoutes}.js + server.js + frontend pages |

---

## 🚀 Common Commands

```bash
# Development
npm run dev                           # Start both backend + frontend
cd esg-backend && npm run dev        # Just backend (Port 3001)
npm start                            # Just frontend (Port 3000)

# Testing
npm run test:phase1                  # Basic tests
npm run test:phase2                  # Enhanced features
npm run test:all                     # Full integration tests

# Database
npm run check-database               # View DB state
npm run add-sample-data              # Populate sample ESG data

# Build
npm run build                        # Create optimized frontend build (build/ folder)
npm run eject                        # ⚠️ One-way operation — exposes CRA config
```

---

## 🔍 Debugging Tips

### Backend Not Responding?
```bash
# Check if server is running
curl -X GET http://localhost:3001/api/health

# Check for errors in terminal (look for 🔴 DB connection error)
# Restart with
cd esg-backend && npm run dev
```

### Frontend Can't Reach Backend?
1. Verify backend is running: `curl http://localhost:3001/api/health`
2. Check CORS: backend `.env` should have `FRONTEND_URL=http://localhost:3000`
3. Check API base URL: `src/utils/api.js` should use `http://localhost:3001/api`
4. Browser console → Network tab → check request URL

### Data Lost After Restart?
- Expected if using in-memory SQLite (`:memory:`)
- Fix: change `database/db.js` to use file path (see Issue #1 above)

### Tests Failing?
```bash
# Make sure backend is running first
cd esg-backend && npm run dev

# In separate terminal, run tests
npm run test:phase1
```

### JWT Token Issues?
- Check `.env` has `JWT_SECRET` set
- In dev: hardcoded secret is fine (will fail in prod!)
- Decode token: use `jwt.io` (paste token to inspect claims)

---

## 🎨 Frontend Components Tree

```
App.js (Router)
├─ Login.jsx (public)
├─ Dashboard.js (protected)
│  ├─ ProfessionalHeader
│  ├─ KpiCard (dumb)
│  └─ PerformanceCard (dumb)
├─ DataEntry.js (protected, 1373 LOC - large!)
│  ├─ Step indicators
│  ├─ Form sections
│  └─ File upload
├─ Reports.js (protected, 1219 LOC - large!)
│  ├─ Data normalization (Reports.js only!)
│  ├─ Chart rendering
│  └─ Export buttons
├─ Analytics.js
│  ├─ Timeframe filters
│  ├─ Chart.js charts
│  └─ MetricCard
├─ Compliance.js
│  ├─ Document upload
│  └─ Status tracking
├─ AdminPanel.js
│  ├─ User approval
│  └─ Role management
└─ ... (Regulatory, Stakeholders, Materiality, SupplyChain, etc.)
```

---

## 🗄️ Database Schema Cheat Sheet

### ESG Data Table
```sql
CREATE TABLE esg_data (
  id INTEGER PRIMARY KEY,
  companyName TEXT NOT NULL,
  year INTEGER NOT NULL,
  environmentalScore FLOAT,           -- 0–100
  socialScore FLOAT,
  governanceScore FLOAT,
  esgScore FLOAT,                     -- Avg of above
  complianceRate FLOAT,
  sustainabilityIndex TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_company_year ON esg_data(companyName, year);
```

### Audit Trail Table
```sql
CREATE TABLE audit_trail (
  id INTEGER PRIMARY KEY,
  action TEXT,                        -- 'CREATE', 'UPDATE', 'DELETE'
  entity TEXT,                        -- 'ESGData', 'Compliance'
  entityId INTEGER,
  userId INTEGER,
  changes JSON,                       -- {"before": {...}, "after": {...}}
  timestamp TIMESTAMP
);
```

---

## 🎓 Terminology

| Term | Meaning |
|------|---------|
| **ESG** | Environmental, Social, Governance (sustainability metrics) |
| **Scope 1/2/3** | Direct (1), indirect energy (2), value chain (3) GHG emissions |
| **BRSR** | Business Responsibility and Sustainability Reporting (India) |
| **GRI** | Global Reporting Initiative (international standard) |
| **Materiality** | What ESG topics matter most to a company |
| **JWT** | JSON Web Token (stateless auth) |
| **CORS** | Cross-Origin Resource Sharing (allow frontend to call backend) |
| **ORM** | Object-Relational Mapping (Sequelize translates JS objects ↔ SQL) |
| **Middleware** | Function that runs before route handler (auth, logging, etc.) |
| **Throttle/Debounce** | Rate-limit function calls (debounce: wait X ms after last call) |

---

## ✅ Developer Checklist (New Feature)

Before pushing code:

- [ ] ESGModel used (not old models)
- [ ] Input validated before DB call
- [ ] Error handled with proper status code (400, 404, 500)
- [ ] API response shape: `{ data, error, success }` or `{ error: "message" }`
- [ ] Auth middleware applied if endpoint should be protected
- [ ] Cache invalidated on mutations (POST, PUT, DELETE)
- [ ] No hardcoded URLs/ports (use .env)
- [ ] No secrets in code
- [ ] Frontend has error boundary for async operations
- [ ] Console.error logs have context (don't just `console.error(error)`)
- [ ] Test added/updated (`esg-backend/test-*.js`)
- [ ] README/docs updated if needed
- [ ] Middleware order correct in server.js
- [ ] No `console.log` in production code (use proper logging)

---

## 🔴 Red Flags (Don't Do These!)

| ❌ Don't | ✅ Do Instead |
|---------|-------------|
| `const EsgData = ...` in new code | `const ESGModel = ...` |
| Route on new base path with `:memory:` SQLite | Consolidate routes, fix persistence |
| Hardcode `http://localhost:3004` | Use `.env.local` or config |
| `app.use(errorLogger)` before routes | Move to bottom (must be last!) |
| Multiple models for same table | Single canonical model |
| Silent error catch + mock fallback | Log + audit trail |
| `console.log` for debugging in prod | Structured logging |
| Raw SQL queries | Use Sequelize ORM |
| State in global localStorage everywhere | Proper state management (Redux/Context) |
| Credentials in .env committed to repo | Add to .gitignore, use secrets manager |

---

## 📖 Further Reading

- Architecture doc: `.github/copilot-instructions.md`
- Detailed analysis: `PROJECT_ANALYSIS_DETAILED.md`
- Backend routes: `esg-backend/routes/`
- Frontend pages: `src/` (Dashboard.js, DataEntry.js, Reports.js)

---

**Questions?** Check `PROJECT_ANALYSIS_DETAILED.md` for deep dives or reach out to the team!
